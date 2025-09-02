import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/mobile';

// Test mobile API endpoints
const testMobileAPI = async () => {
  try {
    console.log('🧪 Testing Mobile API Endpoints...\n');

    // Test 1: Login endpoint
    console.log('1. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com', // Replace with actual test user
      password: 'testpassword'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;

      // Test 2: Get feeds
      console.log('2. Testing feeds endpoint...');
      const feedsResponse = await axios.get(`${API_BASE}/feeds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Feeds endpoint working');

      // Test 3: Register push token
      console.log('3. Testing push token registration...');
      const pushResponse = await axios.post(`${API_BASE}/push/register-token`, {
        token: 'test_push_token_123',
        platform: 'android',
        appVersion: '1.0.0'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Push token registration working');

      console.log('\n🎉 All mobile API endpoints are working!');
    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMobileAPI();
}

export default testMobileAPI;
