const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Pengguna = require('./pengguna')(sequelize);
const Kategori = require('./kategori')(sequelize);
const Postingan = require('./postingan')(sequelize);
const Komentar = require('./komentar')(sequelize);
const Interaksi = require('./interaksi')(sequelize);
const Notifikasi = require('./notifikasi')(sequelize);

// Create models object for associations
const models = {
  Pengguna,
  Kategori,
  Postingan,
  Komentar,
  Interaksi,
  Notifikasi
};

// Call associate methods if they exist
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  Pengguna,
  Kategori,
  Postingan,
  Komentar,
  Interaksi,
  Notifikasi,
};