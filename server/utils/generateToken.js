import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Ensure we're using a consistent field name in the token payload
const generateToken = (userId) => {
  const token = jwt.sign(
    { id: userId }, // Always use 'id' as the key
    process.env.JWT_SECRET,
    {
      expiresIn: '3d',
    }
  );

  return token;
};

export default generateToken;
