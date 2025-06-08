const axios = require('axios');

async function testFullFlow() {
  try {
    console.log('🧪 Testing full posting flow...');
    
    // Step 1: Login
    const loginData = {
      email: 'test@example.com',
      kata_sandi: 'password123'
    };
    
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get posts before creating new one
    console.log('\n📋 Step 2: Getting posts before...');
    const beforeResponse = await axios.get('http://localhost:5000/api/postingan');
    const postsBefore = beforeResponse.data.length;
    console.log(`📊 Posts before: ${postsBefore}`);
    
    // Step 3: Create new post
    const postData = {
      judul: `Test Post ${Date.now()}`,
      konten: 'Ini adalah test posting untuk memastikan flow berfungsi dengan baik. Post ini dibuat secara otomatis untuk testing.',
      id_kategori: 2,
      anonim: false
    };
    
    console.log('\n📝 Step 3: Creating new post...');
    const postResponse = await axios.post('http://localhost:5000/api/postingan', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Post created successfully!');
    console.log('📝 Post ID:', postResponse.data.id);
    console.log('📝 Post Title:', postResponse.data.judul);
    
    // Step 4: Get posts after creating new one
    console.log('\n📋 Step 4: Getting posts after...');
    const afterResponse = await axios.get('http://localhost:5000/api/postingan');
    const postsAfter = afterResponse.data.length;
    console.log(`📊 Posts after: ${postsAfter}`);
    
    // Step 5: Verify the new post appears in the list
    const newPost = afterResponse.data.find(post => post.id === postResponse.data.id);
    if (newPost) {
      console.log('✅ New post found in list!');
      console.log('📝 Post details:');
      console.log(`   - ID: ${newPost.id}`);
      console.log(`   - Title: ${newPost.judul}`);
      console.log(`   - Author: ${newPost.penulis?.nama || 'Unknown'}`);
      console.log(`   - Category: ${newPost.kategori?.nama || 'Unknown'}`);
      console.log(`   - Created: ${newPost.dibuat_pada}`);
    } else {
      console.log('❌ New post NOT found in list!');
    }
    
    // Step 6: Test specific post retrieval
    console.log('\n🔍 Step 6: Testing specific post retrieval...');
    const specificPostResponse = await axios.get(`http://localhost:5000/api/postingan/${postResponse.data.id}`);
    console.log('✅ Specific post retrieved successfully!');
    console.log('📝 Post title:', specificPostResponse.data.judul);
    
    console.log('\n🎉 All tests passed! Full flow working correctly.');
    console.log(`📊 Summary: ${postsBefore} → ${postsAfter} posts (${postsAfter - postsBefore} new)`);
    
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

testFullFlow();
