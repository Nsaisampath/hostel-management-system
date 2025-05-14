const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Attempting to register a new student...');
    
    const response = await axios.post('http://localhost:5000/api/students/register', {
      name: 'Test Student',
      email: `test${Date.now()}@example.com`, // Use timestamp for unique email
      contact: '1234567890',
      password: 'password123',
      room_preference: 'Single'
    });
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if the user ID is present
    if (response.data.user && response.data.user.id) {
      console.log('Student ID received:', response.data.user.id);
    } else {
      console.log('Warning: No student ID in the response');
      console.log('Response structure:', Object.keys(response.data));
      if (response.data.user) {
        console.log('User properties:', Object.keys(response.data.user));
      }
    }
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('No response received');
      console.error(error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error('Error config:', error.config);
  }
}

testRegistration(); 