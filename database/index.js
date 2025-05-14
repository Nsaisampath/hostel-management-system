const { Pool } = require('pg');
const logger = require('../utils/logger');

// Configure database connection with existing database
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hostel_management_system',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return logger.error(`Error connecting to database: ${err.message}`);
  }
  
  logger.info('Successfully connected to PostgreSQL database');
  release();
});

// Helper functions for database operations
module.exports = {
  query: (text, params) => pool.query(text, params),
  
  getClient: async () => {
    const client = await pool.connect();
    return client;
  },
  
  // Gracefully close the pool (useful for tests)
  end: () => pool.end(),
  
  // Transaction helper
  transaction: async (callback) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await callback(client);
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}; 