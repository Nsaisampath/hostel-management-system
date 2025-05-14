const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const db = require('./database');
const { runMigration } = require('./database/migration');
const fileUpload = require('express-fileupload');

// Import routes
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const roomRoutes = require('./routes/rooms');
const leaveRequestRoutes = require('./routes/leave-requests');
const noticeRoutes = require('./routes/notices');
const attendanceRoutes = require('./routes/attendance');
const maintenanceRequestRoutes = require('./routes/maintenance-requests');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Apply rate limiting middleware
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Increase from default of 5 to 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later',
    skip: (req) => {
      // Skip rate limiting for authentication routes
      return req.path.includes('/api/admin/login') || 
             req.path.includes('/api/students/login');
    }
  })
);

// API routes
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/maintenance-requests', maintenanceRequestRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Hostel Management System API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { error: err });
  res.status(500).json({ message: 'Internal server error' });
});

// 404 middleware
app.use((req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Run database migration
    const migrationResult = await runMigration();
    if (!migrationResult.success) {
      logger.error(`Migration failed: ${migrationResult.message}`);
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
    
    // Test database connection
    try {
      await db.query('SELECT NOW()');
      logger.info('Successfully connected to PostgreSQL database');
    } catch (err) {
      logger.error(`Database connection error: ${err.message}`, { error: err });
    }
  } catch (err) {
    logger.error(`Server startup error: ${err.message}`, { error: err });
  }
};

startServer();

module.exports = app;