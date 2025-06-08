require('dotenv').config();
const axios = require('axios');

async function testRegister() {
  try {
    console.log('🧪 Testing registration with unique data...');
    
    const testData = {
      nim: '99999999998',
      nama: 'Test Registration',
      email: 'test-registration@example.com',
      kata_sandi: 'password123',
      peran: 'pengguna'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
      if (error.response.data.errors) {
        console.log('Errors:', error.response.data.errors);
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRegister();
