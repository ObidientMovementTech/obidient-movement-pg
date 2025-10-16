import { query } from '../config/db.js';
import { parseExcelFile, parseExcelFileWithMapping, previewExcelFile, batchInsertVoters } from '../services/excelImportService.js';
import fs from 'fs';

/**
 * Preview Excel file structure and return headers with sample data
 * POST /api/call-center/preview-excel
 */
const previewExcelUpload = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can preview voter data'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No Excel file provided'
      });
    }

    const filePath = req.file.path;

    try {
      // Preview Excel file structure
      console.log('Previewing Excel file:', filePath);
      const previewResult = previewExcelFile(filePath);

      if (!previewResult.success) {
        return res.status(400).json({
          success: false,
          message: previewResult.error
        });
      }

      res.json({
        success: true,
        message: 'Excel file preview generated successfully',
        filePath: filePath, // Keep file for later processing
        preview: previewResult
      });

    } catch (error) {
      console.error('Preview error:', error);
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to preview Excel file',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Preview upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process file upload',
      error: error.message
    });
  }
};

/**
 * Import INEC voter data from Excel file with column mapping
 * POST /api/call-center/import-voters-with-mapping
 */
const importVotersWithMapping = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can import voter data'
      });
    }

    const { filePath, columnMapping } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'No file path provided'
      });
    }

    if (!columnMapping) {
      return res.status(400).json({
        success: false,
        message: 'No column mapping provided'
      });
    }

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'File not found. Please upload the file again.'
      });
    }

    try {
      // Parse Excel file with mapping
      console.log('Parsing Excel file with mapping:', filePath);
      const { voters, errors, totalRows } = parseExcelFileWithMapping(filePath, columnMapping);

      if (voters.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid voter data found in Excel file',
          parseErrors: errors
        });
      }

      // Insert voters into database
      console.log(`Inserting ${voters.length} voters into database...`);
      const insertResults = await batchInsertVoters(voters, req.user.id, query);

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Voter data imported successfully',
        results: {
          totalRows,
          parsed: voters.length,
          inserted: insertResults.inserted,
          duplicatesSkipped: insertResults.duplicates,
          errors: [...errors, ...insertResults.errors]
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to import voter data',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Import with mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process import request',
      error: error.message
    });
  }
};

/**
 * Import INEC voter data from Excel file (legacy endpoint)
 * POST /api/call-center/import-voters
 */
const importVoters = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can import voter data'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No Excel file provided'
      });
    }

    const filePath = req.file.path;

    try {
      // Parse Excel file
      console.log('Parsing Excel file:', filePath);
      const { voters, errors, totalRows } = parseExcelFile(filePath);

      if (voters.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid voter data found in Excel file',
          parseErrors: errors
        });
      }

      // Insert voters into database
      console.log(`Inserting ${voters.length} voters into database...`);
      const insertResults = await batchInsertVoters(voters, req.user.id, query);

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Voter data imported successfully',
        results: {
          totalRowsProcessed: totalRows,
          validRecords: voters.length,
          inserted: insertResults.inserted,
          duplicatesSkipped: insertResults.duplicates,
          parseErrors: errors,
          insertErrors: insertResults.errors
        }
      });

    } catch (parseError) {
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }

  } catch (error) {
    console.error('Import voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import voter data',
      error: error.message
    });
  }
};

/**
 * Get import statistics for admin dashboard
 * GET /api/call-center/import-stats
 */
