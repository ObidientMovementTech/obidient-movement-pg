#!/usr/bin/env node

import { query } from './config/db.js';

async function testAdminAccess() {
  try {
    console.log('🔍 Testing admin user access logic...');

    // Check if there are any admin users
    const adminQuery = 'SELECT id, name, email, role, designation FROM users WHERE role = $1';
    const adminResult = await query(adminQuery, ['admin']);

    console.log(`📊 Found ${adminResult.rows.length} admin user(s):`);
    adminResult.rows.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) - Designation: ${admin.designation || 'None'}`);
    });

    // Check if there are National Coordinators
    const ncQuery = 'SELECT id, name, email, role, designation FROM users WHERE designation = $1';
    const ncResult = await query(ncQuery, ['National Coordinator']);

    console.log(`\n📊 Found ${ncResult.rows.length} National Coordinator(s):`);
    ncResult.rows.forEach(nc => {
      console.log(`  - ${nc.name} (${nc.email}) - Role: ${nc.role || 'user'}`);
    });

    console.log('\n✅ Admin access test completed');

  } catch (error) {
    console.error('❌ Error testing admin access:', error);
  } finally {
    process.exit(0);
  }
}

testAdminAccess();