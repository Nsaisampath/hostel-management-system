const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all maintenance requests (admin only)
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can see all maintenance requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const status = req.query.status; // Filter by status if provided
    
    let query = `
      SELECT mr.*, s.name as student_name, s.room_number
      FROM maintenance_requests mr
      LEFT JOIN students s ON mr.student_id = s.student_id
    `;
    
    const values = [];
    
    if (status) {
      query += ' WHERE mr.status = $1';
      values.push(status);
    }
    
    query += ' ORDER BY mr.created_at DESC';
    
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching maintenance requests: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch maintenance requests' });
  }
});

// Get maintenance requests for a specific student
router.get('/student/:studentId', auth.verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || studentId === 'undefined') {
      return res.status(400).json({ message: 'Valid student ID is required' });
    }
    
    // Ensure users can only view their own maintenance requests unless they're an admin
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Unauthorized: You can only view your own maintenance requests' });
    }
    
    const query = `
      SELECT *
      FROM maintenance_requests
      WHERE student_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [studentId]);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching student maintenance requests: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch maintenance requests' });
  }
});

// Create a new maintenance request
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    const { issue_type, description, room_number, priority } = req.body;
    const studentId = req.user.id; // This comes from the JWT token
    
    // Validate user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create maintenance requests' });
    }
    
    if (!studentId || studentId === 'undefined') {
      return res.status(400).json({ message: 'You must be logged in as a student to create a maintenance request' });
    }
    
    // Validate required fields
    if (!issue_type || !description) {
      return res.status(400).json({ message: 'Issue type and description are required' });
    }
    
    let roomNumberToUse = room_number;
    
    // If room number is not provided, get it from the student record
    if (!roomNumberToUse) {
      const studentQuery = `SELECT room_number FROM students WHERE student_id = $1`;
      const studentResult = await db.query(studentQuery, [studentId]);
      
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      roomNumberToUse = studentResult.rows[0].room_number;
      
      if (!roomNumberToUse) {
        return res.status(400).json({ 
          message: 'You must have a room assigned to create a maintenance request. Please contact an administrator to assign you a room.',
          error_code: 'NO_ROOM_ASSIGNED'
        });
      }
    }
    
    // Verify that the room exists
    const roomCheck = await db.query('SELECT room_number FROM rooms WHERE room_number = $1', [roomNumberToUse]);
    if (roomCheck.rows.length === 0) {
      return res.status(400).json({ 
        message: 'The specified room does not exist in the system.',
        error_code: 'INVALID_ROOM'
      });
    }
    
    // Create the maintenance request
    const insertQuery = `
      INSERT INTO maintenance_requests (student_id, room_number, issue_type, description, priority, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [studentId, roomNumberToUse, issue_type, description, priority || 'medium']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error creating maintenance request: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to create maintenance request. ' + error.message });
  }
});

// Update a maintenance request status (admin only)
router.put('/:id', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can update maintenance request status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid maintenance request ID is required' });
    }
    
    if (!status || !['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, in_progress, completed, rejected)' });
    }
    
    // Check if maintenance request exists
    const checkQuery = `SELECT * FROM maintenance_requests WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Update the maintenance request
    const updateQuery = `
      UPDATE maintenance_requests
      SET status = $1,
          admin_notes = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [status, admin_notes, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating maintenance request: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to update maintenance request' });
  }
});

// Delete a maintenance request
router.delete('/:id', auth.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid maintenance request ID is required' });
    }
    
    // Get the maintenance request to check ownership
    const checkQuery = `SELECT * FROM maintenance_requests WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    const request = checkResult.rows[0];
    
    // Only allow students to delete their own pending requests
    // Admins can delete any request
    if (req.user.role !== 'admin') {
      if (req.user.id !== request.student_id) {
        return res.status(403).json({ message: 'Unauthorized: You can only delete your own maintenance requests' });
      }
      
      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'You can only delete pending maintenance requests' });
      }
    }
    
    // Delete the maintenance request
    const deleteQuery = `DELETE FROM maintenance_requests WHERE id = $1 RETURNING id`;
    const result = await db.query(deleteQuery, [id]);
    
    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting maintenance request: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to delete maintenance request' });
  }
});

module.exports = router; 