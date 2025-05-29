const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authentikasi');


router.post('/register', authController.register);
router.post('/login', authController.login);

// Route profile dan ubah kata sandi perlu autentikasi
router.get('/profile', authenticate, authController.profile);
router.put('/ubah-kata-sandi', authenticate, authController.ubahKataSandi);

module.exports = router;