const { Sequelize } = require('sequelize');
require('dotenv').config(); // Pastikan dotenv dikonfigurasi di awal file

const sequelize = new Sequelize(
  process.env.DB_NAME,   // Nama database
  process.env.DB_USER,   // Pengguna database
  process.env.DB_PASS,   // Kata sandi pengguna
  {
    host: process.env.DB_HOST,   // Host database
    port: process.env.DB_PORT,   // Port database
    dialect: 'postgres',         // Tipe database
    logging: false,              // Nonaktifkan logging SQL
    timezone: '+07:00',          // Atur timezone ke WIB (UTC+7)
    dialectOptions: {
      useUTC: false              // Jangan gunakan UTC di PostgreSQL
    }
  }
);

// Tes koneksi
sequelize.authenticate()
  .then(() => console.log('✅ Koneksi ke database berhasil.'))
  .catch(err => console.error('❌ Gagal menghubungkan ke database:', err));

module.exports = sequelize;