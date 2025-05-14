const pool = require('../config/database');
const logger = require('./logger');

/**
 * Generates a unique registration ID for new students
 * Format: MVGR + YEAR + 4-digit sequence number (e.g., MVGR20250001)
 * @returns {Promise<string>} The generated registration ID
 */
const generateRegisterId = async () => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get the latest student_id from the database
    const query = `
      SELECT student_id 
      FROM students 
      WHERE student_id LIKE $1
      ORDER BY student_id DESC 
      LIMIT 1
    `;
    
    const yearPrefix = `MVGR${currentYear}`;
    const { rows } = await pool.query(query, [`${yearPrefix}%`]);
    
    let newStudentId;
    if (rows.length > 0) {
      // Extract the numeric part and increment
      const lastId = rows[0].student_id;
      const lastNumber = parseInt(lastId.slice(8)); // Extracts "0001" from "MVGR20250001"
      newStudentId = `${yearPrefix}${String(lastNumber + 1).padStart(4, '0')}`; // Generates MVGR20250002, etc.
    } else {
      newStudentId = `${yearPrefix}0001`; // First student of the year
    }
    
    logger.debug(`Generated new student ID: ${newStudentId}`);
    return newStudentId;
  } catch (error) {
    logger.error('Error generating registration ID:', error);
    throw new Error('Failed to generate registration ID');
  }
};

module.exports = { generateRegisterId };