const getImportStats = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view import statistics'
      });
    }

    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_voters,
        COUNT(DISTINCT state) as states_count,
        COUNT(DISTINCT CONCAT(state, '-', lga)) as lga_count,
        COUNT(DISTINCT CONCAT(state, '-', lga, '-', ward)) as ward_count,
        COUNT(DISTINCT CONCAT(state, '-', lga, '-', ward, '-', polling_unit)) as polling_units_count,
        COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as voters_with_names,
        COUNT(CASE WHEN email_address IS NOT NULL AND email_address != '' THEN 1 END) as voters_with_emails,
        COUNT(CASE WHEN last_called_date >= NOW() - INTERVAL '7 days' THEN 1 END) as recently_called,
        COUNT(CASE WHEN confirmed_to_vote = true THEN 1 END) as confirmed_voters
      FROM inec_voters
    `;

    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];

    // Get recent imports
    const recentImportsQuery = `
      SELECT 
        u.name as imported_by_name,
        COUNT(iv.id) as records_imported,
        DATE(iv.created_at) as import_date
      FROM inec_voters iv
      JOIN users u ON iv.imported_by = u.id
      WHERE iv.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY u.name, DATE(iv.created_at)
      ORDER BY import_date DESC
      LIMIT 10
    `;

    const recentImportsResult = await query(recentImportsQuery);
    const recentImports = recentImportsResult.rows;

    res.json({
      success: true,
      stats,
      recentImports
    });

  } catch (error) {
    console.error('Get import stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch import statistics',
      error: error.message
    });
  }
};

/**
 * Get hierarchical voter statistics for admin dashboard
 * GET /api/call-center/voter-statistics
 */
const getVoterStatistics = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view voter statistics'
      });
    }

    console.log('Getting voter statistics for voters with phone numbers...');

    // Simplified query to get LGA-level statistics for voters with phone numbers
    const statisticsQuery = `
      SELECT 
        lga,
        COUNT(*) as voter_count,
        COUNT(DISTINCT ward) as ward_count,
        COUNT(DISTINCT polling_unit) as polling_unit_count
      FROM inec_voters 
      WHERE state = 'ANAMBRA' 
        AND phone_number IS NOT NULL 
        AND phone_number != '' 
        AND LENGTH(TRIM(phone_number)) > 0
      GROUP BY lga
      ORDER BY lga;
    `;

    const lgaResult = await query(statisticsQuery);
    console.log('LGA results:', lgaResult.rows);

    // Get total statistics for voters with phone numbers
    const totalQuery = `
      SELECT 
        COUNT(*) as total_voters,
        COUNT(DISTINCT lga) as lga_count
      FROM inec_voters 
      WHERE state = 'Anambra' 
        AND phone_number IS NOT NULL 
        AND phone_number != '' 
        AND LENGTH(TRIM(phone_number)) > 0
    `;

    const totalResult = await query(totalQuery);
    const totals = totalResult.rows[0];
    console.log('Total statistics:', totals);

    // Format the response to match our frontend interface
    const response = {
      total_voters: parseInt(totals.total_voters),
      lga_count: parseInt(totals.lga_count),
      lgas: lgaResult.rows.map(lga => ({
        lga: lga.lga,
        voter_count: parseInt(lga.voter_count),
        ward_count: parseInt(lga.ward_count),
        polling_unit_count: parseInt(lga.polling_unit_count)
        // For now, we'll just show LGA-level counts without drill-down
      }))
    };

    res.json(response);

  } catch (error) {
    console.error('Get voter statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voter statistics',
      error: error.message
    });
  }
};

/**
 * Assign volunteer to polling unit
 * POST /api/call-center/assign-volunteer
 */
const assignVolunteer = async (req, res) => {
  try {
    const { userId, state, lga, ward, pollingUnit, pollingUnitCode } = req.body;

    // Check admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can assign volunteers'
      });
    }

    // Validate required fields
    if (!userId || !state || !lga || !ward || !pollingUnit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required assignment data'
      });
    }

    // Check if user exists and can be assigned
    const userCheck = await query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if polling unit has voters
    const votersCheck = await query(`
      SELECT COUNT(*) as voter_count 
      FROM inec_voters 
      WHERE state = $1 AND lga = $2 AND ward = $3 AND polling_unit = $4
    `, [state, lga, ward, pollingUnit]);

    if (parseInt(votersCheck.rows[0].voter_count) === 0) {
      return res.status(400).json({
        success: false,
        message: 'No voters found for this polling unit'
      });
    }

    // Deactivate any existing assignment for this user
    await query(
      'UPDATE call_center_assignments SET is_active = false WHERE user_id = $1',
      [userId]
    );

    // Deactivate any existing assignment for this polling unit
    if (pollingUnitCode) {
      await query(
        'UPDATE call_center_assignments SET is_active = false WHERE polling_unit_code = $1',
        [pollingUnitCode]
      );
    }

    // Create new assignment
    const assignment = await query(`
      INSERT INTO call_center_assignments 
      (user_id, state, lga, ward, polling_unit, polling_unit_code, assigned_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, state, lga, ward, pollingUnit, pollingUnitCode, req.user.id]);

    res.json({
      success: true,
      message: 'Volunteer assigned successfully',
      assignment: assignment.rows[0],
      voterCount: parseInt(votersCheck.rows[0].voter_count)
    });

  } catch (error) {
    console.error('Assign volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign volunteer',
      error: error.message
    });
  }
};

