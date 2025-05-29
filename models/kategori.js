
const { Sequelize, DataTypes } = require('sequelize');

// Daftar kategori ENUM (harus sama persis dengan di DB)
const kategoriEnum = [
  'Fasilitas Bangunan',
  'Kebersihan dan Lingkungan',
  'Sarana dan Prasarana Teknologi',
  'Keamanan Kampus',
  'Layanan Akademik',
  'Kegiatan dan Organisasi Mahasiswa',
  'Makanan dan Kantin',
  'Lainnya'
];

module.exports = (sequelize) => {
  const Kategori = sequelize.define('Kategori', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.ENUM(...kategoriEnum), // enum sesuai yang didefinisikan di database
      allowNull: false,
    },
  }, {
    tableName: 'kategori',
    timestamps: false,
  });

  Kategori.associate = (models) => {
    Kategori.hasMany(models.Postingan, {
      foreignKey: 'id_kategori',
      as: 'postingan',
    });
  };

  return Kategori;
};
