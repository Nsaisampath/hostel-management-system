const { Pool } = require('pg');
require('dotenv').config();

async function addLeaveTypeColumn() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  try {
    console.log('Connected to database. Adding leave_type column to leave_requests table...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leave_requests' AND column_name = 'leave_type'
    `;
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('leave_type column already exists in leave_requests table.');
    } else {
      // Add the column
      const alterTableQuery = `
        ALTER TABLE leave_requests
        ADD COLUMN leave_type VARCHAR(20) DEFAULT 'Personal'
      `;
      await pool.query(alterTableQuery);
      console.log('Successfully added leave_type column to leave_requests table.');
    }
  } catch (error) {
    console.error('Error adding leave_type column:', error);
  } finally {
    await pool.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addLeaveTypeColumn();
}

module.exports = { addLeaveTypeColumn }; 