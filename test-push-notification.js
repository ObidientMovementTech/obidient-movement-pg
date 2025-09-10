#!/usr/bin/env node

// Test script to create a new feed and trigger push notifications
import axios from 'axios';

const BASE_URL = 'http://172.20.10.2:5000';

async function testPushNotification() {
  try {
    // First login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/mobile/auth/login`, {
      email: 'admin@obidientmovement.org', // Replace with actual admin email
      password: 'password123' // Replace with actual admin password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Create a test feed
    console.log('📱 Creating test feed...');
    const feedResponse = await axios.post(
      `${BASE_URL}/mobile/feeds/create`,
      {
        title: 'Push Notification Test',
        message: 'This is a test notification to verify push notifications are working correctly. If you see this on your mobile device, the system is functioning properly!',
        feedType: 'general',
        priority: 'normal'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Feed created successfully:', feedResponse.data);
    console.log('📲 Push notification should have been sent to all registered devices');
    console.log('📱 Check your mobile device for the notification!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPushNotification();
