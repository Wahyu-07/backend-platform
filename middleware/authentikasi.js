const jwt = require('jsonwebtoken');

// Middleware verifikasi token (autentikasi)
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Ambil token dari header Authorization, formatnya: "Bearer tokenstring"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, silakan login terlebih dahulu' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa' });
    }
    console.log("Payload hasil decode JWT:", userPayload); // Tambahkan ini
    // Simpan data user dari token ke req.user agar bisa dipakai di controller
    req.user = userPayload;
    next();
  });
};


module.exports = { authenticate };