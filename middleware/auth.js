const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
require('dotenv').config();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate JWT tokens
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    // Check if the header format is correct
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token format is invalid' });
    }
    
    const token = parts[1];
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.error(`Token verification failed: ${err.message}`);
        return res.status(401).json({ message: 'Token is invalid or expired' });
      }
      
      // Add user data to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Middleware to check if user is an admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`Access denied: User ${req.user.id} attempted to access admin resource`);
    return res.status(403).json({ error: 'Forbidden', message: 'Admin privileges required' });
  }

  next();
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with id, role, etc.
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id || user.student_id || user.admin_id,
      role: user.role || 'student',
      email: user.email,
      name: user.name,
      room_number: user.room_number
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

module.exports = {
  verifyToken,
  isAdmin,
  generateToken
}; 