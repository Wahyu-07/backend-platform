require('dotenv').config();
const axios = require('axios');

async function testUniqueRegister() {
  try {
    console.log('🧪 Testing registration with completely unique data...');
    
    // Generate unique data with timestamp
    const timestamp = Date.now();
    const testData = {
      nim: `999${timestamp}`.slice(-11), // Keep it within 11 digits
      nama: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      kata_sandi: 'password123',
      peran: 'pengguna'
    };
    
    console.log('📝 Test data:', {
      nim: testData.nim,
      nama: testData.nama,
      email: testData.email,
      peran: testData.peran
    });
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testData);
    
    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Test login with the new user
    console.log('\n🧪 Testing login with new user...');
    const loginData = {
      email: testData.email,
      kata_sandi: testData.kata_sandi
    };
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    console.log('✅ Login successful!');
    console.log('Login user:', loginResponse.data.user);
    
  } catch (error) {
    console.log('❌ Test failed:');
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

testUniqueRegister();
