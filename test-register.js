const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5000/api/students/register', {
      name: 'Test Student',
      email: 'test@example.com',
      contact: '1234567890',
      password: 'password123',
      room_preference: 'Single'
    });
    
    console.log('Registration successful!');
    console.log(response.data);
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testRegister(); 