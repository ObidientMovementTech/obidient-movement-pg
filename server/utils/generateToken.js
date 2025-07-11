import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Ensure we're using a consistent field name in the token payload
const generateToken = (userId) => {
  console.log(`[VERCEL][TOKEN] Generating token for userId: ${userId}`);

  const token = jwt.sign(
    { id: userId }, // Always use 'id' as the key
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );

  // Verify the token was created correctly (for debugging)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[VERCEL][TOKEN] Token verified with payload:', decoded);
  } catch (error) {
    console.error('[VERCEL][TOKEN] Token verification failed:', error);
  }

  return token;
};

export default generateToken;
