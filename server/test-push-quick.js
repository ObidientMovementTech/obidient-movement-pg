import { sendPushNotification } from './services/pushNotificationService.js';
import { query } from './config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function quickPushTest() {
  console.log('🚀 QUICK PUSH NOTIFICATION TEST');
  console.log('='.repeat(50));

  try {
    // Get the first user with an active push token
    const result = await query(`
      SELECT DISTINCT u.id, u.email, u.name, pt.token, pt.platform
      FROM users u
      JOIN push_tokens pt ON u.id = pt.user_id
      WHERE pt.is_active = true
      ORDER BY u.id
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ No users with active push tokens found');
      console.log('💡 Make sure you have the mobile app installed and registered');
      return;
    }

    const user = result.rows[0];
    console.log('📱 Found user with push token:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Platform: ${user.platform}`);
    console.log(`   Token: ${user.token.substring(0, 20)}...`);

    // Send test notification
    const testTitle = '🧪 Quick Test Notification';
    const testBody = `Hello ${user.name || 'User'}! This is a quick test push notification sent at ${new Date().toLocaleTimeString()}.`;
    const testData = {
      type: 'feed', // This will navigate to Feeds screen
      action: 'open_feeds',
      timestamp: Date.now().toString(),
      user_id: user.id.toString()
    };

    console.log('\n📤 Sending test notification...');
    console.log(`   Title: "${testTitle}"`);
    console.log(`   Body: "${testBody}"`);

    const pushResult = await sendPushNotification(
      [user.id],
      testTitle,
      testBody,
      testData
    );

    console.log('\n✅ Push notification result:');
    console.log(JSON.stringify(pushResult, null, 2));

    if (pushResult.success) {
      console.log('\n🎉 Test notification sent successfully!');
      console.log('📱 Check your mobile device for the notification');
    } else {
      console.log('\n❌ Failed to send notification');
      console.log('Error:', pushResult.error);
    }

  } catch (error) {
    console.error('❌ Quick test error:', error);
  }
}

// Run the quick test
quickPushTest();
