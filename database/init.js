const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create database if it doesn't exist
const createDatabase = async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    // Check if our database exists
    const checkDbResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    // If database doesn't exist, create it
    if (checkDbResult.rowCount === 0) {
      console.log(`Creating database: ${process.env.DB_NAME}`);
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    throw err;
  } finally {
    await pool.end();
  }
};

// Initialize schema
const initSchema = async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  try {
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL
    console.log('Initializing database schema...');
    await pool.query(schemaSql);
    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Error initializing schema:', err);
    throw err;
  } finally {
    await pool.end();
  }
};

// Main function to run the initialization
const initDatabase = async () => {
  try {
    // Create database if it doesn't exist
    await createDatabase();
    
    // Initialize schema
    await initSchema();
    
    console.log('Database initialization completed successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

// Run the initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 