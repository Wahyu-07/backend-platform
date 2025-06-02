const { Sequelize, DataTypes } = require('sequelize');
const { toWIB } = require('../utils/waktu');

// Mendefinisikan model Postingan
module.exports = (sequelize) => {
  const Postingan = sequelize.define('postingan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_penulis: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pengguna', // Pastikan nama model sesuai dengan nama tabel di database
        key: 'id',
      },
    },
    id_kategori: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'kategori', // Pastikan nama model sesuai dengan nama tabel di database
        key: 'id',
      },
    },
    judul: {
      type: DataTypes.STRING(200),
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
    status: {
      type: DataTypes.ENUM('aktif', 'terarsip'),
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
    tableName: 'postingan',
    timestamps: false,
  });

  Postingan.associate = (models) => {
    Postingan.belongsTo(models.Pengguna, {
      foreignKey: 'id_penulis',
      as: 'penulis',
    });

    Postingan.belongsTo(models.Kategori, {
      foreignKey: 'id_kategori',
      as: 'kategori',
    });

    Postingan.hasMany(models.Komentar, {
      foreignKey: 'id_postingan',
      as: 'komentar',
    });

    Postingan.hasMany(models.Interaksi, {
      foreignKey: 'id_postingan',
      as: 'interaksi',
      onDelete: 'CASCADE',
    });

    Postingan.hasMany(models.Notifikasi, {
      foreignKey: 'id_postingan',
      as: 'notifikasi',
      onDelete: 'CASCADE',
    });
  };

  return Postingan;
};