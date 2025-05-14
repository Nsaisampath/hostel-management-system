const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all leave requests (admin only)
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can see all leave requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const status = req.query.status; // Filter by status if provided
    
    let query = `
      SELECT lr.*, s.name as student_name, s.id as student_id
      FROM leave_requests lr
      JOIN students s ON lr.student_id = s.id
    `;
    
    const values = [];
    
    if (status) {
      query += ' WHERE lr.status = $1';
      values.push(status);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching leave requests: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});

// Get leave requests for a specific student
router.get('/student/:studentId', auth.verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Ensure users can only view their own leave requests unless they're an admin
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Unauthorized: You can only view your own leave requests' });
    }
    
    const query = `
      SELECT *
      FROM leave_requests
      WHERE student_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [studentId]);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching student leave requests: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});

// Create a new leave request
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    const { start_date, end_date, reason } = req.body;
    const studentId = req.user.id;
    
    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create leave requests' });
    }
    
    // Validate required fields
    if (!start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Start date, end date, and reason are required' });
    }
    
    // Check if there's an overlapping pending or approved leave request
    const checkQuery = `
      SELECT id FROM leave_requests
      WHERE student_id = $1
      AND status IN ('pending', 'approved')
      AND (
        (start_date <= $2 AND end_date >= $2)
        OR (start_date <= $3 AND end_date >= $3)
        OR (start_date >= $2 AND end_date <= $3)
      )
    `;
    
    const checkResult = await db.query(checkQuery, [studentId, start_date, end_date]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'You already have an overlapping leave request' });
    }
    
    // Create the leave request
    const insertQuery = `
      INSERT INTO leave_requests (student_id, start_date, end_date, reason, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [studentId, start_date, end_date, reason]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error creating leave request: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to create leave request' });
  }
});

// Update a leave request status (admin only)
router.put('/:id', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can update leave request status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Check if leave request exists
    const checkQuery = `SELECT * FROM leave_requests WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Update the leave request
    const updateQuery = `
      UPDATE leave_requests
      SET status = $1,
          admin_notes = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [status, admin_notes, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating leave request: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to update leave request' });
  }
});

// Delete a leave request
router.delete('/:id', auth.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the leave request to check ownership
    const checkQuery = `SELECT * FROM leave_requests WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    const leaveRequest = checkResult.rows[0];
    
    // Only allow students to delete their own pending requests
    // Admins can delete any request
    if (req.user.role !== 'admin') {
      if (req.user.id !== leaveRequest.student_id) {
        return res.status(403).json({ message: 'Unauthorized: You can only delete your own leave requests' });
      }
      
      if (leaveRequest.status !== 'pending') {
        return res.status(400).json({ message: 'You can only delete pending leave requests' });
      }
    }
    
    // Delete the leave request
    const deleteQuery = `DELETE FROM leave_requests WHERE id = $1 RETURNING id`;
    const result = await db.query(deleteQuery, [id]);
    
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting leave request: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to delete leave request' });
  }
});

module.exports = router; 