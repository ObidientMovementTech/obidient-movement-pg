import { query, getClient } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';
import { MONITOR_SUBMISSION_TYPES } from '../services/monitoringService.js';

const normalizePartyDefinitions = (partiesInput, { requireNonEmpty = true } = {}) => {
  if (partiesInput === undefined || partiesInput === null) {
    if (requireNonEmpty) {
      throw new Error('Parties definition is required');
    }
    return [];
  }

  if (!Array.isArray(partiesInput)) {
    throw new Error('Parties must be provided as an array');
  }

  const normalized = [];
  const seenCodes = new Set();

  partiesInput.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') {
      throw new Error(`Party definition at index ${index} is invalid`);
    }

    const codeSource = raw.code ?? raw.partyCode ?? raw.abbreviation ?? raw.name ?? '';
    const nameSource = raw.name ?? raw.partyName ?? raw.displayName ?? codeSource;

    const code = String(codeSource || '').trim().toUpperCase();
    if (!code) {
      throw new Error(`Party code is required (index ${index})`);
    }

    if (seenCodes.has(code)) {
      throw new Error(`Duplicate party code detected: ${code}`);
    }
    seenCodes.add(code);

    const name = String(nameSource || '').trim();
    if (!name) {
      throw new Error(`Party name is required (index ${index})`);
    }

    const displayName = raw.displayName ? String(raw.displayName).trim() || null : null;
    const color = raw.color ? String(raw.color).trim() || null : null;
    const metadata = (raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)) ? raw.metadata : {};

    let aliases = [];
    if (Array.isArray(raw.aliases)) {
      aliases = raw.aliases;
    } else if (raw.alias) {
      aliases = [raw.alias];
    }

    aliases = aliases
      .map((alias) => (alias == null ? null : String(alias).trim()))
      .filter((alias) => alias && alias.toUpperCase() !== code)
      .map((alias) => alias);

    const uniqueAliases = [];
    const aliasSeen = new Set();
    aliases.forEach((alias) => {
      const key = alias.toUpperCase();
      if (!aliasSeen.has(key)) {
        aliasSeen.add(key);
        uniqueAliases.push(alias);
      }
    });

    normalized.push({
      code: code.slice(0, 32),
      name,
      displayName,
      color,
      metadata,
      aliases: uniqueAliases,
    });
  });

  if (requireNonEmpty && normalized.length === 0) {
    throw new Error('At least one party definition must be provided');
  }

  return normalized;
};

