const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');
const {authenticate} = require('../middleware/authentikasi')
const  {forPengelola} = require('../middleware/authorisasi');

// Route yang bisa diakses tanpa otorisasi khusus (misal get pengguna by nim, postingan, dll)
router.get('/nim/:nim', authenticate, penggunaController.getPenggunaByNim);
router.get('/:id/postingan', authenticate, penggunaController.getPostinganByPenggunaId);
router.get('/:id', authenticate, penggunaController.getPenggunaById);
router.get('/', authenticate, penggunaController.getAllPengguna);

// Route yang hanya boleh diakses pengelola
router.post('/', authenticate, forPengelola, penggunaController.createPengguna);
router.put('/:id', authenticate, forPengelola, penggunaController.updatePengguna);
router.delete('/:id', authenticate, forPengelola, penggunaController.deletePengguna);

module.exports = router;