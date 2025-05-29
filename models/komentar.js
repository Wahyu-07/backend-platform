
const { Sequelize, DataTypes } = require('sequelize');
const { toWIB } = require('../utils/waktu'); // pastikan utils/waktu sudah ada

module.exports = (sequelize) => {
  const Komentar = sequelize.define('komentar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_postingan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_penulis: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    konten: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    anonim: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,  // Gunakan Sequelize.NOW untuk nilai default waktu sekarang
      get() {
        // Menambahkan konversi waktu WIB pada saat pengambilan data
        const value = this.getDataValue('dibuat_pada');
        return toWIB(value);  // Menggunakan fungsi toWIB untuk konversi ke WIB
      }
    },
  }, {
    tableName: 'komentar',
    timestamps: false,  // Tidak menggunakan createdAt dan updatedAt
  });

  Komentar.associate = (models) => {
    Komentar.belongsTo(models.Postingan, {
      foreignKey: 'id_postingan',
      as: 'postingan',
    });

    Komentar.belongsTo(models.Pengguna, {
      foreignKey: 'id_penulis',
      as: 'penulis',
    });

    Komentar.hasMany(models.Interaksi, {
      foreignKey: 'id_komentar',
      as: 'interaksi',
    });
  };

  return Komentar;
};
