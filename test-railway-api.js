const axios = require('axios');

async function testRailwayAPI() {
  try {
    console.log('🧪 Testing Railway API response format...');
    
    // Test 1: Get posts endpoint
    console.log('\n📋 Test 1: GET /api/postingan');
    const postsResponse = await axios.get('https://platform.up.railway.app/api/postingan');
    console.log('✅ Status:', postsResponse.status);
    console.log('📦 Response type:', typeof postsResponse.data);
    console.log('📦 Is Array:', Array.isArray(postsResponse.data));
    
    if (Array.isArray(postsResponse.data)) {
      console.log('📊 Posts count:', postsResponse.data.length);
      if (postsResponse.data.length > 0) {
        console.log('📝 First post sample:');
        console.log('   - ID:', postsResponse.data[0].id);
        console.log('   - Title:', postsResponse.data[0].judul);
        console.log('   - Author:', postsResponse.data[0].penulis?.nama || 'Unknown');
        console.log('   - Category:', postsResponse.data[0].kategori?.nama || 'Unknown');
      }
    } else {
      console.log('📦 Response structure:');
      console.log('   - Keys:', Object.keys(postsResponse.data));
      console.log('   - Full response:', JSON.stringify(postsResponse.data, null, 2));
    }
    
    // Test 2: Get categories endpoint
    console.log('\n📋 Test 2: GET /api/kategori');
    const categoriesResponse = await axios.get('https://platform.up.railway.app/api/kategori');
    console.log('✅ Status:', categoriesResponse.status);
    console.log('📦 Response type:', typeof categoriesResponse.data);
    console.log('📦 Is Array:', Array.isArray(categoriesResponse.data));
    
    if (Array.isArray(categoriesResponse.data)) {
      console.log('📊 Categories count:', categoriesResponse.data.length);
    } else {
      console.log('📦 Categories structure:', Object.keys(categoriesResponse.data));
    }
    
    // Test 3: Test login to get token
    console.log('\n📋 Test 3: POST /api/auth/login');
    const loginData = {
      email: 'eddie5',
      kata_sandi: '123456'
    };
    
    const loginResponse = await axios.post('https://platform.up.railway.app/api/auth/login', loginData);
    console.log('✅ Login Status:', loginResponse.status);
    console.log('📦 Login Response keys:', Object.keys(loginResponse.data));
    
    if (loginResponse.data.token) {
      console.log('🔑 Token received successfully');
      
      // Test 4: Create a post with token
      console.log('\n📋 Test 4: POST /api/postingan (with auth)');
      const postData = {
        judul: `Railway Test Post ${Date.now()}`,
        konten: 'Testing Railway API response format for Flutter debugging.',
        id_kategori: 2,
        anonim: false
      };
      
      const createResponse = await axios.post('https://platform.up.railway.app/api/postingan', postData, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Create Post Status:', createResponse.status);
      console.log('📦 Create Response type:', typeof createResponse.data);
      console.log('📦 Create Response keys:', Object.keys(createResponse.data));
      console.log('📝 Created Post ID:', createResponse.data.id);
      
      // Test 5: Get posts again to see the new count
      console.log('\n📋 Test 5: GET /api/postingan (after create)');
      const updatedPostsResponse = await axios.get('https://platform.up.railway.app/api/postingan');
      console.log('✅ Status:', updatedPostsResponse.status);
      console.log('📊 Updated Posts count:', updatedPostsResponse.data.length);
    }
    
    console.log('\n🎉 Railway API test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRailwayAPI();
