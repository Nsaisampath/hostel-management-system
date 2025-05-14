const axios = require('axios');

async function testAdminLogin() {
  const testCases = [
    {
      description: "Using email and password",
      credentials: {
        email: 'admin@hostel.com',
        password: 'admin123'
      }
    },
    {
      description: "Using username instead of email",
      credentials: {
        email: 'admin',
        password: 'admin123'
      }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n[TEST] ${testCase.description}`);
      console.log('Credentials:', JSON.stringify(testCase.credentials));
      
      const response = await axios.post('http://localhost:5000/api/admin/login', testCase.credentials);
      
      console.log('Login successful!');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error('Login failed:');
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
}

testAdminLogin(); 