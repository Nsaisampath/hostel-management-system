const db = require('../database');
const logger = require('./logger');

/**
 * Generates a student ID in the format MVGR2025001
 * Where MVGR is the college prefix, 2025 is the current year, and 001 is an auto-incrementing number
 * 
 * @returns {Promise<string>} A unique student ID
 */
async function generateStudentId() {
  try {
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // College prefix
    const collegePrefix = 'MVGR';
    
    // Get and increment the counter value
    const counterResult = await db.query(
      'UPDATE counters SET counter_value = counter_value + 1, updated_at = NOW() WHERE counter_name = $1 RETURNING counter_value',
      ['student_number']
    );
    
    if (counterResult.rows.length === 0) {
      // If the counter doesn't exist, create it
      await db.query(
        'INSERT INTO counters (counter_name, counter_value) VALUES ($1, $2)',
        ['student_number', 1]
      );
      return `${collegePrefix}${currentYear}001`;
    }
    
    // Get the new counter value
    const counterValue = counterResult.rows[0].counter_value;
    
    // Format the counter value to ensure it's 3 digits (with leading zeros if needed)
    const formattedCounter = counterValue.toString().padStart(3, '0');
    
    // Create the student ID
    const studentId = `${collegePrefix}${currentYear}${formattedCounter}`;
    
    logger.info(`Generated new student ID: ${studentId}`);
    return studentId;
  } catch (error) {
    logger.error(`Error generating student ID: ${error.message}`, { error });
    throw new Error('Failed to generate student ID');
  }
}

module.exports = {
  generateStudentId
}; 