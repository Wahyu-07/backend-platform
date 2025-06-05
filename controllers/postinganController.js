// postinganController.js
const { Postingan, Kategori, Pengguna, Interaksi } = require('../models');
const { Op } = require('sequelize');



/**
 * GET postingan berdasarkan nama kategori
 * Query param: nama_kategori
 */
const getPostinganByNamaKategori = async (req, res) => {
  try {
    const { nama_kategori } = req.query;
    if (!nama_kategori) {
      return res.status(400).json({ message: 'Parameter nama_kategori wajib diisi' });
    }

    // Cari kategori berdasarkan nama kategori
    const kategori = await Kategori.findOne({ where: { nama: nama_kategori } });
    if (!kategori) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    // Ambil semua postingan yang sesuai kategori tersebut
    const postingan = await Postingan.findAll({
      where: { id_kategori: kategori.id },
      include: [
        { model: Kategori, as: 'kategori' },
        { model: Pengguna, as: 'penulis' }
      ]
    });

    if (postingan.length === 0) {
      return res.status(404).json({ message: 'Tidak ada postingan untuk kategori ini' });
    }

    res.status(200).json(postingan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mendapatkan postingan berdasarkan nama kategori', error: error.message });
  }
};

/**
 * CREATE postingan baru
 * Body: { id_kategori, judul, konten, anonim, tipe } atau { nama_kategori, judul, konten, anonim, tipe }
 * id_penulis diambil dari req.user.id hasil verifikasi token JWT
 */
const createPostingan = async (req, res) => {
  try {
    const { id_kategori, nama_kategori, judul, konten, anonim, tipe } = req.body;

    // Ambil id_penulis dari token (middleware auth harus menyediakan ini)
    const id_penulis = req.user.id;

    let kategoriId = id_kategori;

    // Jika frontend mengirim nama_kategori, cari berdasarkan nama
    if (nama_kategori && !id_kategori) {
      const kategori = await Kategori.findOne({ where: { nama: nama_kategori } });
      if (!kategori) {
        return res.status(400).json({ error: 'Kategori tidak valid atau tidak ditemukan' });
      }
      kategoriId = kategori.id;
    }

    // Jika frontend mengirim id_kategori, validasi bahwa kategori ada
    if (id_kategori) {
      const kategori = await Kategori.findByPk(id_kategori);
      if (!kategori) {
        return res.status(400).json({ error: 'Kategori tidak valid atau tidak ditemukan' });
      }
    }

    // Validasi input wajib
    if (!judul || !konten || !kategoriId) {
      return res.status(400).json({ error: 'Judul, konten, dan kategori wajib diisi' });
    }

    // Buat postingan baru dengan data yang lengkap
    const postingan = await Postingan.create({
      id_penulis,
      id_kategori: kategoriId,
      judul,
      konten,
      anonim: anonim || false,
      tipe: tipe || 'aspirasi',
    });

    // Ambil postingan dengan relasi untuk response
    const postinganWithRelations = await Postingan.findByPk(postingan.id, {
      include: [
        { model: Kategori, as: 'kategori' },
        {
          model: Pengguna,
          as: 'penulis',
          attributes: { exclude: ['kata_sandi'] }
        }
      ]
    });

    res.status(201).json(postinganWithRelations);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Gagal membuat postingan', error: error.message });
  }
};

/**
 * GET semua postingan beserta data kategori dan penulis (tanpa kata_sandi)
 * Query params: id_penulis (optional), filter, sort
 */
const getAllPostingan = async (req, res) => {
  try {
    console.log('📝 getAllPostingan called with query:', req.query);

    const { id_penulis, filter, sort } = req.query;

    let whereClause = {};
    let orderClause = [['dibuat_pada', 'DESC']]; // default sort

    // Filter berdasarkan id_penulis jika ada
    if (id_penulis) {
      whereClause.id_penulis = id_penulis;
    }

    // Filter berdasarkan kategori jika ada dan bukan 'semua'
    if (filter && filter !== 'semua') {
      // Mapping dari slug kategori ke nama kategori
      const categoryMapping = {
        'fasilitas-kampus': 'Fasilitas Kampus',
        'akademik': 'Akademik',
        'kesejahteraan-mahasiswa': 'Kesejahteraan Mahasiswa',
        'kegiatan-kemahasiswaan': 'Kegiatan Kemahasiswaan',
        'sarana-prasarana-digital': 'Sarana dan Prasarana Digital',
        'keamanan-ketertiban': 'Keamanan dan Ketertiban',
        'lingkungan-kebersihan': 'Lingkungan dan Kebersihan',
        'transportasi-akses': 'Transportasi dan Akses',
        'kebijakan-administrasi': 'Kebijakan dan Administrasi',
        'saran-inovasi': 'Saran dan Inovasi'
      };

      const categoryName = categoryMapping[filter];
      if (categoryName) {
        // Cari kategori berdasarkan nama
        const kategori = await Kategori.findOne({ where: { nama: categoryName } });
        if (kategori) {
          whereClause.id_kategori = kategori.id;
        }
      }
    }

    // Sorting akan ditangani setelah mendapat data dengan upvote count
    console.log('🔍 Query whereClause:', whereClause);

    const postingan = await Postingan.findAll({
      where: whereClause,
      order: orderClause,
      include: [
        { model: Kategori, as: 'kategori' },
        {
          model: Pengguna,
          as: 'penulis',
          attributes: { exclude: ['kata_sandi'] } // sembunyikan kata sandi untuk keamanan
        }
      ]
    });

    console.log('📊 Found posts:', postingan.length);

    // Tambahkan jumlah upvote dan downvote ke setiap postingan dengan query terpisah
    const postinganWithCounts = await Promise.all(postingan.map(async (post) => {
      const postData = post.toJSON();

      // Hitung upvote dan downvote dengan query terpisah
      const upvoteCount = await Interaksi.count({
        where: { id_postingan: post.id, tipe: 'upvote' }
      });

      const downvoteCount = await Interaksi.count({
        where: { id_postingan: post.id, tipe: 'downvote' }
      });

      return {
        ...postData,
        upvote_count: upvoteCount,
        downvote_count: downvoteCount
      };
    }));

    // Sorting berdasarkan parameter
    if (sort === 'populer') {
      // Sort berdasarkan upvote terbanyak, kemudian tanggal terbaru
      postinganWithCounts.sort((a, b) => {
        if (b.upvote_count !== a.upvote_count) {
          return b.upvote_count - a.upvote_count;
        }
        return new Date(b.dibuat_pada) - new Date(a.dibuat_pada);
      });
    } else {
      // Default sort: terbaru (sudah diurutkan dari query)
      postinganWithCounts.sort((a, b) => new Date(b.dibuat_pada) - new Date(a.dibuat_pada));
    }

    console.log('✅ Returning posts with counts:', postinganWithCounts.length);
    res.status(200).json(postinganWithCounts);
  } catch (error) {
    console.error('❌ Error in getAllPostingan:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      message: 'Gagal mendapatkan postingan',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * GET postingan berdasarkan ID
 */
const getPostinganById = async (req, res) => {
  try {
    const postingan = await Postingan.findOne({
      where: { id: req.params.id },
      include: [
        { model: Kategori, as: 'kategori' },
        { model: Pengguna, as: 'penulis' }
      ]
    });

    if (!postingan) {
      return res.status(404).json({ message: 'Postingan tidak ditemukan' });
    }

    // Tambahkan jumlah upvote dan downvote dengan query terpisah
    const upvoteCount = await Interaksi.count({
      where: { id_postingan: req.params.id, tipe: 'upvote' }
    });

    const downvoteCount = await Interaksi.count({
      where: { id_postingan: req.params.id, tipe: 'downvote' }
    });

    const postData = postingan.toJSON();
    const postinganWithCounts = {
      ...postData,
      upvote_count: upvoteCount,
      downvote_count: downvoteCount
    };

    res.status(200).json(postinganWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mendapatkan postingan', error });
  }
};

/**
 * UPDATE postingan berdasarkan ID
 * Body: { judul, konten, anonim }
 */
const updatePostingan = async (req, res) => {
  try {
    const { judul, konten, anonim } = req.body;

    // Update postingan dan ambil hasil update nya
    const [jumlahUpdate, postingan] = await Postingan.update(
      { judul, konten, anonim },
      {
        where: { id: req.params.id },
        returning: true
      }
    );

    if (jumlahUpdate === 0) {
      return res.status(404).json({ message: 'Postingan tidak ditemukan' });
    }

    res.status(200).json(postingan[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui postingan', error });
  }
};

/**
 * DELETE postingan berdasarkan ID
 */
const deletePostingan = async (req, res) => {
  try {
    const jumlahHapus = await Postingan.destroy({
      where: { id: req.params.id }
    });

    if (!jumlahHapus) {
      return res.status(404).json({ message: 'Postingan tidak ditemukan' });
    }

    res.status(200).json({ message: 'Postingan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus postingan', error });
  }
};

// Export semua fungsi controller sekaligus
module.exports = {
  getPostinganByNamaKategori,
  createPostingan,
  getAllPostingan,
  getPostinganById,
  updatePostingan,
  deletePostingan,
};