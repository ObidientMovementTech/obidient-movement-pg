#!/usr/bin/env node
/**
 * Test Push Notification for Mobile App
 * This script creates a test feed to trigger push notifications
 */

const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://172.20.10.2:5000';

async function createTestFeed() {
  try {
    console.log('🧪 Creating test feed to trigger push notification...');

    const testFeed = {
      title: 'Push Notification Test',
      message: 'This is a test message to verify push notifications are working on your mobile device!',
      feed_type: 'announcement',
      image_url: null,
      user_id: 1, // Replace with valid user ID
      published_at: new Date().toISOString()
    };

    const response = await axios.post(`${SERVER_URL}/mobile/feeds`, testFeed, {
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header - you'll need to get this from your admin login
        // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
      }
    });

    console.log('✅ Test feed created successfully!');
    console.log('📱 Check your mobile device for the push notification');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Error creating test feed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
createTestFeed();
