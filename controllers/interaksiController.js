const { Interaksi, Komentar, Postingan, Pengguna, Sequelize } = require('../models');
const { createLikeNotification, createDownvoteNotification } = require('./notifikasiController');

// GET semua interaksi
const getAllInteraksi = async (req, res) => {
  try {
    // Filter untuk hanya menampilkan reports yang aktif (belum diselesaikan/diabaikan)
    const whereClause = {};

    // Filter berdasarkan query parameter
    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    if (req.query.tipe) {
      whereClause.tipe = req.query.tipe;
    }

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
      ],
      order: [['dibuat_pada', 'DESC']] // Sort by newest first
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

    // Buat notifikasi untuk pemilik postingan (hanya untuk interaksi baru, bukan toggle off)
    if ((tipe === 'upvote' || tipe === 'downvote') && !existingInteraksi) {
      try {
        console.log('Creating notification for interaction:', { tipe, id_postingan, id_pengguna });

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
          console.log('Post found, owner:', postingan.penulis.nama);

          // Ambil data user yang melakukan interaksi
          const userPengirim = await Pengguna.findByPk(id_pengguna, {
            attributes: ['nama']
          });

          if (userPengirim) {
            console.log('User found:', userPengirim.nama);

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
          } else {
            console.log('User not found for notification');
          }
        } else {
          console.log('Post or post owner not found for notification');
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        console.error('Notification error details:', {
          message: notifError.message,
          stack: notifError.stack,
          tipe,
          id_postingan,
          id_pengguna
        });
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
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status yang diizinkan
    const allowedStatuses = ['aktif', 'diabaikan', 'diselesaikan'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status tidak valid',
        detail: 'Status harus salah satu dari: aktif, diabaikan, diselesaikan'
      });
    }

    // Cari interaksi berdasarkan ID
    const interaksi = await Interaksi.findByPk(id);
    if (!interaksi) {
      return res.status(404).json({ error: 'Interaksi tidak ditemukan' });
    }

    // Hanya laporan yang bisa diupdate statusnya
    if (interaksi.tipe !== 'lapor') {
      return res.status(400).json({
        error: 'Hanya laporan yang dapat diupdate statusnya',
        detail: 'Interaksi ini bukan laporan'
      });
    }

    // Update status
    await interaksi.update({ status });

    res.json({
      message: 'Status laporan berhasil diupdate',
      interaksi: {
        id: interaksi.id,
        tipe: interaksi.tipe,
        status: interaksi.status,
        alasan_laporan: interaksi.alasan_laporan
      }
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Gagal mengupdate status report', detail: error.message });
  }
};

// GET statistik interaksi berdasarkan status (untuk admin)
const getInteraksiStats = async (req, res) => {
  try {
    const stats = await Interaksi.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        tipe: 'lapor' // Hanya hitung laporan
      },
      group: ['status'],
      raw: true
    });

    // Format response
    const formattedStats = {
      total: 0,
      aktif: 0,
      diabaikan: 0,
      diselesaikan: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status] = parseInt(stat.count);
      formattedStats.total += parseInt(stat.count);
    });

    res.json({
      message: 'Statistik laporan berhasil diambil',
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error getting interaction stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik interaksi', detail: error.message });
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
  getInteraksiStats,
  deleteInteraksi,
};