const { Sequelize, DataTypes } = require('sequelize');
const { toWIB } = require('../utils/waktu');

// Mendefinisikan model Interaksi
module.exports = (sequelize) => {
  const Interaksi = sequelize.define('Interaksi', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipe: {
    type: DataTypes.ENUM('upvote', 'downvote', 'lapor'),
    allowNull: false,
    },
    id_pengguna: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_postingan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_komentar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alasan_laporan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('aktif', 'diabaikan', 'diselesaikan'),
      allowNull: false,
      defaultValue: 'aktif',
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
        get() {
        // Menambahkan konversi waktu WIB pada saat pengambilan data
        const value = this.getDataValue('dibuat_pada');
        return toWIB(value);  // Menggunakan fungsi toWIB untuk konversi ke WIB
      }
    },
  }, {
    tableName: 'interaksi',
    timestamps: false,
  });

  Interaksi.associate = (models) => {
    Interaksi.belongsTo(models.Pengguna, {
      foreignKey: 'id_pengguna',
      as: 'pengguna',
    });

    Interaksi.belongsTo(models.Postingan, {
      foreignKey: 'id_postingan',
      as: 'postingan',
    });

    Interaksi.belongsTo(models.Komentar, {
      foreignKey: 'id_komentar',
      as: 'komentar',
    });
  };

  return Interaksi;
};