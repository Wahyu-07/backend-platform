const { Sequelize, DataTypes } = require('sequelize');

// Daftar kategori ENUM (10 kategori standar)
const kategoriEnum = [
  'Fasilitas Kampus',
  'Akademik',
  'Kesejahteraan Mahasiswa',
  'Kegiatan Kemahasiswaan',
  'Sarana dan Prasarana Digital',
  'Keamanan dan Ketertiban',
  'Lingkungan dan Kebersihan',
  'Transportasi dan Akses',
  'Kebijakan dan Administrasi',
  'Saran dan Inovasi'
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