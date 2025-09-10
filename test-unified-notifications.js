#!/usr/bin/env node
/**
 * Test Unified Notification System
 * This script creates a test feed and checks if notifications are created properly
 */

const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://172.20.10.2:5000';

async function testUnifiedNotifications() {
  try {
    console.log('🧪 Testing Unified Notification System...');

    // Step 1: Login as admin to get token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${SERVER_URL}/mobile/auth/login`, {
      email: 'admin@example.com', // Replace with your admin email
      password: 'admin123' // Replace with your admin password
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Create test feed
    console.log('📝 Creating test feed...');
    const testFeed = {
      title: 'Unified Notification Test',
      message: 'This tests both web notifications and mobile push notifications!',
      feedType: 'announcement',
      priority: 'normal'
    };

    const feedResponse = await axios.post(`${SERVER_URL}/mobile/feeds`, testFeed, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!feedResponse.data.success) {
      throw new Error('Feed creation failed: ' + feedResponse.data.message);
    }

    console.log('✅ Test feed created successfully!');
    console.log('Feed ID:', feedResponse.data.feedId);
    console.log('📱 Check your mobile device for push notification');
    console.log('🔔 Check notifications screen in mobile app');

    // Step 3: Get notifications to verify they were created
    console.log('🔍 Checking notifications...');
    const notificationsResponse = await axios.get(`${SERVER_URL}/mobile/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (notificationsResponse.data.success) {
      console.log('✅ Notifications retrieved successfully!');
      console.log('Total notifications:', notificationsResponse.data.notifications.length);

      // Find our test notification
      const testNotification = notificationsResponse.data.notifications.find(
        n => n.title === '🔔 New Update' && n.message.includes('Unified Notification Test')
      );

      if (testNotification) {
        console.log('🎯 Test notification found!');
        console.log('Notification:', {
          id: testNotification.id,
          title: testNotification.title,
          feedId: testNotification.feedId,
          read: testNotification.read
        });
      } else {
        console.log('⚠️ Test notification not found in list');
      }
    }

    console.log('\n🎉 Test completed! Check mobile app for:');
    console.log('  1. Push notification popup');
    console.log('  2. Notification in bell icon screen');
    console.log('  3. Mark as read functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testUnifiedNotifications();
