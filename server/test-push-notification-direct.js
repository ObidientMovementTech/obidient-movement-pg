import { sendPushNotification, sendBroadcastPush } from './services/pushNotificationService.js';
import { query } from './config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test configurations
const TEST_CONFIGS = {
  // Test 1: Send to specific user IDs
  SPECIFIC_USERS: {
    title: "🧪 Test Notification - Specific Users",
    body: "This is a test push notification sent to specific users only.",
    userIds: [1, 2, 3], // Replace with actual user IDs you want to test
    data: {
      type: 'test',
      action: 'open_app',
      test_id: Date.now().toString()
    }
  },

  // Test 2: Send to all active users (be careful!)
  BROADCAST: {
    title: "🧪 Test Broadcast Notification",
    body: "This is a test broadcast notification sent to all users with push tokens.",
    data: {
      type: 'test_broadcast',
      action: 'open_notifications',
      test_id: Date.now().toString()
    }
  },

  // Test 3: Send to users with specific criteria
  FILTERED_USERS: {
    title: "🧪 Test Notification - Filtered Users",
    body: "This is a test notification for users who joined recently.",
    data: {
      type: 'test_filtered',
      action: 'open_home',
      test_id: Date.now().toString()
    }
  }
};

// Helper function to get users based on criteria
async function getUsersByCriteria(criteria = 'all', limit = 5) {
  try {
    let queryText;
    let params = [];

    switch (criteria) {
      case 'recent':
        queryText = `
          SELECT DISTINCT u.id, u.email, u.full_name, u.created_at
          FROM users u
          JOIN push_tokens pt ON u.id = pt.user_id
          WHERE pt.is_active = true
          AND u.created_at > NOW() - INTERVAL '30 days'
          ORDER BY u.created_at DESC
          LIMIT $1
        `;
        params = [limit];
        break;

      case 'active_tokens':
        queryText = `
          SELECT DISTINCT u.id, u.email, u.full_name, pt.token, pt.platform
          FROM users u
          JOIN push_tokens pt ON u.id = pt.user_id
          WHERE pt.is_active = true
          ORDER BY u.id
          LIMIT $1
        `;
        params = [limit];
        break;

      case 'all':
      default:
        queryText = `
          SELECT DISTINCT u.id, u.email, u.full_name
          FROM users u
          JOIN push_tokens pt ON u.id = pt.user_id
          WHERE pt.is_active = true
          ORDER BY u.id
          LIMIT $1
        `;
        params = [limit];
        break;
    }

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting users:', error);
    return [];
  }
}

