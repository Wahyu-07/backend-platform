const axios = require('axios');

async function testFlutterPosts() {
  try {
    console.log('🧪 Testing Flutter posts display...');
    
    // Step 1: Login
    const loginData = {
      email: 'eddie5',
      kata_sandi: '123456'
    };
    
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get current posts count
    console.log('\n📋 Step 2: Getting current posts...');
    const beforeResponse = await axios.get('http://localhost:5000/api/postingan');
    const postsBefore = beforeResponse.data.length;
    console.log(`📊 Current posts: ${postsBefore}`);
    
    // Step 3: Create a new post
    const postData = {
      judul: `Flutter Test Post ${Date.now()}`,
      konten: 'Ini adalah test posting untuk memastikan Flutter menampilkan posts dengan benar.',
      id_kategori: 3,
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
    
    // Step 4: Verify posts increased
    console.log('\n📋 Step 4: Verifying posts count...');
    const afterResponse = await axios.get('http://localhost:5000/api/postingan');
    const postsAfter = afterResponse.data.length;
    console.log(`📊 Posts after: ${postsAfter}`);
    
    if (postsAfter > postsBefore) {
      console.log('✅ Posts count increased correctly!');
    } else {
      console.log('❌ Posts count did not increase!');
    }
    
    // Step 5: Show latest posts
    console.log('\n📋 Step 5: Latest posts:');
    afterResponse.data.slice(0, 3).forEach((post, index) => {
      console.log(`${index + 1}. ${post.judul} (ID: ${post.id})`);
      console.log(`   Author: ${post.penulis?.nama || 'Unknown'}`);
      console.log(`   Category: ${post.kategori?.nama || 'Unknown'}`);
      console.log(`   Created: ${post.dibuat_pada}`);
      console.log('');
    });
    
    console.log('🎉 Test completed! Flutter should now show the new posts.');
    console.log(`📊 Total posts: ${postsAfter}`);
    
  } catch (error) {
    console.log('❌ Test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message || error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testFlutterPosts();
