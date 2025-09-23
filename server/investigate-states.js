import { query } from './config/db.js';

try {
  console.log('🔍 Investigating the 38 states issue...');

  const result = await query(`
    SELECT 
      "votingState" as state,
      COUNT(*) as count,
      CASE 
        WHEN "votingState" IS NULL THEN 'NULL'
        WHEN "votingState" = '' THEN 'EMPTY STRING'
        WHEN LENGTH(TRIM("votingState")) = 0 THEN 'WHITESPACE ONLY'
        ELSE 'VALID'
      END as state_type
    FROM users 
    WHERE "votingState" IS NOT NULL
    GROUP BY "votingState"
    ORDER BY 
      CASE 
        WHEN "votingState" IS NULL THEN 1
        WHEN "votingState" = '' THEN 2
        WHEN LENGTH(TRIM("votingState")) = 0 THEN 3
        ELSE 4
      END,
      "votingState"
  `);

  console.log('📊 All states found:', result.rows.length);
  console.log('📋 Complete list of states:');
  result.rows.forEach((row, index) => {
    console.log(`${index + 1}. "${row.state}" (Count: ${row.count}, Type: ${row.state_type})`);
  });

  // Count empty/problematic states
  const problematicStates = result.rows.filter(row =>
    row.state_type !== 'VALID' || row.state.trim() === ''
  );

  console.log('\n⚠️ Problematic states:', problematicStates.length);
  problematicStates.forEach(state => {
    console.log(`   - "${state.state}" (${state.count} users, Type: ${state.state_type})`);
  });

  // Check for official Nigerian states
  const validNigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'Federal Capital Territory', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const invalidStates = result.rows.filter(row =>
    row.state_type === 'VALID' &&
    !validNigerianStates.includes(row.state) &&
    row.state.trim() !== ''
  );

  console.log('\n❓ States not in official Nigerian states list:', invalidStates.length);
  invalidStates.forEach(state => {
    console.log(`   - "${state.state}" (${state.count} users)`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
}