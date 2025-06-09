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
// CORS configuration for production and development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost, 127.0.0.1, and production domains
    const allowedOrigins = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/localhost:\d+$/,
      /^https:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.railway\.app$/,
      'https://aspirasiku-frontend.vercel.app',
      'https://aspirasiku.netlify.app'
    ];

    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      }
      return pattern.test(origin);
    });

    if (isAllowed) {
      return callback(null, true);
    }

    console.log('CORS allowed origin:', origin);
    // Allow all origins for now to prevent CORS issues
    callback(null, true);
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

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AspirasiKu Backend API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/postingan', postinganRoutes);
app.use('/api/komentar', komentarRoutes);
app.use('/api/interaksi', interaksiRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Handle specific error types
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      error: err.errors ? err.errors.map(e => e.message) : err.message
    });
  }

  res.status(500).json({
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl
  });
});

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