import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import VotingBloc from '../models/votingBloc.model.js';
import DefaultVotingBlocSettings from '../models/defaultVotingBlocSettings.model.js';
import generateToken from '../utils/generateToken.js';
import { sendConfirmationEmail } from '../utils/emailHandler.js';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      emailVerified: false
    });

    // Generate auth token
    const authToken = generateToken(newUser.id);
    res.cookie('cu-auth-token', authToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    // Generate confirmation token
    const emailToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1h' });
    const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const link = `${apiBaseUrl}/auth/confirm-email/${emailToken}`;

    // Try to send the email before responding
    try {
      await sendConfirmationEmail(name, email, link, "confirm");
      res.status(201).json({ message: 'User registered successfully, confirmation email sent' });
    } catch (emailError) {
      console.error('Registration email error:', emailError.message);

      // Still create the user but inform about the email issue
      res.status(201).json({
        message: 'User registered successfully, but there was an issue sending the confirmation email. Please use the resend confirmation option.',
        emailSent: false
      });

      // Attempt to resend the email asynchronously after a brief delay
      setTimeout(async () => {
        try {
          await sendConfirmationEmail(name, email, link, "confirm");
          console.log('Delayed confirmation email sent successfully');
        } catch (retryError) {
          console.error('Failed to send delayed confirmation email:', retryError);
        }
      }, 2000);
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // 2. Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please confirm your email to log in." });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // 4. Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user.id, twoFactorPending: true },
        JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.status(200).json({
        message: "2FA verification required",
        requires2FA: true,
        tempToken,
        email: user.email
      });
    }

    // 5. Generate auth token
    const authToken = generateToken(user.id);

    // 6. Set cookie
    res.cookie("cu-auth-token", authToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    // Return single response with user info but without password
    const userResponse = {
      _id: user.id, // Keep _id for frontend compatibility
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      // Include any other fields you want to return
    };

    return res.status(200).json({
      message: "Logged in successfully",
      user: userResponse,
      token: authToken,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.emailVerified = true;
    await user.save();

    // Create automatic voting bloc for the user after email confirmation
    try {
      await createAutoVotingBloc(user);
      console.log(`✅ Auto voting bloc created for user: ${user.email}`);
    } catch (votingBlocError) {
      console.error('Failed to create auto voting bloc:', votingBlocError);
      // Don't fail the email confirmation if voting bloc creation fails
    }

    // Generate session token for auto-login
    const sessionToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success status and let frontend handle pending voting bloc joins
    const redirectUrl = `${process.env.CLIENT_URL}/dashboard?emailVerified=true`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Email confirm error:', err);
    const redirectUrl = `${process.env.CLIENT_URL}/auth/login?error=invalid_token`;
    res.redirect(redirectUrl);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByIdSelect(req.userId, ["passwordHash"]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format response according to API documentation
    const userResponse = {
      _id: user.id, // Keep _id for frontend compatibility
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled || false,
      profileImage: user.profileImage,
      role: user.role,
      kycStatus: user.kycStatus,
      personalInfo: user.personalInfo || {},
      onboardingData: user.onboardingData || {},
      notificationPreferences: user.notificationPreferences || {},
      notificationSettings: user.notificationSettings || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      user: userResponse
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token with longer expiration to account for potential delays
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30m' }); // Extended from 15m to 30m

    // Update the path to match your router configuration
    const resetLink = `${process.env.CLIENT_URL}/auth/change-password?token=${resetToken}`;

    try {
      await sendConfirmationEmail(user.name, user.email, resetLink, "reset");

      // Inform user about potential delays
      res.status(200).json({
        message: 'Reset link sent to email. Please allow up to 5 minutes for delivery.',
        emailProvider: email.includes('@gmail.com') ? 'gmail' : 'other'
      });
    } catch (emailError) {
      console.error(`Password reset email error: ${emailError.message}`);
      res.status(500).json({ message: 'Failed to send reset email' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

export const logoutUser = (req, res) => {
  // Clear the authentication cookie with the same options used when setting it
  res.clearCookie('cu-auth-token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

export const resendConfirmationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate a new confirmation token
    const emailToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const link = `${apiBaseUrl}/auth/confirm-email/${emailToken}`;

    // Send the confirmation email
    try {
      await sendConfirmationEmail(user.name, user.email, link, "confirm");
      res.status(200).json({ message: 'Confirmation email sent successfully' });
    } catch (emailError) {
      console.error(`Failed to send confirmation email: ${emailError.message}`);
      res.status(500).json({ message: 'Failed to send confirmation email' });
    }
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify 2FA login
export const verify2FALogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ message: "Token and verification code are required" });
    }

    // Verify the temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Make sure this is a 2FA pending token
    if (!decoded.twoFactorPending) {
      return res.status(401).json({ message: "Invalid token type" });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the 2FA code
    const verifyTOTP = (token, secret) => {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1 // Allow 1 step before/after for clock drift (30 seconds)
      });
    };

    const isValid = verifyTOTP(code, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    // Generate full auth token
    const authToken = generateToken(user.id);

    // Set cookie
    res.cookie("cu-auth-token", authToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    // Return user info
    const userResponse = {
      _id: user.id, // Keep _id for frontend compatibility
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    };

    return res.status(200).json({
      message: "2FA verification successful",
      user: userResponse,
      token: authToken,
    });

  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({ message: "Failed to verify 2FA" });
  }
};

// Helper function to create automatic voting bloc for new users
const createAutoVotingBloc = async (user) => {
  try {
    console.log(`🚀 Starting auto voting bloc creation for user: ${user.email} (ID: ${user.id})`);

    // Get default settings
    console.log('📋 Fetching default voting bloc settings...');
    const defaultSettings = await DefaultVotingBlocSettings.get();
    console.log('✅ Default settings retrieved:', {
      targetCandidate: defaultSettings.targetCandidate,
      scope: defaultSettings.scope
    });

    // Generate voting bloc data using user information
    console.log('🎯 Generating voting bloc data for user...');
    const votingBlocData = defaultSettings.generateForUser(user);
    console.log('✅ Generated voting bloc data:', {
      name: votingBlocData.name,
      description: votingBlocData.description.substring(0, 50) + '...',
      creator: votingBlocData.creator,
      isAutoGenerated: votingBlocData.isAutoGenerated
    });

    // Generate join code
    const generateJoinCode = () => {
      return Math.random().toString(36).slice(2, 10); // 8 characters
    };

    votingBlocData.joinCode = generateJoinCode();
    console.log('🔑 Generated join code:', votingBlocData.joinCode);

    // Create the voting bloc
    console.log('💾 Creating voting bloc in database...');
    const autoVotingBloc = await VotingBloc.create(votingBlocData);
    console.log(`✅ Auto voting bloc created successfully:`, {
      id: autoVotingBloc.id,
      name: autoVotingBloc.name,
      creator: autoVotingBloc.creator,
      joinCode: autoVotingBloc.joinCode
    });

    return autoVotingBloc;
  } catch (error) {
    console.error('❌ Error creating auto voting bloc:', {
      error: error.message,
      stack: error.stack,
      userId: user?.id,
      userEmail: user?.email
    });
    throw error;
  }
};


