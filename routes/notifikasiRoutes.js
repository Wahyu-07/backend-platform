const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authentikasi');
const {
  getAllNotifikasi,
  createNotifikasi,
  tandaiNotifikasiDibaca,
  tandaiSemuaDibaca,
  createTestNotification,
  forceDatabaseSync
} = require('../controllers/notifikasiController');

// Ambil semua notifikasi untuk pengguna login
router.get('/', authenticate, getAllNotifikasi);

// Buat notifikasi baru
router.post('/', authenticate, createNotifikasi);

// Tandai semua notifikasi sebagai dibaca (harus sebelum /:id/dibaca)
router.put('/semua-dibaca', authenticate, tandaiSemuaDibaca);
router.put('/semua/dibaca', authenticate, tandaiSemuaDibaca); // Alternative endpoint for frontend compatibility

// Tandai satu notifikasi sebagai dibaca
router.put('/:id/dibaca', authenticate, tandaiNotifikasiDibaca);

// Test endpoint to create sample notification
router.post('/test', authenticate, createTestNotification);

// Force database sync endpoint (admin only)
router.post('/sync-db', authenticate, forceDatabaseSync);

module.exports = router;
