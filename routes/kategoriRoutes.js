const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { authenticate } = require('../middleware/authentikasi');
const { forPengelola } = require('../middleware/authorisasi');

// Bebas akses
router.get('/', kategoriController.getAllKategori);
router.get('/:id', kategoriController.getKategoriById);

// Hanya untuk pengelola
router.post('/', authenticate, forPengelola, kategoriController.createKategori);
router.put('/:id', authenticate, forPengelola, kategoriController.updateKategori);
router.delete('/:id', authenticate, forPengelola, kategoriController.deleteKategori);

module.exports = router;