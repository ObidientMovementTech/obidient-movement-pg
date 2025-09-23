import { getObidientVotersDetailed } from './services/obidientVotersService.js';

try {
  console.log('Testing getObidientVotersDetailed with corrected columns...');
  const result = await getObidientVotersDetailed();
  console.log('✅ SUCCESS - States in detailed data:', Object.keys(result).length);

  // Show some sample data structure
  const firstState = Object.keys(result)[0];
  if (firstState && result[firstState]) {
    console.log('📊 Sample State:', firstState);
    console.log('📊 State Data:', {
      obidientRegisteredVoters: result[firstState].obidientRegisteredVoters,
      obidientVotersWithPVC: result[firstState].obidientVotersWithPVC,
      obidientVotersWithoutPVC: result[firstState].obidientVotersWithoutPVC,
      lgasCount: result[firstState].lgas ? Object.keys(result[firstState].lgas).length : 0
    });

    // Show LGA structure
    if (result[firstState].lgas) {
      const firstLGA = Object.keys(result[firstState].lgas)[0];
      if (firstLGA && result[firstState].lgas[firstLGA]) {
        console.log('📊 Sample LGA:', firstLGA);
        console.log('📊 LGA Data:', {
          obidientRegisteredVoters: result[firstState].lgas[firstLGA].obidientRegisteredVoters,
          obidientVotersWithPVC: result[firstState].lgas[firstLGA].obidientVotersWithPVC,
          obidientVotersWithoutPVC: result[firstState].lgas[firstLGA].obidientVotersWithoutPVC,
          wardsCount: result[firstState].lgas[firstLGA].wards ? Object.keys(result[firstState].lgas[firstLGA].wards).length : 0
        });
      }
    }
  }
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
}