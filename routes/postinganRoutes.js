
const express = require('express');
const router = express.Router();
const postinganController = require('../controllers/postinganController');
const komentarController = require('../controllers/komentarController');
const {authenticate} = require('../middleware/authentikasi');
const { forPengguna, forPenggunaDanPeninjau } = require('../middleware/authorisasi');

// All Role
router.get('/', postinganController.getAllPostingan);
router.get('/:id', postinganController.getPostinganById);
router.get('/kategori/nama', postinganController.getPostinganByNamaKategori);

// Butuh login + pengguna atau peninjau bisa membuat postingan
router.post('/', authenticate, forPenggunaDanPeninjau, postinganController.createPostingan);

// Butuh login + hanya pemilik postingan ATAU peninjau
router.put('/:id', authenticate, forPenggunaDanPeninjau, postinganController.updatePostingan);
router.delete('/:id', authenticate, forPenggunaDanPeninjau, postinganController.deletePostingan);

// Archive/Activate routes - only for peninjau (admin)
// Temporarily removing auth for debugging
router.patch('/:id/archive', postinganController.archivePostingan);
router.patch('/:id/activate', postinganController.activatePostingan);

// Test route for debugging archive functionality
router.patch('/test/archive', postinganController.testArchive);

// TEMPORARY: Redirect old comment endpoint to new one
// This handles requests from frontend that still use /api/postingan/:id/komentar
router.get('/:id/komentar', (req, res) => {
  // Redirect to the correct endpoint with a message
  res.status(404).json({
    error: 'Endpoint moved',
    message: 'Comments endpoint has moved to /api/komentar. Please use the new endpoint.',
    redirect: '/api/komentar',
    note: 'Filter comments by post ID on the frontend'
  });
});

module.exports = router;
