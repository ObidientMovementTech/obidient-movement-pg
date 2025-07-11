import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run SQL files in order
const runSQLFile = async (filename) => {
  try {
    const sqlPath = path.join(__dirname, 'sql', filename);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`📝 Running SQL file: ${filename}`);
    await pool.query(sql);
    console.log(`✅ Successfully executed: ${filename}`);
  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error.message);
    throw error;
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // List of SQL files to run in order
    const sqlFiles = [
      '01_create_users_table.sql',
      '02_create_voting_bloc_messages_table.sql',
      '03_create_voting_blocs_tables.sql',
      '04_create_admin_broadcasts_table.sql',
      '05_create_notifications_table.sql',
      '06_create_evaluations_table.sql',
      '07_create_voting_bloc_broadcasts_table.sql'
      // Add more SQL files as we create them
    ];

    // Run each SQL file
    for (const file of sqlFiles) {
      await runSQLFile(file);
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Created tables:');
    console.log('  - users (main user table)');
    console.log('  - userPersonalInfo (personal information)');
    console.log('  - userOnboardingData (onboarding data)');
    console.log('  - userKycInfo (KYC information)');
    console.log('  - userNotificationPreferences (notification prefs)');
    console.log('  - userNotificationSettings (detailed notification settings)');
    console.log('  - votingBlocMessages (voting bloc messaging)');
    console.log('  - votingBlocs (main voting blocs table)');
    console.log('  - votingBlocToolkits (voting bloc toolkits)');
    console.log('  - votingBlocMembers (voting bloc membership)');
    console.log('  - votingBlocMemberMetadata (member engagement data)');
    console.log('  - votingBlocInvitations (invitation system)');
    console.log('  - adminBroadcasts (admin broadcast messages)');
    console.log('  - notifications (user notifications system)');
    console.log('  - evaluations (candidate evaluation system)');
    console.log('  - votingBlocBroadcasts (voting bloc broadcast messages)');

  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
}

export default initializeDatabase;
