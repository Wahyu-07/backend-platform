const express = require('express');
const router = express.Router();
const interaksiController = require('../controllers/interaksiController');
const { authenticate } = require('../middleware/authentikasi');
const { forPengguna, forPenggunaDanPeninjau } = require('../middleware/authorisasi');

router.get('/', interaksiController.getAllInteraksi);
router.get('/:id', interaksiController.getInteraksiById);

// Pengguna dan peninjau boleh membuat interaksi postingan/komentar
router.post('/postingan', authenticate, forPenggunaDanPeninjau, interaksiController.createInteraksiPostingan);
router.post('/komentar', authenticate, forPenggunaDanPeninjau, interaksiController.createInteraksiKomentar);

// Update dan delete hanya boleh dilakukan pemilik interaksi atau peninjau
router.put('/:id', authenticate, forPengguna, interaksiController.updateInteraksi);

// Update status report (khusus untuk peninjau/admin)
router.put('/:id/status', authenticate, forPenggunaDanPeninjau, interaksiController.updateReportStatus);

router.delete('/:id', authenticate, forPenggunaDanPeninjau, interaksiController.deleteInteraksi);

module.exports = router;