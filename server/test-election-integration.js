// Test script to verify election integration
const { getClient } = require('./config/db.js');

async function testElectionIntegration() {
  try {
    console.log('🔍 Testing Election Integration...\n');

    const client = await getClient();

    // 1. Check if elections table exists and has data
    console.log('1. Checking elections table...');
    const electionsResult = await client.query('SELECT * FROM elections ORDER BY created_at DESC');
    console.log(`   Found ${electionsResult.rows.length} elections`);
    electionsResult.rows.forEach(election => {
      console.log(`   - ${election.election_name} (${election.status}) - ${election.election_date}`);
    });

    // 2. Check if polling_unit_submissions has election_id column
    console.log('\n2. Checking polling_unit_submissions structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'polling_unit_submissions' 
      AND column_name IN ('election_id', 'monitor_user_id')
      ORDER BY column_name
    `);
    console.log('   Key columns:');
    columnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // 3. If no elections exist, create a test election
    if (electionsResult.rows.length === 0) {
      console.log('\n3. Creating test election...');
      await client.query(`
        INSERT INTO elections (election_id, election_name, election_type, election_date, status)
        VALUES ('TEST-2027-GOV', '2027 Test Gubernatorial Election', 'gubernatorial', '2027-03-15', 'upcoming')
      `);
      console.log('   ✅ Test election created');
    }

    // 4. Test the monitoring service queries
    console.log('\n4. Testing monitoring service queries...');
    try {
      // Simulate a user ID check
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const statusResult = await client.query(`
        SELECT 
          pu.submission_id,
          pu.election_id,
          pu.polling_unit_code,
          pu.polling_unit_name,
          e.election_name,
          e.status as election_status
        FROM polling_unit_submissions pu
        LEFT JOIN elections e ON pu.election_id = e.election_id
        WHERE pu.monitor_user_id = $1
        ORDER BY pu.created_at DESC
        LIMIT 1
      `, [testUserId]);

      console.log(`   Query executed successfully (${statusResult.rows.length} results)`);
    } catch (queryError) {
      console.log(`   ❌ Query failed: ${queryError.message}`);
    }

    await client.release();
    console.log('\n✅ Election integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testElectionIntegration();
