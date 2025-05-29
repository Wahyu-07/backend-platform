const { Sequelize } = require('sequelize');
require('dotenv').config(); // Pastikan dotenv dikonfigurasi di awal file

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  timezone: '+07:00',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Tes koneksi
sequelize.authenticate()
  .then(() => console.log('✅ Koneksi ke database berhasil.'))
  .catch(err => console.error('❌ Gagal menghubungkan ke database:', err));

module.exports = sequelize;