const insertElectionParties = async (dbClient, electionId, partyDefinitions) => {
  if (!partyDefinitions || partyDefinitions.length === 0) {
    return [];
  }

  const valueClauses = [];
  const values = [];

  partyDefinitions.forEach((party, index) => {
    const base = index * 6;
    valueClauses.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, COALESCE($${base + 6}::jsonb, '{}'::jsonb))`
    );
    values.push(
      electionId,
      party.code,
      party.name,
      party.displayName,
      party.color,
      JSON.stringify(party.metadata ?? {})
    );
  });

  const insertQuery = `
    INSERT INTO election_parties (
      election_id,
      party_code,
      party_name,
      display_name,
      color,
      metadata
    ) VALUES ${valueClauses.join(', ')}
    ON CONFLICT (election_id, party_code) DO UPDATE SET
      party_name = EXCLUDED.party_name,
      display_name = EXCLUDED.display_name,
      color = EXCLUDED.color,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *
  `;

  const { rows } = await dbClient.query(insertQuery, values);

  const rowsByCode = new Map(rows.map((row) => [row.party_code, row]));

  const aliasPlaceholders = [];
  const aliasValues = [];
  let aliasParam = 0;

  partyDefinitions.forEach((party) => {
    const row = rowsByCode.get(party.code);
    if (!row) {
      return;
    }

    (party.aliases || []).forEach((alias) => {
      aliasParam += 1;
      aliasPlaceholders.push(`($${aliasParam * 2 - 1}, $${aliasParam * 2})`);
      aliasValues.push(row.id, alias);
    });
  });

  if (aliasPlaceholders.length > 0) {
    await dbClient.query(
      `INSERT INTO election_party_aliases (party_id, alias)
       VALUES ${aliasPlaceholders.join(', ')}
       ON CONFLICT (party_id, alias) DO NOTHING`,
      aliasValues
    );
  }

  return partyDefinitions.map((party) => {
    const row = rowsByCode.get(party.code);
    return row
      ? {
        ...row,
        aliases: party.aliases || [],
      }
      : {
        election_id: electionId,
        party_code: party.code,
        party_name: party.name,
        display_name: party.displayName,
        color: party.color,
        metadata: party.metadata,
        aliases: party.aliases || [],
      };
  });
};

const fetchElectionParties = async (dbClient, electionId) => {
  const { rows } = await dbClient.query(
    `SELECT 
       ep.id,
       ep.election_id,
       ep.party_code,
       ep.party_name,
       ep.display_name,
       ep.color,
       ep.metadata,
       ep.created_at,
       ep.updated_at,
       COALESCE(array_remove(array_agg(DISTINCT alias.alias), NULL), ARRAY[]::text[]) AS aliases
     FROM election_parties ep
     LEFT JOIN election_party_aliases alias ON alias.party_id = ep.id
     WHERE ep.election_id = $1
     GROUP BY ep.id
     ORDER BY ep.party_code ASC`,
    [electionId]
  );

  return rows.map((row) => ({
    ...row,
    metadata: row.metadata || {},
    aliases: row.aliases || [],
  }));
};

class ElectionController {
  // Create a new election
  async createElection(req, res) {
    const {
      election_name,
      election_type,
      state,
      lga,
      election_date,
      parties
    } = req.body;

    // Validate required fields
    if (!election_name || !election_type || !state || !election_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: election_name, election_type, state, election_date'
      });
    }

    let normalizedParties;
    try {
      normalizedParties = normalizePartyDefinitions(parties, { requireNonEmpty: true });
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Generate unique election ID
      const stateCode = state.substring(0, 3).toUpperCase();
      const typeCode = election_type === 'gubernatorial' ? 'GOV'
        : election_type === 'presidential' ? 'PRES'
          : election_type === 'senatorial' ? 'SEN'
            : election_type === 'house_of_reps' ? 'HOR'
              : election_type === 'state_assembly' ? 'SHA'
                : election_type === 'local_government' ? 'LG'
                  : election_type === 'council' ? 'COU'
                    : 'ELECT';
      const year = new Date(election_date).getFullYear();
      let election_id = `${stateCode}-${typeCode}-${year}`;

      // Ensure election_id uniqueness
      let counter = 1;
      const baseElectionId = election_id;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existingElection = await client.query(
          'SELECT id FROM elections WHERE election_id = $1',
          [election_id]
        );

        if (existingElection.rows.length === 0) {
          break;
        }

        election_id = `${baseElectionId}-${counter}`;
        counter++;
      }

      const today = new Date();
      const electionDateObj = new Date(election_date);
      let status = 'upcoming';

      if (electionDateObj.toDateString() === today.toDateString()) {
        status = 'active';
      } else if (electionDateObj < today) {
        status = 'completed';
      }

      const electionResult = await client.query(
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

      const newElection = electionResult.rows[0];
      const persistedParties = await insertElectionParties(client, newElection.election_id, normalizedParties);

      await client.query('COMMIT');

      logger.info(`Election created: ${newElection.election_id} by admin ${req.user?.id}`);

      res.status(201).json({
        success: true,
        message: 'Election created successfully',
        data: {
          election: newElection,
          parties: persistedParties,
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating election:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create election',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
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

      let sqlQuery = `
        SELECT e.*, (
          SELECT COUNT(*)::int FROM election_parties ep WHERE ep.election_id = e.election_id
        ) AS party_count
        FROM elections e
        WHERE 1=1`;
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

      const election = result.rows[0];
      const parties = await fetchElectionParties({ query }, election.election_id);

      res.json({
        success: true,
        data: {
          election,
          parties
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
    const { id } = req.params;
    const {
      election_name,
      election_type,
      state,
      lga,
      election_date,
      parties
    } = req.body;

    let normalizedParties = null;
    if (parties !== undefined) {
      try {
        normalizedParties = normalizePartyDefinitions(parties, { requireNonEmpty: true });
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const existingElection = await client.query(
        'SELECT * FROM elections WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (existingElection.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      let election = existingElection.rows[0];

      if (election.status === 'active') {
        logger.warn(`Attempt to update active election ${id} by admin ${req.user?.id}`);
      }

      const updateFields = [];
      const updateValues = [];
      const makePlaceholder = () => `$${updateValues.length + 1}`;

      if (election_name !== undefined) {
        updateFields.push(`election_name = ${makePlaceholder()}`);
        updateValues.push(election_name);
      }

      if (election_type !== undefined) {
        updateFields.push(`election_type = ${makePlaceholder()}`);
        updateValues.push(election_type);
      }

      if (state !== undefined) {
        updateFields.push(`state = ${makePlaceholder()}`);
        updateValues.push(state);
      }

      if (lga !== undefined) {
        updateFields.push(`lga = ${makePlaceholder()}`);
        updateValues.push(lga || null);
      }

      if (election_date !== undefined) {
        updateFields.push(`election_date = ${makePlaceholder()}`);
        updateValues.push(election_date);

        const today = new Date();
        const electionDateObj = new Date(election_date);
        let newStatus = 'upcoming';

        if (electionDateObj.toDateString() === today.toDateString()) {
          newStatus = 'active';
        } else if (electionDateObj < today) {
          newStatus = 'completed';
        }

        updateFields.push(`status = ${makePlaceholder()}`);
        updateValues.push(newStatus);
      }

      if (updateFields.length === 0 && !normalizedParties) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'No changes to apply'
        });
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        const wherePlaceholder = `$${updateValues.length + 1}`;
        updateValues.push(id);
        const updateQuery = `
          UPDATE elections
          SET ${updateFields.join(', ')}
          WHERE id = ${wherePlaceholder}
          RETURNING *
        `;

        const updateResult = await client.query(updateQuery, updateValues);
        election = updateResult.rows[0];
      }

      let partiesResponse = null;
      if (normalizedParties) {
        await client.query(
          `DELETE FROM election_party_aliases
           WHERE party_id IN (
             SELECT id FROM election_parties WHERE election_id = $1
           )`,
          [election.election_id]
        );

        await client.query(
          `DELETE FROM election_parties
           WHERE election_id = $1
             AND NOT (party_code = ANY($2::text[]))`,
          [election.election_id, normalizedParties.map((party) => party.code)]
        );

        partiesResponse = await insertElectionParties(client, election.election_id, normalizedParties);
      }

      await client.query('COMMIT');

      const responseParties = partiesResponse || await fetchElectionParties(client, election.election_id);

      logger.info(`Election updated: ${election.election_id} by admin ${req.user?.id}`);

      res.json({
        success: true,
        message: 'Election updated successfully',
        data: {
          election,
          parties: responseParties
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating election:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update election',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
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
        'UPDATE elections SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
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

      // Count monitor submissions that will be deleted
      const submissionsCheck = await query(
        'SELECT COUNT(*) FROM monitor_submissions WHERE election_id = $1',
        [election.election_id]
      );

      const submissionCount = parseInt(submissionsCheck.rows[0].count);

      // Delete monitor submissions for this election
      if (submissionCount > 0) {
        await query(
          'DELETE FROM monitor_submissions WHERE election_id = $1',
          [election.election_id]
        );
        logger.info(`Deleted ${submissionCount} monitor submission(s) for election: ${election.election_id}`);
      }

      // Delete associated election parties
      await query('DELETE FROM election_parties WHERE election_id = $1', [election.election_id]);

      // Delete the election
      await query('DELETE FROM elections WHERE id = $1', [id]);

      logger.info(`Election deleted: ${election.election_id} by admin ${req.user?.id}`);

      res.json({
        success: true,
        message: submissionCount > 0
          ? `Election deleted successfully along with ${submissionCount} monitor submission(s)`
          : 'Election deleted successfully'
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
      const parties = await fetchElectionParties({ query }, election.election_id);

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
      const locationStats = await query(
        `SELECT 
           COALESCE(
             scope_snapshot->>'pollingUnitName',
             scope_snapshot->>'pollingUnitCode',
             scope_snapshot->>'ward',
             'Unknown Location'
           ) AS polling_unit_location,
           scope_snapshot->>'state' AS state,
           scope_snapshot->>'lga' AS lga,
           COUNT(*) AS submission_count
         FROM monitor_submissions 
         WHERE election_id = $1
           AND submission_type = $2
         GROUP BY polling_unit_location, state, lga
         ORDER BY submission_count DESC
         LIMIT 10`,
        [election.election_id, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO]
      );

      // Get recent activity
      const recentActivity = await query(
        `SELECT 
           ms.created_at,
           ms.status,
           ms.submission_type,
           COALESCE(
             ms.scope_snapshot->>'pollingUnitName',
             ms.scope_snapshot->>'pollingUnitCode',
             ms.scope_snapshot->>'ward',
             'Unknown Location'
           ) AS polling_unit_location,
           SPLIT_PART(COALESCE(u.name, ''), ' ', 1) AS first_name,
           SPLIT_PART(COALESCE(u.name, ''), ' ', 2) AS last_name,
           u."userName" AS username
         FROM monitor_submissions ms
         LEFT JOIN users u ON ms.user_id = u.id
         WHERE ms.election_id = $1
         ORDER BY ms.created_at DESC
         LIMIT 10`,
        [election.election_id]
      );

      res.json({
        success: true,
        data: {
          election,
          parties,
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
