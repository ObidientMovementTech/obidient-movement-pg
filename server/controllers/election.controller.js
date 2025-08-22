import { query, getClient } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';

class ElectionController {
  // Create a new election
  async createElection(req, res) {
    try {
      const {
        election_name,
        election_type,
        state,
        lga,
        election_date
      } = req.body;

      // Validate required fields
      if (!election_name || !election_type || !state || !election_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: election_name, election_type, state, election_date'
        });
      }

      // Generate unique election ID
      const stateCode = state.substring(0, 3).toUpperCase();
      const typeCode = election_type === 'gubernatorial' ? 'GOV' :
        election_type === 'presidential' ? 'PRES' :
          election_type === 'senatorial' ? 'SEN' :
            election_type === 'house_of_reps' ? 'HOR' :
              election_type === 'state_assembly' ? 'SHA' :
                election_type === 'local_government' ? 'LG' :
                  election_type === 'council' ? 'COU' : 'ELECT';
      const year = new Date(election_date).getFullYear();
      let election_id = `${stateCode}-${typeCode}-${year}`;

      // Check if election_id already exists and modify if needed
      let counter = 1;
      let baseElectionId = election_id;
      while (true) {
        try {
          const existingElection = await query(
            'SELECT id FROM elections WHERE election_id = $1',
            [election_id]
          );

          if (existingElection.rows.length === 0) {
            break; // ID is unique
          }

          // ID exists, modify it
          election_id = `${baseElectionId}-${counter}`;
          counter++;
        } catch (error) {
          break; // If query fails, assume ID is unique
        }
      }

      // Determine election status based on date
      const today = new Date();
      const electionDateObj = new Date(election_date);
      let status = 'upcoming';

      if (electionDateObj.toDateString() === today.toDateString()) {
        status = 'active';
      } else if (electionDateObj < today) {
        status = 'completed';
      }

