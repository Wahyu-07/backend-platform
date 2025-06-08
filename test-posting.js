require('dotenv').config();
const axios = require('axios');

async function testPosting() {
  try {
    console.log('🧪 Testing posting functionality...');
    
    // First, login to get token
    const loginData = {
      email: 'test@example.com',
      kata_sandi: 'password123'
    };
    
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test posting
    const postData = {
      judul: 'Test Posting dari Script',
      konten: 'Ini adalah test posting untuk memastikan API berfungsi dengan baik.',
      id_kategori: 2,
      anonim: false
    };
    
    console.log('📝 Creating post...');
    const postResponse = await axios.post('http://localhost:5000/api/postingan', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Post created successfully!');
    console.log('Post data:', postResponse.data);
    
    // Test getting all posts
    console.log('\n📋 Getting all posts...');
    const getResponse = await axios.get('http://localhost:5000/api/postingan');
    console.log('✅ Posts retrieved:', getResponse.data.length, 'posts found');
    
  } catch (error) {
    console.log('❌ Test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message || error.response.data);
      if (error.response.data.error) {
        console.log('Error:', error.response.data.error);
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

testPosting();
