require('dotenv').config();
const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database with models...');
    
    // Force sync to recreate tables with correct structure
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database sync completed successfully!');
    console.log('📊 All tables should now match the model definitions');
    
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

syncDatabase();
