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
      const { electionIds, monitoringLocation } = req.body;
      const adminId = req.user.id;

      // Validate inputs
      if (!userId || !electionIds || !Array.isArray(electionIds)) {
        return res.status(400).json({
          success: false,
          message: 'User ID and election IDs are required'
        });
      }

      // Get user details
      const userResult = await client.query(
        'SELECT id, name, email, designation, assignedstate, assignedlga, assignedward FROM users WHERE id = $1',
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
        user.designation,
        user.assignedstate || monitoringLocation?.state
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
          user.assignedstate || monitoringLocation?.state
        );
        uniqueKey = newKey;
      }

      // Update user with monitoring key
      await client.query(`
        UPDATE users 
        SET monitor_unique_key = $1,
            key_assigned_by = $2,
            key_assigned_date = CURRENT_TIMESTAMP,
            key_status = 'active',
            election_access_level = $3,
            monitoring_location = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [
        uniqueKey,
        adminId,
        JSON.stringify(electionIds),
        JSON.stringify(monitoringLocation || {
          state: user.assignedstate,
          lga: user.assignedlga,
          ward: user.assignedward
        }),
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
          monitoringLocation || {
            state: user.assignedstate,
            lga: user.assignedlga,
            ward: user.assignedward
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
      const { uniqueKey } = req.body;
      const userId = req.user.id;

      if (!uniqueKey) {
        return res.status(400).json({
          success: false,
          message: 'Unique key is required'
        });
      }

      // Verify key belongs to user and is active
      const result = await query(`
        SELECT 
          u.id, u.name, u.designation, u.election_access_level, 
          u.monitoring_location, u.key_assigned_date,
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
        LEFT JOIN elections e ON e.election_id = ANY(
          SELECT json_array_elements_text(u.election_access_level::json)
        )
        WHERE u.monitor_unique_key = $1 
          AND u.id = $2 
          AND u.key_status = 'active'
        GROUP BY u.id, u.name, u.designation, u.election_access_level, 
                 u.monitoring_location, u.key_assigned_date
      `, [uniqueKey, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Invalid key or key not assigned to this user'
        });
      }

      const userData = result.rows[0];

      res.status(200).json({
        success: true,
        message: 'Key verified successfully',
        data: {
          userInfo: {
            name: userData.name,
            designation: userData.designation,
            assignedDate: userData.key_assigned_date,
            monitoringLocation: userData.monitoring_location
          },
          elections: userData.elections.filter(e => e.election_id !== null),
          accessGranted: true
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
        LEFT JOIN elections e ON e.election_id = ANY(
          SELECT json_array_elements_text(u.election_access_level::json)
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
