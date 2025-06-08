const { Sequelize, DataTypes } = require('sequelize');
const { toWIB } = require('../utils/waktu');

// Mendefinisikan model Notifikasi
module.exports = (sequelize) => {
  const Notifikasi = sequelize.define('Notifikasi', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_penerima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pengguna',
        key: 'id'
      }
    },
    id_pengirim: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pengguna',
        key: 'id'
      }
    },
    id_postingan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'postingan',
        key: 'id'
      }
    },
    id_komentar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'komentar',
        key: 'id'
      }
    },
    tipe: {
      type: DataTypes.ENUM('like', 'downvote', 'comment', 'reply', 'mention', 'system'),
      allowNull: false,
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dibaca: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const value = this.getDataValue('dibuat_pada');
        return toWIB(value);
      }
    },
  }, {
    tableName: 'notifikasi',
    timestamps: false,
  });

  // Define associations
  Notifikasi.associate = (models) => {
    // Notifikasi belongs to penerima (receiver)
    Notifikasi.belongsTo(models.Pengguna, {
      foreignKey: 'id_penerima',
      as: 'penerima',
    });

    // Notifikasi belongs to pengirim (sender)
    Notifikasi.belongsTo(models.Pengguna, {
      foreignKey: 'id_pengirim',
      as: 'pengirim',
    });

    // Notifikasi belongs to postingan
    Notifikasi.belongsTo(models.Postingan, {
      foreignKey: 'id_postingan',
      as: 'postingan',
    });

    // Notifikasi belongs to komentar
    Notifikasi.belongsTo(models.Komentar, {
      foreignKey: 'id_komentar',
      as: 'komentar',
    });
  };

  return Notifikasi;
};