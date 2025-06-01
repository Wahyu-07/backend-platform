require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postinganRoutes = require('./routes/postinganRoutes');
const komentarRoutes = require('./routes/komentarRoutes');
const interaksiRoutes = require('./routes/interaksiRoutes');
const penggunaRoutes = require('./routes/penggunaRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('🚀 API Platform Aspirasi Mahasiswa berjalan!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/postingan', postinganRoutes);
app.use('/api/komentar', komentarRoutes);
app.use('/api/interaksi', interaksiRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

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