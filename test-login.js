require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login with existing user...');
    
    // Test with the user we know exists
    const loginData = {
      email: '12350111035@students-uin.suska.ac.id', // eddie5's actual email
      kata_sandi: '123456' // Assuming this is the password
    };
    
    console.log('Trying to login with:', loginData.email);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.log('❌ Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('Error:', error.message);
    }
    
    // Try with test user
    console.log('\n🧪 Trying with test user...');
    try {
      const testLoginData = {
        email: 'test@example.com',
        kata_sandi: 'password123'
      };
      
      const testResponse = await axios.post('http://localhost:5000/api/auth/login', testLoginData);
      console.log('✅ Test user login successful!');
      console.log('User:', testResponse.data.user);
      
    } catch (testError) {
      console.log('❌ Test user login also failed:');
      if (testError.response) {
        console.log('Status:', testError.response.status);
        console.log('Message:', testError.response.data.message);
      }
    }
  }
}

testLogin();
