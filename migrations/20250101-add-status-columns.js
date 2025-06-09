'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check and add status column to postingan table
      const postinganTable = await queryInterface.describeTable('postingan');
      if (!postinganTable.status) {
        await queryInterface.addColumn('postingan', 'status', {
          type: Sequelize.ENUM('aktif', 'terarsip'),
          allowNull: false,
          defaultValue: 'aktif'
        });
        console.log('✅ Status column added to postingan table');
      } else {
        console.log('ℹ️ Status column already exists in postingan table');
      }

      // Check and add status column to interaksi table
      const interaksiTable = await queryInterface.describeTable('interaksi');
      if (!interaksiTable.status) {
        await queryInterface.addColumn('interaksi', 'status', {
          type: Sequelize.ENUM('aktif', 'diabaikan', 'diselesaikan'),
          allowNull: false,
          defaultValue: 'aktif'
        });
        console.log('✅ Status column added to interaksi table');
      } else {
        console.log('ℹ️ Status column already exists in interaksi table');
      }
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check and remove status column from interaksi table
      const interaksiTable = await queryInterface.describeTable('interaksi');
      if (interaksiTable.status) {
        await queryInterface.removeColumn('interaksi', 'status');
        console.log('✅ Status column removed from interaksi table');
      }

      // Check and remove status column from postingan table
      const postinganTable = await queryInterface.describeTable('postingan');
      if (postinganTable.status) {
        await queryInterface.removeColumn('postingan', 'status');
        console.log('✅ Status column removed from postingan table');
      }
    } catch (error) {
      console.error('❌ Rollback error:', error.message);
      throw error;
    }
  }
};
