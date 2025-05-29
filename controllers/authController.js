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

    if (peran === 'pengelola') {
      if (kodeRahasia === 'pengelola') {
        finalPeran = 'pengelola';
      } else {
        return res.status(403).json({ message: 'Kode rahasia tidak valid untuk membuat akun pengelola' });
      }
    } 

    const pengguna = await Pengguna.create({
      nim,
      nama,
      email,
      kata_sandi: hashed,
      peran: finalPeran,
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      pengguna: {
        id: pengguna.id,
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
      return res.status(400).json({ message: 'Email dan kata sandi wajib diisi' });
    }

    const pengguna = await Pengguna.findOne({ where: { email } });
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
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
      token,
      pengguna: {
        id: pengguna.id,
        email: pengguna.email,
        nama: pengguna.nama,
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

module.exports = {
  register,
  login,
  profile,
  ubahKataSandi,
};