import s3Client from '../config/aws.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';
import User from '../models/user.model.js';
import { query, getClient } from '../config/db.js';

// Helper function to transform frontend field names to database field names
const transformPersonalInfoFields = (frontendData) => {
  if (!frontendData) return null;

  return {
    firstName: frontendData.first_name || frontendData.firstName,
    middleName: frontendData.middle_name || frontendData.middleName,
    lastName: frontendData.last_name || frontendData.lastName,
    userName: frontendData.user_name || frontendData.userName,
    phoneNumber: frontendData.phone_number || frontendData.phoneNumber,
    countryCode: frontendData.country_code || frontendData.countryCode,
    gender: frontendData.gender,
    lga: frontendData.lga,
    ward: frontendData.ward,
    ageRange: frontendData.age_range || frontendData.ageRange,
    stateOfOrigin: frontendData.state_of_origin || frontendData.stateOfOrigin,
    votingEngagementState: frontendData.voting_engagement_state || frontendData.votingEngagementState,
    citizenship: frontendData.citizenship,
    isVoter: frontendData.isVoter,
    willVote: frontendData.willVote
  };
};

// Helper function to transform database field names back to frontend field names
const transformPersonalInfoToFrontend = (dbData) => {
  if (!dbData) return {};

  return {
    first_name: dbData.firstName || dbData.first_name,
    middle_name: dbData.middleName || dbData.middle_name,
    last_name: dbData.lastName || dbData.last_name,
    user_name: dbData.userName || dbData.user_name,
    phone_number: dbData.phoneNumber || dbData.phone_number,
    country_code: dbData.countryCode || dbData.country_code,
    gender: dbData.gender,
    lga: dbData.lga,
    ward: dbData.ward,
    age_range: dbData.ageRange || dbData.age_range,
    state_of_origin: dbData.stateOfOrigin || dbData.state_of_origin,
    voting_engagement_state: dbData.votingEngagementState || dbData.voting_engagement_state,
    citizenship: dbData.citizenship,
    isVoter: dbData.isVoter,
    willVote: dbData.willVote
  };
};

// Helper function to save KYC info to separate table
const saveKycInfo = async (userId, kycData) => {
  const { idType, idNumber, idImageUrl, selfieImageUrl } = kycData;

  await query(
    `INSERT INTO "userKycInfo" (
      "userId", "idType", "idNumber", "idImageUrl", "selfieImageUrl"
    ) VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT ("userId") 
    DO UPDATE SET
      "idType" = EXCLUDED."idType",
      "idNumber" = EXCLUDED."idNumber", 
      "idImageUrl" = EXCLUDED."idImageUrl",
      "selfieImageUrl" = EXCLUDED."selfieImageUrl",
      "updatedAt" = NOW()`,
    [userId, idType, idNumber, idImageUrl, selfieImageUrl]
  );
};

// Helper function to upload base64 image to S3
const uploadBase64ToS3 = async (base64String, filename, folder) => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const imageUrl = await uploadBufferToS3(buffer, filename, {
      folder,
      contentType: 'image/jpeg' // Assuming JPEG, could be made dynamic
    });

    return imageUrl;
  } catch (error) {
    throw new Error(`Failed to upload ${filename}: ${error.message}`);
  }
};

