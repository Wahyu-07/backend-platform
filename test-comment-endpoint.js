const axios = require('axios');

async function testCommentEndpoint() {
  const baseURL = 'https://platform.up.railway.app/api';

  try {
    console.log('🧪 Testing comment endpoint after backend fixes...');

    // Test GET /api/komentar
    console.log('\n📥 Testing GET /api/komentar');
    const response = await axios.get(`${baseURL}/komentar`);

    console.log('✅ Status:', response.status);
    console.log('📦 Response length:', response.data.length);
    console.log('📄 Sample data:', JSON.stringify(response.data.slice(0, 2), null, 2));

    console.log('\n🎉 Comment endpoint is working!');

    // Test old endpoint to see the redirect message
    console.log('\n📥 Testing old endpoint /api/postingan/12/komentar');
    try {
      const oldResponse = await axios.get(`${baseURL}/postingan/12/komentar`);
      console.log('Old endpoint response:', oldResponse.data);
    } catch (oldError) {
      console.log('Old endpoint error (expected):', oldError.response?.data || oldError.message);
    }

  } catch (error) {
    console.error('❌ Error testing comment endpoint:', error.response?.data || error.message);

    if (error.response?.data?.detail) {
      console.error('🔍 Error detail:', error.response.data.detail);
    }
  }
}

testCommentEndpoint();
