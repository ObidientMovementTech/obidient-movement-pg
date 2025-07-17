import { query, getClient } from '../config/db.js';

class User {
  constructor(userData) {
    Object.assign(this, userData);
  }

  // Create a new user
  static async create(userData) {
    const {
      name,
      email,
      phone,
      passwordHash,
      profileImage = null,
      emailVerified = false,
      role = 'user',
      votingState = null,
      votingLGA = null,
      votingWard = null,
      gender = null,
      ageRange = null,
      citizenship = null,
      isVoter = null,
      willVote = null,
      userName = null,
      countryCode = null,
      stateOfOrigin = null
    } = userData;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Insert main user record
      const userResult = await client.query(
        `INSERT INTO users (
          name, email, phone, "passwordHash", "profileImage", 
          "emailVerified", role, "votingState", "votingLGA", "votingWard",
          gender, "ageRange", citizenship, "isVoter", "willVote",
          "userName", "countryCode", "stateOfOrigin"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
        RETURNING *`,
        [name, email, phone, passwordHash, profileImage, emailVerified, role,
          votingState, votingLGA, votingWard, gender, ageRange, citizenship,
          isVoter, willVote, userName, countryCode, stateOfOrigin]
      );

      const user = userResult.rows[0];

      // Create related records with default values
      await client.query(
        'INSERT INTO "userNotificationPreferences" ("userId") VALUES ($1)',
        [user.id]
      );

      await client.query(
        `INSERT INTO "userNotificationSettings" ("userId") VALUES ($1)`,
        [user.id]
      );

      await client.query('COMMIT');
      return new User(user);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by email
  static async findOne(criteria) {
    let whereClause = '';
    let values = [];

    if (criteria.email) {
      whereClause = 'WHERE email = $1';
      values = [criteria.email];
    } else if (criteria.phone) {
      whereClause = 'WHERE phone = $1';
      values = [criteria.phone];
    } else if (criteria.id) {
      whereClause = 'WHERE id = $1';
      values = [criteria.id];
    }

    const result = await query(`SELECT * FROM users ${whereClause}`, values);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find all users with optional filtering
  static async findAll(options = {}) {
    let whereClause = '';
    let values = [];
    let paramIndex = 1;

    if (options.excludeUserId) {
      whereClause = 'WHERE id != $1';
      values.push(options.excludeUserId);
      paramIndex++;
    }

    if (options.role) {
      if (whereClause) {
        whereClause += ` AND role = $${paramIndex}`;
      } else {
        whereClause = `WHERE role = $${paramIndex}`;
      }
      values.push(options.role);
      paramIndex++;
    }

    const result = await query(`SELECT * FROM users ${whereClause}`, values);
    return result.rows.map(row => new User(row));
  }

  // Find user by ID and exclude password
  static async findByIdSelect(id, excludeFields = []) {
    let selectFields = '*';
    if (excludeFields.includes('passwordHash')) {
      selectFields = `id, name, email, phone, "profileImage", "emailVerified", role, 
                     "kycStatus", "twoFactorEnabled", "twoFactorQRCode", otp, "otpExpiry", 
                     "otpPurpose", "pendingEmail", "kycRejectionReason", "hasTakenCauseSurvey",
                     "countryOfResidence", "createdAt", "updatedAt"`;
    }

    const result = await query(`SELECT ${selectFields} FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;

    const user = new User(result.rows[0]);

    // Fetch related data
    const personalInfo = await query('SELECT * FROM "userPersonalInfo" WHERE "userId" = $1', [id]);
    const onboardingData = await query('SELECT * FROM "userOnboardingData" WHERE "userId" = $1', [id]);
    const kycInfo = await query('SELECT * FROM "userKycInfo" WHERE "userId" = $1', [id]);
    const notificationPrefs = await query('SELECT * FROM "userNotificationPreferences" WHERE "userId" = $1', [id]);
    const notificationSettings = await query('SELECT * FROM "userNotificationSettings" WHERE "userId" = $1', [id]);

    // Attach related data
    user.personalInfo = personalInfo.rows[0] || {};
    user.onboardingData = this._formatOnboardingData(onboardingData.rows[0]);
    user.selfieImageUrl = kycInfo.rows[0]?.selfieImageUrl;
    user.validID = this._formatValidID(kycInfo.rows[0]);
    user.notificationPreferences = this._formatNotificationPreferences(notificationPrefs.rows[0]);
    user.notificationSettings = this._formatNotificationSettings(notificationSettings.rows[0]);

    return user;
  }

  // Update user
  static async findByIdAndUpdate(id, updateData) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Build dynamic update query for users table
      const fieldsToUpdate = [];
      const values = [];
      let paramCount = 1;

      // Handle profile image
      if (updateData.profileImage !== undefined) {
        fieldsToUpdate.push(`"profileImage" = $${paramCount}`);
        values.push(updateData.profileImage);
        paramCount++;
      }

      // Handle personal info fields (now in users table after migration)
      if (updateData.personalInfo) {
        const personalInfo = updateData.personalInfo;

        const personalInfoFields = {
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

        Object.keys(personalInfoFields).forEach(key => {
          if (personalInfo[key] !== undefined) {
            fieldsToUpdate.push(`"${personalInfoFields[key]}" = $${paramCount}`);
            values.push(personalInfo[key]);
            paramCount++;
          }
        });
      }

      // Handle direct user fields
      const directFields = ['name', 'email', 'phone', 'votingState', 'votingLGA'];
      directFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fieldsToUpdate.push(`"${field}" = $${paramCount}`);
          values.push(updateData[field]);
          paramCount++;
        }
      });

      // Always update the updatedAt timestamp
      fieldsToUpdate.push(`"updatedAt" = NOW()`);

      if (fieldsToUpdate.length > 1) { // More than just updatedAt
        const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramCount}`;
        values.push(id);
        await client.query(updateQuery, values);
      }

      await client.query('COMMIT');
      return await User.findByIdSelect(id, ['passwordHash']);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Save method for instance
  async save() {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    const updatableFields = [
      'name', 'email', 'phone', 'passwordHash', 'profileImage', 'emailVerified',
      'role', 'kycStatus', 'twoFactorEnabled', 'twoFactorSecret', 'twoFactorQRCode',
      'otp', 'otpExpiry', 'otpPurpose', 'pendingEmail', 'kycRejectionReason',
      'hasTakenCauseSurvey', 'countryOfResidence',
      // Add all the new profile fields
      'votingState', 'votingLGA', 'votingWard', 'gender', 'ageRange', 'citizenship',
      'isVoter', 'willVote', 'userName', 'countryCode', 'stateOfOrigin'
    ];

    updatableFields.forEach(field => {
      if (this[field] !== undefined) {
        updateFields.push(`"${field}" = $${paramCount}`);
        values.push(this[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) return this;

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(this.id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete user by email (for testing)
  static async deleteByEmail(email) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Get user ID first
      const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const userId = userResult.rows[0].id;

      // Delete related records first (foreign key constraints)
      await client.query('DELETE FROM "userPersonalInfo" WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM "userOnboardingData" WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM "userKycInfo" WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM "userNotificationPreferences" WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM "userNotificationSettings" WHERE "userId" = $1', [userId]);

      // Delete main user record
      const result = await client.query('DELETE FROM users WHERE email = $1 RETURNING *', [email]);

      await client.query('COMMIT');
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete user by ID (for testing)
  static async deleteById(id) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Delete related records first (foreign key constraints)
      await client.query('DELETE FROM "userPersonalInfo" WHERE "userId" = $1', [id]);
      await client.query('DELETE FROM "userOnboardingData" WHERE "userId" = $1', [id]);
      await client.query('DELETE FROM "userKycInfo" WHERE "userId" = $1', [id]);
      await client.query('DELETE FROM "userNotificationPreferences" WHERE "userId" = $1', [id]);
      await client.query('DELETE FROM "userNotificationSettings" WHERE "userId" = $1', [id]);

      // Delete main user record
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

      await client.query('COMMIT');
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get notification settings for a user
  static async getNotificationSettings(userId) {
    const result = await query(
      `SELECT 
        email_account_updates as "emailAccountUpdates",
        email_surveys_polls as "emailSurveysPolls", 
        email_leaders_updates as "emailLeadersUpdates",
        push_account_updates as "pushAccountUpdates",
        push_surveys_polls as "pushSurveysPolls",
        push_leaders_updates as "pushLeadersUpdates",
        website_desktop_notifications as "websiteDesktopNotifications",
        website_sound_alerts as "websiteSoundAlerts"
       FROM "userNotificationSettings" 
       WHERE "userId" = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return {
        email: {
          accountUpdates: true,
          surveysPolls: false,
          leadersUpdates: true
        },
        push: {
          accountUpdates: true,
          surveysPolls: true,
          leadersUpdates: false
        },
        website: {
          desktopNotifications: true,
          soundAlerts: false
        }
      };
    }

    const settings = result.rows[0];
    return {
      email: {
        accountUpdates: settings.emailAccountUpdates,
        surveysPolls: settings.emailSurveysPolls,
        leadersUpdates: settings.emailLeadersUpdates
      },
      push: {
        accountUpdates: settings.pushAccountUpdates,
        surveysPolls: settings.pushSurveysPolls,
        leadersUpdates: settings.pushLeadersUpdates
      },
      website: {
        desktopNotifications: settings.websiteDesktopNotifications,
        soundAlerts: settings.websiteSoundAlerts
      }
    };
  }

  // Update notification settings for a user
  static async updateNotificationSettings(userId, settings) {
    const { email, push, website } = settings;

    const result = await query(
      `UPDATE "userNotificationSettings" 
       SET 
         email_account_updates = $2,
         email_surveys_polls = $3,
         email_leaders_updates = $4,
         push_account_updates = $5,
         push_surveys_polls = $6,
         push_leaders_updates = $7,
         website_desktop_notifications = $8,
         website_sound_alerts = $9,
         "updatedAt" = NOW()
       WHERE "userId" = $1
       RETURNING *`,
      [
        userId,
        email.accountUpdates,
        email.surveysPolls,
        email.leadersUpdates,
        push.accountUpdates,
        push.surveysPolls,
        push.leadersUpdates,
        website.desktopNotifications,
        website.soundAlerts
      ]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      email,
      push,
      website
    };
  }

  // Static helper methods for formatting data
  static _formatOnboardingData(data) {
    if (!data) return {};

    return {
      securityValidation: {
        profilePictureUrl: data.profilePictureUrl
      },
      demographics: {
        ethnicity: data.ethnicity,
        religion: data.religion,
        occupation: data.occupation,
        levelOfEducation: data.levelOfEducation,
        maritalStatus: data.maritalStatus
      },
      politicalPreferences: {
        partyAffiliation: data.partyAffiliation
      },
      engagementAndMobilization: {
        isVolunteering: data.isVolunteering,
        pastElectionParticipation: data.pastElectionParticipation
      },
      votingBehavior: {
        likelyToVote: data.likelyToVote,
        isRegistered: data.isRegistered,
        registrationDate: data.registrationDate
      }
    };
  }

  static _formatValidID(data) {
    if (!data) return {};

    return {
      idType: data.idType,
      idNumber: data.idNumber,
      idImageUrl: data.idImageUrl
    };
  }

  static _formatNotificationPreferences(data) {
    if (!data) return { email: true, push: true, broadcast: true };

    return {
      email: data.email,
      push: data.push,
      broadcast: data.broadcast
    };
  }

  static _formatNotificationSettings(data) {
    if (!data) return {};

    return {
      email: {
        accountUpdates: data.emailAccountUpdates,
        newCauses: data.emailNewCauses,
        causeUpdates: data.emailCauseUpdates,
        surveysPolls: data.emailSurveysPolls,
        leadersUpdates: data.emailLeadersUpdates
      },
      push: {
        accountUpdates: data.pushAccountUpdates,
        newCauses: data.pushNewCauses,
        causeUpdates: data.pushCauseUpdates,
        surveysPolls: data.pushSurveysPolls,
        leadersUpdates: data.pushLeadersUpdates
      },
      website: {
        desktopNotifications: data.desktopNotifications,
        soundAlerts: data.soundAlerts
      }
    };
  }

  // Method to return user object (like Mongoose toObject)
  toObject() {
    const obj = { ...this };

    // Since we're using camelCase in the database now, 
    // no conversion needed for most fields
    return obj;
  }
}

export default User;
