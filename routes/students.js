const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const { generateStudentId } = require('../utils/idGenerator');

/**
 * @route   GET /api/students
 * @desc    Get all students
 * @access  Admin
 */
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { status, unassigned } = req.query;
    let query = 'SELECT * FROM students';
    
    // Add WHERE clause if needed
    if (status || unassigned === 'true') {
      query += ' WHERE';
      
      if (status) {
        query += ` status = '${status}'`;
      }
      
      if (unassigned === 'true') {
        if (status) query += ' AND';
        query += ' (room_number IS NULL OR room_number = \'\')';
      }
    }
    
    const result = await db.query(query);
    
    // Remove passwords from response
    const students = result.rows.map(student => {
      const { password, ...studentWithoutPassword } = student;
      return studentWithoutPassword;
    });
    
    res.json(students);
  } catch (error) {
    logger.error(`Error fetching students: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Admin or Self
 */
router.get('/:id', auth.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied: You can only view your own profile' });
    }

    const query = 'SELECT * FROM students WHERE student_id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove password from response
    const { password, ...student } = result.rows[0];

    res.json(student);
  } catch (error) {
    logger.error(`Error fetching student: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

/**
 * @route   POST /api/students
 * @desc    Add a new student
 * @access  Admin
 */
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { name, email, contact, password, room_number } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate a new student ID
    const student_id = await generateStudentId();
    
    // Check if student with this email already exists
    const checkQuery = 'SELECT * FROM students WHERE email = $1';
    const checkResult = await db.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Student with this email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert student into database
    const insertQuery = `
      INSERT INTO students (student_id, name, email, contact, password, room_number, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(
      insertQuery, 
      [student_id, name, email, contact, hashedPassword, room_number]
    );
    
    // Remove password from response
    const { password: pwd, ...newStudent } = result.rows[0];
    
    res.status(201).json(newStudent);
  } catch (error) {
    logger.error(`Error creating student: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to create student' });
  }
});

/**
 * @route   POST /api/students/register
 * @desc    Register a new student
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, contact, password, room_preference } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if student with this email already exists
    const checkQuery = 'SELECT * FROM students WHERE email = $1';
    const checkResult = await db.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Student with this email already exists' 
      });
    }
    
    // Generate a unique student ID
    const student_id = await generateStudentId();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert student into database
    const insertQuery = `
      INSERT INTO students (student_id, name, email, contact, password, room_preference, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(
      insertQuery, 
      [student_id, name, email, contact, hashedPassword, room_preference]
    );
    
    // Generate JWT token
    const user = {
      id: result.rows[0].student_id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      room_number: result.rows[0].room_number,
      role: 'student'
    };
    
    const token = auth.generateToken(user);
    
    res.status(201).json({ 
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    logger.error(`Error registering student: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to register student' });
  }
});

/**
 * @route   POST /api/students/login
 * @desc    Login a student
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find student by email
    const query = 'SELECT * FROM students WHERE email = $1';
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const student = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const user = {
      id: student.student_id,
      name: student.name,
      email: student.email,
      room_number: student.room_number,
      role: 'student'
    };
    
    const token = auth.generateToken(user);
    
    res.json({ 
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    logger.error(`Error logging in student: ${error.message}`, { error });
    res.status(500).json({ message: 'Login failed' });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update a student
 * @access  Admin or Self
 */
router.put('/:id', auth.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contact, room_number } = req.body;
    
    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied: You can only update your own profile' });
    }
    
    // Check if student exists
    const checkQuery = 'SELECT * FROM students WHERE student_id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student
    const updateQuery = `
      UPDATE students
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          contact = COALESCE($3, contact),
          room_number = COALESCE($4, room_number),
          updated_at = NOW()
      WHERE student_id = $5
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [name, email, contact, room_number, id]);
    
    // Remove password from response
    const { password, ...updatedStudent } = result.rows[0];
    
    res.json(updatedStudent);
  } catch (error) {
    logger.error(`Error updating student: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to update student' });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student
 * @access  Admin
 */
router.delete('/:id', auth.verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { id } = req.params;
    
    // Check if student exists
    const checkQuery = 'SELECT * FROM students WHERE student_id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete student
    await db.query('DELETE FROM students WHERE student_id = $1', [id]);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting student: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

/**
 * @route   PUT /api/students/:id/status
 * @desc    Update a student's status
 * @access  Admin
 */
router.put('/:id/status', auth.verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'graduated'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (active, inactive, or graduated)' });
    }
    
    // Check if student exists
    const checkQuery = 'SELECT * FROM students WHERE student_id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student status
    const updateQuery = `
      UPDATE students
      SET status = $1, updated_at = NOW()
      WHERE student_id = $2
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [status, id]);
    
    // Remove password from response
    const { password, ...updatedStudent } = result.rows[0];
    
    res.json({
      message: `Student status updated to '${status}' successfully`,
      student: updatedStudent
    });
  } catch (error) {
    logger.error(`Error updating student status: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to update student status' });
  }
});

module.exports = router; 