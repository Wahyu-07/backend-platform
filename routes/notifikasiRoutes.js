const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authentikasi');
const {
  getAllNotifikasi,
  createNotifikasi,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notifikasiController');

/**
 * GET /api/notifikasi
 * Mendapatkan semua notifikasi untuk user yang sedang login
 */
router.get('/', authenticate, getAllNotifikasi);

/**
 * POST /api/notifikasi
 * Membuat notifikasi baru
 */
router.post('/', authenticate, createNotifikasi);

/**
 * PUT /api/notifikasi/:id/read
 * Menandai notifikasi sebagai sudah dibaca
 */
router.put('/:id/read', authenticate, markAsRead);

/**
 * PUT /api/notifikasi/read-all
 * Menandai semua notifikasi sebagai sudah dibaca
 */
router.put('/read-all', authenticate, markAllAsRead);

module.exports = router;