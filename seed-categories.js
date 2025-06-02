require('dotenv').config();
const { sequelize, Kategori } = require('./models');

const categories = [
  'Fasilitas Kampus',
  'Akademik', 
  'Kesejahteraan Mahasiswa',
  'Kegiatan Kemahasiswaan',
  'Sarana dan Prasarana Digital',
  'Keamanan dan Ketertiban',
  'Lingkungan dan Kebersihan',
  'Transportasi dan Akses',
  'Kebijakan dan Administrasi',
  'Saran dan Inovasi'
];

async function seedCategories() {
  try {
    console.log('🌱 Memulai seeding kategori...');
    
    // Cek koneksi database
    await sequelize.authenticate();
    console.log('✅ Database terkoneksi');
    
    // Sync database
    await sequelize.sync();
    console.log('✅ Database ter-sinkronisasi');
    
    // Cek apakah kategori sudah ada
    const existingCategories = await Kategori.findAll();
    
    if (existingCategories.length > 0) {
      console.log(`📋 Kategori sudah ada (${existingCategories.length} kategori)`);
      existingCategories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.nama}`);
      });
      return;
    }
    
    // Tambahkan kategori baru
    console.log('📝 Menambahkan kategori baru...');
    
    for (let i = 0; i < categories.length; i++) {
      const category = await Kategori.create({
        nama: categories[i]
      });
      console.log(`   ✅ ${i + 1}. ${category.nama} (ID: ${category.id})`);
    }
    
    console.log('🎉 Seeding kategori berhasil!');
    
  } catch (error) {
    console.error('❌ Error saat seeding kategori:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Koneksi database ditutup');
  }
}

// Jalankan seeder
seedCategories();
