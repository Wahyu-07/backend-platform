'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column to postingan table
    await queryInterface.addColumn('postingan', 'status', {
      type: Sequelize.ENUM('aktif', 'terarsip'),
      defaultValue: 'aktif',
      allowNull: false
    });

    // Add status column to interaksi table
    await queryInterface.addColumn('interaksi', 'status', {
      type: Sequelize.ENUM('aktif', 'diabaikan', 'diselesaikan'),
      allowNull: false,
      defaultValue: 'aktif',
      after: 'alasan_laporan'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove status column from interaksi table
    await queryInterface.removeColumn('interaksi', 'status');
    
    // Remove status column from postingan table
    await queryInterface.removeColumn('postingan', 'status');
  }
};
