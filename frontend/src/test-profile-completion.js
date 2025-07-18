// Quick test script to verify profile completion API
import { getProfileCompletion } from './services/profileService';

const testProfileCompletion = async () => {
  try {
    console.log('🧪 Testing profile completion API...');
    const result = await getProfileCompletion();
    console.log('✅ Profile completion API response:', result);
  } catch (error) {
    console.error('❌ Profile completion API error:', error);
  }
};

// Run test if executed directly
if (typeof window !== 'undefined') {
  window.testProfileCompletion = testProfileCompletion;
  console.log('🧪 Profile completion test function available as window.testProfileCompletion()');
}

export default testProfileCompletion;