      // Insert election into database
      const result = await query(
        `INSERT INTO elections (
          election_id, 
          election_name, 
          election_type, 
          state, 
          lga, 
          election_date, 
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [election_id, election_name, election_type, state, lga || null, election_date, status]
      );

      const newElection = result.rows[0];

      logger.info(`Election created: ${election_id} by admin ${req.user?.id}`);

      res.status(201).json({
        success: true,
        message: 'Election created successfully',
        data: {
          election: newElection
        }
      });

    } catch (error) {
      logger.error('Error creating election:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create election',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all elections with optional filters
  async getElections(req, res) {
    try {
      const {
        status,
        state,
        election_type,
        search,
        page = 1,
        limit = 50
      } = req.query;

      let sqlQuery = 'SELECT * FROM elections WHERE 1=1';
      const queryParams = [];
      let paramCount = 0;

      // Add filters
      if (status && status !== 'all') {
        paramCount++;
        sqlQuery += ` AND status = $${paramCount}`;
        queryParams.push(status);
      }

      if (state) {
        paramCount++;
        sqlQuery += ` AND state ILIKE $${paramCount}`;
        queryParams.push(`%${state}%`);
      }

      if (election_type) {
        paramCount++;
        sqlQuery += ` AND election_type = $${paramCount}`;
        queryParams.push(election_type);
      }

      if (search) {
        paramCount++;
        sqlQuery += ` AND (election_name ILIKE $${paramCount} OR state ILIKE $${paramCount} OR election_type ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
      }

      // Add sorting and pagination
      sqlQuery += ' ORDER BY election_date DESC, created_at DESC';

      const offset = (parseInt(page) - 1) * parseInt(limit);
      paramCount++;
      sqlQuery += ` LIMIT $${paramCount}`;
      queryParams.push(parseInt(limit));

      paramCount++;
      sqlQuery += ` OFFSET $${paramCount}`;
      queryParams.push(offset);

      const result = await query(sqlQuery, queryParams);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM elections WHERE 1=1';
      const countParams = [];
      let countParamCount = 0;

      if (status && status !== 'all') {
        countParamCount++;
        countQuery += ` AND status = $${countParamCount}`;
        countParams.push(status);
      }

      if (state) {
        countParamCount++;
        countQuery += ` AND state ILIKE $${countParamCount}`;
        countParams.push(`%${state}%`);
      }

      if (election_type) {
        countParamCount++;
        countQuery += ` AND election_type = $${countParamCount}`;
        countParams.push(election_type);
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (election_name ILIKE $${countParamCount} OR state ILIKE $${countParamCount} OR election_type ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await query(countQuery, countParams);
      const totalElections = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalElections / parseInt(limit));

      res.json({
        success: true,
        data: {
          elections: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalElections,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching elections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch elections',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a specific election by ID
  async getElectionById(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        'SELECT * FROM elections WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      res.json({
        success: true,
        data: {
          election: result.rows[0]
        }
      });

    } catch (error) {
      logger.error('Error fetching election:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch election',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update an election
  async updateElection(req, res) {
    try {
      const { id } = req.params;
      const {
        election_name,
        election_type,
        state,
        lga,
        election_date
      } = req.body;

      // Check if election exists
      const existingElection = await query(
        'SELECT * FROM elections WHERE id = $1',
        [id]
      );

      if (existingElection.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      // Check if election is active or completed (might want to restrict updates)
      const election = existingElection.rows[0];
      if (election.status === 'active') {
        // You might want to restrict certain updates for active elections
        logger.warn(`Attempt to update active election ${id} by admin ${req.user?.id}`);
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];
      let paramCount = 0;

      if (election_name !== undefined) {
        paramCount++;
        updateFields.push(`election_name = $${paramCount}`);
        updateValues.push(election_name);
      }

      if (election_type !== undefined) {
        paramCount++;
        updateFields.push(`election_type = $${paramCount}`);
        updateValues.push(election_type);
      }

      if (state !== undefined) {
        paramCount++;
        updateFields.push(`state = $${paramCount}`);
        updateValues.push(state);
      }

      if (lga !== undefined) {
        paramCount++;
        updateFields.push(`lga = $${paramCount}`);
        updateValues.push(lga || null);
      }

      if (election_date !== undefined) {
        paramCount++;
        updateFields.push(`election_date = $${paramCount}`);
        updateValues.push(election_date);

        // Update status based on new date if provided
        const today = new Date();
        const electionDateObj = new Date(election_date);
        let newStatus = 'upcoming';

        if (electionDateObj.toDateString() === today.toDateString()) {
          newStatus = 'active';
        } else if (electionDateObj < today) {
          newStatus = 'completed';
        }

        paramCount++;
        updateFields.push(`status = $${paramCount}`);
        updateValues.push(newStatus);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Add updated_at
      paramCount++;
      updateFields.push(`updated_at = $${paramCount}`);
      updateValues.push(new Date());

      // Add ID for WHERE clause
      paramCount++;
      updateValues.push(id);

      const updateQuery = `
        UPDATE elections 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;

      const result = await query(updateQuery, updateValues);
      const updatedElection = result.rows[0];

      logger.info(`Election updated: ${updatedElection.election_id} by admin ${req.user?.id}`);

      res.json({
        success: true,
        message: 'Election updated successfully',
        data: {
          election: updatedElection
        }
      });

    } catch (error) {
      logger.error('Error updating election:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update election',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update election status
  async updateElectionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['upcoming', 'active', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: upcoming, active, completed'
        });
      }

      // Check if election exists
      const existingElection = await query(
        'SELECT * FROM elections WHERE id = $1',
        [id]
      );

      if (existingElection.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const result = await query(
        'UPDATE elections SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [status, new Date(), id]
      );

      const updatedElection = result.rows[0];

      logger.info(`Election status updated: ${updatedElection.election_id} to ${status} by admin ${req.user?.id}`);

      res.json({
        success: true,
        message: 'Election status updated successfully',
        data: {
          election: updatedElection
        }
      });

    } catch (error) {
      logger.error('Error updating election status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update election status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete an election
  async deleteElection(req, res) {
    try {
      const { id } = req.params;

      // Check if election exists
      const existingElection = await query(
        'SELECT * FROM elections WHERE id = $1',
        [id]
      );

      if (existingElection.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const election = existingElection.rows[0];

      // Check if there are monitor keys assigned to this election
      const monitorKeysCheck = await query(
        'SELECT COUNT(*) FROM monitor_keys WHERE election_id = $1',
        [election.election_id]
      );

      const monitorKeyCount = parseInt(monitorKeysCheck.rows[0].count);

      if (monitorKeyCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete election. ${monitorKeyCount} monitor key(s) are assigned to this election. Please revoke all monitor keys first.`
        });
      }

      // Check if there are monitor submissions for this election
      const submissionsCheck = await query(
        'SELECT COUNT(*) FROM monitor_submissions WHERE election_id = $1',
        [election.election_id]
      );

      const submissionCount = parseInt(submissionsCheck.rows[0].count);

      if (submissionCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete election. ${submissionCount} monitor submission(s) exist for this election.`
        });
      }

      // Delete the election
      await query('DELETE FROM elections WHERE id = $1', [id]);

      logger.info(`Election deleted: ${election.election_id} by admin ${req.user?.id}`);

      res.json({
        success: true,
        message: 'Election deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting election:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete election',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get election statistics
  async getElectionStats(req, res) {
    try {
      const { id } = req.params;

      // Check if election exists
      const existingElection = await query(
        'SELECT * FROM elections WHERE id = $1',
        [id]
      );

      if (existingElection.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const election = existingElection.rows[0];

      // Get monitor key statistics
      const monitorKeysStats = await query(`
        SELECT 
          COUNT(*) as total_keys,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_keys,
          COUNT(CASE WHEN status = 'revoked' THEN 1 END) as revoked_keys
        FROM monitor_keys 
        WHERE election_id = $1
      `, [election.election_id]);

      // Get submission statistics
      const submissionStats = await query(`
        SELECT 
          COUNT(*) as total_submissions,
          COUNT(DISTINCT user_id) as unique_monitors,
          COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_submissions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_submissions,
          COUNT(CASE WHEN status = 'flagged' THEN 1 END) as flagged_submissions
        FROM monitor_submissions 
        WHERE election_id = $1
      `, [election.election_id]);

      // Get location distribution
      const locationStats = await query(`
        SELECT 
          polling_unit_location,
          COUNT(*) as submission_count
        FROM monitor_submissions 
        WHERE election_id = $1 
        GROUP BY polling_unit_location
        ORDER BY submission_count DESC
        LIMIT 10
      `, [election.election_id]);

      // Get recent activity
      const recentActivity = await query(`
        SELECT 
          ms.created_at,
          ms.status,
          ms.polling_unit_location,
          u.first_name,
          u.last_name
        FROM monitor_submissions ms
        JOIN users u ON ms.user_id = u.id
        WHERE ms.election_id = $1
        ORDER BY ms.created_at DESC
        LIMIT 10
      `, [election.election_id]);

      res.json({
        success: true,
        data: {
          election,
          stats: {
            monitorKeys: monitorKeysStats.rows[0],
            submissions: submissionStats.rows[0],
            locationDistribution: locationStats.rows,
            recentActivity: recentActivity.rows
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching election statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch election statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get dashboard overview stats
  async getDashboardStats(req, res) {
    try {
      // Get overall election statistics
      const totalElections = await query('SELECT COUNT(*) FROM elections');
      const activeElections = await query("SELECT COUNT(*) FROM elections WHERE status = 'active'");
      const upcomingElections = await query("SELECT COUNT(*) FROM elections WHERE status = 'upcoming'");
      const completedElections = await query("SELECT COUNT(*) FROM elections WHERE status = 'completed'");

      // Get monitor key statistics
      const totalMonitorKeys = await query('SELECT COUNT(*) FROM monitor_keys');
      const activeMonitorKeys = await query("SELECT COUNT(*) FROM monitor_keys WHERE status = 'active'");

      // Get submission statistics
      const totalSubmissions = await query('SELECT COUNT(*) FROM monitor_submissions');
      const todaySubmissions = await query(`
        SELECT COUNT(*) FROM monitor_submissions 
        WHERE DATE(created_at) = CURRENT_DATE
      `);

      // Get recent elections
      const recentElections = await query(`
        SELECT * FROM elections 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      res.json({
        success: true,
        data: {
          elections: {
            total: parseInt(totalElections.rows[0].count),
            active: parseInt(activeElections.rows[0].count),
            upcoming: parseInt(upcomingElections.rows[0].count),
            completed: parseInt(completedElections.rows[0].count)
          },
          monitorKeys: {
            total: parseInt(totalMonitorKeys.rows[0].count),
            active: parseInt(activeMonitorKeys.rows[0].count)
          },
          submissions: {
            total: parseInt(totalSubmissions.rows[0].count),
            today: parseInt(todaySubmissions.rows[0].count)
          },
          recentElections: recentElections.rows
        }
      });

    } catch (error) {
      logger.error('Error fetching dashboard statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new ElectionController();
