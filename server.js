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
// CORS configuration for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and 127.0.0.1 with any port
    const allowedOrigins = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/localhost:\d+$/,
      /^https:\/\/127\.0\.0\.1:\d+$/
    ];

    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
    if (isAllowed) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Origin: ${req.headers.origin} - Body:`, req.body);
  next();
});

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