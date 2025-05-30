const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authentikasi');
const {
  getAllNotifikasi,
  createNotifikasi,
  tandaiNotifikasiDibaca,
  tandaiSemuaDibaca,
} = require('../controllers/notifikasiController');

// Ambil semua notifikasi untuk pengguna login
router.get('/', authenticate, getAllNotifikasi);

// Buat notifikasi baru
router.post('/', authenticate, createNotifikasi);

// Tandai satu notifikasi sebagai dibaca
router.put('/:id/dibaca', authenticate, tandaiNotifikasiDibaca);

// Tandai semua notifikasi sebagai dibaca
router.put('/semua/dibaca', authenticate, tandaiSemuaDibaca);

module.exports = router;
