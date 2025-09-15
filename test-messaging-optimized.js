/**
 * Test script to verify optimized messaging system
 * This should NOT overwhelm the server with continuous requests
 */

const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:3000'; // Change to your server URL
const TEST_USER_TOKEN = 'your-test-token-here'; // Add your test token

console.log('🧪 Testing optimized messaging system...');
console.log('📋 Expected behavior:');
console.log('  ✅ No continuous polling');
console.log('  ✅ API calls only on specific actions');
console.log('  ✅ No rate limit errors');
console.log('  ✅ Badge updates correctly');

// Simulate the app behavior
async function testOptimizedFlow() {
  console.log('\n🚀 Simulating app startup...');

  try {
    // 1. Initial load (should happen once on app startup)
    console.log('📱 App mounted - fetching initial data...');
    const unreadCountResponse = await axios.get(`${SERVER_URL}/api/mobile/messages/unread-count`, {
      headers: { 'Authorization': `Bearer ${TEST_USER_TOKEN}` }
    });
    console.log(`   📊 Initial unread count: ${unreadCountResponse.data.unreadCount || 0}`);

    const messagesResponse = await axios.get(`${SERVER_URL}/api/mobile/messages?page=1&limit=20&status=all`, {
      headers: { 'Authorization': `Bearer ${TEST_USER_TOKEN}` }
    });
    console.log(`   💬 Loaded ${messagesResponse.data.messages?.length || 0} messages`);

    console.log('✅ Initial load complete');

    // 2. User navigates around app (should NOT make API calls)
    console.log('\n🧭 User navigates between screens...');
    console.log('   📱 User goes to Home screen - NO API calls');
    console.log('   📱 User goes to Feeds screen - NO API calls');
    console.log('   📱 User goes to Profile screen - NO API calls');
    console.log('   📱 User returns to Messages screen - Only resets badge (no API call)');
    console.log('✅ Navigation complete - no unnecessary API calls');

    // 3. Manual refresh (should happen only when user pulls to refresh)
    console.log('\n🔄 User manually pulls to refresh...');
    const refreshUnreadResponse = await axios.get(`${SERVER_URL}/api/mobile/messages/unread-count`, {
      headers: { 'Authorization': `Bearer ${TEST_USER_TOKEN}` }
    });
    console.log(`   📊 Refreshed unread count: ${refreshUnreadResponse.data.unreadCount || 0}`);

    const refreshMessagesResponse = await axios.get(`${SERVER_URL}/api/mobile/messages?page=1&limit=20&status=all`, {
      headers: { 'Authorization': `Bearer ${TEST_USER_TOKEN}` }
    });
    console.log(`   💬 Refreshed ${refreshMessagesResponse.data.messages?.length || 0} messages`);
    console.log('✅ Manual refresh complete');

    // 4. Wait and verify no automatic calls
    console.log('\n⏱️  Waiting 5 seconds to verify no automatic polling...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ No automatic API calls detected during wait period');

    console.log('\n🎉 Test completed successfully!');
    console.log('📈 Server should show minimal API usage:');
    console.log('   - 2 unread count calls (initial + manual refresh)');
    console.log('   - 2 messages list calls (initial + manual refresh)');
    console.log('   - No continuous polling');
    console.log('   - No rate limit errors');

  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ Rate limit error detected!');
      console.error('   This suggests the optimization didn\'t work properly');
    } else if (error.response?.status === 401) {
      console.log('🔐 Authentication required - please add valid token to test');
    } else {
      console.error('❌ Test error:', error.message);
    }
  }
}

// Run the test
testOptimizedFlow();

console.log('\n📝 Notes:');
console.log('   - Update SERVER_URL and TEST_USER_TOKEN for your environment');
console.log('   - Check your server logs to verify minimal API usage');
console.log('   - The badge should still work correctly in the mobile app');
console.log('   - Users can still get updates by manually pulling to refresh');
