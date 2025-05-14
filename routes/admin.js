const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   POST /api/admin/login
 * @desc    Login admin
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find admin by email
    const query = 'SELECT * FROM admins WHERE email = $1';
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const admin = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      logger.warn(`Failed admin login attempt for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const user = {
      id: admin.admin_id,
      username: admin.username,
      email: admin.email,
      role: 'admin'
    };
    
    const token = auth.generateToken(user);
    
    // Remove password from response
    const { password: pwd, ...adminData } = admin;
    
    res.json({ 
      message: 'Login successful',
      admin: adminData,
      token
    });
  } catch (error) {
    logger.error(`Error logging in admin: ${error.message}`);
    res.status(500).json({ message: 'Failed to login' });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard data
 * @access  Admin
 */
router.get('/dashboard', auth.verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    // Get total students count
    const studentsQuery = 'SELECT COUNT(*) as total_students FROM students';
    const studentsResult = await db.query(studentsQuery);
    
    // Get total rooms count
    const roomsQuery = 'SELECT COUNT(*) as total_rooms FROM rooms';
    const roomsResult = await db.query(roomsQuery);
    
    // Get available rooms count (using room status directly instead of join query)
    const availableRoomsQuery = "SELECT COUNT(*) as available_rooms FROM rooms WHERE status = 'available'";
    const availableRoomsResult = await db.query(availableRoomsQuery);
    
    // Get pending maintenance requests count
    const maintenanceQuery = "SELECT COUNT(*) as pending_maintenance FROM maintenance_requests WHERE status = 'pending'";
    const maintenanceResult = await db.query(maintenanceQuery);
    
    // Get pending leave requests count
    const leaveQuery = "SELECT COUNT(*) as pending_leave FROM leave_requests WHERE status = 'pending'";
    const leaveResult = await db.query(leaveQuery);
    
    res.json({
      students: {
        total: parseInt(studentsResult.rows[0].total_students || 0)
      },
      rooms: {
        total: parseInt(roomsResult.rows[0].total_rooms || 0),
        available: parseInt(availableRoomsResult.rows[0].available_rooms || 0),
        occupied: parseInt(roomsResult.rows[0].total_rooms || 0) - parseInt(availableRoomsResult.rows[0].available_rooms || 0)
      },
      pending: {
        maintenance: parseInt(maintenanceResult.rows[0].pending_maintenance || 0),
        leave: parseInt(leaveResult.rows[0].pending_leave || 0)
      }
    });
  } catch (error) {
    logger.error(`Error fetching dashboard data: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

/**
 * @route   POST /api/admin/change-password
 * @desc    Change admin password
 * @access  Admin
 */
router.post('/change-password', auth.verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Get admin from database
    const getQuery = 'SELECT * FROM admins WHERE admin_id = $1';
    const getResult = await db.query(getQuery, [adminId]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    const admin = getResult.rows[0];
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const updateQuery = 'UPDATE admins SET password = $1, updated_at = NOW() WHERE admin_id = $2 RETURNING admin_id';
    await db.query(updateQuery, [hashedPassword, adminId]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Error changing admin password: ${error.message}`);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

/**
 * @route   POST /api/admin/register
 * @desc    Register a new admin
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
    }
    
    // Check if admin already exists
    const checkQuery = 'SELECT * FROM admins WHERE username = $1 OR email = $2';
    const checkResult = await db.query(checkQuery, [username, email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert admin
    const insertQuery = `
      INSERT INTO admins (username, password, email, created_at, updated_at) 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      RETURNING *
    `;
    const result = await db.query(insertQuery, [username, hashedPassword, email]);
    
    // Remove password from response
    const { password: pwd, ...adminData } = result.rows[0];
    
    // Generate JWT token
    const user = {
      id: adminData.admin_id,
      username: adminData.username,
      email: adminData.email,
      role: 'admin'
    };
    
    const token = auth.generateToken(user);
    
    res.status(201).json({
      message: 'Admin registered successfully',
      admin: adminData,
      token
    });
  } catch (error) {
    logger.error(`Error registering admin: ${error.message}`);
    res.status(500).json({ message: 'Failed to register admin' });
  }
});

module.exports = router; 