const nodemailer = require('nodemailer');
const logger = require('./logger');
require('dotenv').config();

// Create reusable transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email credentials not configured. Email functionality disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send registration ID to student's email
 * @param {string} email - Student's email address
 * @param {string} registerId - Generated registration ID
 * @returns {Promise<boolean>} Success status
 */
const sendRegisterIdEmail = async (email, registerId) => {
  try {
    const transporter = createTransporter();
    
    // If transporter is null, email is disabled
    if (!transporter) {
      logger.info(`Email would have been sent to ${email} with ID ${registerId} (disabled)`);
      return false;
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Hostel Registration ID',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a4a4a;">Welcome to MVGR Hostel</h2>
          <p>Thank you for registering with our hostel management system.</p>
          <p>Your registration ID is: <strong style="font-size: 18px; color: #3f51b5;">${registerId}</strong></p>
          <p>Please keep this ID safe as you will need it for all future communications.</p>
          <p>If you have any questions, please contact the hostel administration.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${email}:`, error);
    return false;
  }
};

module.exports = { sendRegisterIdEmail }; 