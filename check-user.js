require('dotenv').config();
const { Pengguna } = require('./models');

async function checkSpecificUser() {
  try {
    const nim = '12350111035';
    const email = 'eddie5@gmail.com';
    
    const userByNim = await Pengguna.findOne({ where: { nim } });
    const userByEmail = await Pengguna.findOne({ where: { email } });
    
    console.log('🔍 Checking user conflicts:');
    console.log(`NIM ${nim}:`);
    if (userByNim) {
      console.log(`  ✅ EXISTS - Name: ${userByNim.nama}, Email: ${userByNim.email}`);
    } else {
      console.log(`  ❌ NOT FOUND`);
    }
    
    console.log(`Email ${email}:`);
    if (userByEmail) {
      console.log(`  ✅ EXISTS - Name: ${userByEmail.nama}, NIM: ${userByEmail.nim}`);
    } else {
      console.log(`  ❌ NOT FOUND`);
    }
    
    // Show all users for reference
    console.log('\n📋 All users in database:');
    const allUsers = await Pengguna.findAll({
      attributes: ['id', 'nim', 'nama', 'email', 'peran']
    });
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nama} - NIM: ${user.nim} - Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkSpecificUser();
