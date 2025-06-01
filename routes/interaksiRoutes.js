const express = require('express');
const router = express.Router();
const interaksiController = require('../controllers/interaksiController');
const { authenticate } = require('../middleware/authentikasi');
const { forPengguna, forPenggunaDanPeninjau } = require('../middleware/authorisasi');

router.get('/', interaksiController.getAllInteraksi);
router.get('/:id', interaksiController.getInteraksiById);

// Hanya pengguna yang boleh membuat interaksi postingan/komentar
router.post('/postingan', authenticate, forPengguna, interaksiController.createInteraksiPostingan);
router.post('/komentar', authenticate, forPengguna, interaksiController.createInteraksiKomentar);

// Update dan delete hanya boleh dilakukan pemilik interaksi atau peninjau
router.put('/:id', authenticate, forPengguna, interaksiController.updateInteraksi);
router.delete('/:id', authenticate, forPenggunaDanPeninjau, interaksiController.deleteInteraksi);

module.exports = router;