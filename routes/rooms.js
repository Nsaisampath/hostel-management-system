const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms
 * @access  Authenticated
 */
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    // Query to get all rooms with occupied bed count
    const query = `
      SELECT r.room_number, r.capacity, r.room_type, r.floor, r.availability_status,
        COUNT(s.student_id) AS occupied_beds,
        (r.capacity - COUNT(s.student_id)) AS available_beds
      FROM rooms r
      LEFT JOIN students s ON r.room_number = s.room_number
      GROUP BY r.room_number, r.capacity, r.room_type, r.floor, r.availability_status
      ORDER BY r.room_number
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching rooms: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

/**
 * @route   GET /api/rooms/:roomNumber
 * @desc    Get room details by room number
 * @access  Authenticated
 */
router.get('/:roomNumber', auth.verifyToken, async (req, res) => {
  try {
    const { roomNumber } = req.params;
    
    if (!roomNumber || roomNumber === 'undefined') {
      return res.status(400).json({ message: 'Valid room number is required' });
    }
    
    // Query to get room details
    const roomQuery = `
      SELECT * FROM rooms WHERE room_number = $1
    `;
    
    const roomResult = await db.query(roomQuery, [roomNumber]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Query to get students in this room
    const studentsQuery = `
      SELECT id, name, email, phone
      FROM students
      WHERE room_number = $1
    `;
    
    const studentsResult = await db.query(studentsQuery, [roomNumber]);
    
    // Calculate bed availability
    const room = roomResult.rows[0];
    const students = studentsResult.rows;
    const occupiedBeds = students.length;
    const availableBeds = room.capacity - occupiedBeds;
    
    res.json({
      ...room,
      occupied_beds: occupiedBeds,
      available_beds: availableBeds,
      students
    });
  } catch (error) {
    logger.error(`Error fetching room details: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch room details' });
  }
});

