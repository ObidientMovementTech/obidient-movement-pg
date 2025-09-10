import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFeedNotificationMigration() {
  try {
    console.log('🔄 Running migration: Add feed notification type...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_feed_notification_type.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon to handle multiple statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 100) + '...');
        await query(statement.trim());
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('📝 The notifications table now accepts "feed" type notifications');

    // Test the constraint by checking allowed types
    const result = await query(`
      SELECT consrc 
      FROM pg_constraint 
      WHERE conrelid = 'notifications'::regclass 
      AND conname = 'notifications_type_check'
    `);

    if (result.rows.length > 0) {
      console.log('🔍 Updated constraint:', result.rows[0].consrc);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFeedNotificationMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runFeedNotificationMigration };
