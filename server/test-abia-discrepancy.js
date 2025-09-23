import { getObidientVotersByState, getObidientVotersDetailed } from './services/obidientVotersService.js';

async function checkAbiaData() {
  try {
    console.log('Testing Abia state data discrepancy...');

    // Get data from both methods
    const votersByState = await getObidientVotersByState();
    const detailedData = await getObidientVotersDetailed();

    // Find Abia in voters by state
    const abiaInGlobalList = votersByState.find(state => state.state === 'Abia');
    console.log('Abia in global state list:', abiaInGlobalList);

    // Get Abia from detailed data
    const abiaInDetailed = detailedData['Abia'];
    console.log('Abia in detailed data:', {
      obidientRegisteredVoters: abiaInDetailed?.obidientRegisteredVoters,
      obidientVotersWithPVC: abiaInDetailed?.obidientVotersWithPVC,
      obidientVotersWithoutPVC: abiaInDetailed?.obidientVotersWithoutPVC
    });

    // Calculate LGA totals from detailed data
    let lgaTotalRegistered = 0;
    let lgaTotalWithPVC = 0;
    let lgaTotalWithoutPVC = 0;

    if (abiaInDetailed && abiaInDetailed.lgas) {
      Object.values(abiaInDetailed.lgas).forEach(lga => {
        lgaTotalRegistered += lga.obidientRegisteredVoters;
        lgaTotalWithPVC += lga.obidientVotersWithPVC;
        lgaTotalWithoutPVC += lga.obidientVotersWithoutPVC;
      });
    }

    console.log('Abia totals calculated from LGAs:', {
      obidientRegisteredVoters: lgaTotalRegistered,
      obidientVotersWithPVC: lgaTotalWithPVC,
      obidientVotersWithoutPVC: lgaTotalWithoutPVC
    });

    // Check for any discrepancies
    console.log('DISCREPANCY ANALYSIS:');
    console.log('1. National view vs State view:');
    console.log('   Total registered:', abiaInGlobalList?.totalObidientUsers, 'vs', abiaInDetailed?.obidientRegisteredVoters);
    console.log('   With PVC:', abiaInGlobalList?.votersWithPVC, 'vs', abiaInDetailed?.obidientVotersWithPVC);
    console.log('   Without PVC:', abiaInGlobalList?.votersWithoutPVC, 'vs', abiaInDetailed?.obidientVotersWithoutPVC);

    console.log('2. State totals vs sum of LGAs:');
    console.log('   Total registered:', abiaInDetailed?.obidientRegisteredVoters, 'vs', lgaTotalRegistered);
    console.log('   With PVC:', abiaInDetailed?.obidientVotersWithPVC, 'vs', lgaTotalWithPVC);
    console.log('   Without PVC:', abiaInDetailed?.obidientVotersWithoutPVC, 'vs', lgaTotalWithoutPVC);

    console.log('3. National view vs sum of LGAs:');
    console.log('   Total registered:', abiaInGlobalList?.totalObidientUsers, 'vs', lgaTotalRegistered);
    console.log('   With PVC:', abiaInGlobalList?.votersWithPVC, 'vs', lgaTotalWithPVC);
    console.log('   Without PVC:', abiaInGlobalList?.votersWithoutPVC, 'vs', lgaTotalWithoutPVC);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
checkAbiaData();