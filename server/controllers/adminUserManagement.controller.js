import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../config/db.js';
import { generateOTP } from '../utils/otpUtils.js';
import { sendOTPEmail, sendConfirmationEmail } from '../utils/emailHandler.js';

export const adminUserManagementController = {
  // Get all users with pagination and filters - OPTIMIZED FOR LARGE DATASETS
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 25, // Increased default limit for better UX
        search = '',
        role = '',
        status = '',
        kycStatus = '',
        emailVerified = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        skipCount = 'false' // Option to skip expensive count for better performance
      } = req.query;

      const offset = (page - 1) * limit;
      const maxLimit = 100; // Prevent excessive data loading
      const actualLimit = Math.min(parseInt(limit), maxLimit);

      // Validate sortBy and sortOrder to prevent SQL injection
      const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'email', 'role', 'emailVerified', 'kycStatus'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      // Build WHERE clause dynamically
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (search) {
        // Standard ILIKE search (works without pg_trgm extension)
        // This provides good performance with proper B-tree indexes
        whereConditions.push(`(
          u.name ILIKE $${paramIndex} OR 
          u.email ILIKE $${paramIndex} OR 
          u.phone ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (role) {
        whereConditions.push(`u.role = $${paramIndex}`);
        queryParams.push(role);
        paramIndex++;
      }

      if (kycStatus) {
        whereConditions.push(`u."kycStatus" = $${paramIndex}`);
        queryParams.push(kycStatus);
        paramIndex++;
      }

      if (emailVerified !== '') {
        whereConditions.push(`u."emailVerified" = $${paramIndex}`);
        queryParams.push(emailVerified === 'true');
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // OPTIMIZED: Simplified query for basic user listing - NO EXPENSIVE JOINS
      const usersQuery = `
        SELECT 
          u.id, u.name, u.email, u.phone, u.role, u."emailVerified", u."kycStatus",
          u."profileImage", u."countryOfResidence", u."votingState", u."votingLGA",
          u.designation, u."assignedState", u."assignedLGA", u."assignedWard",
          u."createdAt", u."updatedAt"
        FROM users u
        ${whereClause}
        ORDER BY u."${safeSortBy}" ${safeSortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      // Add limit and offset to the parameters
      queryParams.push(actualLimit, offset);

      let total = null;
      let totalPages = null;
      let usersResult;
      let countResult = null;

      // Skip count for faster loading when specifically requested
      if (skipCount === 'true') {
        usersResult = await query(usersQuery, queryParams);
      } else {
        // Optimized count query - only count from main table
        const countQuery = `
          SELECT COUNT(*) as total
          FROM users u
          ${whereClause}
        `;

        // Count query params should not include limit and offset
        const countParams = queryParams.slice(0, -2);

        [usersResult, countResult] = await Promise.all([
          query(usersQuery, queryParams),
          query(countQuery, countParams)
        ]);

        total = parseInt(countResult.rows[0].total);
        totalPages = Math.ceil(total / actualLimit);
      }

      const users = usersResult.rows;

      // OPTIMIZED: Load additional data only for current page users (lazy loading)
      if (users.length > 0) {
        const userIds = users.map(u => u.id);

        // Get voting bloc member counts for users' own voting blocs - FIXED QUERY
        const votingBlocQuery = `
          SELECT 
            vb.creator as "userId",
            COALESCE(SUM(member_counts.actual_members), 0) as "totalMembersInOwnedBlocs",
            COUNT(vb.id) as "ownedVotingBlocsCount",
            MAX(member_counts.latest_join) as "lastVotingBlocActivity"
          FROM "votingBlocs" vb
          LEFT JOIN (
            SELECT 
              vbm."votingBlocId",
              COUNT(*) as actual_members,
              MAX(vbm."joinDate") as latest_join
            FROM "votingBlocMembers" vbm
            GROUP BY vbm."votingBlocId"
          ) member_counts ON vb.id = member_counts."votingBlocId"
          WHERE vb.creator = ANY($1) AND vb.status = 'active'
          GROUP BY vb.creator
        `;

        const votingBlocResult = await query(votingBlocQuery, [userIds]);
        const votingBlocData = Object.fromEntries(
          votingBlocResult.rows.map(row => [row.userId, row])
        );

        // Enhance users with voting bloc data
        users.forEach(user => {
          const votingData = votingBlocData[user.id];
          user.totalMembersInOwnedBlocs = votingData ? parseInt(votingData.totalMembersInOwnedBlocs) : 0;
          user.ownedVotingBlocsCount = votingData ? parseInt(votingData.ownedVotingBlocsCount) : 0;
          user.lastVotingBlocActivity = votingData?.lastVotingBlocActivity || null;
        });
      }

      res.json({
        success: true,
        data: {
          users,
          pagination: skipCount === 'true' ? {
            page: parseInt(page),
            limit: actualLimit,
            hasNextPage: users.length === actualLimit, // Estimate based on result size
            hasPrevPage: page > 1
          } : {
            page: parseInt(page),
            limit: actualLimit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  },

  // OPTIMIZED: Cached user statistics with faster queries
  async getUserStatistics(req, res) {
    try {
      // Use multiple simpler queries instead of one complex query for better performance
      const [totalUsersQuery, rolesQuery, verificationQuery, kycQuery, recentQuery] = await Promise.all([
        query('SELECT COUNT(*) as total FROM users'),
        query('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
        query('SELECT "emailVerified", COUNT(*) as count FROM users GROUP BY "emailVerified"'),
        query('SELECT "kycStatus", COUNT(*) as count FROM users GROUP BY "kycStatus"'),
        query(`
          SELECT 
            COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '7 days' THEN 1 END) as "newUsersWeek",
            COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN 1 END) as "newUsersMonth"
          FROM users
        `)
      ]);

      // Process results
      const totalUsers = parseInt(totalUsersQuery.rows[0].total);

      const roleStats = Object.fromEntries(
        rolesQuery.rows.map(row => [row.role, parseInt(row.count)])
      );

      const verificationStats = Object.fromEntries(
        verificationQuery.rows.map(row => [row.emailVerified ? 'verified' : 'unverified', parseInt(row.count)])
      );

      const kycStats = Object.fromEntries(
        kycQuery.rows.map(row => [row.kycStatus, parseInt(row.count)])
      );

      const recentStats = recentQuery.rows[0];

      const stats = {
        totalUsers,
        totalAdmins: roleStats.admin || 0,
        totalRegularUsers: roleStats.user || 0,
        verifiedUsers: verificationStats.verified || 0,
        unverifiedUsers: verificationStats.unverified || 0,
        approvedKyc: kycStats.approved || 0,
        pendingKyc: kycStats.pending || 0,
        rejectedKyc: kycStats.rejected || 0,
        unsubmittedKyc: kycStats.unsubmitted || 0,
        newUsersWeek: parseInt(recentStats.newUsersWeek) || 0,
        newUsersMonth: parseInt(recentStats.newUsersMonth) || 0
      };

      // Get registration trends (last 30 days) with optimized query
      const trendsQuery = `
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM users
        WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 30
      `;

      const trendsResult = await query(trendsQuery);
      const registrationTrends = trendsResult.rows;

      res.json({
        success: true,
        data: {
          statistics: stats,
          registrationTrends
        }
      });

    } catch (error) {
      console.error('Get user statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error.message
      });
    }
  },

  // Get single user details
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      const userQuery = `
        SELECT 
          u.*,
          pi.*,
          od.*,
          kyc.*
        FROM users u
        LEFT JOIN "userPersonalInfo" pi ON u.id = pi."userId"
        LEFT JOIN "userOnboardingData" od ON u.id = od."userId"
        LEFT JOIN "userKycInfo" kyc ON u.id = kyc."userId"
        WHERE u.id = $1
      `;

      // Get user's voting blocs
      const votingBlocsQuery = `
        SELECT 
          vb.id, vb.name, vb.description, vb.scope, vb."locationState", vb."locationLga",
          vbm."joinDate", vbm.id as "membershipId",
          vbmm."decisionTag", vbmm."contactTag", vbmm."engagementLevel"
        FROM "votingBlocs" vb
        JOIN "votingBlocMembers" vbm ON vb.id = vbm."votingBlocId"
        LEFT JOIN "votingBlocMemberMetadata" vbmm ON vb.id = vbmm."votingBlocId" AND vbm."userId" = vbmm."userId"
        WHERE vbm."userId" = $1
        ORDER BY vbm."joinDate" DESC
      `;

      // Get user's created voting blocs
      const createdBlocsQuery = `
        SELECT id, name, description, scope, "totalMembers", "createdAt"
        FROM "votingBlocs"
        WHERE creator = $1
        ORDER BY "createdAt" DESC
      `;

      const [userResult, votingBlocsResult, createdBlocsResult] = await Promise.all([
        query(userQuery, [userId]),
        query(votingBlocsQuery, [userId]),
        query(createdBlocsQuery, [userId])
      ]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const votingBlocs = votingBlocsResult.rows;
      const createdBlocs = createdBlocsResult.rows;

      res.json({
        success: true,
        data: {
          user,
          votingBlocs,
          createdBlocs
        }
      });

    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details',
        error: error.message
      });
    }
  },

  // Update user role
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be "user" or "admin"'
        });
      }

      // Prevent admin from demoting themselves
      if (req.user.id === userId && role === 'user') {
        return res.status(403).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }

      const updateQuery = `
        UPDATE users 
        SET role = $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING id, name, email, role
      `;

      const result = await query(updateQuery, [role, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User role updated to ${role}`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role',
        error: error.message
      });
    }
  },

  // Update user status (suspend/activate)
  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { emailVerified, suspended = false } = req.body;

      let updateFields = [];
      let queryParams = [];
      let paramIndex = 1;

      if (typeof emailVerified === 'boolean') {
        updateFields.push(`"emailVerified" = $${paramIndex}`);
        queryParams.push(emailVerified);
        paramIndex++;
      }

      // We can add a suspended field to the users table if needed
      updateFields.push(`"updatedAt" = NOW()`);

      if (updateFields.length === 1) { // Only updatedAt
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      queryParams.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, email, "emailVerified"
      `;

      const result = await query(updateQuery, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message
      });
    }
  },

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const {
        name,
        email,
        phone,
        countryOfResidence,
        votingState,
        votingLGA,
        personalInfo
      } = req.body;

      const client = await getClient();

      try {
        await client.query('BEGIN');

        // Update main user table
        if (name || email || phone || countryOfResidence || votingState || votingLGA) {
          let updateFields = [];
          let queryParams = [];
          let paramIndex = 1;

          if (name) {
            updateFields.push(`name = $${paramIndex}`);
            queryParams.push(name);
            paramIndex++;
          }

          if (email) {
            updateFields.push(`email = $${paramIndex}`);
            queryParams.push(email);
            paramIndex++;
          }

          if (phone) {
            updateFields.push(`phone = $${paramIndex}`);
            queryParams.push(phone);
            paramIndex++;
          }

          if (countryOfResidence) {
            updateFields.push(`"countryOfResidence" = $${paramIndex}`);
            queryParams.push(countryOfResidence);
            paramIndex++;
          }

          if (votingState) {
            updateFields.push(`"votingState" = $${paramIndex}`);
            queryParams.push(votingState);
            paramIndex++;
          }

          if (votingLGA) {
            updateFields.push(`"votingLGA" = $${paramIndex}`);
            queryParams.push(votingLGA);
            paramIndex++;
          }

          updateFields.push(`"updatedAt" = NOW()`);
          queryParams.push(userId);

          const userUpdateQuery = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
          `;

          await client.query(userUpdateQuery, queryParams);
        }

        // Update personal info if provided
        if (personalInfo) {
          const personalInfoFields = Object.keys(personalInfo);
          if (personalInfoFields.length > 0) {
            // Check if personal info record exists
            const checkPersonalInfo = await client.query(
              'SELECT id FROM "userPersonalInfo" WHERE "userId" = $1',
              [userId]
            );

            if (checkPersonalInfo.rows.length > 0) {
              // Update existing record
              let updateFields = [];
              let queryParams = [];
              let paramIndex = 1;

              personalInfoFields.forEach(field => {
                updateFields.push(`"${field}" = $${paramIndex}`);
                queryParams.push(personalInfo[field]);
                paramIndex++;
              });

              updateFields.push(`"updatedAt" = NOW()`);
              queryParams.push(userId);

              const personalUpdateQuery = `
                UPDATE "userPersonalInfo" 
                SET ${updateFields.join(', ')}
                WHERE "userId" = $${paramIndex}
              `;

              await client.query(personalUpdateQuery, queryParams);
            } else {
              // Create new record
              const fields = ['userId', ...personalInfoFields];
              const values = [userId, ...personalInfoFields.map(field => personalInfo[field])];
              const placeholders = values.map((_, index) => `$${index + 1}`);

              const insertQuery = `
                INSERT INTO "userPersonalInfo" (${fields.map(f => `"${f}"`).join(', ')})
                VALUES (${placeholders.join(', ')})
              `;

              await client.query(insertQuery, values);
            }
          }
        }

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'User profile updated successfully'
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: error.message
      });
    }
  },

  // Force password reset
  async forcePasswordReset(req, res) {
    try {
      const { userId } = req.params;

      // Get user details
      const userResult = await query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Generate OTP for password reset
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with OTP
      await query(
        `UPDATE users 
         SET otp = $1, "otpExpiry" = $2, "otpPurpose" = 'password_reset', "updatedAt" = NOW()
         WHERE id = $3`,
        [otp, otpExpiry, userId]
      );

      // Send OTP email
      await sendOTPEmail(user.name, user.email, otp, 'password_reset');

      res.json({
        success: true,
        message: 'Password reset email sent to user'
      });

    } catch (error) {
      console.error('Force password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate password reset',
        error: error.message
      });
    }
  },

  // Create new user
  async createUser(req, res) {
    try {
      const {
        name,
        email,
        password,
        phone,
        role = 'user',
        emailVerified = false,
        countryOfResidence,
        votingState,
        votingLGA
      } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const createUserQuery = `
        INSERT INTO users (
          name, email, phone, "passwordHash", role, "emailVerified",
          "countryOfResidence", "votingState", "votingLGA"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, name, email, phone, role, "emailVerified", "createdAt"
      `;

      const result = await query(createUserQuery, [
        name, email, phone, passwordHash, role, emailVerified,
        countryOfResidence, votingState, votingLGA
      ]);

      const newUser = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  },

  // Delete user with complete cleanup
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (req.user.id === userId) {
        return res.status(403).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const client = await getClient();

      try {
        await client.query('BEGIN');

        // Get user details before deletion
        const userResult = await client.query(
          'SELECT name, email FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        const user = userResult.rows[0];

        // Delete in order to handle foreign key constraints

        // 1. Delete voting bloc invitations
        await client.query(
          'DELETE FROM "votingBlocInvitations" WHERE "invitedUser" = $1 OR "invitedBy" = $1',
          [userId]
        );

        // 2. Delete voting bloc member metadata
        await client.query(
          'DELETE FROM "votingBlocMemberMetadata" WHERE "userId" = $1',
          [userId]
        );

        // 3. Delete voting bloc memberships
        await client.query(
          'DELETE FROM "votingBlocMembers" WHERE "userId" = $1',
          [userId]
        );

        // 4. Delete voting bloc messages where user is sender or receiver
        await client.query(
          'DELETE FROM "votingBlocMessages" WHERE "fromUser" = $1 OR "toUser" = $1',
          [userId]
        );

        // 5. Delete voting bloc broadcasts where user is sender
        await client.query(
          'DELETE FROM "votingBlocBroadcasts" WHERE "sentBy" = $1',
          [userId]
        );

        // 6. Handle voting blocs created by this user
        // We need to decide: delete the bloc or transfer ownership
        // For now, let's delete them (since they're auto-generated mostly)
        const ownedBlocsResult = await client.query(
          'SELECT id FROM "votingBlocs" WHERE creator = $1',
          [userId]
        );

        for (const bloc of ownedBlocsResult.rows) {
          // Delete toolkits first
          await client.query(
            'DELETE FROM "votingBlocToolkits" WHERE "votingBlocId" = $1',
            [bloc.id]
          );

          // Delete the voting bloc (this will cascade to members due to foreign key)
          await client.query(
            'DELETE FROM "votingBlocs" WHERE id = $1',
            [bloc.id]
          );
        }

        // 7. Delete notifications
        await client.query(
          'DELETE FROM notifications WHERE recipient = $1',
          [userId]
        );

        // 8. Delete evaluations (by assessor email)
        await client.query(
          'DELETE FROM evaluations WHERE assessorEmail = $1',
          [user.email] // Use the user's email to find their evaluations
        );

        // 9. Delete admin broadcasts (if user was admin)
        await client.query(
          'DELETE FROM "adminBroadcasts" WHERE "sentBy" = $1',
          [userId]
        );

        // 10. Delete user personal data (these will cascade due to foreign key constraints)
        await client.query(
          'DELETE FROM "userKycInfo" WHERE "userId" = $1',
          [userId]
        );

        await client.query(
          'DELETE FROM "userOnboardingData" WHERE "userId" = $1',
          [userId]
        );

        await client.query(
          'DELETE FROM "userPersonalInfo" WHERE "userId" = $1',
          [userId]
        );

        await client.query(
          'DELETE FROM "userNotificationSettings" WHERE "userId" = $1',
          [userId]
        );

        await client.query(
          'DELETE FROM "userNotificationPreferences" WHERE "userId" = $1',
          [userId]
        );

        // 11. Finally delete the main user record
        await client.query(
          'DELETE FROM users WHERE id = $1',
          [userId]
        );

        await client.query('COMMIT');

        res.json({
          success: true,
          message: `User ${user.name} (${user.email}) and all related data deleted successfully`
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  },

  // Bulk operations
  async bulkUpdateUsers(req, res) {
    try {
      const { userIds, action, data } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      const client = await getClient();

      try {
        await client.query('BEGIN');

        let result = [];

        switch (action) {
          case 'updateRole':
            if (!data.role || !['user', 'admin'].includes(data.role)) {
              throw new Error('Invalid role');
            }

            // Prevent admin from changing their own role in bulk
            const filteredIds = userIds.filter(id => id !== req.user.id);

            if (filteredIds.length > 0) {
              const updateQuery = `
                UPDATE users 
                SET role = $1, "updatedAt" = NOW()
                WHERE id = ANY($2)
                RETURNING id, name, email, role
              `;

              const updateResult = await client.query(updateQuery, [data.role, filteredIds]);
              result = updateResult.rows;
            }
            break;

          case 'updateEmailVerified':
            if (typeof data.emailVerified !== 'boolean') {
              throw new Error('Invalid emailVerified value');
            }

            const verifyQuery = `
              UPDATE users 
              SET "emailVerified" = $1, "updatedAt" = NOW()
              WHERE id = ANY($2)
              RETURNING id, name, email, "emailVerified"
            `;

            const verifyResult = await client.query(verifyQuery, [data.emailVerified, userIds]);
            result = verifyResult.rows;
            break;

          default:
            throw new Error('Invalid bulk action');
        }

        await client.query('COMMIT');

        res.json({
          success: true,
          message: `Bulk ${action} completed successfully`,
          data: result
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Bulk update users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk operation',
        error: error.message
      });
    }
  },

  // FAST SEARCH: Optimized search for typeahead/autocomplete
  async fastSearch(req, res) {
    try {
      const { q = '', limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: { users: [] }
        });
      }

      const maxLimit = 20;
      const actualLimit = Math.min(parseInt(limit), maxLimit);

      // Ultra-fast search query - only essential fields, indexed columns
      const searchQuery = `
        SELECT 
          id, name, email, role, "emailVerified", "kycStatus", "profileImage"
        FROM users
        WHERE 
          name ILIKE $1 OR 
          email ILIKE $1 OR 
          phone ILIKE $1
        ORDER BY 
          CASE 
            WHEN name ILIKE $2 THEN 1
            WHEN email ILIKE $2 THEN 2
            ELSE 3
          END,
          "createdAt" DESC
        LIMIT $3
      `;

      const result = await query(searchQuery, [`%${q}%`, `${q}%`, actualLimit]);

      res.json({
        success: true,
        data: {
          users: result.rows,
          query: q
        }
      });

    } catch (error) {
      console.error('Fast search error:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message
      });
    }
  },

  // Resend verification email to a specific unverified user
  async resendVerificationEmail(req, res) {
    try {
      const { userId } = req.params;

      // Get user details
      const userResult = await query(
        'SELECT id, name, email, "emailVerified" FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Check if user is already verified
      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'User email is already verified'
        });
      }

      // Generate confirmation token (just like in registration)
      const JWT_SECRET = process.env.JWT_SECRET;
      const emailToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const link = `${frontendUrl}/auth/confirm-email/${emailToken}`;

      // Send confirmation email (same as registration)
      await sendConfirmationEmail(user.name, user.email, link, "confirm");

      res.json({
        success: true,
        message: `Confirmation email sent to ${user.email}`,
        data: {
          userId: user.id,
          email: user.email,
          sentAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Resend verification email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email',
        error: error.message
      });
    }
  },

  // Resend verification emails to ALL unverified users
  async resendAllVerificationEmails(req, res) {
    try {
      // Get all unverified users
      const unverifiedUsersResult = await query(
        'SELECT id, name, email FROM users WHERE "emailVerified" = false ORDER BY "createdAt" DESC'
      );

      const unverifiedUsers = unverifiedUsersResult.rows;

      if (unverifiedUsers.length === 0) {
        return res.json({
          success: true,
          message: 'No unverified users found',
          data: {
            totalSent: 0,
            users: []
          }
        });
      }

      const results = [];
      const errors = [];
      const JWT_SECRET = process.env.JWT_SECRET;
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

      // Batch processing configuration - Optimized for ZeptoMail Pro
      const BATCH_SIZE = 50; // Send 50 emails per batch (ZeptoMail can handle this)
      const BATCH_DELAY = 5000; // 5 seconds between batches (much faster)
      const EMAIL_DELAY = 100; // 100ms between individual emails

      console.log(`📧 Starting bulk email operation for ${unverifiedUsers.length} users`);
      console.log(`📊 Batch size: ${BATCH_SIZE}, Batch delay: ${BATCH_DELAY / 1000}s, Email delay: ${EMAIL_DELAY / 1000}s`);

      // Process users in batches
      for (let i = 0; i < unverifiedUsers.length; i += BATCH_SIZE) {
        const batch = unverifiedUsers.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(unverifiedUsers.length / BATCH_SIZE);

        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`);

        // Process current batch
        for (const user of batch) {
          try {
            // Generate confirmation token (just like in registration)
            const emailToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
            const link = `${frontendUrl}/auth/confirm-email/${emailToken}`;

            // Send confirmation email (same as registration)
            await sendConfirmationEmail(user.name, user.email, link, "confirm");

            results.push({
              userId: user.id,
              email: user.email,
              name: user.name,
              status: 'sent',
              sentAt: new Date().toISOString(),
              batch: batchNumber
            });

            console.log(`✅ Email sent to ${user.email} (${results.length}/${unverifiedUsers.length})`);

            // Delay between individual emails within a batch
            if (batch.indexOf(user) < batch.length - 1) {
              await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY));
            }

          } catch (emailError) {
            console.error(`❌ Failed to send email to ${user.email}:`, emailError.message);
            errors.push({
              userId: user.id,
              email: user.email,
              name: user.name,
              status: 'failed',
              error: emailError.message,
              batch: batchNumber
            });
          }
        }

        // Delay between batches (except for the last batch)
        if (i + BATCH_SIZE < unverifiedUsers.length) {
          console.log(`⏳ Batch ${batchNumber} complete. Waiting ${BATCH_DELAY / 1000}s before next batch...`);
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }

      console.log(`🎉 Bulk email operation completed! Sent: ${results.length}, Failed: ${errors.length}`);

      res.json({
        success: true,
        message: `Verification emails processed for ${unverifiedUsers.length} users`,
        data: {
          totalUsers: unverifiedUsers.length,
          totalSent: results.length,
          totalFailed: errors.length,
          sentEmails: results,
          failedEmails: errors,
          processedAt: new Date().toISOString(),
          batchInfo: {
            batchSize: BATCH_SIZE,
            totalBatches: Math.ceil(unverifiedUsers.length / BATCH_SIZE),
            batchDelay: BATCH_DELAY,
            emailDelay: EMAIL_DELAY
          }
        }
      });

    } catch (error) {
      console.error('Resend all verification emails error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process verification emails',
        error: error.message
      });
    }
  },

  // BACKUP: Original bulk email function (kept for reference)
  async resendAllVerificationEmailsSimple(req, res) {
    try {
      // Get all unverified users
      const unverifiedUsersResult = await query(
        'SELECT id, name, email FROM users WHERE "emailVerified" = false ORDER BY "createdAt" DESC'
      );

      const unverifiedUsers = unverifiedUsersResult.rows;

      if (unverifiedUsers.length === 0) {
        return res.json({
          success: true,
          message: 'No unverified users found',
          data: {
            totalSent: 0,
            users: []
          }
        });
      }

      const results = [];
      const errors = [];
      const JWT_SECRET = process.env.JWT_SECRET;
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

      // Process each user
      for (const user of unverifiedUsers) {
        try {
          // Generate confirmation token (just like in registration)
          const emailToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
          const link = `${frontendUrl}/auth/confirm-email/${emailToken}`;

          // Send confirmation email (same as registration)
          await sendConfirmationEmail(user.name, user.email, link, "confirm");

          results.push({
            userId: user.id,
            email: user.email,
            name: user.name,
            status: 'sent',
            sentAt: new Date().toISOString()
          });

          // Minimal delay for ZeptoMail Pro - can handle high volume
          // 100ms delay = max 600 emails per minute (well within ZeptoMail limits)
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          errors.push({
            userId: user.id,
            email: user.email,
            name: user.name,
            status: 'failed',
            error: emailError.message
          });
        }
      }

      res.json({
        success: true,
        message: `Verification emails processed for ${unverifiedUsers.length} users`,
        data: {
          totalUsers: unverifiedUsers.length,
          totalSent: results.length,
          totalFailed: errors.length,
          sentEmails: results,
          failedEmails: errors,
          processedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Resend all verification emails error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process verification emails',
        error: error.message
      });
    }
  },

  // Get statistics for unverified users
  async getUnverifiedUsersStats(req, res) {
    try {
      const statsResult = await query(`
        SELECT 
          COUNT(*) as total_unverified,
          COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '24 hours' THEN 1 END) as unverified_last_24h,
          COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '7 days' THEN 1 END) as unverified_last_7d,
          COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN 1 END) as unverified_last_30d
        FROM users 
        WHERE "emailVerified" = false
      `);

      const recentUnverifiedResult = await query(`
        SELECT id, name, email, "createdAt"
        FROM users 
        WHERE "emailVerified" = false
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          stats: statsResult.rows[0],
          recentUnverified: recentUnverifiedResult.rows
        }
      });

    } catch (error) {
      console.error('Get unverified users stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unverified users statistics',
        error: error.message
      });
    }
  },

  // Update user designation and assignment
  async updateUserDesignation(req, res) {
    try {
      const { userId } = req.params;
      const { designation, assignedState, assignedLGA, assignedWard } = req.body;

      // Validate designation
      const validDesignations = [
        'National Coordinator',
        'State Coordinator',
        'LGA Coordinator',
        'Ward Coordinator',
        'Polling Unit Agent',
        'Vote Defender',
        'Community Member'
      ];

      if (!designation || !validDesignations.includes(designation)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid designation provided'
        });
      }

      // Validate assignment requirements based on designation
      if (designation === 'State Coordinator' && !assignedState) {
        return res.status(400).json({
          success: false,
          message: 'State Coordinator requires an assigned state'
        });
      }

      if (designation === 'LGA Coordinator' && (!assignedState || !assignedLGA)) {
        return res.status(400).json({
          success: false,
          message: 'LGA Coordinator requires assigned state and LGA'
        });
      }

      if (designation === 'Ward Coordinator' && (!assignedState || !assignedLGA || !assignedWard)) {
        return res.status(400).json({
          success: false,
          message: 'Ward Coordinator requires assigned state, LGA, and ward'
        });
      }

      // Check if user exists
      const userResult = await query('SELECT id, name FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user designation and assignment
      const updateResult = await query(
        `UPDATE users 
         SET designation = $1, 
             "assignedState" = $2, 
             "assignedLGA" = $3, 
             "assignedWard" = $4,
             "updatedAt" = NOW()
         WHERE id = $5
         RETURNING id, name, designation, "assignedState", "assignedLGA", "assignedWard"`,
        [designation, assignedState, assignedLGA, assignedWard, userId]
      );

      const updatedUser = updateResult.rows[0];

      res.json({
        success: true,
        message: `Successfully updated designation for ${updatedUser.name}`,
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Update user designation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user designation',
        error: error.message
      });
    }
  },

  // Export verified users to CSV
  async exportVerifiedUsersCSV(req, res) {
    try {
      console.log('Starting CSV export for verified users');

      // Fetch verified users with only the required fields
      const result = await query(`
        SELECT 
          name,
          email,
          phone
        FROM users 
        WHERE "emailVerified" = true
        ORDER BY name ASC
      `);

      const users = result.rows;
      console.log(`Found ${users.length} verified users for export`);

      // Generate CSV content
      const headers = ['Name', 'Email', 'Phone'];
      const csvRows = [headers.join(',')];

      users.forEach(user => {
        const row = [
          user.name ? `"${user.name.replace(/"/g, '""')}"` : '""', // Escape quotes in names
          user.email ? `"${user.email}"` : '""',
          user.phone ? `"${user.phone}"` : '""'
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="verified-users-${new Date().toISOString().split('T')[0]}.csv"`);

      res.status(200).send(csvContent);

    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export user data',
        error: error.message
      });
    }
  }
};
