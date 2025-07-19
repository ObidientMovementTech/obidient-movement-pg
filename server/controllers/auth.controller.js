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
      password,
      countryCode,
      votingState,
      votingLGA,
      pendingVotingBlocJoin // New field for voting bloc join info
    } = req.body;

    // Validate input with specific error messages
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
        field: 'name'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        field: 'email'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'email'
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        field: 'phone'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        field: 'password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        field: 'password'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please use a different email or try logging in.',
        field: 'email',
        errorType: 'EMAIL_EXISTS'
      });
    }

    // Check if phone number already exists (optional validation)
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists. Please use a different phone number.',
        field: 'phone',
        errorType: 'PHONE_EXISTS'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with optional voting location
    const userData = {
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      emailVerified: false
    };

    // Add country code if provided
    if (countryCode) {
      userData.countryCode = countryCode;
    }

    // Add voting location if provided
    if (votingState) {
      userData.votingState = votingState;
    }
    if (votingLGA) {
      userData.votingLGA = votingLGA;
    }

    const newUser = await User.create(userData);

    // Generate auth token
    const authToken = generateToken(newUser.id);
    res.cookie('cu-auth-token', authToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    // Generate confirmation token with pending voting bloc info
    const tokenPayload = { userId: newUser.id };
    if (pendingVotingBlocJoin) {
      tokenPayload.pendingVotingBlocJoin = pendingVotingBlocJoin;
    }
    const emailToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/auth/confirm-email/${emailToken}`;

    // Try to send the email before responding
    try {
      await sendConfirmationEmail(name, email, link, "confirm");
      res.status(201).json({
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        emailSent: true
      });
    } catch (emailError) {
      console.error('Registration email error:', emailError.message);

      // Still create the user but inform about the email issue
      res.status(201).json({
        success: true,
        message: 'Account created successfully, but there was an issue sending the verification email. You can request a new verification email from the login page.',
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

    // Handle specific database errors
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      if (error.constraint && error.constraint.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          field: 'email',
          errorType: 'EMAIL_EXISTS'
        });
      }
      if (error.constraint && error.constraint.includes('phone')) {
        return res.status(409).json({
          success: false,
          message: 'An account with this phone number already exists.',
          field: 'phone',
          errorType: 'PHONE_EXISTS'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Unable to create account at this time. Please try again later.',
      errorType: 'SERVER_ERROR'
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        field: 'email'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        field: 'password'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'email'
      });
    }

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email address. Please check your email or sign up for a new account.",
        field: 'email',
        errorType: 'EMAIL_NOT_FOUND'
      });
    }

    // 2. Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in. Check your inbox for a verification email.",
        field: 'email',
        errorType: 'EMAIL_NOT_VERIFIED',
        email: user.email // Include email for resend verification option
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please check your password and try again.",
        field: 'password',
        errorType: 'INVALID_PASSWORD'
      });
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
        success: true,
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
      success: true,
      message: "Login successful! Welcome back.",
      user: userResponse,
      token: authToken,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time. Please try again later.",
      errorType: 'SERVER_ERROR'
    });
  }
};



export const confirmEmail = async (req, res) => {
  try {
    // Get token from request body for API-based confirmation
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set email as verified if not already
    let wasAlreadyVerified = user.emailVerified;
    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    // Clean up any existing duplicate auto voting blocs first
    await cleanupDuplicateAutoVotingBlocs(user.id);

    // Create automatic voting bloc for the user after email confirmation
    // Check if user already has an auto-generated voting bloc to prevent duplicates
    const existingBlocs = await VotingBloc.findByCreator(user.id);
    const existingAutoBloc = existingBlocs.find(bloc => bloc.isAutoGenerated);

    if (!existingAutoBloc) {
      try {
        await createAutoVotingBloc(user);
        console.log(`✅ Auto voting bloc created for user: ${user.email}`);
      } catch (votingBlocError) {
        console.error('Failed to create auto voting bloc:', votingBlocError);
        // Don't fail the email confirmation if voting bloc creation fails
      }
    } else {
      console.log(`ℹ️  User ${user.email} already has an auto-generated voting bloc, skipping creation`);
    }

    // Generate session token for auto-login
    const sessionToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie for auto-login
    res.cookie('cu-auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Check if there's a pending voting bloc join in the token
    let pendingJoin = null;
    if (decoded.pendingVotingBlocJoin) {
      pendingJoin = decoded.pendingVotingBlocJoin;
    }

    res.status(200).json({
      success: true,
      message: wasAlreadyVerified ? 'Email already verified, auto voting bloc checked' : 'Email confirmed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true
      },
      pendingVotingBlocJoin: pendingJoin
    });
  } catch (err) {
    console.error('Email confirm error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByIdSelect(req.userId, ["passwordHash"]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format response with flattened fields from the users table
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

      // Flattened personal info fields (direct from users table)
      userName: user.userName,
      gender: user.gender,
      ageRange: user.ageRange,
      citizenship: user.citizenship,
      countryCode: user.countryCode,
      stateOfOrigin: user.stateOfOrigin,
      votingState: user.votingState,
      votingLGA: user.votingLGA,
      votingWard: user.votingWard,
      isVoter: user.isVoter,
      willVote: user.willVote,

      // Legacy nested structure (for backward compatibility)
      personalInfo: user.personalInfo || {},
      onboardingData: user.onboardingData || {},

      // Settings and preferences
      notificationPreferences: user.notificationPreferences || {},
      notificationSettings: user.notificationSettings || {},

      // Timestamps
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
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        field: 'email'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address. Please check your email or sign up for a new account.',
        field: 'email',
        errorType: 'EMAIL_NOT_FOUND'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already verified. You can proceed to login.',
        field: 'email',
        errorType: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Generate a new confirmation token
    const emailToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/auth/confirm-email/${emailToken}`;

    // Send the confirmation email
    try {
      await sendConfirmationEmail(user.name, user.email, link, "confirm");
      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully! Please check your inbox and spam folder.',
        emailSent: true
      });
    } catch (emailError) {
      console.error(`Failed to send confirmation email: ${emailError.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
        errorType: 'EMAIL_SEND_ERROR'
      });
    }
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to resend verification email at this time. Please try again later.',
      errorType: 'SERVER_ERROR'
    });
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
    console.log('👤 User voting location data:', {
      votingState: user.votingState,
      votingLGA: user.votingLGA
    });

    // Get default settings
    console.log('📋 Fetching default voting bloc settings...');
    const defaultSettings = await DefaultVotingBlocSettings.get();
    console.log('✅ Default settings retrieved:', {
      targetCandidate: defaultSettings.targetCandidate,
      scope: defaultSettings.scope,
      locationDefaults: typeof defaultSettings.locationDefaults === 'string'
        ? JSON.parse(defaultSettings.locationDefaults)
        : defaultSettings.locationDefaults
    });

    // Generate voting bloc data using user information
    console.log('🎯 Generating voting bloc data for user...');
    const votingBlocData = defaultSettings.generateForUser(user);
    console.log('✅ Generated voting bloc data:', {
      name: votingBlocData.name,
      description: votingBlocData.description.substring(0, 50) + '...',
      creator: votingBlocData.creator,
      locationState: votingBlocData.locationState,
      locationLga: votingBlocData.locationLga,
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

// Helper function to clean up duplicate auto voting blocs for a user
const cleanupDuplicateAutoVotingBlocs = async (userId) => {
  try {
    console.log(`🧹 Cleaning up duplicate auto voting blocs for user: ${userId}`);

    // Find all voting blocs for this user
    const allBlocs = await VotingBloc.findByCreator(userId);

    // Filter to only auto-generated ones
    const autoBlocs = allBlocs.filter(bloc => bloc.isAutoGenerated);

    console.log(`📊 Found ${autoBlocs.length} auto-generated voting blocs for user ${userId}`);

    if (autoBlocs.length <= 1) {
      console.log('✅ No duplicates found, no cleanup needed');
      return;
    }

    // Keep the first one (oldest) and delete the rest
    const keepBloc = autoBlocs[0];
    const duplicateBlocs = autoBlocs.slice(1);

    console.log(`🗑️  Deleting ${duplicateBlocs.length} duplicate auto voting blocs`);
    console.log(`✅ Keeping bloc: "${keepBloc.name}" (ID: ${keepBloc.id})`);

    // Delete duplicate blocs
    for (const dupBloc of duplicateBlocs) {
      await VotingBloc.deleteById(dupBloc.id);
      console.log(`❌ Deleted duplicate bloc: "${dupBloc.name}" (ID: ${dupBloc.id})`);
    }

    console.log(`✅ Cleanup completed for user ${userId}`);
  } catch (error) {
    console.error('❌ Error cleaning up duplicate auto voting blocs:', error);
    // Don't throw error to prevent breaking the main flow
  }
};

// Admin endpoint to cleanup duplicate auto voting blocs for all users
export const cleanupDuplicateAutoBlocs = async (req, res) => {
  try {
    console.log('🧹 Starting cleanup of duplicate auto voting blocs for all users...');

    // Use raw SQL to find users with multiple auto-generated voting blocs
    const duplicateUsersQuery = `
      SELECT creator, COUNT(*) as count, 
             ARRAY_AGG(id ORDER BY "createdAt" ASC) as bloc_ids,
             ARRAY_AGG(name ORDER BY "createdAt" ASC) as bloc_names
      FROM "votingBlocs" 
      WHERE "isAutoGenerated" = true 
      GROUP BY creator 
      HAVING COUNT(*) > 1
    `;

    const { query } = await import('../config/db.js');
    const result = await query(duplicateUsersQuery);
    const duplicateUsers = result.rows;

    console.log(`📊 Found ${duplicateUsers.length} users with duplicate auto voting blocs`);

    let totalCleaned = 0;
    let totalDeleted = 0;

    // Clean up duplicates for each user
    for (const userGroup of duplicateUsers) {
      const userId = userGroup.creator;
      const blocIds = userGroup.bloc_ids;
      const blocNames = userGroup.bloc_names;
      const duplicateCount = userGroup.count - 1; // Keep 1, delete the rest

      console.log(`🧹 Cleaning up ${duplicateCount} duplicates for user: ${userId}`);

      // Keep the first one (oldest), delete the rest
      const keepBlocId = blocIds[0];
      const keepBlocName = blocNames[0];
      const deletionBlocIds = blocIds.slice(1);
      const deletionBlocNames = blocNames.slice(1);

      // Delete duplicate blocs
      for (let i = 0; i < deletionBlocIds.length; i++) {
        const dupBlocId = deletionBlocIds[i];
        const dupBlocName = deletionBlocNames[i];

        await VotingBloc.deleteById(dupBlocId);
        console.log(`❌ Deleted duplicate bloc: "${dupBlocName}" (ID: ${dupBlocId})`);
        totalDeleted++;
      }

      console.log(`✅ Kept bloc: "${keepBlocName}" (ID: ${keepBlocId}) for user ${userId}`);
      totalCleaned++;
    }

    console.log(`✅ Cleanup completed. Cleaned ${totalCleaned} users, deleted ${totalDeleted} duplicate blocs`);

    res.status(200).json({
      success: true,
      message: 'Duplicate auto voting blocs cleanup completed',
      stats: {
        usersWithDuplicates: duplicateUsers.length,
        usersCleaned: totalCleaned,
        blocsDeleted: totalDeleted
      }
    });
  } catch (error) {
    console.error('❌ Error during duplicate auto voting blocs cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup duplicate auto voting blocs',
      error: error.message
    });
  }
};


