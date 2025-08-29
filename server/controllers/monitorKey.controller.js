import { query, getClient } from '../config/db.js';
import { sendVoteDefenderKeyAssignedEmail } from '../utils/emailHandler.js';

// Generate unique monitoring key
const generateMonitorKey = (designation, state, year = new Date().getFullYear()) => {
  const designationCode = {
    'National Coordinator': 'NC',
    'State Coordinator': 'SC',
    'LGA Coordinator': 'LC',
    'Ward Coordinator': 'WC',
    'Polling Unit Agent': 'PA',
    'Vote Defender': 'VD'
  }[designation] || 'VD';

  const stateCode = state ? state.substring(0, 3).toUpperCase() : 'GEN';
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${designationCode}-${year}-${stateCode}-${randomCode}`;
};

// Verify if user can be assigned monitoring access
const canAssignMonitoringAccess = (designation) => {
  const eligibleDesignations = [
    'National Coordinator',
    'State Coordinator',
    'LGA Coordinator',
    'Ward Coordinator',
    'Polling Unit Agent',
    'Vote Defender'
  ];
  return eligibleDesignations.includes(designation);
};

export const monitorKeyController = {
  // Assign monitoring key to user
  async assignMonitorKey(req, res) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const { userId } = req.params;
      const {
        electionIds,
        monitoring_location,
        assignedState,
        assignedLGA,
        assignedWard,
        key_status,
        election_access_level
      } = req.body;
      const adminId = req.user.id;

      // Validate inputs
      if (!userId || !electionIds || !Array.isArray(electionIds)) {
        return res.status(400).json({
          success: false,
          message: 'User ID and election IDs are required'
        });
      }

      // Validate monitoring location
      if (!monitoring_location || !monitoring_location.state) {
        return res.status(400).json({
          success: false,
          message: 'Monitoring location with state is required'
        });
      }

      // Get user details
      const userResult = await client.query(
        'SELECT id, name, email, designation, assignedState, assignedLGA, assignedWard FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Check if user is eligible for monitoring access
      if (!canAssignMonitoringAccess(user.designation)) {
        return res.status(400).json({
          success: false,
          message: 'User designation is not eligible for monitoring access'
        });
      }

      // Check if user already has an active key
      const existingKeyResult = await client.query(
        'SELECT monitor_unique_key, key_status FROM users WHERE id = $1 AND key_status = $2',
        [userId, 'active']
      );

      if (existingKeyResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already has an active monitoring key',
          currentKey: existingKeyResult.rows[0].monitor_unique_key
        });
      }

      // Generate unique key
      const uniqueKey = generateMonitorKey(
        election_access_level || user.designation,
        monitoring_location.state
      );

      // Ensure key is unique
      const keyCheckResult = await client.query(
        'SELECT id FROM users WHERE monitor_unique_key = $1',
        [uniqueKey]
      );

      if (keyCheckResult.rows.length > 0) {
        // Regenerate if collision (very rare)
        const newKey = generateMonitorKey(
          user.designation,
          user.assignedState || monitoring_location?.state
        );
        uniqueKey = newKey;
      }

      // Update user with monitoring key and location information
      await client.query(`
        UPDATE users 
        SET monitor_unique_key = $1,
            key_assigned_by = $2,
            key_assigned_date = CURRENT_TIMESTAMP,
            key_status = $3,
            election_access_level = $4,
            monitoring_location = $5,
            assignedState = $6,
            assignedLGA = $7,
            assignedWard = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        uniqueKey,
        adminId,
        key_status || 'active',
        election_access_level || user.designation,
        monitoring_location,
        assignedState || monitoring_location.state,
        assignedLGA || monitoring_location.lga,
        assignedWard || monitoring_location.ward,
        userId
      ]);

      // Get election details for email
      const electionsResult = await client.query(
        'SELECT election_name, election_date, state FROM elections WHERE election_id = ANY($1)',
        [electionIds]
      );

      await client.query('COMMIT');

      // Send email notification
      try {
        await sendVoteDefenderKeyAssignedEmail(
          user.name,
          user.email,
          uniqueKey,
          user.designation,
          electionsResult.rows,
          monitoring_location || {
            state: user.assignedState,
            lga: user.assignedLGA,
            ward: user.assignedWard
          }
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Monitoring key assigned successfully',
        data: {
          uniqueKey,
          elections: electionsResult.rows,
          assignedDate: new Date().toISOString()
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error assigning monitor key:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign monitoring key',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  },

  // Verify monitoring key
  async verifyMonitorKey(req, res) {
    try {
      console.log('🔥 VERIFY MONITOR KEY - REQUEST RECEIVED');
      console.log('🔍 Request method:', req.method);
      console.log('🔍 Request URL:', req.url);
      console.log('🔍 Request headers:', {
        authorization: req.headers.authorization,
        cookie: req.headers.cookie,
        'content-type': req.headers['content-type']
      });
      console.log('🔍 Request body:', req.body);
      console.log('🔍 Request user:', req.user);
      console.log('🔍 Session:', req.session);

      const { uniqueKey } = req.body;
      const userId = req.user?.id;

      console.log('🔍 Extracted data:', { uniqueKey, userId });

      if (!uniqueKey) {
        console.log('❌ No unique key provided');
        return res.status(400).json({
          success: false,
          message: 'Unique key is required'
        });
      }

      if (!userId) {
        console.log('❌ No user ID found in request (user not authenticated)');
        console.log('❌ req.user:', req.user);
        console.log('❌ req.session:', req.session);
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // First, let's check what's in the user's record
      console.log('🔍 Checking user record first...');
      const userCheck = await query(`
        SELECT 
          id, name, designation, election_access_level, 
          monitoring_location, key_assigned_date, monitor_unique_key, key_status
        FROM users 
        WHERE monitor_unique_key = $1 AND id = $2
      `, [uniqueKey, userId]);

      console.log('🔍 User check result:', {
        found: userCheck.rows.length > 0,
        userData: userCheck.rows[0]
      });

      if (userCheck.rows.length === 0) {
        console.log('❌ User not found with this key and user ID combination');
        return res.status(404).json({
          success: false,
          message: 'Invalid key or key not assigned to this user'
        });
      }

      const user = userCheck.rows[0];
      console.log('🔍 User election_access_level value:', user.election_access_level);
      console.log('🔍 User designation:', user.designation);

      // Check if user has active key
      if (user.key_status !== 'active') {
        console.log('❌ Key is not active, status:', user.key_status);
        return res.status(400).json({
          success: false,
          message: 'Monitoring key is not active'
        });
      }

      // Get elections based on user's access level and location
      let elections = [];
      try {
        console.log('🔍 Fetching elections based on access level and location...');

        // Build query based on access level
        let electionQuery = `
          SELECT 
            election_id, election_name, election_type, state, election_date, status
          FROM elections 
          WHERE status = 'active'
        `;
        let queryParams = [];

        // Filter elections based on user's access level and location
        const accessLevel = user.election_access_level || user.designation;
        const monitoringLocation = user.monitoring_location ? JSON.parse(user.monitoring_location) : null;

        if (accessLevel === 'State Coordinator' && monitoringLocation?.state) {
          electionQuery += ` AND state = $1`;
          queryParams.push(monitoringLocation.state);
        } else if (accessLevel === 'LGA Coordinator' && monitoringLocation?.state) {
          electionQuery += ` AND state = $1`;
          queryParams.push(monitoringLocation.state);
          // Could add LGA filtering if that field exists in elections table
        } else if (accessLevel === 'National Coordinator') {
          // National coordinators can see all elections
        }

        electionQuery += ` ORDER BY election_date DESC`;

        console.log('🔍 Election query:', electionQuery);
        console.log('🔍 Query params:', queryParams);

        const electionsResult = await query(electionQuery, queryParams);
        elections = electionsResult.rows;
        console.log('🔍 Found elections:', elections.length);

      } catch (error) {
        console.log('❌ Error fetching elections:', error.message);
        // Continue without elections - key verification can still succeed
      }

      console.log('✅ Key verification successful for user:', user.name);

      res.status(200).json({
        success: true,
        message: 'Key verified successfully',
        data: {
          userInfo: {
            name: user.name,
            designation: user.designation,
            accessLevel: user.election_access_level,
            assignedDate: user.key_assigned_date,
            monitoringLocation: user.monitoring_location
          },
          elections: elections,
          accessGranted: true,
          totalElections: elections.length
        }
      });

    } catch (error) {
      console.error('Error verifying monitor key:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify monitoring key',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user's monitoring access status
  async getMonitoringAccess(req, res) {
    try {
      const userId = req.user.id;

      const result = await query(`
        SELECT 
          monitor_unique_key, key_status, key_assigned_date,
          election_access_level, monitoring_location, designation,
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'election_id', e.election_id,
              'election_name', e.election_name,
              'election_type', e.election_type,
              'state', e.state,
              'election_date', e.election_date,
              'status', e.status
            )
          ) as elections
        FROM users u
        LEFT JOIN elections e ON (
          u.election_access_level IS NOT NULL 
          AND u.election_access_level != '' 
          AND e.election_id = ANY(
            CASE 
              WHEN u.election_access_level ~ '^\\[.*\\]$' THEN
                ARRAY(SELECT json_array_elements_text(u.election_access_level::json))
              ELSE 
                ARRAY[u.election_access_level]
            END
          )
        )
        WHERE u.id = $1
        GROUP BY u.id, u.monitor_unique_key, u.key_status, u.key_assigned_date,
                 u.election_access_level, u.monitoring_location, u.designation
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = result.rows[0];

      res.status(200).json({
        success: true,
        data: {
          hasAccess: userData.key_status === 'active',
          keyStatus: userData.key_status,
          uniqueKey: userData.monitor_unique_key,
          assignedDate: userData.key_assigned_date,
          elections: userData.elections.filter(e => e.election_id !== null),
          monitoringLocation: userData.monitoring_location,
          designation: userData.designation,
          canHaveAccess: canAssignMonitoringAccess(userData.designation)
        }
      });

    } catch (error) {
      console.error('Error getting monitoring access:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monitoring access',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Revoke monitoring key
  async revokeMonitorKey(req, res) {
    try {
      const { userId } = req.params;
      const adminId = req.user.id;

      const result = await query(`
        UPDATE users 
        SET key_status = 'revoked',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND key_status = 'active'
        RETURNING name, email, monitor_unique_key
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found or no active key to revoke'
        });
      }

      const user = result.rows[0];

      // Send email notification about revocation
      try {
        const emailData = {
          to: user.email,
          subject: 'Vote Defender Access Revoked - Obidient Movement',
          template: 'vote-defender-key-revoked',
          data: {
            userName: user.name,
            revokedDate: new Date().toISOString()
          }
        };

        await emailService.sendEmail(emailData);
      } catch (emailError) {
        console.error('Failed to send revocation email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Monitoring key revoked successfully'
      });

    } catch (error) {
      console.error('Error revoking monitor key:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke monitoring key',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all active elections
  async getActiveElections(req, res) {
    try {
      const result = await query(`
        SELECT election_id, election_name, election_type, state, lga,
               election_date, status
        FROM elections 
        WHERE status IN ('upcoming', 'active')
        ORDER BY election_date ASC
      `);

      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error getting active elections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active elections',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
