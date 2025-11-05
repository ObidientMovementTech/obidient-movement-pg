import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { query } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/situation-room/overview
 * Get comprehensive monitoring overview for admins
 */
router.get('/overview', protect, isAdmin, async (req, res) => {
  try {
    const { electionId, state, lga, ward } = req.query;

    // Build filters
    const filters = [];
    const params = [];
    let paramIndex = 1;

    if (electionId) {
      filters.push(`ms.election_id = $${paramIndex}`);
      params.push(electionId);
      paramIndex++;
    }

    if (state) {
      filters.push(`UPPER(ms.scope_snapshot->>'state') = UPPER($${paramIndex})`);
      params.push(state);
      paramIndex++;
    }

    if (lga) {
      filters.push(`UPPER(ms.scope_snapshot->>'lga') = UPPER($${paramIndex})`);
      params.push(lga);
      paramIndex++;
    }

    if (ward) {
      filters.push(`UPPER(ms.scope_snapshot->>'ward') = UPPER($${paramIndex})`);
      params.push(ward);
      paramIndex++;
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Get active polling units (those who submitted PU info)
    const activeUnitsQuery = `
      SELECT 
        ms.submission_id,
        ms.user_id,
        ms.polling_unit_code,
        ms.submission_data->>'puName' as pu_name,
        ms.submission_data->>'gpsCoordinates' as gps_coordinates,
        ms.submission_data->>'locationType' as location_type,
        ms.scope_snapshot->>'state' as state,
        ms.scope_snapshot->>'lga' as lga,
        ms.scope_snapshot->>'ward' as ward,
        ms.created_at,
        u.name as agent_name,
        u.phone as agent_phone,
        u.designation
      FROM monitor_submissions ms
      LEFT JOIN users u ON u.id = ms.user_id
      ${whereClause ? whereClause + ' AND' : 'WHERE'} ms.submission_type = 'polling_unit_info'
      ORDER BY ms.created_at DESC
    `;

    const activeUnits = await query(activeUnitsQuery, params);

    // Get submission counts by type
    const submissionStatsQuery = `
      SELECT 
        ms.submission_type,
        COUNT(*) as total,
        COUNT(DISTINCT ms.user_id) as unique_agents,
        COUNT(DISTINCT ms.polling_unit_code) as unique_units
      FROM monitor_submissions ms
      ${whereClause}
      GROUP BY ms.submission_type
    `;

    const submissionStats = await query(submissionStatsQuery, params);

    // Get recent incidents
    const incidentsQuery = `
      SELECT 
        ms.submission_id,
        ms.user_id,
        ms.polling_unit_code,
        ms.submission_data->>'description' as description,
        ms.submission_data->>'severity' as severity,
        ms.submission_data->>'resolved' as resolved,
        ms.scope_snapshot->>'state' as state,
        ms.scope_snapshot->>'lga' as lga,
        ms.scope_snapshot->>'ward' as ward,
        ms.created_at,
        u.name as reporter_name
      FROM monitor_submissions ms
      LEFT JOIN users u ON u.id = ms.user_id
      ${whereClause ? whereClause + ' AND' : 'WHERE'} ms.submission_type = 'incident_report'
      ORDER BY ms.created_at DESC
      LIMIT 50
    `;

    const incidents = await query(incidentsQuery, params);

    // Get timeline of all submissions
    const timelineQuery = `
      SELECT 
        ms.submission_id,
        ms.submission_type,
        ms.polling_unit_code,
        ms.scope_snapshot->>'state' as state,
        ms.scope_snapshot->>'lga' as lga,
        ms.scope_snapshot->>'ward' as ward,
        ms.created_at,
        u.name as agent_name
      FROM monitor_submissions ms
      LEFT JOIN users u ON u.id = ms.user_id
      ${whereClause}
      ORDER BY ms.created_at DESC
      LIMIT 100
    `;

    const timeline = await query(timelineQuery, params);

    // Get active agents count
    const activeAgentsQuery = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM monitor_submissions ms
      ${whereClause ? whereClause + ' AND' : 'WHERE'} created_at >= NOW() - INTERVAL '2 hours'
    `;

    const activeAgentsResult = await query(activeAgentsQuery, params);

    res.json({
      success: true,
      data: {
        activePollingUnits: activeUnits.rows,
        submissionStats: submissionStats.rows,
        recentIncidents: incidents.rows,
        timeline: timeline.rows,
        activeAgentsCount: activeAgentsResult.rows[0]?.count || 0,
        summary: {
          totalActiveUnits: activeUnits.rows.length,
          totalIncidents: incidents.rows.length,
          unresolvedIncidents: incidents.rows.filter(i => i.resolved === 'false' || i.resolved === false).length,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching situation room overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch situation room data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/situation-room/polling-unit/:puCode
 * Get detailed information for a specific polling unit
 */
router.get('/polling-unit/:puCode', protect, isAdmin, async (req, res) => {
  try {
    const { puCode } = req.params;

    // Get all submissions for this PU
    const submissionsQuery = `
      SELECT 
        ms.*,
        u.name as agent_name,
        u.phone as agent_phone,
        u.designation
      FROM monitor_submissions ms
      LEFT JOIN users u ON u.id = ms.user_id
      WHERE ms.polling_unit_code = $1
      ORDER BY ms.created_at DESC
    `;

    const submissions = await query(submissionsQuery, [puCode]);

    res.json({
      success: true,
      data: submissions.rows
    });

  } catch (error) {
    console.error('Error fetching polling unit details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polling unit details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
