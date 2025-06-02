
const { Kategori } = require('../models');

// GET semua kategori
const getAllKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findAll();
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data kategori', detail: error.message });
  }
};

// GET kategori berdasarkan ID
const getKategoriById = async (req, res) => {
  try {
    const kategori = await Kategori.findByPk(req.params.id);
    if (!kategori) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil kategori', detail: error.message });
  }
};

// POST membuat kategori baru
const createKategori = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Silakan login terlebih dahulu' });
    }

    const { nama } = req.body;
    if (!nama) {
      return res.status(400).json({ error: 'Field nama wajib diisi' });
    }

    const kategori = await Kategori.create({ nama });
    res.status(201).json(kategori);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat kategori', detail: error.message });
  }
};

// PUT mengubah kategori berdasarkan ID
const updateKategori = async (req, res) => {
  try {
    const { nama } = req.body;
    const kategori = await Kategori.findByPk(req.params.id);
    if (!kategori) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }

    kategori.nama = nama || kategori.nama;
    await kategori.save();
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui kategori', detail: error.message });
  }
};

// DELETE kategori berdasarkan ID
const deleteKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findByPk(req.params.id);
    if (!kategori) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }

    await kategori.destroy();
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus kategori', detail: error.message });
  }
};

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};
