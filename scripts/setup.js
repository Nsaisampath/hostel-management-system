const { initDatabase } = require('../database/init');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Update .env file with additional variables
const updateEnvFile = () => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Add JWT secret if not present
    if (!envContent.includes('JWT_SECRET=')) {
      const jwtSecret = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      envContent += `\nJWT_SECRET=${jwtSecret}`;
    }
    
    // Add email configuration if not present
    if (!envContent.includes('EMAIL_SERVICE=')) {
      envContent += '\nEMAIL_SERVICE=gmail';
      envContent += '\nEMAIL_USER=your_email@gmail.com';
      envContent += '\nEMAIL_PASS=your_email_password';
    }
    
    fs.writeFileSync(envPath, envContent);
    logger.info('Updated .env file with additional configuration');
  } catch (err) {
    logger.error('Error updating .env file:', err);
  }
};

// Main setup function
const setup = async () => {
  try {
    logger.info('Starting setup process...');
    
    // Update .env file
    updateEnvFile();
    
    // Initialize database
    logger.info('Initializing database...');
    await initDatabase();
    
    // Install dependencies if needed
    logger.info('Checking dependencies...');
    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error installing dependencies: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.warn(`Dependency installation warnings: ${stderr}`);
      }
      
      logger.info('Dependencies installed successfully');
      logger.info('Setup completed successfully!');
      logger.info('You can now start the server with: npm start');
    });
  } catch (err) {
    logger.error('Setup failed:', err);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup }; 