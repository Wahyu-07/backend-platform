require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pengguna } = require('./models');

async function createTestUser() {
  try {
    console.log('🔧 Creating test users for Flutter app...');

    // Check if test user already exists
    const existingUser = await Pengguna.findOne({ where: { email: 'test@example.com' } });

    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('NIM:', existingUser.nim);
      console.log('Name:', existingUser.nama);
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);

      const testUser = await Pengguna.create({
        nim: '12345678901',
        nama: 'Test User Flutter',
        email: 'test@example.com',
        kata_sandi: hashedPassword,
        peran: 'pengguna'
      });

      console.log('✅ Test user created successfully:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('NIM: 12345678901');
      console.log('Name: Test User Flutter');
    }

    // Check current user count
    const userCount = await Pengguna.count();
    console.log(`\n📊 Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestUser();
