const axios = require('axios');

async function testCommentEndpoint() {
  const baseURL = 'https://platform.up.railway.app/api';
  
  try {
    console.log('🧪 Testing comment endpoint after database migration...');
    
    // Test GET /api/komentar
    console.log('\n📥 Testing GET /api/komentar');
    const response = await axios.get(`${baseURL}/komentar`);
    
    console.log('✅ Status:', response.status);
    console.log('📦 Response length:', response.data.length);
    console.log('📄 Sample data:', JSON.stringify(response.data.slice(0, 2), null, 2));
    
    console.log('\n🎉 Comment endpoint is working after migration!');
    
  } catch (error) {
    console.error('❌ Error testing comment endpoint:', error.response?.data || error.message);
    
    if (error.response?.data?.detail) {
      console.error('🔍 Error detail:', error.response.data.detail);
    }
  }
}

testCommentEndpoint();
