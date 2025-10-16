import express from 'express';
import {
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
} from '../controllers/callCenter.controller.js';
import { upload } from '../services/excelImportService.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { query } from '../config/db.js';

const router = express.Router();

// Admin routes - for importing and managing data
router.post('/preview-excel', authenticateUser, upload.single('excelFile'), previewExcelUpload);
router.post('/import-voters-with-mapping', authenticateUser, importVotersWithMapping);
router.post('/import-voters', authenticateUser, upload.single('excelFile'), importVoters); // Legacy endpoint
router.get('/import-stats', authenticateUser, getImportStats);
router.get('/voter-statistics', authenticateUser, getVoterStatistics);
router.post('/assign-volunteer', authenticateUser, assignVolunteer);
router.get('/volunteers', authenticateUser, getVolunteers);
router.get('/available-polling-units', authenticateUser, getAvailablePollingUnits);

// Admin navigation routes - for hierarchical browsing
router.get('/wards/:lga', authenticateUser, getWardsByLGA);
router.get('/polling-units/:lga/:ward', authenticateUser, getPollingUnitsByWard);
router.get('/voters/:lga/:ward/:pollingUnit', authenticateUser, getVotersByPollingUnit);

// Volunteer routes - for call center operations
router.get('/my-assignment', authenticateUser, getMyAssignment);
router.get('/my-voters', authenticateUser, getMyVoters);
router.put('/update-voter/:voterId', authenticateUser, updateVoterInfo);

// Legacy route handler (replaced by controller methods above)
router.get('/my-assignment-legacy', authenticateUser, async (req, res) => {
  try {
    const assignment = await query(`
      SELECT 
        cca.*,
        COUNT(iv.id) as total_voters,
        COUNT(CASE WHEN iv.called_recently = true THEN 1 END) as recently_called,
        COUNT(CASE WHEN iv.confirmed_to_vote = true THEN 1 END) as confirmed_voters
      FROM call_center_assignments cca
      LEFT JOIN inec_voters iv ON (
        cca.state = iv.state AND 
        cca.lga = iv.lga AND 
        cca.ward = iv.ward AND 
        cca.polling_unit = iv.polling_unit
      )
      WHERE cca.user_id = $1 AND cca.is_active = true
      GROUP BY cca.id
    `, [req.user.id]);

    if (assignment.rows.length === 0) {
      return res.json({
        success: true,
        assignment: null,
        message: 'No active assignment found'
      });
    }

    res.json({
      success: true,
      assignment: assignment.rows[0]
    });

  } catch (error) {
    console.error('Get my assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignment',
      error: error.message
    });
  }
});

router.get('/my-voters', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 50, filter = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // First, get the user's assignment
    const assignment = await query(`
      SELECT state, lga, ward, polling_unit 
      FROM call_center_assignments 
      WHERE user_id = $1 AND is_active = true
    `, [req.user.id]);

    if (assignment.rows.length === 0) {
      return res.json({
        success: true,
        voters: [],
        total: 0,
        message: 'No active assignment found'
      });
    }

    const { state, lga, ward, polling_unit } = assignment.rows[0];

    // Build filter conditions
    let filterCondition = '';
    const params = [state, lga, ward, polling_unit];

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
        filterCondition = 'AND (confirmed_to_vote IS NULL OR confirmed_to_vote = false) AND called_recently = true';
        break;
    }

    // Get voters with pagination
    const voters = await query(`
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
        call_count
      FROM inec_voters 
      WHERE state = $1 AND lga = $2 AND ward = $3 AND polling_unit = $4 ${filterCondition}
      ORDER BY 
        CASE WHEN called_recently = true THEN last_called_date END DESC,
        CASE WHEN called_recently = false OR called_recently IS NULL THEN id END ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Get total count
    const totalCount = await query(`
      SELECT COUNT(*) as total 
      FROM inec_voters 
      WHERE state = $1 AND lga = $2 AND ward = $3 AND polling_unit = $4 ${filterCondition}
    `, params);

    res.json({
      success: true,
      voters: voters.rows,
      total: parseInt(totalCount.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(totalCount.rows[0].total) / limit)
    });

  } catch (error) {
    console.error('Get my voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voters',
      error: error.message
    });
  }
});

router.put('/update-voter/:voterId', authenticateUser, async (req, res) => {
  try {
    const { voterId } = req.params;
    const {
      fullName,
      emailAddress,
      gender,
      ageGroup,
      confirmedToVote,
      demands,
      notes,
      calledRecently = true
    } = req.body;

    // Verify the voter belongs to the user's assignment
    const voterCheck = await query(`
      SELECT iv.id 
      FROM inec_voters iv
      JOIN call_center_assignments cca ON (
        cca.state = iv.state AND 
        cca.lga = iv.lga AND 
        cca.ward = iv.ward AND 
        cca.polling_unit = iv.polling_unit
      )
      WHERE iv.id = $1 AND cca.user_id = $2 AND cca.is_active = true
    `, [voterId, req.user.id]);

    if (voterCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Voter not found in your assignment'
      });
    }

    // Update voter information
    const updatedVoter = await query(`
      UPDATE inec_voters 
      SET 
        full_name = COALESCE($2, full_name),
        email_address = COALESCE($3, email_address),
        gender = COALESCE($4, gender),
        age_group = COALESCE($5, age_group),
        confirmed_to_vote = COALESCE($6, confirmed_to_vote),
        demands = COALESCE($7, demands),
        notes = COALESCE($8, notes),
        called_recently = $9,
        last_called_date = CURRENT_TIMESTAMP,
        call_count = call_count + 1,
        last_updated_by = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      voterId, fullName, emailAddress, gender, ageGroup,
      confirmedToVote, demands, notes, calledRecently, req.user.id
    ]);

    // Log the call
    await query(`
      INSERT INTO call_logs (voter_id, volunteer_id, call_outcome, notes, data_collected)
      VALUES ($1, $2, 'answered', $3, $4)
    `, [
      voterId,
      req.user.id,
      notes || 'Voter information updated',
      JSON.stringify({
        fullName,
        emailAddress,
        gender,
        ageGroup,
        confirmedToVote,
        demands
      })
    ]);

    res.json({
      success: true,
      message: 'Voter information updated successfully',
      voter: updatedVoter.rows[0]
    });

  } catch (error) {
    console.error('Update voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update voter information',
      error: error.message
    });
  }
});

export default router;