/**
 * Get volunteers and their assignments
 * GET /api/call-center/volunteers
 */
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        cca.state,
        cca.lga,
        cca.ward,
        cca.polling_unit,
        cca.polling_unit_code,
        cca.assigned_at,
        cca.is_active,
        ab.name as assigned_by_name,
        COUNT(iv.id) as voter_count,
        COUNT(cl.id) as total_calls_made
      FROM users u
      LEFT JOIN call_center_assignments cca ON u.id = cca.user_id AND cca.is_active = true
      LEFT JOIN users ab ON cca.assigned_by = ab.id
      LEFT JOIN inec_voters iv ON (
        cca.state = iv.state AND 
        cca.lga = iv.lga AND 
        cca.ward = iv.ward AND 
        cca.polling_unit = iv.polling_unit
      )
      LEFT JOIN call_logs cl ON u.id = cl.volunteer_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email, u.phone, cca.state, cca.lga, cca.ward, 
               cca.polling_unit, cca.polling_unit_code, cca.assigned_at, cca.is_active, ab.name
      ORDER BY cca.assigned_at DESC NULLS LAST
    `);

    res.json({
      success: true,
      volunteers: volunteers.rows
    });

  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get volunteers',
      error: error.message
    });
  }
};

/**
 * Get volunteer's assigned polling unit
 * GET /api/call-center/my-assignment
 */
const getMyAssignment = async (req, res) => {
  try {
    const userId = req.user.id;

    const assignmentQuery = `
      SELECT 
        cca.id,
        cca.state,
        cca.lga,
        cca.ward,
        cca.polling_unit,
        cca.polling_unit_code,
        cca.assigned_at,
        cca.is_active,
        (SELECT COUNT(*) 
         FROM inec_voters iv 
         WHERE UPPER(iv.state) = UPPER(cca.state)
           AND iv.lga = cca.lga 
           AND iv.ward = cca.ward 
           AND iv.polling_unit = cca.polling_unit) as total_voters,
        (SELECT COUNT(*) 
         FROM inec_voters iv 
         WHERE UPPER(iv.state) = UPPER(cca.state)
           AND iv.lga = cca.lga 
           AND iv.ward = cca.ward 
           AND iv.polling_unit = cca.polling_unit
           AND iv.called_recently = true) as recently_called,
        (SELECT COUNT(*) 
         FROM inec_voters iv 
         WHERE UPPER(iv.state) = UPPER(cca.state)
           AND iv.lga = cca.lga 
           AND iv.ward = cca.ward 
           AND iv.polling_unit = cca.polling_unit
           AND iv.confirmed_to_vote = true) as confirmed_voters
      FROM call_center_assignments cca
      WHERE cca.user_id = $1 AND cca.is_active = true
    `;

    const result = await query(assignmentQuery, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        assignment: null
      });
    }

    res.json({
      success: true,
      assignment: result.rows[0]
    });

  } catch (error) {
    console.error('Get my assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignment',
      error: error.message
    });
  }
};

/**
 * Get voters assigned to the volunteer
 * GET /api/call-center/my-voters
 */
const getMyVoters = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = req.query.filter || 'all';
    const offset = (page - 1) * limit;

    // First get the volunteer's assignment
    const assignmentQuery = `
      SELECT id, state, lga, ward, polling_unit 
      FROM call_center_assignments 
      WHERE user_id = $1 AND is_active = true
    `;

    const assignmentResult = await query(assignmentQuery, [userId]);

    if (assignmentResult.rows.length === 0) {
      return res.json({
        success: true,
        voters: [],
        totalPages: 0,
        currentPage: page
      });
    }

    const assignment = assignmentResult.rows[0];

    // Build filter conditions
    let filterCondition = '';
    const queryParams = [assignment.state, assignment.lga, assignment.ward, assignment.polling_unit];
    let paramCount = 4;

    switch (filter) {
      case 'not_called':
        filterCondition = 'AND (called_recently = false OR called_recently IS NULL)';
        break;
      case 'called_recently':
        filterCondition = 'AND called_recently = true';
        break;
      case 'confirmed':
        filterCondition = 'AND confirmed_to_vote = true';
        break;
      case 'needs_follow_up':
        filterCondition = 'AND (confirmed_to_vote = false OR confirmed_to_vote IS NULL) AND called_recently = true';
        break;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inec_voters 
      WHERE UPPER(state) = UPPER($1)
        AND lga = $2 
        AND ward = $3 
        AND polling_unit = $4 
        ${filterCondition}
    `;

    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / limit);

    // Get voters
    queryParams.push(limit, offset);
    const votersQuery = `
      SELECT 
        id,
        phone_number,
        full_name,
        email_address,
        gender,
        age_group,
        called_recently,
        last_called_date,
        confirmed_to_vote,
        demands,
        notes,
        COALESCE((SELECT COUNT(*) FROM call_logs WHERE voter_id = inec_voters.id), 0) as call_count
      FROM inec_voters 
      WHERE UPPER(state) = UPPER($1)
        AND lga = $2 
        AND ward = $3 
        AND polling_unit = $4 
        ${filterCondition}
      ORDER BY 
        CASE WHEN called_recently = true THEN 1 ELSE 0 END,
        last_called_date DESC NULLS LAST,
        id
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const votersResult = await query(votersQuery, queryParams);

    res.json({
      success: true,
      voters: votersResult.rows,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Get my voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voters',
      error: error.message
    });
  }
};

/**
 * Get available polling units (not yet assigned to volunteers)
 * GET /api/call-center/available-polling-units
 */
const getAvailablePollingUnits = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access this resource'
      });
    }

    const pollingUnitsQuery = `
      SELECT DISTINCT
        iv.state,
        iv.lga,
        iv.ward,
        iv.polling_unit,
        iv.polling_unit_code,
        COUNT(*) as voter_count
      FROM inec_voters iv
      GROUP BY iv.state, iv.lga, iv.ward, iv.polling_unit, iv.polling_unit_code
      ORDER BY iv.state, iv.lga, iv.ward, iv.polling_unit
    `;

    const result = await query(pollingUnitsQuery);

    res.json({
      success: true,
      pollingUnits: result.rows
    });

  } catch (error) {
    console.error('Get available polling units error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available polling units',
      error: error.message
    });
  }
};

/**
 * Update voter information after a call
 * PUT /api/call-center/update-voter/:voterId
 */
const updateVoterInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const voterId = req.params.voterId;
    const {
      fullName,
      emailAddress,
      gender,
      ageGroup,
      confirmedToVote,
      demands,
      notes
    } = req.body;

    // Verify the voter belongs to this volunteer's assignment
    const verifyQuery = `
      SELECT iv.id 
      FROM inec_voters iv
      JOIN call_center_assignments cca 
        ON UPPER(iv.state) = UPPER(cca.state)
        AND iv.lga = cca.lga 
        AND iv.ward = cca.ward 
        AND iv.polling_unit = cca.polling_unit
      WHERE iv.id = $1 
        AND cca.user_id = $2 
        AND cca.is_active = true
    `;

    const verifyResult = await query(verifyQuery, [voterId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only update voters assigned to you'
      });
    }

    // Update voter information and increment call_count
    const updateQuery = `
      UPDATE inec_voters SET
        full_name = COALESCE($2, full_name),
        email_address = COALESCE($3, email_address),
        gender = COALESCE($4, gender),
        age_group = COALESCE($5, age_group),
        confirmed_to_vote = COALESCE($6, confirmed_to_vote),
        demands = COALESCE($7, demands),
        notes = COALESCE($8, notes),
        called_recently = true,
        last_called_date = CURRENT_TIMESTAMP,
        call_count = COALESCE(call_count, 0) + 1,
        last_updated_by = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const updateResult = await query(updateQuery, [
      voterId,
      fullName || null,
      emailAddress || null,
      gender || null,
      ageGroup || null,
      confirmedToVote,
      demands || null,
      notes || null,
      userId
    ]);

    // Log the call with proper schema
    const logQuery = `
      INSERT INTO call_logs (
        voter_id,
        volunteer_id,
        call_date,
        call_outcome,
        notes,
        data_collected
      ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
    `;

    // Determine call outcome based on whether voter confirmed
    let callOutcome = 'answered';
    if (confirmedToVote === true) {
      callOutcome = 'confirmed';
    } else if (confirmedToVote === false) {
      callOutcome = 'declined';
    }

    // Store additional data in JSONB
    const dataCollected = {
      fullName: fullName || null,
      emailAddress: emailAddress || null,
      gender: gender || null,
      ageGroup: ageGroup || null,
      confirmedToVote: confirmedToVote,
      demands: demands || null
    };

    await query(logQuery, [
      voterId,
      userId,
      callOutcome,
      notes || null,
      JSON.stringify(dataCollected)
    ]);

    res.json({
      success: true,
      message: 'Voter information updated successfully',
      voter: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update voter info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update voter information',
      error: error.message
    });
  }
};

