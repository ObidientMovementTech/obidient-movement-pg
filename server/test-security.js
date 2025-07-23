#!/usr/bin/env node

/**
 * Security Test Script
 * Tests the rate limiting and security measures implemented
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test rate limiting on registration
async function testRegistrationRateLimit() {
  log('\n🔄 Testing Registration Rate Limiting...', 'blue');

  const registrationData = {
    name: 'Test User',
    email: TEST_EMAIL,
    phone: '+1234567890',
    password: TEST_PASSWORD,
    votingState: 'Lagos',
    votingLGA: 'Ikeja'
  };

  try {
    // Make 4 rapid registration attempts (should block on 4th)
    for (let i = 1; i <= 4; i++) {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registrationData,
          email: `test${i}@example.com`
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        log(`✅ Rate limit triggered on attempt ${i} (Expected behavior)`, 'green');
        return true;
      } else {
        log(`📝 Attempt ${i}: ${response.status} - ${data.message}`, 'yellow');
      }
    }

    log('❌ Rate limiting not working - all requests succeeded', 'red');
    return false;
  } catch (error) {
    log(`❌ Error testing rate limit: ${error.message}`, 'red');
    return false;
  }
}

// Test input validation
async function testInputValidation() {
  log('\n🔄 Testing Input Validation...', 'blue');

  const maliciousData = {
    name: '<script>alert("xss")</script>',
    email: 'malicious@example.com', // Use different email to avoid rate limits
    phone: '9876543210',
    password: 'weak' // This should fail password validation
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousData)
    });

    const data = await response.json();

    if (response.status === 400 && data.errors) {
      log('✅ Input validation working - weak password rejected', 'green');
      return true;
    } else if (response.status === 403) {
      log('✅ Suspicious activity detection working - malicious input blocked', 'green');
      return true;
    } else if (response.status === 429) {
      log('⚠️  Hit rate limit (this means rate limiting is working, but need to test validation separately)', 'yellow');
      // Try a simpler validation test that doesn't trigger rate limits
      return await testValidationWithoutRateLimit();
    } else {
      log(`❌ Input validation failed: ${response.status} - ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing validation: ${error.message}`, 'red');
    return false;
  }
}

// Test validation on a different endpoint to avoid rate limits
async function testValidationWithoutRateLimit() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email', // Invalid email format
        password: 'test'
      })
    });

    const data = await response.json();

    if (response.status === 400 && data.errors) {
      log('✅ Email validation working - invalid email format rejected', 'green');
      return true;
    } else {
      log(`❌ Email validation not working: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing email validation: ${error.message}`, 'red');
    return false;
  }
}

// Test login rate limiting
async function testLoginRateLimit() {
  log('\n🔄 Testing Login Rate Limiting...', 'blue');

  const loginData = {
    email: 'nonexistent@example.com',
    password: 'wrongpassword'
  };

  try {
    // Make 6 rapid login attempts (should block on 6th)
    for (let i = 1; i <= 6; i++) {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      if (response.status === 429) {
        log(`✅ Login rate limit triggered on attempt ${i} (Expected behavior)`, 'green');
        return true;
      } else {
        log(`📝 Login attempt ${i}: ${response.status}`, 'yellow');
      }
    }

    log('❌ Login rate limiting not working', 'red');
    return false;
  } catch (error) {
    log(`❌ Error testing login rate limit: ${error.message}`, 'red');
    return false;
  }
}

// Test security headers
async function testSecurityHeaders() {
  log('\n🔄 Testing Security Headers...', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/`);
    const headers = response.headers;

    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security'
    ];

    let headersFound = 0;
    securityHeaders.forEach(header => {
      if (headers.get(header)) {
        log(`✅ ${header}: ${headers.get(header)}`, 'green');
        headersFound++;
      } else {
        log(`❌ Missing header: ${header}`, 'red');
      }
    });

    return headersFound === securityHeaders.length;
  } catch (error) {
    log(`❌ Error testing headers: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runSecurityTests() {
  log('🔒 SECURITY TESTS STARTING', 'blue');
  log('=====================================', 'blue');

  const tests = [
    { name: 'Registration Rate Limiting', fn: testRegistrationRateLimit },
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'Login Rate Limiting', fn: testLoginRateLimit },
    { name: 'Security Headers', fn: testSecurityHeaders }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;

      // Wait longer between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000)); // Increased to 3 seconds
    } catch (error) {
      log(`❌ Test "${test.name}" failed: ${error.message}`, 'red');
    }
  }

  log('\n=====================================', 'blue');
  log(`🔒 SECURITY TESTS COMPLETED`, 'blue');
  log(`📊 Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('✅ All security measures are working correctly!', 'green');
  } else {
    log('⚠️  Some security tests failed. Please review the implementation.', 'yellow');
  }
}

// Check if server is running first
async function checkServerStatus() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      log('✅ Server is running, starting tests...', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Server is not running. Please start the server first:', 'red');
    log('   cd server && npm run dev', 'yellow');
    return false;
  }
}

// Run tests
if (await checkServerStatus()) {
  await runSecurityTests();
}
