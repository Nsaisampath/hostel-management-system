const axios = require('axios');

async function createAdmin() {
  try {
    console.log('Attempting to create a new admin user...');
    
    const response = await axios.post('http://localhost:5000/api/admin/register', {
      username: 'newadmin',
      email: 'newadmin@hostel.com',
      password: 'password123'
    });
    
    console.log('Admin creation successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Now try to login with the new admin
    console.log('\nAttempting to login with new admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'newadmin@hostel.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('Status:', loginResponse.status);
    console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('Operation failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
  }
}

createAdmin(); 