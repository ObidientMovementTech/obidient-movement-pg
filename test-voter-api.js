// Test script to verify the voter API integration
const { stateDashboardService } = require('./frontend/src/services/stateDashboardService');

async function testVoterAPI() {
  try {
    console.log('🧪 Testing Obidient Voter API Integration...');

    // Test basic voter data
    console.log('\n1. Testing basic voter data...');
    const basicData = await stateDashboardService.getObidientVoterData(false);
    console.log('✅ Basic data response:', basicData.success ? 'Success' : 'Failed');

    // Test detailed voter data
    console.log('\n2. Testing detailed voter data...');
    const detailedData = await stateDashboardService.getObidientVoterData(true);
    console.log('✅ Detailed data response:', detailedData.success ? 'Success' : 'Failed');

    // Display sample data
    if (basicData.success && basicData.data.votersByState) {
      console.log('\n📊 Sample voter data by states:');
      const states = Object.keys(basicData.data.votersByState).slice(0, 5);
      states.forEach(state => {
        const data = basicData.data.votersByState[state];
        console.log(`  ${state}: ${data.obidientVoters} voters, ${data.votersWithPVC} with PVC`);
      });
    }

    console.log('\n🎉 API Integration test completed!');

  } catch (error) {
    console.error('❌ API Integration test failed:', error);
  }
}

// Note: This would need to be run in a browser environment with authentication
console.log('📝 This test script shows the API integration structure.');
console.log('🔧 To test in browser: Open dev tools and run the StateDashboard page.');
console.log('🗳️ Expected flow: Login → Navigate to State Dashboard → See real voter data');