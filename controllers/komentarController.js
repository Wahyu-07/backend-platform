const { Komentar, Postingan, Pengguna, Interaksi } = require('../models');

// GET semua komentar lengkap dengan relasi
const getAllKomentar = async (req, res) => {
  try {
    const komentar = await Komentar.findAll({
      include: [
        { model: Postingan, as: 'postingan' },
        { model: Pengguna, as: 'penulis' },
        { model: Interaksi, as: 'interaksi' }
      ]
    });
    res.json(komentar);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data komentar', detail: error.message });
  }
};

// GET komentar berdasarkan ID dengan relasi
const getKomentarById = async (req, res) => {
  try {
    const komentar = await Komentar.findByPk(req.params.id, {
      include: [
        { model: Postingan, as: 'postingan' },
        { model: Pengguna, as: 'penulis' },
        { model: Interaksi, as: 'interaksi' }
      ]
    });
    if (!komentar) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    res.json(komentar);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil komentar', detail: error.message });
  }
};

// POST membuat komentar baru
const createKomentar = async (req, res) => {
  try {
    const { id_postingan, konten, anonim } = req.body;

    // Ambil ID penulis dari user login (dari token yang sudah diverifikasi)
    const id_penulis = req.user.id;

    if (!id_postingan || !konten) {
      return res.status(400).json({ error: 'id_postingan dan konten wajib diisi' });
    }

    const komentar = await Komentar.create({
      id_penulis,
      id_postingan,
      konten,
      anonim: anonim ?? false
    });

    res.status(201).json(komentar);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat komentar', detail: error.message });
  }
};

// PUT memperbarui komentar
const updateKomentar = async (req, res) => {
  try {
    const komentar = await Komentar.findByPk(req.params.id);
    if (!komentar) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }

    const { id_postingan, id_penulis, konten, anonim } = req.body;

    komentar.id_postingan = id_postingan || komentar.id_postingan;
    komentar.id_penulis = id_penulis || komentar.id_penulis;
    komentar.konten = konten || komentar.konten;
    komentar.anonim = anonim !== undefined ? anonim : komentar.anonim;

    await komentar.save();
    res.json(komentar);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui komentar', detail: error.message });
  }
};

// DELETE komentar
const deleteKomentar = async (req, res) => {
  try {
    const komentar = await Komentar.findByPk(req.params.id);
    if (!komentar) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }

    await komentar.destroy();
    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus komentar', detail: error.message });
  }
};

// Export semua function di sini
module.exports = {
  getAllKomentar,
  getKomentarById,
  createKomentar,
  updateKomentar,
  deleteKomentar,
};
  