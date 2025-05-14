const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

// Test data
const studentData = {
  student_id: `test${Date.now()}`,
  name: 'Test Student',
  email: `teststudent${Date.now()}@example.com`,
  contact: '1234567890',
  password: 'password123'
};

const adminData = {
  username: `admin${Date.now()}`,
  email: `admin${Date.now()}@example.com`,
  password: 'adminpass123'
};

// Helper function to log detailed errors
function logErrorDetails(error) {
  console.error('Error details:');
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Status:', error.response.status);
    console.error('Headers:', error.response.headers);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received. Request:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
  }
  if (error.config) {
    console.error('Request URL:', error.config.url);
    console.error('Request Method:', error.config.method);
    console.error('Request Data:', error.config.data);
  }
}

// Test student registration
async function testStudentRegistration() {
  try {
    console.log('Testing student registration...');
    console.log('Sending data:', studentData);
    const response = await axios.post(`${API_URL}/students/register`, studentData);
    console.log('Student registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Student registration failed:', error.response?.data || error.message);
    logErrorDetails(error);
    return null;
  }
}

// Test student login
async function testStudentLogin() {
  try {
    console.log('Testing student login...');
    const loginData = {
      email: studentData.email,
      password: studentData.password
    };
    console.log('Sending data:', loginData);
    const response = await axios.post(`${API_URL}/students/login`, loginData);
    console.log('Student login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Student login failed:', error.response?.data || error.message);
    logErrorDetails(error);
    return null;
  }
}

// Test admin registration
async function testAdminRegistration() {
  try {
    console.log('Testing admin registration...');
    console.log('Sending data:', adminData);
    const response = await axios.post(`${API_URL}/admin/register`, adminData);
    console.log('Admin registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Admin registration failed:', error.response?.data || error.message);
    logErrorDetails(error);
    return null;
  }
}

// Test admin login
async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const loginData = {
      email: adminData.email,
      password: adminData.password
    };
    console.log('Sending data:', loginData);
    const response = await axios.post(`${API_URL}/admin/login`, loginData);
    console.log('Admin login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    logErrorDetails(error);
    return null;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting authentication tests...');
    
    // Test student flow
    await testStudentRegistration();
    await testStudentLogin();
    
    // Test admin flow
    await testAdminRegistration();
    await testAdminLogin();
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests(); 