/**
 * @route   POST /api/rooms
 * @desc    Add a new room
 * @access  Admin
 */
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can add rooms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { room_number, capacity, room_type, floor, availability_status = 'available' } = req.body;
    
    // Validate required fields
    if (!room_number || !capacity || !room_type || !floor) {
      return res.status(400).json({ message: 'Room number, capacity, room type and floor are required' });
    }
    
    // Check if room already exists
    const checkQuery = `SELECT * FROM rooms WHERE room_number = $1`;
    const checkResult = await db.query(checkQuery, [room_number]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Room with this number already exists' });
    }
    
    // Create the room
    const insertQuery = `
      INSERT INTO rooms (room_number, capacity, room_type, floor, availability_status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [room_number, capacity, room_type, floor, availability_status]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error creating room: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to create room' });
  }
});

/**
 * @route   PUT /api/rooms/:roomNumber
 * @desc    Update a room
 * @access  Admin
 */
router.put('/:roomNumber', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can update rooms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { roomNumber } = req.params;
    
    if (!roomNumber || roomNumber === 'undefined') {
      return res.status(400).json({ message: 'Valid room number is required' });
    }
    
    const { capacity, room_type, floor, availability_status } = req.body;
    
    // Check if room exists
    const checkQuery = `SELECT * FROM rooms WHERE room_number = $1`;
    const checkResult = await db.query(checkQuery, [roomNumber]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Build update query dynamically based on provided fields
    let updateQuery = 'UPDATE rooms SET updated_at = NOW()';
    const values = [];
    let paramCount = 1;
    
    if (capacity !== undefined) {
      updateQuery += `, capacity = $${paramCount}`;
      values.push(capacity);
      paramCount++;
    }
    
    if (room_type !== undefined) {
      updateQuery += `, room_type = $${paramCount}`;
      values.push(room_type);
      paramCount++;
    }
    
    if (floor !== undefined) {
      updateQuery += `, floor = $${paramCount}`;
      values.push(floor);
      paramCount++;
    }
    
    if (availability_status !== undefined) {
      updateQuery += `, availability_status = $${paramCount}`;
      values.push(availability_status);
      paramCount++;
    }
    
    updateQuery += ` WHERE room_number = $${paramCount} RETURNING *`;
    values.push(roomNumber);
    
    const result = await db.query(updateQuery, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating room: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to update room' });
  }
});

/**
 * @route   DELETE /api/rooms/:roomNumber
 * @desc    Delete a room
 * @access  Admin
 */
router.delete('/:roomNumber', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can delete rooms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { roomNumber } = req.params;
    
    // Check if any students are assigned to this room
    const checkQuery = `SELECT COUNT(*) as count FROM students WHERE room_number = $1`;
    const checkResult = await db.query(checkQuery, [roomNumber]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ message: 'Cannot delete room with assigned students' });
    }
    
    // Delete the room
    const deleteQuery = `DELETE FROM rooms WHERE room_number = $1 RETURNING room_id`;
    const result = await db.query(deleteQuery, [roomNumber]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting room: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to delete room' });
  }
});

/**
 * @route   GET /api/rooms/available
 * @desc    Get all available rooms
 * @access  Authenticated
 */
router.get('/available', auth.verifyToken, async (req, res) => {
  try {
    const query = "SELECT * FROM rooms WHERE availability_status = 'available' ORDER BY room_number";
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    logger.error('Error fetching available rooms:', err);
    res.status(500).json({ message: 'Failed to fetch available rooms' });
  }
});

/**
 * @route   GET /api/rooms/:id/students
 * @desc    Get all students in a room
 * @access  Admin
 */
router.get('/:id/students', auth.verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM students WHERE room_number = $1';
    const { rows } = await db.query(query, [id]);
    
    // Remove passwords from response
    const students = rows.map(student => {
      const { password, ...studentWithoutPassword } = student;
      return studentWithoutPassword;
    });

    res.json(students);
  } catch (err) {
    logger.error(`Error fetching students for room ${id}:`, err);
    res.status(500).json({ message: 'Failed to fetch students for room' });
  }
});

/**
 * @route   POST /api/rooms/:roomNumber/assign
 * @desc    Assign a student to a room
 * @access  Admin
 */
router.post('/:roomNumber/assign', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can assign rooms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { roomNumber } = req.params;
    // Accept either studentId or student_id for compatibility
    const studentId = req.body.studentId || req.body.student_id;
    
    if (!roomNumber || roomNumber === 'undefined') {
      return res.status(400).json({ message: 'Valid room number is required' });
    }
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    // Begin transaction
    await db.query('BEGIN');
    
    try {
      // Check if room exists and has available beds
      const roomQuery = `
        SELECT r.*, COUNT(s.student_id) AS occupied_beds
        FROM rooms r
        LEFT JOIN students s ON r.room_number = s.room_number
        WHERE r.room_number = $1
        GROUP BY r.room_id, r.room_number, r.capacity, r.room_type, r.floor, r.availability_status, r.created_at, r.updated_at
      `;
      
      const roomResult = await db.query(roomQuery, [roomNumber]);
      
      if (roomResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Room not found' });
      }
      
      const room = roomResult.rows[0];
      
      if (room.availability_status !== 'available') {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Room is not available for assignment' });
      }
      
      if (room.occupied_beds >= room.capacity) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Room is already full' });
      }
      
      // Check if student exists
      const studentQuery = `SELECT * FROM students WHERE student_id = $1`;
      const studentResult = await db.query(studentQuery, [studentId]);
      
      if (studentResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Student not found' });
      }
      
      const student = studentResult.rows[0];
      
      // Check if student is already assigned to a room
      if (student.room_number) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Student is already assigned to room ' + student.room_number });
      }
      
      // Assign student to room
      const updateQuery = `
        UPDATE students
        SET room_number = $1, updated_at = NOW()
        WHERE student_id = $2
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, [roomNumber, studentId]);
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.json({
        message: 'Student assigned to room successfully',
        student: result.rows[0]
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error(`Error assigning room: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to assign room' });
  }
});

/**
 * @route   POST /api/rooms/:roomNumber/remove
 * @desc    Remove a student from a room
 * @access  Admin
 */
router.post('/:roomNumber/remove', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can remove students from rooms
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { roomNumber } = req.params;
    const { studentId } = req.body;
    
    if (!roomNumber || roomNumber === 'undefined') {
      return res.status(400).json({ message: 'Valid room number is required' });
    }
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    // Check if student exists and is in the specified room
    const studentQuery = `SELECT * FROM students WHERE student_id = $1`;
    const studentResult = await db.query(studentQuery, [studentId]);
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const student = studentResult.rows[0];
    
    if (student.room_number !== roomNumber) {
      return res.status(400).json({ message: 'Student is not assigned to the specified room' });
    }
    
    // Remove student from room
    const updateQuery = `
      UPDATE students
      SET room_number = NULL, updated_at = NOW()
      WHERE student_id = $1
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [studentId]);
    
    res.json({
      message: 'Student removed from room successfully',
      student: result.rows[0]
    });
  } catch (error) {
    logger.error(`Error removing student from room: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to remove student from room' });
  }
});

module.exports = router; 