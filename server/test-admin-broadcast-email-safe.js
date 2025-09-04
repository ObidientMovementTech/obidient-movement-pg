import { sendAdminBroadcastEmail } from './utils/emailHandler.js';

// 🚨 SAFETY CHECK - Test the admin broadcast email function with FAKE emails only
async function testAdminBroadcastEmail() {
  console.log('🧪 Testing Admin Broadcast Email Function...\n');
  console.log('🛡️  SAFETY: This test only uses fake email addresses!\n');

  const testData = {
    title: "[TEST] Important Platform Update",
    message: `[THIS IS A TEST EMAIL - NOT SENT TO REAL USERS]

Dear Obidient Movement members,

We are excited to announce significant improvements to our platform:

1. Enhanced election monitoring capabilities
2. Improved voting bloc communication tools  
3. New mobile app features for better engagement

These updates will help us work more effectively together as we build a stronger movement for positive change in Nigeria.

Please log in to your dashboard to explore these new features and continue participating in our democratic initiatives.

Thank you for your continued dedication to the Obidient Movement.`,
    senderName: "Admin Test User (TESTING ONLY)",
    recipients: [
      { email: "fake-test1@example-domain-that-does-not-exist.com", name: "Test User 1" },
      { email: "fake-test2@example-domain-that-does-not-exist.com", name: "Test User 2" }
    ]
  };

  // 🚨 SAFETY CHECK: Ensure we're only using test emails
  const safeEmails = testData.recipients.every(recipient => 
    recipient.email.includes('example-domain-that-does-not-exist.com') ||
    recipient.email.includes('example.com')
  );

  if (!safeEmails) {
    console.error('🚨 SAFETY ABORT: Test contains real email addresses!');
    console.error('❌ Test cancelled to protect live users');
    return;
  }

  try {
    console.log('📧 Sending test admin broadcast email...');
    console.log(`📋 Title: ${testData.title}`);
    console.log(`👥 Recipients: ${testData.recipients.length} FAKE test emails`);
    console.log(`👤 Sender: ${testData.senderName}\n`);
    console.log('🛡️  Email addresses used:');
    testData.recipients.forEach(recipient => {
      console.log(`   - ${recipient.email} (FAKE)`);
    });
    console.log('');

    const result = await sendAdminBroadcastEmail(
      testData.title,
      testData.message,
      testData.senderName,
      testData.recipients
    );

    console.log('✅ Email sending completed!');
    console.log(`📊 Results:`);
    console.log(`   - Successful: ${result.successful}`);
    console.log(`   - Failed: ${result.failed}`);
    console.log(`   - Total: ${result.total}`);

    if (result.successful === result.total) {
      console.log('\n🎉 All test emails sent successfully!');
    } else {
      console.log(`\n⚠️  ${result.failed} test emails failed to send (expected for fake addresses)`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testAdminBroadcastEmail();
