const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');
const {authenticate} = require('../middleware/authentikasi')
const  {forPeninjau} = require('../middleware/authorisasi');

// Route yang bisa diakses tanpa otorisasi khusus (misal get pengguna by nim, postingan, dll)
router.get('/nim/:nim', authenticate, penggunaController.getPenggunaByNim);
router.get('/:id/postingan', authenticate, penggunaController.getPostinganByPenggunaId);
router.get('/:id', authenticate, penggunaController.getPenggunaById);
router.get('/', authenticate, penggunaController.getAllPengguna);

// Profile picture update (user can update their own)
router.put('/profile-picture', authenticate, penggunaController.updateProfilePicture);

// Route yang hanya boleh diakses peninjau
router.post('/', authenticate, forPeninjau, penggunaController.createPengguna);
router.put('/:id', authenticate, forPeninjau, penggunaController.updatePengguna);
router.delete('/:id', authenticate, forPeninjau, penggunaController.deletePengguna);

module.exports = router;