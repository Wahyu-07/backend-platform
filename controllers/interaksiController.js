const { Interaksi, Komentar, Postingan, Pengguna } = require('../models');
const { createLikeNotification, createDownvoteNotification } = require('./notifikasiController');

// GET semua interaksi
const getAllInteraksi = async (req, res) => {
  try {
    // Filter untuk hanya menampilkan reports yang aktif (belum diselesaikan/diabaikan)
    const whereClause = {};

    // Temporarily disabled status filter due to missing status column in production
    // TODO: Re-enable when database migration is complete
    // whereClause.status = 'aktif';

    const interaksi = await Interaksi.findAll({
      where: whereClause,
      include: [
        {
          model: Komentar,
          as: 'komentar',
          include: [
            {
              model: Pengguna,
              as: 'penulis',
              attributes: ['id', 'nama', 'peran']
            }
          ]
        },
        {
          model: Postingan,
          as: 'postingan',
          include: [
            {
              model: Pengguna,
              as: 'penulis',
              attributes: ['id', 'nama', 'peran']
            },
            {
              model: require('../models').Kategori,
              as: 'kategori',
              attributes: ['id', 'nama']
            }
          ]
        },
        {
          model: Pengguna,
          as: 'pengguna',
          attributes: ['id', 'nama', 'peran']
        }
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
    const { id_postingan, tipe, alasan_laporan } = req.body;

    // Ambil id pengguna dari token yang sudah diverifikasi
    const id_pengguna = req.user.id;

    if (!id_postingan || !tipe) {
      return res.status(400).json({ error: 'id_postingan dan tipe wajib diisi' });
    }

    const validTipe = ['upvote', 'downvote', 'lapor'];
    if (!validTipe.includes(tipe)) {
      return res.status(400).json({ error: 'Tipe interaksi tidak valid' });
    }

    // Validasi alasan laporan jika tipe adalah 'lapor'
    if (tipe === 'lapor' && !alasan_laporan) {
      return res.status(400).json({ error: 'Alasan laporan wajib diisi untuk tipe lapor' });
    }

    // Cek apakah user sudah pernah melakukan interaksi yang sama
    const existingInteraksi = await Interaksi.findOne({
      where: {
        id_pengguna,
        id_postingan,
        tipe
      }
    });

    if (existingInteraksi) {
      // Toggle: hapus interaksi jika sudah ada
      await existingInteraksi.destroy();
      return res.json({
        message: `${tipe} berhasil dihapus`,
        action: 'removed',
        tipe: tipe
      });
    }

    // Cek apakah user sudah melakukan interaksi berlawanan (upvote vs downvote)
    if (tipe === 'upvote' || tipe === 'downvote') {
      const oppositeType = tipe === 'upvote' ? 'downvote' : 'upvote';
      const oppositeInteraksi = await Interaksi.findOne({
        where: {
          id_pengguna,
          id_postingan,
          tipe: oppositeType
        }
      });

      if (oppositeInteraksi) {
        // Hapus interaksi berlawanan
        await oppositeInteraksi.destroy();
      }
    }

    const interaksi = await Interaksi.create({
      id_pengguna,
      id_postingan,
      tipe,
      id_komentar: null,
      alasan_laporan: tipe === 'lapor' ? alasan_laporan : null,
    });

    // Buat notifikasi untuk pemilik postingan
    if (tipe === 'upvote' || tipe === 'downvote') {
      try {
        // Ambil data postingan dan pemiliknya
        const postingan = await Postingan.findByPk(id_postingan, {
          include: [
            {
              model: Pengguna,
              as: 'penulis',
              attributes: ['id', 'nama']
            }
          ]
        });

        if (postingan && postingan.penulis) {
          // Ambil data user yang melakukan interaksi
          const userPengirim = await Pengguna.findByPk(id_pengguna, {
            attributes: ['nama']
          });

          if (userPengirim) {
            if (tipe === 'upvote') {
              await createLikeNotification(
                id_pengguna,
                postingan.penulis.id,
                id_postingan,
                userPengirim.nama,
                postingan.judul
              );
            } else if (tipe === 'downvote') {
              await createDownvoteNotification(
                id_pengguna,
                postingan.penulis.id,
                id_postingan,
                userPengirim.nama,
                postingan.judul
              );
            }
          }
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Jangan gagalkan request utama jika notifikasi gagal
      }
    }

    res.status(201).json({
      ...interaksi.toJSON(),
      message: `${tipe} berhasil ditambahkan`,
      action: 'added'
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat interaksi pada postingan', detail: error.message });
  }
};

// POST membuat interaksi untuk komentar
const createInteraksiKomentar = async (req, res) => {
  try {
    const { id_komentar, tipe, alasan_laporan } = req.body;

    // Ambil id pengguna dari token
    const id_pengguna = req.user.id;

    if (!id_komentar || !tipe) {
      return res.status(400).json({ error: 'id_komentar dan tipe wajib diisi' });
    }

    const validTipe = ['upvote', 'downvote', 'lapor'];
    if (!validTipe.includes(tipe)) {
      return res.status(400).json({ error: 'Tipe interaksi tidak valid' });
    }

    // Validasi alasan laporan jika tipe adalah 'lapor'
    if (tipe === 'lapor' && !alasan_laporan) {
      return res.status(400).json({ error: 'Alasan laporan wajib diisi untuk tipe lapor' });
    }

    const interaksi = await Interaksi.create({
      id_pengguna,
      id_komentar,
      tipe,
      id_postingan: null,
      alasan_laporan: tipe === 'lapor' ? alasan_laporan : null,
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

// PUT update status report (untuk admin)
const updateReportStatus = async (req, res) => {
  try {
    // Temporarily disabled due to missing status column in production database
    return res.status(503).json({
      error: 'Fitur update status sedang dalam perbaikan',
      detail: 'Database schema sedang diupdate'
    });

    /* TODO: Re-enable when database migration is complete
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status
    const validStatus = ['aktif', 'diabaikan', 'diselesaikan'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }

    const interaksi = await Interaksi.findByPk(id);
    if (!interaksi) {
      return res.status(404).json({ error: 'Report tidak ditemukan' });
    }

    // Hanya bisa update report (tipe lapor)
    if (interaksi.tipe !== 'lapor') {
      return res.status(400).json({ error: 'Hanya report yang bisa diupdate statusnya' });
    }

    await interaksi.update({ status });

    res.json({
      message: `Status report berhasil diubah menjadi ${status}`,
      interaksi: interaksi
    });
    */
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate status report', detail: error.message });
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
  updateReportStatus,
  deleteInteraksi,
};