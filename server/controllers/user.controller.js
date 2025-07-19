import s3Client from '../config/aws.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { uploadBufferToS3 } from '../utils/s3Upload.js';
import { generateOTP, createOTPExpiry, isOTPValid } from '../utils/otpUtils.js';
import { generateTOTPSecret, generateQRCode, verifyTOTP } from '../utils/tfaUtils.js';
import { sendOTPEmail } from '../utils/emailHandler.js';

// Check if username is available
export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    const currentUserId = req.userId; // From auth middleware

    console.log('🔍 Username availability check:', { username, currentUserId });

    if (!username) {
      return res.status(400).json({
        available: false,
        message: 'Username is required'
      });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        available: false,
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
      });
    }

    // Check if username exists (excluding current user)
    const existingUser = await User.findOne({ userName: username });
    console.log('🔍 Existing user found:', existingUser ? { id: existingUser.id, userName: existingUser.userName } : null);

    if (existingUser && existingUser.id !== currentUserId) {
      console.log('❌ Username taken by different user');
      return res.status(200).json({
        available: false,
        message: 'Username is already taken'
      });
    }

    console.log('✅ Username available');
    return res.status(200).json({
      available: true,
      message: 'Username is available'
    });
  } catch (error) {
    console.error('❌ Username check error:', error);
    res.status(500).json({
      available: false,
      message: 'Server error while checking username'
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ error: 'File buffer is required' });
    }

    // Upload to S3
    const imageUrl = await uploadBufferToS3(
      req.file.buffer,
      req.file.originalname,
      {
        folder: 'profile_images',
        contentType: req.file.mimetype
      }
    );

    // Update user's profile image URL
    await User.findByIdAndUpdate(req.userId, { profileImage: imageUrl });
    return res.json({ url: imageUrl });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
};

// PATCH /users/me - update user profile (including personal info fields)
export const updateMe = async (req, res) => {
  try {
    const updates = req.body;
    console.log('🔄 UpdateMe called with updates:', updates);

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('👤 Current user before update:', { name: user.name, phone: user.phone, profileImage: user.profileImage });

    // Update personal info fields (now in main users table after migration)
    if (updates.personalInfo) {
      console.log('📝 Updating personalInfo:', updates.personalInfo);

      // Map personalInfo fields to their new locations in users table
      const personalInfoMapping = {
        userName: 'userName',
        phoneNumber: 'phone',
        countryCode: 'countryCode',
        gender: 'gender',
        lga: 'votingLGA',
        ward: 'votingWard',
        ageRange: 'ageRange',
        stateOfOrigin: 'stateOfOrigin',
        votingEngagementState: 'votingState',
        citizenship: 'citizenship',
        isVoter: 'isVoter',
        willVote: 'willVote'
      };

      Object.keys(personalInfoMapping).forEach(oldField => {
        if (updates.personalInfo[oldField] !== undefined) {
          const newField = personalInfoMapping[oldField];
          console.log(`🔧 Mapping personalInfo.${oldField} to user.${newField}: "${updates.personalInfo[oldField]}"`);
          user[newField] = updates.personalInfo[oldField];
        }
      });
    }

    // Update top-level fields (expanded to include all personal info fields)
    const allowedTopLevelFields = [
      'name', 'phone', 'profileImage', 'votingState', 'votingLGA', 'votingWard',
      'gender', 'ageRange', 'citizenship', 'isVoter', 'willVote', 'userName',
      'countryCode', 'stateOfOrigin', 'notificationPreferences', 'onboardingData'
    ];

    allowedTopLevelFields.forEach(field => {
      if (updates[field] !== undefined) {
        console.log(`🔧 Updating ${field} from "${user[field]}" to "${updates[field]}"`);
        if (field === 'onboardingData') {
          // Handle nested onboardingData updates
          user.onboardingData = { ...user.onboardingData, ...updates.onboardingData };
        } else {
          user[field] = updates[field];
        }
      }
    });

    console.log('👤 User after updates but before save:', { name: user.name, phone: user.phone, profileImage: user.profileImage });

    await user.save();

    console.log('✅ User saved successfully:', { name: user.name, phone: user.phone, profileImage: user.profileImage });

    res.json({ user });
  } catch (err) {
    console.error('UpdateMe error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// PATCH /users/:id - update user by admin
export const updateUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Save updated user
    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified
        // Include other non-sensitive fields as needed
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Password Change Step 1: Request OTP for password change
export const requestPasswordChange = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If currentPassword is provided, verify it
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = createOTPExpiry(10); // 10 minutes expiry

    // Save OTP to user record
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpPurpose = 'password_reset';
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.name, user.email, otp, 'password_reset');

    return res.status(200).json({
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Password change request error:', error);
    return res.status(500).json({ message: 'Failed to process request' });
  }
};

// OTP Verification
export const verifyOTP = async (req, res) => {
  try {
    const { otp, purpose } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and hasn't expired
    if (!isOTPValid(otp, user.otp, user.otpExpiry)) {
      return res.status(400).json({
        message: 'Invalid or expired verification code'
      });
    }

    // Check if OTP purpose matches
    if (user.otpPurpose !== purpose) {
      return res.status(400).json({
        message: 'Invalid verification purpose'
      });
    }

    // If everything is valid, return success
    return res.status(200).json({
      message: 'Verification successful',
      verified: true
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Failed to verify code' });
  }
};

// Password Change Step 3: Change Password (after OTP verification)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, otpVerified } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If not OTP verified, check current password
    if (!otpVerified) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    } else {
      // Check if OTP was actually used for password reset
      if (user.otpPurpose !== 'password_reset') {
        return res.status(400).json({ message: 'OTP verification for password reset required' });
      }
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.passwordHash = hashedPassword;

    // Clear OTP data
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;

    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
};

// Send Email Verification
export const sendEmailVerification = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = createOTPExpiry(10); // 10 minutes expiry

    // Save OTP to user record
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpPurpose = 'email_verification';
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.name, user.email, otp, 'email_verification');

    return res.status(200).json({
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Failed to send verification email' });
  }
};

// Verify Email with OTP
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and hasn't expired
    if (!isOTPValid(otp, user.otp, user.otpExpiry)) {
      return res.status(400).json({
        message: 'Invalid or expired verification code'
      });
    }

    // Check if OTP purpose matches
    if (user.otpPurpose !== 'email_verification') {
      return res.status(400).json({
        message: 'Invalid verification purpose'
      });
    }

    // Update email verification status
    user.emailVerified = true;

    // Clear OTP data
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;

    await user.save();

    return res.status(200).json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Failed to verify email' });
  }
};

