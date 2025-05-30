const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pengguna } = require('../models');

// POST /register
const register = async (req, res) => {
  try {
    const { nim, nama, email, kata_sandi, peran, kodeRahasia } = req.body;

    if (!nim || !nama || !email || !kata_sandi) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const existing = await Pengguna.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah digunakan' });
    }

    const hashed = await bcrypt.hash(kata_sandi, 10);

    let finalPeran = 'pengguna';

    if (peran === 'peninjau') {
      if (kodeRahasia === 'peninjau') {
        finalPeran = 'peninjau';
      } else {
        return res.status(403).json({ message: 'Kode rahasia tidak valid untuk membuat akun peninjau' });
      }
    }

    const pengguna = await Pengguna.create({
      nim,
      nama,
      email,
      kata_sandi: hashed,
      peran: finalPeran,
    });

    // Generate token untuk auto-login setelah register
    const token = jwt.sign(
      { id: pengguna.id, peran: pengguna.peran },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: pengguna.id,
        nim: pengguna.nim,
        nama: pengguna.nama,
        email: pengguna.email,
        peran: pengguna.peran,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal registrasi', error: err.message });
  }
};


// POST /login
const login = async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    if (!email || !kata_sandi) {
      return res.status(400).json({ message: 'Email/username dan kata sandi wajib diisi' });
    }

    // Check if input is email or username
    const isEmail = email.includes('@');
    const whereClause = isEmail ? { email } : { nama: email };

    let pengguna = await Pengguna.findOne({ where: whereClause });

    // If not found and input doesn't contain @, try searching by email as well
    if (!pengguna && !isEmail) {
      pengguna = await Pengguna.findOne({ where: { email } });
    }

    if (!pengguna) {
      return res.status(404).json({
        message: 'Email atau username tidak ditemukan'
      });
    }

    const cocok = await bcrypt.compare(kata_sandi, pengguna.kata_sandi);
    if (!cocok) {
      return res.status(401).json({ message: 'Kata sandi salah' });
    }

    const token = jwt.sign(
      { id: pengguna.id, peran: pengguna.peran },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: pengguna.id,
        nim: pengguna.nim,
        nama: pengguna.nama,
        email: pengguna.email,
        peran: pengguna.peran
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login gagal', error: err.message });
  }
};


// GET /profile
const profile = async (req, res) => {
  try {
    const pengguna = await Pengguna.findByPk(req.user.id, {
      attributes: { exclude: ['kata_sandi'] }
    });

    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json(pengguna);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil profil', error: err.message });
  }
};

// PUT /ubah-kata-sandi
const ubahKataSandi = async (req, res) => {
  try {
    const { kata_sandi_lama, kata_sandi_baru } = req.body;

    if (!kata_sandi_lama || !kata_sandi_baru) {
      return res.status(400).json({ message: 'Kata sandi lama dan baru wajib diisi' });
    }

    const pengguna = await Pengguna.findByPk(req.user.id);
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const cocok = await bcrypt.compare(kata_sandi_lama, pengguna.kata_sandi);
    if (!cocok) {
      return res.status(401).json({ message: 'Kata sandi lama salah' });
    }

    const hashedBaru = await bcrypt.hash(kata_sandi_baru, 10);
    pengguna.kata_sandi = hashedBaru;
    await pengguna.save();

    res.json({ message: 'Kata sandi berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengubah kata sandi', error: err.message });
  }
};

// PUT /ubah-profil - User dapat mengubah profil sendiri
const ubahProfil = async (req, res) => {
  try {
    const { nama, email } = req.body;

    if (!nama && !email) {
      return res.status(400).json({ message: 'Nama atau email harus diisi' });
    }

    const pengguna = await Pengguna.findByPk(req.user.id);
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Cek apakah email sudah digunakan oleh user lain
    if (email && email !== pengguna.email) {
      const existingUser = await Pengguna.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email sudah digunakan oleh pengguna lain' });
      }
    }

    // Update data
    if (nama) pengguna.nama = nama;
    if (email) pengguna.email = email;

    await pengguna.save();

    // Return updated user data (exclude password)
    const updatedUser = await Pengguna.findByPk(req.user.id, {
      attributes: { exclude: ['kata_sandi'] }
    });

    res.json({
      message: 'Profil berhasil diperbarui',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengubah profil', error: err.message });
  }
};

// PUT /upload-profile-picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { profile_picture } = req.body;

    if (!profile_picture) {
      return res.status(400).json({ message: 'Profile picture data is required' });
    }

    // Validate base64 format
    if (!profile_picture.startsWith('data:image/jpeg;base64,')) {
      return res.status(400).json({ message: 'Only JPG format is allowed' });
    }

    const pengguna = await Pengguna.findByPk(req.user.id);
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Update profile picture
    pengguna.profile_picture = profile_picture;
    await pengguna.save();

    // Return updated user data (exclude password)
    const updatedUser = await Pengguna.findByPk(req.user.id, {
      attributes: { exclude: ['kata_sandi'] }
    });

    res.json({
      message: 'Profile picture berhasil diupload',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal upload profile picture', error: err.message });
  }
};

module.exports = {
  register,
  login,
  profile,
  ubahKataSandi,
  ubahProfil,
  uploadProfilePicture,
};