require('dotenv').config();
const { QueryTypes } = require('sequelize');
const { sequelize } = require('./models');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check if postingan table exists and its columns
    const postinganColumns = await sequelize.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'postingan' ORDER BY ordinal_position;",
      { type: QueryTypes.SELECT }
    );
    
    console.log('\n📋 Postingan table columns:');
    if (postinganColumns.length > 0) {
      postinganColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('  ❌ Postingan table does not exist');
    }
    
    // Check if kategori table exists
    const kategoriColumns = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'kategori' ORDER BY ordinal_position;",
      { type: QueryTypes.SELECT }
    );
    
    console.log('\n📂 Kategori table columns:');
    if (kategoriColumns.length > 0) {
      kategoriColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('  ❌ Kategori table does not exist');
    }
    
    // Check all tables in database
    const allTables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
      { type: QueryTypes.SELECT }
    );
    
    console.log('\n📊 All tables in database:');
    allTables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database structure:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDatabaseStructure();
