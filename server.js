require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database'); // Menggunakan sequelize dari models

// Import routes
const authRoutes = require('./routes/authRoutes');
const postinganRoutes = require('./routes/postinganRoutes');
const komentarRoutes = require('./routes/komentarRoutes');
const interaksiRoutes = require('./routes/interaksiRoutes');
const penggunaRoutes = require('./routes/penggunaRoutes'); // ✅ Tambahkan route pengguna
const kategoriRoutes = require('./routes/kategoriRoutes');

// Memuat variabel lingkungan dari file .env
require('dotenv').config();
dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/postingan', postinganRoutes);
app.use('/api/komentar', komentarRoutes);
app.use('/api/interaksi', interaksiRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/kategori', kategoriRoutes);

// Koneksi ke database dan sinkronisasi
async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database terkoneksi dengan baik");

    await sequelize.sync(); // Sinkronisasi model ke database
    console.log("Database ter-sinkronisasi");
  } catch (error) {
    console.error("Error menghubungkan ke database:", error);
  }
}

connectDatabase();

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});