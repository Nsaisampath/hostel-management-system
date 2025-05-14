const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Get attendance for a specific date
router.get('/date/:date', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can see all attendance records
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { date } = req.params;
    
    if (!date || date === 'undefined') {
      return res.status(400).json({ message: 'Valid date is required (YYYY-MM-DD)' });
    }
    
    const query = `
      SELECT a.*, s.name, s.id as student_id 
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE DATE(a.date) = $1
      ORDER BY s.name
    `;
    
    const result = await db.query(query, [date]);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching attendance: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Get attendance for a specific student
router.get('/student/:studentId', auth.verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || studentId === 'undefined') {
      return res.status(400).json({ message: 'Valid student ID is required' });
    }
    
    // Ensure users can only view their own attendance unless they're an admin
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Unauthorized: You can only view your own attendance' });
    }
    
    const query = `
      SELECT a.*, admin.username as marked_by_name
      FROM attendance a
      LEFT JOIN admins admin ON a.marked_by = admin.id
      WHERE a.student_id = $1
      ORDER BY a.date DESC
    `;
    
    const result = await db.query(query, [studentId]);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching student attendance: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Upload attendance for multiple students
router.post('/upload', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can upload attendance
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { date } = req.body;
    const adminId = req.user.id;
    
    if (!adminId || adminId === 'undefined') {
      return res.status(400).json({ message: 'Valid admin ID is required' });
    }
    
    // Validate required fields
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    // If we get a file upload, parse it here
    if (req.files && req.files.file) {
      const file = req.files.file;
      
      // Process the file based on type (CSV or Excel)
      // For simplicity, we'll assume a properly formatted JSON for now
      // In a real implementation, you'd parse CSV/Excel here
      
      return res.status(201).json({ message: 'Attendance file processing is not implemented yet' });
    }
    
    // Handle JSON attendance data
    const { attendance } = req.body;
    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ message: 'Attendance data is required and must be an array' });
    }
    
    // Begin transaction
    await db.query('BEGIN');
    
    try {
      // Delete existing attendance records for this date
      const deleteQuery = `DELETE FROM attendance WHERE DATE(date) = $1`;
      await db.query(deleteQuery, [date]);
      
      // Insert new attendance records
      const insertQuery = `
        INSERT INTO attendance (student_id, date, status, marked_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `;
      
      for (const record of attendance) {
        if (!record.student_id || !record.status) {
          await db.query('ROLLBACK');
          return res.status(400).json({ message: 'Each attendance record must include student_id and status' });
        }
        
        if (!['present', 'absent', 'late'].includes(record.status)) {
          await db.query('ROLLBACK');
          return res.status(400).json({ message: 'Status must be one of: present, absent, late' });
        }
        
        await db.query(insertQuery, [record.student_id, date, record.status, adminId]);
      }
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.status(201).json({ message: 'Attendance uploaded successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error(`Error uploading attendance: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to upload attendance' });
  }
});

// Get attendance statistics for the last 30 days
router.get('/stats', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can view attendance stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const query = `
      SELECT 
        DATE(date) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'late') as late
      FROM attendance
      WHERE date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(date)
      ORDER BY DATE(date) DESC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching attendance stats: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch attendance statistics' });
  }
});

module.exports = router; 