/**
 * Get wards for a specific LGA
 */
const getWardsByLGA = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view voter navigation data'
      });
    }

    const { lga } = req.params;

    if (!lga) {
      return res.status(400).json({
        success: false,
        message: 'LGA parameter is required'
      });
    }

    const wardsQuery = `
      SELECT 
        ward,
        COUNT(*) as voter_count,
        COUNT(DISTINCT polling_unit) as polling_unit_count
      FROM inec_voters 
      WHERE state = 'Anambra' 
        AND lga = $1
        AND phone_number IS NOT NULL 
        AND phone_number != '' 
        AND LENGTH(TRIM(phone_number)) > 0
      GROUP BY ward
      ORDER BY ward;
    `;

    const result = await query(wardsQuery, [lga]);

    res.json({
      success: true,
      lga: lga,
      wards: result.rows
    });

  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wards',
      error: error.message
    });
  }
};

/**
 * Get polling units for a specific ward
 */
const getPollingUnitsByWard = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view voter navigation data'
      });
    }

    const { lga, ward } = req.params;

    if (!lga || !ward) {
      return res.status(400).json({
        success: false,
        message: 'LGA and ward parameters are required'
      });
    }

    const pollingUnitsQuery = `
      SELECT 
        polling_unit,
        polling_unit_code,
        COUNT(*) as voter_count
      FROM inec_voters 
      WHERE state = 'Anambra' 
        AND lga = $1
        AND ward = $2
        AND phone_number IS NOT NULL 
        AND phone_number != '' 
        AND LENGTH(TRIM(phone_number)) > 0
      GROUP BY polling_unit, polling_unit_code
      ORDER BY polling_unit;
    `;

    const result = await query(pollingUnitsQuery, [lga, ward]);

    res.json({
      success: true,
      lga: lga,
      ward: ward,
      pollingUnits: result.rows
    });

  } catch (error) {
    console.error('Get polling units error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polling units',
      error: error.message
    });
  }
};