// Submit KYC (serverless-compatible, no multer)
export const submitKYC = async (req, res) => {
  try {
    const userId = req.userId;
    const { personalInfo, validIDType, validIDNumber, validIDBase64, selfieBase64 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required data (personal info is now optional since it's handled separately)
    if (!validIDType || !validIDNumber) {
      return res.status(400).json({ message: 'Missing required Valid ID information' });
    }

    // Get the user first to check what data we already have
    const user = await User.findByIdSelect(userId, ['passwordHash']);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let validIDUrl = user.validID?.idImageUrl || null;
    let selfieUrl = user.selfieImageUrl || null;

    // Upload ID image to S3 only if a new base64 image is provided
    if (validIDBase64) {
      try {
        console.log('Uploading new ID image to S3');
        validIDUrl = await uploadBase64ToS3(
          validIDBase64,
          `id-${userId}-${Date.now()}.jpg`,
          'kyc/valid_ids'
        );
        console.log('ID image uploaded successfully:', validIDUrl);
      } catch (error) {
        console.error('S3 ID upload error:', error);
        return res.status(500).json({ message: 'Failed to upload ID document' });
      }
    } else {
      console.log('Using existing ID image URL:', validIDUrl);
    }

    // Upload selfie to S3 only if a new base64 image is provided
    if (selfieBase64) {
      try {
        console.log('Uploading new selfie to S3');
        selfieUrl = await uploadBase64ToS3(
          selfieBase64,
          `selfie-${userId}-${Date.now()}.jpg`,
          'kyc/selfies'
        );
        console.log('Selfie uploaded successfully:', selfieUrl);
      } catch (error) {
        console.error('S3 selfie upload error:', error);
        return res.status(500).json({ message: 'Failed to upload selfie image' });
      }
    } else {
      console.log('Using existing selfie URL:', selfieUrl);
    }

    // Update personal information (this updates userPersonalInfo table)
    if (personalInfo) {
      const transformedPersonalInfo = transformPersonalInfoFields(personalInfo);
      await User.findByIdAndUpdate(userId, { personalInfo: transformedPersonalInfo });
    }

    // Validate that we have both Valid ID and Selfie before marking as pending
    if (!validIDUrl) {
      return res.status(400).json({ message: 'Valid ID image is required to submit KYC' });
    }

    if (!selfieUrl) {
      return res.status(400).json({ message: 'Selfie image is required to submit KYC' });
    }

    // Update KYC status to pending for review
    user.kycStatus = 'pending';

    // Save KYC information to userKycInfo table
    await saveKycInfo(userId, {
      idType: validIDType,
      idNumber: validIDNumber,
      idImageUrl: validIDUrl,
      selfieImageUrl: selfieUrl
    });

    await user.save();

    res.status(200).json({ message: 'KYC submitted successfully', kycStatus: user.kycStatus });
  } catch (err) {
    console.error('KYC submission error:', err);
    res.status(500).json({ message: 'KYC submission failed', error: err.message });
  }
};

// Save personal info step separately
export const savePersonalInfoStep = async (req, res) => {
  try {
    const userId = req.userId;
    const { personalInfo } = req.body;

    console.log('🔍 SavePersonalInfoStep called with:');
    console.log('UserId:', userId);
    console.log('Raw personalInfo from frontend:', JSON.stringify(personalInfo, null, 2));

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required data
    if (!personalInfo) {
      return res.status(400).json({ message: 'Missing personal information' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform frontend field names to database field names
    const transformedPersonalInfo = transformPersonalInfoFields(personalInfo);
    console.log('🔄 Transformed personalInfo for database:', JSON.stringify(transformedPersonalInfo, null, 2));

    // Update personal information using PostgreSQL method
    await User.findByIdAndUpdate(userId, { personalInfo: transformedPersonalInfo });

    // If KYC is unsubmitted, mark as draft
    if (user.kycStatus === 'unsubmitted') {
      user.kycStatus = 'draft';
      await user.save();
    }

    res.status(200).json({
      message: 'Personal information saved successfully',
      personalInfo: transformPersonalInfoToFrontend(transformedPersonalInfo)
    });
  } catch (err) {
    console.error('Save personal info error:', err);
    res.status(500).json({
      message: 'Failed to save personal information',
      error: err.message
    });
  }
};

// Save valid ID step separately
export const saveValidIDStep = async (req, res) => {
  try {
    const userId = req.userId;
    const { validIDType, validIDNumber, validIDBase64 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required data
    if (!validIDType || !validIDNumber) {
      return res.status(400).json({ message: 'Missing valid ID information' });
    }

    const user = await User.findByIdSelect(userId, ['passwordHash']);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let validIDUrl = user.validID?.idImageUrl;

    // Upload new ID image if provided
    if (validIDBase64) {
      try {
        validIDUrl = await uploadBase64ToS3(
          validIDBase64,
          `id-${userId}-${Date.now()}.jpg`,
          'kyc/valid_ids'
        );
      } catch (error) {
        console.error('S3 ID upload error:', error);
        return res.status(500).json({ message: 'Failed to upload ID document' });
      }
    }

    // Update valid ID information in KYC table
    await saveKycInfo(userId, {
      idType: validIDType,
      idNumber: validIDNumber,
      idImageUrl: validIDUrl,
      selfieImageUrl: user.selfieImageUrl // preserve existing selfie
    });

    // If KYC is unsubmitted, mark as draft
    if (user.kycStatus === 'unsubmitted') {
      user.kycStatus = 'draft';
    }

    await user.save();

    res.status(200).json({
      message: 'Valid ID information saved successfully',
      validID: {
        idType: validIDType,
        idNumber: validIDNumber,
        idImageUrl: validIDUrl
      }
    });
  } catch (err) {
    console.error('Save valid ID error:', err);
    res.status(500).json({
      message: 'Failed to save valid ID information',
      error: err.message
    });
  }
};

// Save selfie step separately
export const saveSelfieStep = async (req, res) => {
  try {
    const userId = req.userId;
    const { selfieBase64 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required data
    if (!selfieBase64) {
      return res.status(400).json({ message: 'Missing selfie image' });
    }

    const user = await User.findByIdSelect(userId, ['passwordHash']);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let selfieUrl = null;

    // Upload selfie to S3
    try {
      console.log('Uploading selfie to S3');
      selfieUrl = await uploadBase64ToS3(
        selfieBase64,
        `selfie-${userId}-${Date.now()}.jpg`,
        'kyc/selfies'
      );
      console.log('Selfie uploaded successfully:', selfieUrl);
    } catch (error) {
      console.error('S3 selfie upload error:', error);
      return res.status(500).json({ message: 'Failed to upload selfie image' });
    }

    // Update selfie in KYC table
    await saveKycInfo(userId, {
      idType: user.validID?.idType,
      idNumber: user.validID?.idNumber,
      idImageUrl: user.validID?.idImageUrl,
      selfieImageUrl: selfieUrl
    });

    // If KYC is unsubmitted, mark as draft
    if (user.kycStatus === 'unsubmitted') {
      user.kycStatus = 'draft';
    }

    await user.save();

    res.status(200).json({
      message: 'Selfie saved successfully',
      selfieImageUrl: selfieUrl
    });
  } catch (err) {
    console.error('Save selfie error:', err);
    res.status(500).json({
      message: 'Failed to save selfie',
      error: err.message
    });
  }
};

// Get current user's KYC
export const getMyKYC = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByIdSelect(userId, ['passwordHash']);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      kycStatus: user.kycStatus,
      personalInfo: transformPersonalInfoToFrontend(user.personalInfo),
      validID: {
        idType: user.validID?.idType,
        idNumber: user.validID?.idNumber,
        idImageUrl: user.validID?.idImageUrl,
      },
      selfieImageUrl: user.selfieImageUrl,
      kycRejectionReason: user.kycRejectionReason,
    });
  } catch (err) {
    console.error('Get KYC error:', err);
    res.status(500).json({ message: 'Failed to fetch KYC', error: err.message });
  }
};

// Edit KYC (if not approved)
export const editKYC = async (req, res) => {
  try {
    const userId = req.userId;
    const { personalInfo, validIDType, validIDNumber, validIDBase64, selfieBase64 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByIdSelect(userId, ['passwordHash']);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus === 'approved') {
      return res.status(400).json({ message: 'KYC already approved. Cannot edit.' });
    }

    let validIDUrl = user.validID?.idImageUrl;
    let selfieUrl = user.selfieImageUrl;

    // Upload new ID image if provided
    if (validIDBase64) {
      try {
        validIDUrl = await uploadBase64ToS3(
          validIDBase64,
          `id-${userId}-${Date.now()}.jpg`,
          'kyc/valid_ids'
        );
      } catch (error) {
        console.error('S3 ID upload error:', error);
        return res.status(500).json({ message: 'Failed to upload ID document' });
      }
    }

    // Upload new selfie if provided
    if (selfieBase64) {
      try {
        selfieUrl = await uploadBase64ToS3(
          selfieBase64,
          `selfie-${userId}-${Date.now()}.jpg`,
          'kyc/selfies'
        );
      } catch (error) {
        console.error('S3 selfie upload error:', error);
        return res.status(500).json({ message: 'Failed to upload selfie image' });
      }
    }

    // Update personal information if provided (this updates userPersonalInfo table)
    if (personalInfo) {
      const transformedPersonalInfo = transformPersonalInfoFields(personalInfo);
      await User.findByIdAndUpdate(userId, { personalInfo: transformedPersonalInfo });
    }

    // Update KYC info if any ID/selfie data changed
    if (validIDType || validIDNumber || validIDUrl || selfieUrl) {
      await saveKycInfo(userId, {
        idType: validIDType || user.validID?.idType,
        idNumber: validIDNumber || user.validID?.idNumber,
        idImageUrl: validIDUrl || user.validID?.idImageUrl,
        selfieImageUrl: selfieUrl || user.selfieImageUrl
      });
    }

    // Update KYC status back to pending if it was rejected
    if (user.kycStatus === 'rejected') {
      user.kycStatus = 'pending';
      user.kycRejectionReason = '';
    }

    await user.save();

    res.status(200).json({
      message: 'KYC updated successfully',
      kycStatus: user.kycStatus
    });
  } catch (err) {
    console.error('Edit KYC error:', err);
    res.status(500).json({ message: 'Failed to update KYC', error: err.message });
  }
};

// Admin: Get all KYC submissions
export const getAllKYC = async (req, res) => {
  try {
    // Get users with KYC submissions using PostgreSQL query
    const result = await query(`
      SELECT 
        u.id as "_id",
        u.name,
        u.email, 
        u.phone,
        u."kycStatus",
        u."kycRejectionReason",
        u."createdAt",
        pi."firstName",
        pi."lastName", 
        pi."phoneNumber",
        pi.gender,
        pi.lga,
        pi.ward,
        pi."ageRange",
        pi."stateOfOrigin",
        pi."votingEngagementState",
        pi.citizenship,
        pi."isVoter",
        pi."willVote",
        kyc."idType",
        kyc."idNumber", 
        kyc."idImageUrl",
        kyc."selfieImageUrl"
      FROM users u
      LEFT JOIN "userPersonalInfo" pi ON u.id = pi."userId"
      LEFT JOIN "userKycInfo" kyc ON u.id = kyc."userId"
      WHERE u."kycStatus" != 'unsubmitted'
      ORDER BY u."createdAt" DESC
    `);

    // Transform data to match frontend expectations
    const kycSubmissions = result.rows.map(row => ({
      _id: row._id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      kycStatus: row.kycStatus,
      kycRejectionReason: row.kycRejectionReason,
      createdAt: row.createdAt,
      personalInfo: {
        firstName: row.firstName,
        lastName: row.lastName,
        phoneNumber: row.phoneNumber,
        gender: row.gender,
        lga: row.lga,
        ward: row.ward,
        ageRange: row.ageRange,
        stateOfOrigin: row.stateOfOrigin,
        votingEngagementState: row.votingEngagementState,
        citizenship: row.citizenship,
        isVoter: row.isVoter,
        willVote: row.willVote
      },
      validID: {
        idType: row.idType,
        idNumber: row.idNumber,
        idImageUrl: row.idImageUrl
      },
      selfieImageUrl: row.selfieImageUrl
    }));

    res.status(200).json(kycSubmissions);
  } catch (err) {
    console.error('Get all KYC error:', err);
    res.status(500).json({ message: 'Failed to fetch KYC submissions', error: err.message });
  }
};

// Admin: Approve KYC
export const approveKYC = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycStatus = 'approved';
    user.kycRejectionReason = '';

    await user.save();

    res.status(200).json({ message: 'KYC approved successfully' });
  } catch (err) {
    console.error('Approve KYC error:', err);
    res.status(500).json({ message: 'Failed to approve KYC', error: err.message });
  }
};

// Admin: Reject KYC
export const rejectKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycStatus = 'rejected';
    user.kycRejectionReason = reason;

    await user.save();

    res.status(200).json({ message: 'KYC rejected with reason provided' });
  } catch (err) {
    console.error('Reject KYC error:', err);
    res.status(500).json({ message: 'Failed to reject KYC', error: err.message });
  }
};