// Set up Two-Factor Authentication
export const setup2FA = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Generate TOTP secret
    const secret = generateTOTPSecret(user.email);

    // Save secret to user record
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCode = await generateQRCode(secret.otpauth_url);

    return res.status(200).json({
      message: '2FA setup initiated',
      qrCode
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({ message: 'Failed to set up 2FA' });
  }
};

// Verify and Enable 2FA
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a 2FA secret
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    // Verify token
    const isValid = verifyTOTP(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    return res.status(200).json({
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ message: 'Failed to verify 2FA code' });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify token
    const isValid = verifyTOTP(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    return res.status(200).json({
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({ message: 'Failed to disable 2FA' });
  }
};

// Email Change Step 1: Request to change email
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;
    const userId = req.userId;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ message: 'New email and current password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Store the pending email change
    user.pendingEmail = newEmail;

    // If 2FA is enabled, create OTP for email change
    if (user.twoFactorEnabled) {
      // User has 2FA, send response indicating 2FA verification is needed
      user.otpPurpose = 'email_change';
      await user.save();

      return res.status(200).json({
        message: '2FA verification required',
        requires2FA: true
      });
    } else {
      // If no 2FA, generate verification email to new address directly
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = createOTPExpiry();
      user.otpPurpose = 'email_change';
      await user.save();

      // Send verification email to NEW address
      await sendOTPEmail(user.name, newEmail, otp, 'Verify Your Email Change');

      return res.status(200).json({
        message: 'Email verification sent to new email address'
      });
    }

  } catch (error) {
    console.error('Email change request error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Email Change Step 2: Verify email change with OTP (for both 2FA and non-2FA flows)
export const verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pendingEmail) {
      return res.status(400).json({ message: 'No pending email change' });
    }

    // If this is a 2FA verification, verify with the TOTP
    if (user.twoFactorEnabled && user.otpPurpose === 'email_change') {
      const isValid = verifyTOTP(otp, user.twoFactorSecret);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // 2FA verified, now send verification email to new address
      const emailOtp = generateOTP();
      user.otp = emailOtp;
      user.otpExpiry = createOTPExpiry();
      await user.save();

      // Send verification email to NEW address
      await sendOTPEmail(user.name, user.pendingEmail, emailOtp, 'Verify Your Email Change');

      return res.status(200).json({
        message: 'Email verification sent to new email address'
      });
    }
    // If this is the email verification step
    else if (user.otp && user.otpPurpose === 'email_change') {
      if (!isOTPValid(otp, user.otp, user.otpExpiry)) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      // Update email and clear fields
      user.email = user.pendingEmail;
      user.pendingEmail = null;
      user.otp = null;
      user.otpExpiry = null;
      user.otpPurpose = null;
      await user.save();

      return res.status(200).json({
        message: 'Email changed successfully',
        newEmail: user.email
      });
    } else {
      return res.status(400).json({ message: 'Invalid verification state' });
    }

  } catch (error) {
    console.error('Email change verification error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, push, broadcast } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize the notification preferences object if it doesn't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    // Update each field if provided in the request
    if (email !== undefined) user.notificationPreferences.email = Boolean(email);
    if (push !== undefined) user.notificationPreferences.push = Boolean(push);
    if (broadcast !== undefined) user.notificationPreferences.broadcast = Boolean(broadcast);

    await user.save();

    return res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /users/delete-account - delete user account
export const deleteAccount = async (req, res) => {
  try {
    const { password, confirmationText } = req.body;

    // Validate confirmationText format - frontend should enforce this too
    if (!confirmationText || !confirmationText.includes('Delete account for')) {
      return res.status(400).json({ message: 'Invalid confirmation. Please type the confirmation text exactly as shown.' });
    }

    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Delete the user
    await User.findByIdAndDelete(req.userId);

    // Clear user's session and cookies
    req.session = null;
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ message: 'Failed to delete account. Please try again.' });
  }
};

// Safe method to get profile completion percentage
export const getProfileCompletion = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if database has profileCompletionPercentage field
    let dbCompletionPercentage = null;
    if (user.profileCompletionPercentage !== undefined) {
      dbCompletionPercentage = user.profileCompletionPercentage;
    }

    // Calculate completion percentage manually as fallback
    // These fields match exactly what the EditProfileModal considers required
    const requiredFields = [
      'name', 'phone', 'userName', 'gender', 'ageRange', 'citizenship',
      'stateOfOrigin', 'votingState', 'votingLGA', 'votingWard', 'isVoter', 'willVote'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = user[field];
      return value && value.toString().trim() !== '';
    });

    const missingFields = requiredFields.filter(field => {
      const value = user[field];
      return !value || value.toString().trim() === '';
    });

    const manualCompletionPercentage = (completedFields.length / requiredFields.length) * 100;

    // Debug logging to see exactly what fields are missing
    console.log('🔍 Profile completion debug for user:', userId);
    console.log('📊 Field status:', {
      name: user.name || 'MISSING',
      phone: user.phone || 'MISSING',
      userName: user.userName || 'MISSING',
      gender: user.gender || 'MISSING',
      ageRange: user.ageRange || 'MISSING',
      citizenship: user.citizenship || 'MISSING',
      stateOfOrigin: user.stateOfOrigin || 'MISSING',
      votingState: user.votingState || 'MISSING',
      votingLGA: user.votingLGA || 'MISSING',
      votingWard: user.votingWard || 'MISSING',
      isVoter: user.isVoter || 'MISSING',
      willVote: user.willVote || 'MISSING'
    });
    console.log('✅ Completed fields:', completedFields);
    console.log('❌ Missing fields:', missingFields);
    console.log('📈 Completion percentage:', manualCompletionPercentage.toFixed(1) + '%');

    return res.status(200).json({
      success: true,
      data: {
        dbCompletionPercentage,
        manualCompletionPercentage: Math.round(manualCompletionPercentage * 10) / 10, // Round to 1 decimal
        completedFields: completedFields.length,
        totalFields: requiredFields.length,
        missingFields: missingFields,
        // Add field details for debugging
        fieldDetails: {
          name: user.name || null,
          phone: user.phone || null,
          userName: user.userName || null,
          gender: user.gender || null,
          ageRange: user.ageRange || null,
          citizenship: user.citizenship || null,
          stateOfOrigin: user.stateOfOrigin || null,
          votingState: user.votingState || null,
          votingLGA: user.votingLGA || null,
          votingWard: user.votingWard || null,
          isVoter: user.isVoter || null,
          willVote: user.willVote || null
        }
      }
    });
  } catch (error) {
    console.error('Get profile completion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile completion'
    });
  }
};
