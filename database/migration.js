const db = require('./index');
const logger = require('../utils/logger');

async function runMigration() {
  try {
    logger.info('Starting database migration');
    
    // Check if leave_type column exists in leave_requests
    const checkLeaveTypeQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leave_requests' 
      AND column_name = 'leave_type'
    `;
    
    const leaveTypeResult = await db.query(checkLeaveTypeQuery);
    
    if (leaveTypeResult.rows.length === 0) {
      logger.info('Adding leave_type column to leave_requests table');
      await db.query(`
        ALTER TABLE leave_requests 
        ADD COLUMN leave_type VARCHAR(20) DEFAULT 'Personal'
      `);
      logger.info('Added leave_type column to leave_requests table');
    } else {
      logger.info('leave_type column already exists in leave_requests table');
    }
    
    // Add other migrations here as needed
    
    logger.info('Database migration completed successfully');
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    logger.error(`Migration error: ${error.message}`, { error });
    return { success: false, message: error.message };
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigration }; 