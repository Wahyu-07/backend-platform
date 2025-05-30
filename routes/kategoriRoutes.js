const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { authenticate } = require('../middleware/authentikasi');
const { forPeninjau } = require('../middleware/authorisasi');

// Bebas akses
router.get('/', kategoriController.getAllKategori);
router.get('/:id', kategoriController.getKategoriById);

// Hanya untuk peninjau
router.post('/', authenticate, forPeninjau, kategoriController.createKategori);
router.put('/:id', authenticate, forPeninjau, kategoriController.updateKategori);
router.delete('/:id', authenticate, forPeninjau, kategoriController.deleteKategori);

module.exports = router;