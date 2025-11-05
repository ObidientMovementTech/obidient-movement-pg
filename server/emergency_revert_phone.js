#!/usr/bin/env node

/**
 * EMERGENCY: Revert User Phone Numbers to Local Format
 * 
 * This script reverts Nigerian phone numbers in the users table
 * from +234XXXXXXXXXX format back to 0XXXXXXXXXX format
 * 
 * SAFE TO RUN: Creates backup column before making changes
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'obidient_movement',
});

async function revertPhoneNumbers() {
  const client = await pool.connect();

  try {
    console.log('\n🚨 EMERGENCY PHONE NUMBER REVERSION 🚨\n');
    console.log('Database:', process.env.DB_NAME);
    console.log('Host:', process.env.DB_HOST);
    console.log('\n================================\n');

    // Check current state
    console.log('📊 Checking current phone number formats...\n');

    const beforeStats = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE phone LIKE '+234%') as international_format,
        COUNT(*) FILTER (WHERE phone LIKE '0%') as local_format,
        COUNT(*) FILTER (WHERE phone LIKE '+%' AND phone NOT LIKE '+234%') as other_countries,
        COUNT(*) as total
      FROM users
    `);

    console.log('BEFORE REVERSION:');
    console.log(`  • International (+234): ${beforeStats.rows[0].international_format}`);
    console.log(`  • Local (0...): ${beforeStats.rows[0].local_format}`);
    console.log(`  • Other countries: ${beforeStats.rows[0].other_countries}`);
    console.log(`  • Total users: ${beforeStats.rows[0].total}`);
    console.log('\n================================\n');

    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrations', '20250103_revert_user_phone_format.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('⚙️  Executing migration...\n');

    await client.query(migrationSQL);

    console.log('✅ Migration executed successfully!\n');
    console.log('================================\n');

    // Check after state
    const afterStats = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE phone LIKE '+234%') as international_format,
        COUNT(*) FILTER (WHERE phone LIKE '0%') as local_format,
        COUNT(*) FILTER (WHERE phone LIKE '+%' AND phone NOT LIKE '+234%') as other_countries,
        COUNT(*) as total
      FROM users
    `);

    console.log('📊 AFTER REVERSION:');
    console.log(`  • International (+234): ${afterStats.rows[0].international_format}`);
    console.log(`  • Local (0...): ${afterStats.rows[0].local_format}`);
    console.log(`  • Other countries: ${afterStats.rows[0].other_countries}`);
    console.log(`  • Total users: ${afterStats.rows[0].total}`);
    console.log('\n================================\n');

    // Show sample conversions
    const samples = await client.query(`
      SELECT email, phone_backup as before, phone as after, country_code
      FROM users 
      WHERE phone_backup LIKE '+234%' 
      LIMIT 5
    `);

    if (samples.rows.length > 0) {
      console.log('📝 Sample conversions:');
      samples.rows.forEach(row => {
        console.log(`  ${row.email}`);
        console.log(`    Before: ${row.before}`);
        console.log(`    After:  ${row.after}`);
        console.log(`    Country: ${row.country_code || 'NG'}\n`);
      });
    }

    console.log('✅ REVERSION COMPLETE!\n');
    console.log('💡 Note: A backup column "phone_backup" has been created');
    console.log('   You can remove it later once you verify everything works.\n');

  } catch (error) {
    console.error('\n❌ ERROR during reversion:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
revertPhoneNumbers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