// Helper function to display user info
function displayUsers(users, title) {
  console.log(`\n📋 ${title}:`);
  console.log('─'.repeat(80));
  if (users.length === 0) {
    console.log('   No users found with active push tokens');
    return;
  }

  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: ${user.id} | Email: ${user.email} | Name: ${user.full_name || 'N/A'}`);
    if (user.token) {
      console.log(`      Token: ${user.token.substring(0, 20)}... | Platform: ${user.platform}`);
    }
    if (user.created_at) {
      console.log(`      Joined: ${new Date(user.created_at).toLocaleDateString()}`);
    }
  });
}

// Test functions
async function testSpecificUsers() {
  console.log('\n🎯 TEST 1: Send notification to specific users');
  console.log('='.repeat(60));

  const config = TEST_CONFIGS.SPECIFIC_USERS;

  // First, let's see what users are available
  const availableUsers = await getUsersByCriteria('active_tokens', 10);
  displayUsers(availableUsers, 'Available users with push tokens');

  if (availableUsers.length === 0) {
    console.log('\n⚠️  No users with active push tokens found. Please register a user with the mobile app first.');
    return;
  }

  // Use the first few available users
  const targetUserIds = availableUsers.slice(0, Math.min(3, availableUsers.length)).map(u => u.id);

  console.log(`\n📤 Sending notification to user IDs: [${targetUserIds.join(', ')}]`);
  console.log(`   Title: "${config.title}"`);
  console.log(`   Body: "${config.body}"`);

  try {
    const result = await sendPushNotification(
      targetUserIds,
      config.title,
      config.body,
      config.data
    );

    console.log('\n✅ Result:', result);
  } catch (error) {
    console.error('\n❌ Error sending notification:', error);
  }
}

async function testBroadcastNotification() {
  console.log('\n📢 TEST 2: Send broadcast notification');
  console.log('='.repeat(60));

  const config = TEST_CONFIGS.BROADCAST;

  // Get count of users who would receive this
  const userCount = await query(`
    SELECT COUNT(DISTINCT user_id) as count 
    FROM push_tokens 
    WHERE is_active = true
  `);

  console.log(`\n👥 This will send to ${userCount.rows[0].count} users with active push tokens`);
  console.log(`   Title: "${config.title}"`);
  console.log(`   Body: "${config.body}"`);

  // Safety check
  if (userCount.rows[0].count > 10) {
    console.log('\n⚠️  WARNING: This will send to more than 10 users!');
    console.log('   For safety, this test is limited to first 5 users.');
    console.log('   To send to all users, modify the TEST_CONFIGS.BROADCAST.force_all = true');

    // Send to first 5 users only for safety
    const limitedUsers = await getUsersByCriteria('active_tokens', 5);
    const userIds = limitedUsers.map(u => u.id);

    const result = await sendPushNotification(
      userIds,
      config.title + ' (Limited Test)',
      config.body,
      config.data
    );

    console.log('\n✅ Limited broadcast result:', result);
    return;
  }

  try {
    const result = await sendBroadcastPush(
      config.title,
      config.body,
      config.data
    );

    console.log('\n✅ Broadcast result:', result);
  } catch (error) {
    console.error('\n❌ Error sending broadcast:', error);
  }
}

async function testFilteredUsers() {
  console.log('\n🔍 TEST 3: Send notification to filtered users (recent joiners)');
  console.log('='.repeat(60));

  const config = TEST_CONFIGS.FILTERED_USERS;

  // Get recent users
  const recentUsers = await getUsersByCriteria('recent', 5);
  displayUsers(recentUsers, 'Recent users (last 30 days) with push tokens');

  if (recentUsers.length === 0) {
    console.log('\n⚠️  No recent users found. Falling back to any users with tokens...');
    const anyUsers = await getUsersByCriteria('active_tokens', 3);
    if (anyUsers.length === 0) {
      console.log('   No users with active push tokens found.');
      return;
    }
    recentUsers.push(...anyUsers);
  }

  const userIds = recentUsers.map(u => u.id);

  console.log(`\n📤 Sending to ${userIds.length} recent users`);
  console.log(`   Title: "${config.title}"`);
  console.log(`   Body: "${config.body}"`);

  try {
    const result = await sendPushNotification(
      userIds,
      config.title,
      config.body,
      config.data
    );

    console.log('\n✅ Filtered users result:', result);
  } catch (error) {
    console.error('\n❌ Error sending to filtered users:', error);
  }
}

// Main test runner
async function runPushNotificationTests() {
  console.log('🚀 PUSH NOTIFICATION TESTING SUITE');
  console.log('='.repeat(60));
  console.log('📱 Testing direct push notifications without creating feeds');
  console.log('🧪 This will send test notifications to users with active mobile devices\n');

  // Check if Firebase is configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ Firebase configuration missing in .env file');
    console.error('   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  try {
    // Test 1: Specific users
    await testSpecificUsers();

    console.log('\n' + '─'.repeat(80));

    // Test 2: Broadcast (with safety limits)
    await testBroadcastNotification();

    console.log('\n' + '─'.repeat(80));

    // Test 3: Filtered users
    await testFilteredUsers();

    console.log('\n' + '='.repeat(80));
    console.log('🎉 All push notification tests completed!');
    console.log('💡 Check your mobile device(s) for the test notifications');
    console.log('📊 Check the console output above for delivery results');

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
}

// Interactive menu for selective testing
async function showTestMenu() {
  console.log('\n📋 PUSH NOTIFICATION TEST MENU');
  console.log('='.repeat(40));
  console.log('1. Test specific users');
  console.log('2. Test broadcast (limited for safety)');
  console.log('3. Test filtered users (recent joiners)');
  console.log('4. Run all tests');
  console.log('5. Show users with push tokens');
  console.log('0. Exit');
  console.log('─'.repeat(40));
}

// If running directly, show menu or run based on command line args
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📱 PUSH NOTIFICATION DIRECT TESTER');
    console.log('Usage examples:');
    console.log('  node test-push-notification-direct.js all       # Run all tests');
    console.log('  node test-push-notification-direct.js specific  # Test specific users');
    console.log('  node test-push-notification-direct.js broadcast # Test broadcast');
    console.log('  node test-push-notification-direct.js filtered  # Test filtered users');
    console.log('  node test-push-notification-direct.js users     # Show users with tokens');
    console.log('\nOr run without arguments for interactive mode (coming soon)');
    process.exit(0);
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case 'all':
      runPushNotificationTests();
      break;
    case 'specific':
      testSpecificUsers();
      break;
    case 'broadcast':
      testBroadcastNotification();
      break;
    case 'filtered':
      testFilteredUsers();
      break;
    case 'users':
      getUsersByCriteria('active_tokens', 20).then(users => {
        displayUsers(users, 'All users with active push tokens');
      });
      break;
    default:
      console.log('❌ Unknown command:', command);
      process.exit(1);
  }
}

export {
  runPushNotificationTests,
  testSpecificUsers,
  testBroadcastNotification,
  testFilteredUsers,
  getUsersByCriteria
};
