const sequelize = require('./config/database');

async function runMigration() {

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if status column exists in interaksi table
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'interaksi' AND column_name = 'status'
    `);

    if (results.length === 0) {
      console.log('🔧 Adding status column to interaksi table...');

      // Create ENUM type for interaksi status if it doesn't exist
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE interaksi_status_enum AS ENUM ('aktif', 'diabaikan', 'diselesaikan');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Add status column to interaksi table
      await sequelize.query(`
        ALTER TABLE interaksi
        ADD COLUMN status interaksi_status_enum
        NOT NULL DEFAULT 'aktif'
      `);

      console.log('✅ Status column added to interaksi table successfully.');
    } else {
      console.log('✅ Status column already exists in interaksi table.');
    }

    // Check if status column exists in postingan table
    const [postResults] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'postingan' AND column_name = 'status'
    `);

    if (postResults.length === 0) {
      console.log('🔧 Adding status column to postingan table...');

      // Create ENUM type for postingan status if it doesn't exist
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE postingan_status_enum AS ENUM ('aktif', 'terarsip');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Add status column to postingan table
      await sequelize.query(`
        ALTER TABLE postingan
        ADD COLUMN status postingan_status_enum
        NOT NULL DEFAULT 'aktif'
      `);

      console.log('✅ Status column added to postingan table successfully.');
    } else {
      console.log('✅ Status column already exists in postingan table.');
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
