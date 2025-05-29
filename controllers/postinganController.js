// postinganController.js
const { Postingan, Kategori, Pengguna } = require('../models');
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
 * Body: { nama_kategori, judul, konten, anonim }
 * id_penulis diambil dari req.user.id hasil verifikasi token JWT
 */
const createPostingan = async (req, res) => {
  try {
    const { nama_kategori, judul, konten, anonim } = req.body;

    // Ambil id_penulis dari token (middleware auth harus menyediakan ini)
    const id_penulis = req.user.id;

    // Cari kategori berdasarkan nama kategori
    const kategori = await Kategori.findOne({ where: { nama: nama_kategori } });
    if (!kategori) {
      return res.status(400).json({ error: 'Kategori tidak valid atau tidak ditemukan' });
    }

    // Buat postingan baru dengan data yang lengkap
    const postingan = await Postingan.create({
      id_penulis,
      id_kategori: kategori.id,
      judul,
      konten,
      anonim,
    });

    res.status(201).json(postingan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat postingan', error: error.message });
  }
};

/**
 * GET semua postingan beserta data kategori dan penulis (tanpa kata_sandi)
 */
const getAllPostingan = async (req, res) => {
  try {
    const postingan = await Postingan.findAll({
      include: [
        { model: Kategori, as: 'kategori' },
        { 
          model: Pengguna, 
          as: 'penulis',
          attributes: { exclude: ['kata_sandi'] } // sembunyikan kata sandi untuk keamanan
        }
      ]
    });

    res.status(200).json(postingan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mendapatkan postingan', error });
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

    res.status(200).json(postingan);
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