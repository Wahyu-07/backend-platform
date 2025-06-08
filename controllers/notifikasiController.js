const { Op } = require('sequelize');
const { Notifikasi, Pengguna, Postingan, Komentar } = require('../models');

/**
 * Ambil semua notifikasi untuk pengguna yang sedang login
 */
const getAllNotifikasi = async (req, res) => {
  try {
    const idPenerima = req.user.id;

    await hapusNotifikasiTidakValid();

    const semuaNotifikasi = await Notifikasi.findAll({
      where: { id_penerima: idPenerima },
      order: [['dibuat_pada', 'DESC']],
      include: [
        { model: Pengguna, as: 'pengirim', attributes: ['id', 'nama', 'email'] },
        { model: Postingan, as: 'postingan', attributes: ['id', 'judul'], required: false },
        { model: Komentar, as: 'komentar', attributes: ['id', 'konten'], required: false }
      ]
    });

    const notifikasiValid = semuaNotifikasi.filter(n => {
      if (n.tipe === 'system') return true;
      if (n.id_postingan && !n.postingan) return false;
      if (n.id_komentar && !n.komentar) return false;
      return true;
    });

    res.json(notifikasiValid);
  } catch (err) {
    console.error('Gagal mengambil notifikasi:', err);
    res.status(500).json({ message: 'Gagal mengambil notifikasi', error: err.message });
  }
};

// Helper function untuk menghapus notifikasi yang tidak valid (orphaned)
const hapusNotifikasiTidakValid = async () => {
  try {
    // Hapus notifikasi yang merujuk ke postingan yang sudah tidak ada
    await Notifikasi.destroy({
      where: {
        id_postingan: { [require('sequelize').Op.not]: null }
      },
      include: [{
        model: Postingan,
        as: 'postingan',
        where: null,
        required: false
      }]
    });

    // Hapus notifikasi yang merujuk ke komentar yang sudah tidak ada
    await Notifikasi.destroy({
      where: {
        id_komentar: { [require('sequelize').Op.not]: null }
      },
      include: [{
        model: Komentar,
        as: 'komentar',
        where: null,
        required: false
      }]
    });
  } catch (error) {
    console.error('Error saat menghapus notifikasi tidak valid:', error);
  }
};


/**
 * Buat notifikasi baru
 */
const createNotifikasi = async (req, res) => {
  try {
    const { id_penerima, id_pengirim, id_postingan, id_komentar, tipe, judul, pesan } = req.body;

    if (!id_penerima || !tipe || !judul || !pesan) {
      return res.status(400).json({ message: 'ID penerima, tipe, judul, dan pesan wajib diisi' });
    }

    if (id_pengirim && id_pengirim === id_penerima) {
      return res.status(400).json({ message: 'Tidak dapat membuat notifikasi untuk diri sendiri' });
    }

    const notifikasiBaru = await Notifikasi.create({
      id_penerima,
      id_pengirim: id_pengirim || null,
      id_postingan: id_postingan || null,
      id_komentar: id_komentar || null,
      tipe,
      judul,
      pesan,
      dibaca: false
    });

    const notifikasiLengkap = await Notifikasi.findByPk(notifikasiBaru.id, {
      include: [
        { model: Pengguna, as: 'pengirim', attributes: ['id', 'nama', 'email'] },
        { model: Postingan, as: 'postingan', attributes: ['id', 'judul'] },
        { model: Komentar, as: 'komentar', attributes: ['id', 'konten'] }
      ]
    });

    res.status(201).json({ message: 'Notifikasi berhasil dibuat', notifikasi: notifikasiLengkap });
  } catch (err) {
    console.error('Gagal membuat notifikasi:', err);
    res.status(500).json({ message: 'Gagal membuat notifikasi', error: err.message });
  }
};

/**
 * Tandai satu notifikasi sebagai dibaca
 */
const tandaiNotifikasiDibaca = async (req, res) => {
  try {
    const { id } = req.params;
    const idPenerima = req.user.id;

    const notifikasi = await Notifikasi.findOne({
      where: { id, id_penerima: idPenerima }
    });

    if (!notifikasi) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }

    await notifikasi.update({ dibaca: true });

    res.json({ message: 'Notifikasi ditandai sebagai dibaca', notifikasi });
  } catch (err) {
    console.error('Gagal menandai notifikasi:', err);
    res.status(500).json({ message: 'Gagal menandai notifikasi sebagai dibaca', error: err.message });
  }
};

/**
 * Tandai semua notifikasi sebagai dibaca
 */
const tandaiSemuaDibaca = async (req, res) => {
  try {
    const idPenerima = req.user.id;

    await Notifikasi.update(
      { dibaca: true },
      { where: { id_penerima: idPenerima, dibaca: false } }
    );

    res.json({ message: 'Semua notifikasi ditandai sebagai dibaca' });
  } catch (err) {
    console.error('Gagal menandai semua notifikasi:', err);
    res.status(500).json({ message: 'Gagal menandai semua notifikasi', error: err.message });
  }
};

/**
 * Helper: Buat notifikasi untuk upvote
 */
const createNotifikasiUpvote = async (id_pengirim, id_penerima, id_postingan, namaPengirim, judulPostingan) => {
  try {
    if (id_pengirim === id_penerima) return;

    await Notifikasi.create({
      id_penerima,
      id_pengirim,
      id_postingan,
      tipe: 'like',
      judul: 'Postingan Anda Mendapat Upvote',
      pesan: `${namaPengirim} memberikan upvote pada postingan Anda: "${judulPostingan}"`,
      dibaca: false
    });
  } catch (err) {
    console.error('Gagal membuat notifikasi upvote:', err);
  }
};

/**
 * Helper: Buat notifikasi untuk downvote
 */
const createNotifikasiDownvote = async (id_pengirim, id_penerima, id_postingan, namaPengirim, judulPostingan) => {
  try {
    if (id_pengirim === id_penerima) return;

    await Notifikasi.create({
      id_penerima,
      id_pengirim,
      id_postingan,
      tipe: 'downvote',
      judul: 'Postingan Anda Mendapat Downvote',
      pesan: `${namaPengirim} memberikan downvote pada postingan Anda: "${judulPostingan}"`,
      dibaca: false
    });
  } catch (err) {
    console.error('Gagal membuat notifikasi downvote:', err);
  }
};

/**
 * Helper: Buat notifikasi untuk komentar
 */
const createNotifikasiKomentar = async (id_pengirim, id_penerima, id_postingan, id_komentar, namaPengirim, judulPostingan) => {
  try {
    if (id_pengirim === id_penerima) return;

    await Notifikasi.create({
      id_penerima,
      id_pengirim,
      id_postingan,
      id_komentar,
      tipe: 'comment',
      judul: 'Komentar Baru',
      pesan: `${namaPengirim} mengomentari postingan Anda: "${judulPostingan}"`,
      dibaca: false
    });
  } catch (err) {
    console.error('Gagal membuat notifikasi komentar:', err);
  }
};

// Alias functions for backward compatibility
const createLikeNotification = createNotifikasiUpvote;
const createDownvoteNotification = createNotifikasiDownvote;
const createCommentNotification = createNotifikasiKomentar;

module.exports = {
  getAllNotifikasi,
  createNotifikasi,
  tandaiNotifikasiDibaca,
  tandaiSemuaDibaca,
  createNotifikasiUpvote,
  createNotifikasiDownvote,
  createNotifikasiKomentar,
  createLikeNotification,
  createDownvoteNotification,
  createCommentNotification
};
