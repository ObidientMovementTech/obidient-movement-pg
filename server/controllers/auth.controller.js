import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import VotingBloc from '../models/votingBloc.model.js';
import DefaultVotingBlocSettings from '../models/defaultVotingBlocSettings.model.js';
import generateToken from '../utils/generateToken.js';
import { sendConfirmationEmail, sendOTPEmail } from '../utils/emailHandler.js';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import { logger } from '../middlewares/security.middleware.js';
import { query } from '../config/db.js';
import { createRefreshToken, rotateRefreshToken, revokeAllUserTokens, getRefreshCookieOptions } from '../utils/refreshToken.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const sanitizeRedirectPath = (rawPath) => {
  if (!rawPath || typeof rawPath !== 'string') {
    return '/dashboard';
  }

  try {
    const decoded = decodeURIComponent(rawPath);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) {
      return '/dashboard';
    }
    return decoded;
  } catch (error) {
    logger.warn('Failed to decode Google redirect path', {
      rawPath,
      error: error.message,
    });
    return '/dashboard';
  }
};

const decodeGoogleState = (stateParam) => {
  if (!stateParam || typeof stateParam !== 'string') {
    return {};
  }

  try {
    const json = Buffer.from(stateParam, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return {};
  } catch (error) {
    logger.warn('Failed to parse Google OAuth state payload', {
      error: error.message,
    });
    return {};
  }
};

// ── Dual-mode auth response helper ──────────────────────────────
// Detects mobile vs web and returns tokens accordingly.
const isMobileRequest = (req) =>
  req.headers['x-client-type'] === 'mobile';

const sendAuthTokens = async (req, res, userId, extraPayload = {}) => {
  const authToken = generateToken(userId);
  const { rawToken: refreshRaw } = await createRefreshToken(userId);

  if (isMobileRequest(req)) {
    // Mobile: tokens in response body (stored in SecureStorage)
    return { authToken, refreshToken: refreshRaw, ...extraPayload };
  }

  // Web: httpOnly cookies
  res.cookie('cu-auth-token', authToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.cookie('cu-refresh-token', refreshRaw, getRefreshCookieOptions());

  return { authToken, ...extraPayload };
};

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
      votingWard, // Add support for voting ward
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
      logger.warn('Registration attempt with existing email', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(409).json({
        success: false,
        message: 'An account with these details already exists. Please use different credentials or try logging in.',
        field: 'email',
        errorType: 'ACCOUNT_EXISTS'
      });
    }

    // Check if phone number already exists (optional validation)
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      logger.warn('Registration attempt with existing phone', {
        phone,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(409).json({
        success: false,
        message: 'An account with these details already exists. Please use different credentials or try logging in.',
        field: 'phone',
        errorType: 'ACCOUNT_EXISTS'
      });
    }

    const salt = await bcrypt.genSalt(12);
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
    if (votingWard) {
      userData.votingWard = votingWard;
    }

    const newUser = await User.create(userData);

    // Log successful registration
    logger.info('User registered successfully', {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      countryCode: newUser.countryCode || 'NG',
      votingState: newUser.votingState || 'N/A',
      isDiaspora: !!newUser.countryCode && newUser.countryCode !== 'NG',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Generate auth tokens (dual-mode: cookies for web, body for mobile)
    const regTokens = await sendAuthTokens(req, res, newUser.id);

    // Generate confirmation token with pending voting bloc info
    const tokenPayload = { userId: newUser.id };
    if (pendingVotingBlocJoin) {
      tokenPayload.pendingVotingBlocJoin = pendingVotingBlocJoin;
    }
    const emailToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/auth/confirm-email/${emailToken}`;

    // Generate 6-digit OTP code for email verification
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await User.findByIdAndUpdate(newUser.id, {
      otp: otpCode,
      otpExpiry: otpExpiry.toISOString(),
      otpPurpose: 'email_verification',
    });

    // DEBUG: Verify OTP was actually saved
    const savedUser = await User.findById(newUser.id);
    console.log(`[OTP-DEBUG] Registration OTP for ${email}: code=${otpCode}, saved_otp=${savedUser?.otp}, saved_purpose=${savedUser?.otpPurpose}, saved_expiry=${savedUser?.otpExpiry}`);

    // Try to send the email before responding
    try {
      // Send OTP code for email verification
      await sendOTPEmail(name, email, otpCode, 'email_verification');

      const response = {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        emailSent: true,
      };
      // Include tokens in body for mobile
      if (isMobileRequest(req)) {
        response.token = regTokens.authToken;
        response.refreshToken = regTokens.refreshToken;
      }
      res.status(201).json(response);
    } catch (emailError) {
      console.error('Registration email error:', emailError.message);

      const response = {
        success: true,
        message: 'Account created successfully, but there was an issue sending the verification email. You can request a new verification email from the login page.',
        emailSent: false,
      };
      if (isMobileRequest(req)) {
        response.token = regTokens.authToken;
        response.refreshToken = regTokens.refreshToken;
      }
      res.status(201).json(response);

      // Attempt to resend the OTP email asynchronously after a brief delay
      setTimeout(async () => {
        try {
          await sendOTPEmail(name, email, otpCode, 'email_verification');
          console.log('Delayed OTP email sent successfully');
        } catch (retryError) {
          console.error('Failed to send delayed OTP email:', retryError);
        }
      }, 2000);
    }
  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

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
        message: 'Email or phone number is required',
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

    // Determine if input is email or phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(email);

    // Build filter to search by either email or phone
    const findFilter = isEmail ? { email } : { phone: email };

    // 1. Check if user exists
    const user = await User.findOne(findFilter);
    if (!user) {
      logger.warn('Login attempt with non-existent credentials', {
        identifier: email,
        isEmail,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/phone and password.',
        field: 'email',
        errorType: 'INVALID_CREDENTIALS'
      });
    }

    // 2. Check if email is verified
    if (!user.emailVerified) {
      logger.warn('Login attempt with unverified email', {
        email,
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in. Check your inbox for a verification email.",
        field: 'email',
        errorType: 'EMAIL_NOT_VERIFIED',
        email: user.email // Include email for resend verification option
      });
    }

    // 2b. Check account lockout (8 failed attempts in 30 minutes)
    const LOCKOUT_WINDOW_MINUTES = 30;
    const MAX_FAILED_ATTEMPTS = 8;

    const recentFailures = await query(
      `SELECT COUNT(*) AS fail_count FROM login_attempts
       WHERE user_id = $1 AND success = false
         AND attempted_at > NOW() - INTERVAL '${LOCKOUT_WINDOW_MINUTES} minutes'`,
      [user.id]
    );

    if (parseInt(recentFailures.rows[0].fail_count) >= MAX_FAILED_ATTEMPTS) {
      logger.warn('Account locked due to too many failed login attempts', {
        userId: user.id,
        ip: req.ip,
        failCount: recentFailures.rows[0].fail_count
      });
      return res.status(429).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again in 30 minutes.',
        errorType: 'ACCOUNT_LOCKED'
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Record failed attempt
      await query(
        'INSERT INTO login_attempts (user_id, ip_address, success) VALUES ($1, $2, false)',
        [user.id, req.ip]
      );

      logger.warn('Login attempt with incorrect password', {
        email,
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/phone and password.',
        field: 'password',
        errorType: 'INVALID_CREDENTIALS'
      });
    }

    // Record successful login and clear failed attempts
    await query(
      'INSERT INTO login_attempts (user_id, ip_address, success) VALUES ($1, $2, true)',
      [user.id, req.ip]
    );

    // 4. Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user.id, twoFactorPending: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        success: true,
        message: "2FA verification required",
        requires2FA: true,
        tempToken,
        email: user.email
      });
    }

    // 5. Generate auth token + refresh token (dual-mode: web cookies / mobile body)
    const tokenData = await sendAuthTokens(req, res, user.id);

    // Return single response with user info but without password
    const userResponse = {
      _id: user.id, // Keep _id for frontend compatibility
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      designation: user.designation,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      assignedState: user.assignedState,
      assignedLGA: user.assignedLGA,
      assignedWard: user.assignedWard,
    };

    // Log successful login
    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      name: user.name,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: "Login successful! Welcome back.",
      user: userResponse,
      token: tokenData.authToken,
      ...(isMobileRequest(req) && { refreshToken: tokenData.refreshToken }),
    });

  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time. Please try again later.",
      errorType: 'SERVER_ERROR'
    });
  }
};

export const googleLoginCallback = async (req, res) => {
  try {
    const oauthUser = req.user;

    if (!oauthUser || !oauthUser.email) {
      logger.error('Google OAuth callback missing email payload');
      const fallbackUrl = `${getFrontendBaseUrl()}/auth/login?error=google_callback_error`;
      return res.redirect(fallbackUrl);
    }

    const { googleId, email, displayName, photoUrl } = oauthUser;
    const stateData = decodeGoogleState(req.query.state);
    const redirectPath = sanitizeRedirectPath(stateData.redirectTo);
    const frontendBase = getFrontendBaseUrl();
    const redirectUrl = `${frontendBase}${redirectPath}`;

    let userRecord = null;
    if (googleId) {
      const googleLookup = await query('SELECT * FROM users WHERE google_id = $1 LIMIT 1', [googleId]);
      if (googleLookup.rows.length > 0) {
        userRecord = new User(googleLookup.rows[0]);
      }
    }

    if (!userRecord) {
      userRecord = await User.findOne({ email });
    }

    if (!userRecord) {
      logger.warn('Google login attempted for unknown account', {
        email,
        googleId,
      });

      const params = new URLSearchParams({
        error: 'google_account_missing',
        email,
      });

      return res.redirect(`${frontendBase}/auth/login?${params.toString()}`);
    }

    await query(
      `UPDATE users SET
         google_id = $1,
         oauth_provider = 'google',
         email = CASE
           WHEN email IS NULL OR email = '' OR LOWER(email) LIKE '%@obidients.com' THEN $4
           ELSE email
         END,
         "emailVerified" = TRUE,
         "profileImage" = COALESCE($2, "profileImage"),
         name = CASE
           WHEN name IS NULL OR TRIM(name) = '' THEN $3
           ELSE name
         END,
         last_login_at = NOW(),
         "updatedAt" = NOW()
       WHERE id = $5`,
      [googleId, photoUrl, displayName, email, userRecord.id]
    );

    const updatedUser = await User.findById(userRecord.id);

    if (!updatedUser) {
      logger.error('Failed to load user after Google login update', {
        userId: userRecord.id,
      });
      return res.redirect(`${frontendBase}/auth/login?error=google_callback_error`);
    }

    if (updatedUser.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { userId: updatedUser.id, twoFactorPending: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      const params = new URLSearchParams({
        requires2FA: '1',
        tempToken,
        email: updatedUser.email || email,
        redirect: redirectPath,
        status: 'google-linked'
      });

      logger.info('Google login requires 2FA', {
        userId: updatedUser.id,
        email: updatedUser.email,
      });

      return res.redirect(`${frontendBase}/auth/login?${params.toString()}`);
    }

    const authToken = generateToken(updatedUser.id);

    res.cookie('cu-auth-token', authToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Issue refresh token for Google login
    const { rawToken: googleRefresh } = await createRefreshToken(updatedUser.id);
    res.cookie('cu-refresh-token', googleRefresh, getRefreshCookieOptions());

    logger.info('User logged in via Google', {
      userId: updatedUser.id,
      email: updatedUser.email,
    });

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Google login callback error', {
      error: error.message,
      stack: error.stack,
    });

    const fallbackUrl = `${getFrontendBaseUrl()}/auth/login?error=google_callback_error`;
    return res.redirect(fallbackUrl);
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
      { expiresIn: '3d' }
    );

    // Set HTTP-only cookie for auto-login
    res.cookie('cu-auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // Issue refresh token
    const { rawToken: confirmRefresh } = await createRefreshToken(user.id);
    res.cookie('cu-refresh-token', confirmRefresh, getRefreshCookieOptions());

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

// Verify email using 6-digit OTP code (for mobile app)
export const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
        errorType: 'EMAIL_NOT_FOUND',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can proceed to login.',
        errorType: 'EMAIL_ALREADY_VERIFIED',
      });
    }

    // Check OTP validity
    console.log(`[OTP-DEBUG] Verify attempt for ${email}: stored_otp=${user.otp}, stored_purpose=${user.otpPurpose}, submitted_code=${code}`);
    if (!user.otp || user.otpPurpose !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.',
        errorType: 'NO_OTP',
      });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
        errorType: 'OTP_EXPIRED',
      });
    }

    if (user.otp !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
        errorType: 'INVALID_OTP',
      });
    }

    // OTP is valid — verify email and clear OTP fields
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;
    await user.save();

    // Clean up any existing duplicate auto voting blocs
    await cleanupDuplicateAutoVotingBlocs(user.id);

    // Create automatic voting bloc for the user
    const existingBlocs = await VotingBloc.findByCreator(user.id);
    const existingAutoBloc = existingBlocs.find(bloc => bloc.isAutoGenerated);

    if (!existingAutoBloc) {
      try {
        await createAutoVotingBloc(user);
        console.log(`✅ Auto voting bloc created for user: ${user.email}`);
      } catch (votingBlocError) {
        console.error('Failed to create auto voting bloc:', votingBlocError);
      }
    }

    // Generate session tokens (dual-mode)
    const verifyTokens = await sendAuthTokens(req, res, user.id);

    const responsePayload = {
      success: true,
      message: 'Email verified successfully',
      token: verifyTokens.authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
    };
    if (isMobileRequest(req)) {
      responsePayload.refreshToken = verifyTokens.refreshToken;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Verify email code error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to verify code at this time. Please try again later.',
      errorType: 'SERVER_ERROR',
    });
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
      id: user.id, // Primary identifier (Postgres)
      _id: user.id, // Keep _id for frontend compatibility
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled || false,
      profileImage: user.profileImage,
      role: user.role,
      kycStatus: user.kycStatus,
      adcStatus: user.adcStatus || 'not_registered',

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
      votingPU: user.votingPU,
      isVoter: user.isVoter,
      willVote: user.willVote,

      // Bank account details
      bankName: user.bankName,
      bankAccountNumber: user.bankAccountNumber,
      bankAccountName: user.bankAccountName,

      // Designation and assignment fields
      designation: user.designation,
      assignedState: user.assignedState,
      assignedLGA: user.assignedLGA,
      assignedWard: user.assignedWard,

      // Legacy nested structure (for backward compatibility)
      personalInfo: user.personalInfo || {},
      onboardingData: user.onboardingData || {},

      // Settings and preferences
      notificationPreferences: user.notificationPreferences || {},
      notificationSettings: user.notificationSettings || {},

      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // Profile completion
      profileCompletionPercentage: user.profileCompletionPercentage || 0,
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
      // Return success regardless to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset code has been sent. Please allow up to 5 minutes for delivery.',
      });
    }

    // Invalidate any existing reset tokens for this user
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [user.id]);

    // --- Link-based reset (kept for backward compat with web deep links) ---
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.CLIENT_URL}/auth/change-password?token=${rawToken}`;

    // --- OTP-based reset (for mobile + new web flow) ---
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await User.findByIdAndUpdate(user.id, {
      otp: otpCode,
      otpExpiry: otpExpiry.toISOString(),
      otpPurpose: 'password_reset',
    });

    try {
      await sendOTPEmail(user.name, user.email, otpCode, 'password_reset');

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset code has been sent. Please allow up to 5 minutes for delivery.',
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

    // Hash the incoming token and look it up
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const resetRow = result.rows[0];
    const user = await User.findById(resetRow.user_id);
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Mark token as used (single-use)
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRow.id]);

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

/**
 * OTP-based password reset (for mobile + new web flow).
 * Step 1: User calls forgotPassword → receives OTP via email
 * Step 2: User calls this endpoint with { email, code, newPassword }
 */
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code',
      });
    }

    // Check OTP validity
    if (!user.otp || user.otpPurpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'No reset code found. Please request a new one.',
      });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    if (user.otp !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code. Please check and try again.',
      });
    }

    // OTP is valid — reset password and clear OTP fields
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;
    await user.save();

    // Invalidate any link-based reset tokens too
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [user.id]);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (err) {
    console.error('Reset password with OTP error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};

export const logoutUser = async (req, res) => {
  // Revoke all refresh tokens for this user
  try {
    const token = req.cookies?.['cu-auth-token'];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id || decoded.userId;
      if (userId) await revokeAllUserTokens(userId);
    }
  } catch { /* token may be expired — still clear cookies */ }

  // Clear the authentication cookie with the same options used when setting it
  res.clearCookie('cu-auth-token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  res.clearCookie('cu-refresh-token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth'
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

export const refreshAccessToken = async (req, res) => {
  try {
    // Accept refresh token from cookie (web) or request body (mobile)
    const rawToken = req.cookies?.['cu-refresh-token'] || req.body?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const result = await rotateRefreshToken(rawToken);
    if (!result) {
      // Clear cookies for web clients
      if (!isMobileRequest(req)) {
        res.clearCookie('cu-auth-token', {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/'
        });
        res.clearCookie('cu-refresh-token', {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/api/auth'
        });
      }
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Issue new access token
    const accessToken = generateToken(result.userId);

    if (isMobileRequest(req)) {
      // Mobile: return tokens in body
      return res.status(200).json({
        success: true,
        message: 'Token refreshed',
        token: accessToken,
        refreshToken: result.newRawToken,
      });
    }

    // Web: set cookies
    res.cookie('cu-auth-token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('cu-refresh-token', result.newRawToken, getRefreshCookieOptions());

    return res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    logger.error('Refresh token error', { error: error.message });
    return res.status(500).json({ message: 'Token refresh failed' });
  }
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

    // Generate new 6-digit OTP code for mobile verification
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await User.findByIdAndUpdate(user.id, {
      otp: otpCode,
      otpExpiry: otpExpiry.toISOString(),
      otpPurpose: 'email_verification',
    });

    // Send the confirmation email
    try {
      await sendOTPEmail(user.name, user.email, otpCode, 'email_verification');
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

    // Generate full auth token (dual-mode)
    const tokenData = await sendAuthTokens(req, res, user.id);

    // Return user info
    const userResponse = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    };

    return res.status(200).json({
      message: "2FA verification successful",
      user: userResponse,
      token: tokenData.authToken,
      ...(isMobileRequest(req) && { refreshToken: tokenData.refreshToken }),
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
      return crypto.randomBytes(4).toString('hex'); // 8 hex characters
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


