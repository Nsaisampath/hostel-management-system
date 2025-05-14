const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   GET /api/notices
 * @desc    Get all notices
 * @access  Authenticated
 */
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT n.*, a.username as admin_username
      FROM notices n
      LEFT JOIN admins a ON n.admin_id = a.admin_id
      ORDER BY n.created_at DESC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching notices: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch notices' });
  }
});

/**
 * @route   GET /api/notices/:id
 * @desc    Get a specific notice
 * @access  Authenticated
 */
router.get('/:id', auth.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid notice ID is required' });
    }
    
    const query = `
      SELECT n.*, a.username as admin_username
      FROM notices n
      LEFT JOIN admins a ON n.admin_id = a.admin_id
      WHERE n.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error fetching notice: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to fetch notice' });
  }
});

/**
 * @route   POST /api/notices
 * @desc    Create a new notice (admin only)
 * @access  Admin
 */
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can create notices
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { title, content, priority = 'normal' } = req.body;
    const adminId = req.user.id;
    
    if (!adminId || adminId === 'undefined') {
      return res.status(400).json({ message: 'Valid admin ID is required' });
    }
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Create the notice
    const insertQuery = `
      INSERT INTO notices (admin_id, title, content, priority, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [adminId, title, content, priority]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error creating notice: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to create notice' });
  }
});

/**
 * @route   PUT /api/notices/:id
 * @desc    Update a notice (admin only)
 * @access  Admin
 */
router.put('/:id', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can update notices
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { id } = req.params;
    const { title, content, priority } = req.body;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid notice ID is required' });
    }
    
    // Check if notice exists
    const checkQuery = `SELECT * FROM notices WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Build update query dynamically based on provided fields
    let updateQuery = 'UPDATE notices SET updated_at = NOW()';
    const values = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updateQuery += `, title = $${paramCount}`;
      values.push(title);
      paramCount++;
    }
    
    if (content !== undefined) {
      updateQuery += `, content = $${paramCount}`;
      values.push(content);
      paramCount++;
    }
    
    if (priority !== undefined) {
      updateQuery += `, priority = $${paramCount}`;
      values.push(priority);
      paramCount++;
    }
    
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);
    
    const result = await db.query(updateQuery, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating notice: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to update notice' });
  }
});

/**
 * @route   DELETE /api/notices/:id
 * @desc    Delete a notice (admin only)
 * @access  Admin
 */
router.delete('/:id', auth.verifyToken, async (req, res) => {
  try {
    // Only admins can delete notices
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid notice ID is required' });
    }
    
    // Check if notice exists
    const checkQuery = `SELECT * FROM notices WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Delete the notice
    const deleteQuery = `DELETE FROM notices WHERE id = $1 RETURNING id`;
    const result = await db.query(deleteQuery, [id]);
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting notice: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to delete notice' });
  }
});

module.exports = router; 