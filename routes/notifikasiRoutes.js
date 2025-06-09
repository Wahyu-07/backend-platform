const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authentikasi');
const {
  getAllNotifikasi,
  createNotifikasi,
  tandaiNotifikasiDibaca,
  tandaiSemuaDibaca
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

module.exports = router;