/**
 * Get voters for a specific polling unit
 */
const getVotersByPollingUnit = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view voter navigation data'
      });
    }

    const { lga, ward, pollingUnit } = req.params;

    if (!lga || !ward || !pollingUnit) {
      return res.status(400).json({
        success: false,
        message: 'LGA, ward, and polling unit parameters are required'
      });
    }

    const votersQuery = `
      SELECT 
        id,
        vin,
        first_name,
        last_name,
        other_names,
        phone_number,
        email,
        address,
        occupation,
        gender,
        age,
        confirmed,
        last_called,
        created_at
      FROM inec_voters 
      WHERE state = 'Anambra' 
        AND lga = $1
        AND ward = $2
        AND polling_unit = $3
        AND phone_number IS NOT NULL 
        AND phone_number != '' 
        AND LENGTH(TRIM(phone_number)) > 0
      ORDER BY last_name, first_name;
    `;

    const result = await query(votersQuery, [lga, ward, pollingUnit]);

    res.json({
      success: true,
      lga: lga,
      ward: ward,
      polling_unit: pollingUnit,
      voters: result.rows
    });

  } catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voters',
      error: error.message
    });
  }
};

export {
  previewExcelUpload,
  importVotersWithMapping,
  importVoters,
  getImportStats,
  getVoterStatistics,
  assignVolunteer,
  getVolunteers,
  getMyAssignment,
  getMyVoters,
  updateVoterInfo,
  getAvailablePollingUnits,
  getWardsByLGA,
  getPollingUnitsByWard,
  getVotersByPollingUnit
};