'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if status column already exists
      const tableDescription = await queryInterface.describeTable('Postingan');
      
      if (!tableDescription.status) {
        // Add status column if it doesn't exist
        await queryInterface.addColumn('Postingan', 'status', {
          type: Sequelize.ENUM('aktif', 'terarsip'),
          allowNull: false,
          defaultValue: 'aktif'
        });
        
        console.log('✅ Status column added to Postingan table');
      } else {
        console.log('ℹ️ Status column already exists in Postingan table');
      }
    } catch (error) {
      console.error('❌ Error adding status column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if status column exists before trying to remove it
      const tableDescription = await queryInterface.describeTable('Postingan');
      
      if (tableDescription.status) {
        await queryInterface.removeColumn('Postingan', 'status');
        console.log('✅ Status column removed from Postingan table');
      } else {
        console.log('ℹ️ Status column does not exist in Postingan table');
      }
    } catch (error) {
      console.error('❌ Error removing status column:', error);
      throw error;
    }
  }
};
