const { Pengguna, Postingan } = require('../models');

// GET semua pengguna
const getAllPengguna = async (req, res) => {
  try {
    const pengguna = await Pengguna.findAll();
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna', detail: error.message });
  }
};

// GET pengguna berdasarkan ID
const getPenggunaById = async (req, res) => {
  try {
    const pengguna = await Pengguna.findByPk(req.params.id);
    if (!pengguna) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna', detail: error.message });
  }
};

// GET pengguna berdasarkan NIM
const getPenggunaByNim = async (req, res) => {
  try {
    const { nim } = req.params;
    const pengguna = await Pengguna.findOne({ where: { nim } });
    if (!pengguna) {
      return res.status(404).json({ error: 'Pengguna dengan NIM tersebut tidak ditemukan' });
    }
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna berdasarkan NIM', detail: error.message });
  }
};

// GET semua postingan berdasarkan ID pengguna
const getPostinganByPenggunaId = async (req, res) => {
  try {
    const { id } = req.params;
    const pengguna = await Pengguna.findByPk(id);
    if (!pengguna) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    const postingan = await Postingan.findAll({
      where: { id_penulis: id },
      order: [['dibuat_pada', 'DESC']],
      include: [
        {
          model: require('../models').Kategori,
          as: 'kategori'
        }
      ]
    });

    // Return empty array instead of 404 for consistency with frontend
    res.status(200).json(postingan);
  } catch (error) {
    res.status(500).json({
      error: 'Gagal mengambil data postingan pengguna',
      detail: error.message,
    });
  }
};

// POST tambah pengguna
const createPengguna = async (req, res) => {
  try {
    const { nim, nama, email, kata_sandi, peran } = req.body;
    const pengguna = await Pengguna.create({ nim, nama, email, kata_sandi, peran });
    res.status(201).json({ message: 'Pengguna berhasil dibuat', data: pengguna });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat pengguna', detail: error.message });
  }
};

// PUT update pengguna
const updatePengguna = async (req, res) => {
  try {
    const pengguna = await Pengguna.findByPk(req.params.id);
    if (!pengguna) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    const { nim, nama, email, kata_sandi, peran } = req.body;

    pengguna.nim = nim || pengguna.nim;
    pengguna.nama = nama || pengguna.nama;
    pengguna.email = email || pengguna.email;
    pengguna.kata_sandi = kata_sandi || pengguna.kata_sandi;
    pengguna.peran = peran || pengguna.peran;

    await pengguna.save();
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui pengguna', detail: error.message });
  }
};

// DELETE pengguna
const deletePengguna = async (req, res) => {
  try {
    const pengguna = await Pengguna.findByPk(req.params.id);
    if (!pengguna) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    await pengguna.destroy();
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus pengguna', detail: error.message });
  }
};

// UPDATE profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; // From authentication middleware
    const { profile_picture } = req.body;

    // Find user
    const pengguna = await Pengguna.findByPk(userId);
    if (!pengguna) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Update profile picture
    await pengguna.update({ profile_picture });

    // Return updated user data (without password)
    const updatedUser = await Pengguna.findByPk(userId, {
      attributes: { exclude: ['kata_sandi'] }
    });

    res.json({
      message: 'Foto profil berhasil diperbarui',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      error: 'Gagal memperbarui foto profil',
      detail: error.message
    });
  }
};

module.exports = {
  getAllPengguna,
  getPenggunaById,
  getPenggunaByNim,
  getPostinganByPenggunaId,
  createPengguna,
  updatePengguna,
  deletePengguna,
  updateProfilePicture,
};