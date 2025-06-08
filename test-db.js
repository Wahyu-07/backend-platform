require('dotenv').config();
const { Pengguna } = require('./models');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection and user creation...');
    
    // Test 1: Check existing users
    const existingUsers = await Pengguna.findAll({
      attributes: ['id', 'nim', 'nama', 'email', 'peran'],
      limit: 5
    });
    
    console.log('📊 Existing users in database:', existingUsers.length);
    existingUsers.forEach(user => {
      console.log(`  - ${user.nama} (${user.email}) - NIM: ${user.nim}`);
    });
    
    // Test 2: Check if NIM or email already exists
    const testNim = '12350111035';
    const testEmail = 'eddie5@gmail.com';
    
    const existingByNim = await Pengguna.findOne({ where: { nim: testNim } });
    const existingByEmail = await Pengguna.findOne({ where: { email: testEmail } });
    
    console.log(`\n🔍 Checking conflicts:`);
    console.log(`  - NIM ${testNim} exists:`, !!existingByNim);
    console.log(`  - Email ${testEmail} exists:`, !!existingByEmail);
    
    if (existingByNim) {
      console.log(`  - Existing user with NIM: ${existingByNim.nama} (${existingByNim.email})`);
    }
    
    if (existingByEmail) {
      console.log(`  - Existing user with Email: ${existingByEmail.nama} (${existingByEmail.nim})`);
    }
    
    // Test 3: Try to create a new unique user
    const uniqueNim = '99999999999';
    const uniqueEmail = 'test-unique@example.com';
    
    try {
      const newUser = await Pengguna.create({
        nim: uniqueNim,
        nama: 'Test Unique User',
        email: uniqueEmail,
        kata_sandi: 'hashedpassword123',
        peran: 'pengguna'
      });
      
      console.log('\n✅ Successfully created test user:', newUser.nama);
      
      // Clean up - delete the test user
      await newUser.destroy();
      console.log('🧹 Test user cleaned up');
      
    } catch (createError) {
      console.log('\n❌ Error creating test user:', createError.message);
      if (createError.errors) {
        createError.errors.forEach(err => {
          console.log(`  - ${err.path}: ${err.message}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase();
