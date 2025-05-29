const { Interaksi, Komentar, Postingan, Pengguna } = require('../models');

// GET semua interaksi
const getAllInteraksi = async (req, res) => {
  try {
    const interaksi = await Interaksi.findAll({
      include: [
        { model: Komentar, as: 'komentar' },
        { model: Postingan, as: 'postingan' },
        { model: Pengguna, as: 'pengguna' }
      ]
    });
    res.json(interaksi);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data interaksi', detail: error.message });
  }
};

// GET interaksi berdasarkan ID
const getInteraksiById = async (req, res) => {
  try {
    const interaksi = await Interaksi.findByPk(req.params.id, {
      include: [
        { model: Komentar, as: 'komentar' },
        { model: Postingan, as: 'postingan' },
        { model: Pengguna, as: 'pengguna' }
      ]
    });
    if (!interaksi) {
      return res.status(404).json({ error: 'Interaksi tidak ditemukan' });
    }
    res.json(interaksi);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil interaksi', detail: error.message });
  }
};

// POST membuat interaksi untuk postingan
const createInteraksiPostingan = async (req, res) => {
  try {
    const { id_postingan, tipe } = req.body;

    // Ambil id pengguna dari token yang sudah diverifikasi
    const id_pengguna = req.user.id;

    if (!id_postingan || !tipe) {
      return res.status(400).json({ error: 'id_postingan dan tipe wajib diisi' });
    }

    const validTipe = ['upvote', 'downvote', 'lapor'];
    if (!validTipe.includes(tipe)) {
      return res.status(400).json({ error: 'Tipe interaksi tidak valid' });
    }

    const interaksi = await Interaksi.create({
      id_pengguna,
      id_postingan,
      tipe,
      id_komentar: null,
    });

    res.status(201).json(interaksi);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat interaksi pada postingan', detail: error.message });
  }
};

// POST membuat interaksi untuk komentar
const createInteraksiKomentar = async (req, res) => {
  try {
    const { id_komentar, tipe } = req.body;

    // Ambil id pengguna dari token
    const id_pengguna = req.user.id;

    if (!id_komentar || !tipe) {
      return res.status(400).json({ error: 'id_komentar dan tipe wajib diisi' });
    }

    const validTipe = ['upvote', 'downvote', 'lapor'];
    if (!validTipe.includes(tipe)) {
      return res.status(400).json({ error: 'Tipe interaksi tidak valid' });
    }

    const interaksi = await Interaksi.create({
      id_pengguna,
      id_komentar,
      tipe,
      id_postingan: null,
    });

    res.status(201).json(interaksi);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat interaksi pada komentar', detail: error.message });
  }
};

// PUT memperbarui interaksi
const updateInteraksi = async (req, res) => {
  try {
    const interaksi = await Interaksi.findByPk(req.params.id);
    if (!interaksi) {
      return res.status(404).json({ error: 'Interaksi tidak ditemukan' });
    }

    const { id_pengguna, id_komentar, id_postingan, tipe } = req.body;

    await interaksi.update({
      id_pengguna: id_pengguna ?? interaksi.id_pengguna,
      id_komentar: id_komentar ?? interaksi.id_komentar,
      id_postingan: id_postingan ?? interaksi.id_postingan,
      tipe: tipe ?? interaksi.tipe,
    });

    res.json(interaksi);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui interaksi', detail: error.message });
  }
};

// DELETE interaksi
const deleteInteraksi = async (req, res) => {
  try {
    const interaksi = await Interaksi.findByPk(req.params.id);
    if (!interaksi) {
      return res.status(404).json({ error: 'Interaksi tidak ditemukan' });
    }

    await interaksi.destroy();
    res.json({ message: 'Interaksi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus interaksi', detail: error.message });
  }
};

module.exports = {
  getAllInteraksi,
  getInteraksiById,
  createInteraksiPostingan,
  createInteraksiKomentar,
  updateInteraksi,
  deleteInteraksi,
};