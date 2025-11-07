import { query } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';

/**
 * Results Dashboard Controller
 * Provides hierarchical election results data with performance optimizations
 */

/**
 * GET /api/results-dashboard/elections
 * Get all active elections for results viewing
 */
export const getActiveElectionsForResults = async (req, res) => {
  try {
    const electionsQuery = `
      SELECT 
        e.id,
        e.election_id,
        e.election_name,
        e.election_type as type,
        e.state,
        e.lga,
        e.election_date,
        e.status,
        COUNT(DISTINCT ms.submission_id) as total_submissions,
        COUNT(DISTINCT CASE WHEN ms.submission_type = 'result_tracking' THEN ms.submission_id END) as result_submissions,
        COUNT(DISTINCT CASE WHEN ms.submission_type = 'polling_unit_info' THEN ms.submission_id END) as setup_submissions
      FROM elections e
      LEFT JOIN monitor_submissions ms ON ms.election_id = e.election_id
      WHERE e.status = 'active'
      GROUP BY e.id, e.election_id, e.election_name, e.election_type, e.state, e.lga, e.election_date, e.status
      ORDER BY e.election_date DESC, e.created_at DESC
    `;

    const result = await query(electionsQuery);

    res.json({
      success: true,
      data: {
        elections: result.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching active elections for results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/results-dashboard/elections/:electionId/hierarchy
 * Get hierarchical results structure: LGA -> Ward -> PU with aggregated data
 */
export const getElectionResultsHierarchy = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Get election parties for color mapping
    const partiesQuery = `
      SELECT 
        party_code,
        party_name,
        display_name,
        color,
        display_order
      FROM election_parties
      WHERE election_id = $1
      ORDER BY display_order ASC, party_code ASC
    `;
    const partiesResult = await query(partiesQuery, [electionId]);
    const parties = partiesResult.rows;

    // Get all submissions with location hierarchy
    const submissionsQuery = `
      SELECT 
        ms.submission_id,
        ms.submission_type,
        ms.polling_unit_code,
        ms.submission_data,
        ms.attachments,
        ms.scope_snapshot,
        ms.created_at,
        u.id as user_id,
        u.name as agent_name,
        u.phone as agent_phone,
        u."profileImage" as agent_photo,
        u.designation as agent_designation,
        u.support_group as agent_support_group
      FROM monitor_submissions ms
      LEFT JOIN users u ON u.id = ms.user_id
      WHERE ms.election_id = $1
        AND ms.submission_type IN ('polling_unit_info', 'result_tracking')
      ORDER BY ms.scope_snapshot->>'state', 
               ms.scope_snapshot->>'lga', 
               ms.scope_snapshot->>'ward',
               ms.polling_unit_code,
               ms.created_at DESC
    `;

    const submissionsResult = await query(submissionsQuery, [electionId]);
    const submissions = submissionsResult.rows;

    // Build hierarchical structure
    const hierarchy = {};

    // Process each submission
    submissions.forEach(submission => {
      const scope = submission.scope_snapshot || {};
      const state = scope.state || 'Unknown';
      const lga = scope.lga || 'Unknown';
      const ward = scope.ward || 'Unknown';
      const puCode = submission.polling_unit_code;

      // Initialize hierarchy levels
      if (!hierarchy[state]) {
        hierarchy[state] = {
          state,
          lgas: {},
          totalSubmissions: 0,
          resultSubmissions: 0,
          setupSubmissions: 0
        };
      }

      if (!hierarchy[state].lgas[lga]) {
        hierarchy[state].lgas[lga] = {
          lga,
          state,
          wards: {},
          totalSubmissions: 0,
          resultSubmissions: 0,
          setupSubmissions: 0,
          partyTotals: {}
        };
      }

      if (!hierarchy[state].lgas[lga].wards[ward]) {
        hierarchy[state].lgas[lga].wards[ward] = {
          ward,
          lga,
          state,
          pollingUnits: {},
          totalSubmissions: 0,
          resultSubmissions: 0,
          setupSubmissions: 0,
          partyTotals: {}
        };
      }

      // Initialize polling unit if not exists
      if (!hierarchy[state].lgas[lga].wards[ward].pollingUnits[puCode]) {
        hierarchy[state].lgas[lga].wards[ward].pollingUnits[puCode] = {
          puCode,
          puName: submission.submission_data?.puName || puCode,
          ward,
          lga,
          state,
          hasSetup: false,
          hasResults: false,
          setupData: null,
          resultData: null,
          agent: null,
          lastUpdated: null
        };
      }

      const pu = hierarchy[state].lgas[lga].wards[ward].pollingUnits[puCode];

      // Update based on submission type
      if (submission.submission_type === 'polling_unit_info') {
        pu.hasSetup = true;
        pu.setupData = submission.submission_data;
        hierarchy[state].setupSubmissions++;
        hierarchy[state].lgas[lga].setupSubmissions++;
        hierarchy[state].lgas[lga].wards[ward].setupSubmissions++;
      } else if (submission.submission_type === 'result_tracking') {
        pu.hasResults = true;
        pu.resultData = submission.submission_data;

        // Extract party votes
        const votesPerParty = submission.submission_data?.stats?.votesPerParty || [];
        pu.partyVotes = votesPerParty;

        // Aggregate party totals at ward level
        votesPerParty.forEach(({ party, votes }) => {
          if (!hierarchy[state].lgas[lga].wards[ward].partyTotals[party]) {
            hierarchy[state].lgas[lga].wards[ward].partyTotals[party] = 0;
          }
          hierarchy[state].lgas[lga].wards[ward].partyTotals[party] += votes || 0;
        });

        // Extract evidence URLs
        pu.ec8aPhoto = submission.submission_data?.ec8aPhoto || submission.attachments?.[0];
        pu.evidencePhotos = submission.attachments || [];

        hierarchy[state].resultSubmissions++;
        hierarchy[state].lgas[lga].resultSubmissions++;
        hierarchy[state].lgas[lga].wards[ward].resultSubmissions++;
      }

      // Update agent info (from most recent submission)
      if (!pu.agent && submission.agent_name) {
        pu.agent = {
          id: submission.user_id,
          name: submission.agent_name,
          phone: submission.agent_phone,
          photo: submission.agent_photo,
          designation: submission.agent_designation,
          supportGroup: submission.agent_support_group
        };
      }

      // Update timestamps
      pu.lastUpdated = submission.created_at;

      // Update total submissions count
      hierarchy[state].totalSubmissions++;
      hierarchy[state].lgas[lga].totalSubmissions++;
      hierarchy[state].lgas[lga].wards[ward].totalSubmissions++;
    });

    // Aggregate party totals at LGA level
    Object.values(hierarchy).forEach(stateData => {
      Object.values(stateData.lgas).forEach(lgaData => {
        Object.values(lgaData.wards).forEach(wardData => {
          Object.entries(wardData.partyTotals).forEach(([party, votes]) => {
            if (!lgaData.partyTotals[party]) {
              lgaData.partyTotals[party] = 0;
            }
            lgaData.partyTotals[party] += votes;
          });
        });
      });
    });

    res.json({
      success: true,
      data: {
        electionId,
        parties,
        hierarchy,
        summary: {
          totalStates: Object.keys(hierarchy).length,
          totalLGAs: Object.values(hierarchy).reduce((sum, state) => sum + Object.keys(state.lgas).length, 0),
          totalWards: Object.values(hierarchy).reduce((sum, state) =>
            sum + Object.values(state.lgas).reduce((wardSum, lga) =>
              wardSum + Object.keys(lga.wards).length, 0), 0),
          totalPollingUnits: Object.values(hierarchy).reduce((sum, state) =>
            sum + Object.values(state.lgas).reduce((wardSum, lga) =>
              wardSum + Object.values(lga.wards).reduce((puSum, ward) =>
                puSum + Object.keys(ward.pollingUnits).length, 0), 0), 0)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching election results hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results hierarchy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/results-dashboard/elections/:electionId/polling-unit/:submissionId
 * Get detailed polling unit information including all evidence
 */
export const getPollingUnitDetails = async (req, res) => {
  try {
    const { electionId, submissionId } = req.params;

    const detailsQuery = `
      SELECT 
        ms.submission_id,
        ms.submission_type,
        ms.polling_unit_code,
        ms.submission_data,
        ms.attachments,
        ms.scope_snapshot,
        ms.created_at,
        u.id as user_id,
        u.name as agent_name,
        u.phone as agent_phone,
        u."profileImage" as agent_photo,
        u."userName" as agent_username,
        u.email as agent_email,
        u.designation as agent_designation,
        u."monitoring_location" as agent_location,
        u.support_group as agent_support_group
      FROM monitor_submissions ms
      LEFT JOIN users u ON u.id = ms.user_id
      WHERE ms.submission_id = $1
        AND ms.election_id = $2
    `;

    const result = await query(detailsQuery, [submissionId, electionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Polling unit submission not found'
      });
    }

    const submission = result.rows[0];

    res.json({
      success: true,
      data: {
        submission: {
          id: submission.submission_id,
          type: submission.submission_type,
          puCode: submission.polling_unit_code,
          data: submission.submission_data,
          attachments: submission.attachments,
          scope: submission.scope_snapshot,
          createdAt: submission.created_at
        },
        agent: {
          id: submission.user_id,
          name: submission.agent_name,
          phone: submission.agent_phone,
          photo: submission.agent_photo,
          username: submission.agent_username,
          email: submission.agent_email,
          designation: submission.agent_designation,
          location: submission.agent_location,
          supportGroup: submission.agent_support_group
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching polling unit details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polling unit details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getActiveElectionsForResults,
  getElectionResultsHierarchy,
  getPollingUnitDetails
};
