import { promises as fs } from 'fs';
import { query } from './config/db.js';

const runMigrations = async () => {
  try {
    console.log('🔄 Running migrations...');

    // Migration 1: Add voting location to users
    console.log('📋 Running migration: add_voting_location_to_users.sql');
    const migration1 = await fs.readFile('./migrations/add_voting_location_to_users.sql', 'utf8');
    await query(migration1);
    console.log('✅ Migration completed: add_voting_location_to_users.sql');

    // Migration 2: Make voting bloc location nullable
    console.log('📋 Running migration: make_voting_bloc_location_nullable.sql');
    const migration2 = await fs.readFile('./migrations/make_voting_bloc_location_nullable.sql', 'utf8');
    await query(migration2);
    console.log('✅ Migration completed: make_voting_bloc_location_nullable.sql');

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

runMigrations();
