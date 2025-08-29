import { query, getClient } from '../config/db.js';

export const monitoringService = {
  /**
   * Check if user has completed PU setup for any election
   */
  async checkPUCompletion(userId) {
    try {
      const result = await query(
        `SELECT 
          pu.submission_id,
          pu.election_id,
          pu.polling_unit_code as pu_code,
          pu.polling_unit_name as pu_name,
          pu.ward_name as ward,
          pu.lga_name as lga,
          pu.state_name as state,
          pu.gps_coordinates,
          pu.created_at,
          e.election_name,
          e.election_type,
          e.election_date,
          e.status as election_status
        FROM polling_unit_submissions pu
        LEFT JOIN elections e ON pu.election_id = e.election_id
        WHERE pu.monitor_user_id = $1
        ORDER BY pu.created_at DESC
        LIMIT 1`,
        [userId]
      );

      return {
        hasPUSetup: result.rows.length > 0,
        puInfo: result.rows.length > 0 ? result.rows[0] : null
      };
    } catch (error) {
      console.error('Error checking PU completion:', error);
      throw error;
    }
  },

  /**
   * Get monitoring dashboard status for a user
   */
  async getMonitoringStatus(userId) {
    try {
      const puCheck = await this.checkPUCompletion(userId);

      if (!puCheck.hasPUSetup) {
        return {
          needsPUSetup: true,
          puInfo: null,
          formStatuses: {}
        };
      }

      // Get completion status for each form type
      // For now, only check polling unit submissions since other tables may not exist yet
      const [officerReports, resultReports, incidentReports] = await Promise.all([
        // Officer arrival reports - placeholder until table schema is confirmed
        Promise.resolve({ rows: [{ count: '0', last_updated: null }] }),

        // Result tracking reports - placeholder until table schema is confirmed
        Promise.resolve({ rows: [{ count: '0', last_updated: null }] }),

        // Incident reports - placeholder until table schema is confirmed
        Promise.resolve({ rows: [{ count: '0', last_updated: null }] })
      ]);

      return {
        needsPUSetup: false,
        puInfo: puCheck.puInfo,
        formStatuses: {
          pollingUnit: {
            completed: true,
            count: 1,
            lastUpdated: puCheck.puInfo.created_at
          },
          officerArrival: {
            completed: parseInt(officerReports.rows[0].count) > 0,
            count: parseInt(officerReports.rows[0].count),
            lastUpdated: officerReports.rows[0].last_updated
          },
          resultTracking: {
            completed: parseInt(resultReports.rows[0].count) > 0,
            count: parseInt(resultReports.rows[0].count),
            lastUpdated: resultReports.rows[0].last_updated
          },
          incidentReporting: {
            completed: parseInt(incidentReports.rows[0].count) > 0,
            count: parseInt(incidentReports.rows[0].count),
            lastUpdated: incidentReports.rows[0].last_updated
          }
        }
      };
    } catch (error) {
      console.error('Error getting monitoring status:', error);
      throw error;
    }
  },

  /**
   * Get recent submissions summary
   */
  async getRecentSubmissions(userId, limit = 10) {
    try {
      const result = await query(
        `SELECT 
          'polling_unit' as form_type,
          submission_id as id,
          polling_unit_name as title,
          'Polling Unit Setup' as description,
          created_at
        FROM polling_unit_submissions 
        WHERE monitor_user_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting recent submissions:', error);
      throw error;
    }
  }
};
