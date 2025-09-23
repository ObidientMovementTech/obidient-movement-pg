import { getObidientVotersByState } from './services/obidientVotersService.js';

try {
  console.log('Testing getObidientVotersByState with corrected columns...');
  const result = await getObidientVotersByState();
  console.log('✅ SUCCESS - States found:', result.length);
  if (result.length > 0) {
    console.log('📊 Sample state data:', JSON.stringify(result[0], null, 2));
    console.log('📊 Total obidient users across all states:',
      result.reduce((sum, state) => sum + state.totalObidientUsers, 0));
    console.log('📊 Total with PVC:',
      result.reduce((sum, state) => sum + state.votersWithPVC, 0));
    console.log('📊 Total without PVC:',
      result.reduce((sum, state) => sum + state.votersWithoutPVC, 0));
  }
} catch (error) {
  console.error('❌ ERROR:', error.message);
  if (error.message.includes('column')) {
    console.error('🔍 Column error detected. Available columns might be different.');
  }
}