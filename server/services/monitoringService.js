import { query } from '../config/db.js';
import {
  deriveMonitoringScopeFromUser,
  parseMonitoringScope,
  createScopePuSummary,
  MonitoringScopeError,
} from '../utils/monitoringScope.js';

export const MONITOR_SUBMISSION_TYPES = Object.freeze({
  POLLING_UNIT_INFO: 'polling_unit_info',
  OFFICER_ARRIVAL: 'officer_arrival',
  RESULT_TRACKING: 'result_tracking',
  INCIDENT_REPORT: 'incident_report',
});

const FORM_TYPE_TITLES = Object.freeze({
  [MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO]: 'Polling Unit Setup',
  [MONITOR_SUBMISSION_TYPES.OFFICER_ARRIVAL]: 'Officer Arrival Report',
  [MONITOR_SUBMISSION_TYPES.RESULT_TRACKING]: 'Result Tracking Report',
  [MONITOR_SUBMISSION_TYPES.INCIDENT_REPORT]: 'Incident Report',
});

const computeSubmissionStatus = (rows) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  const summary = {
    submissionId: rows[0].submission_id,
    electionId: null,
    pollingUnitCode: null,
    scope: null,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
    status: 'in_progress',
    completionPercentage: 0,
    puInfoCompleted: false,
    officerArrivalCompleted: false,
    resultTrackingCompleted: false,
    incidentReportCompleted: false,
    incidentReportCount: 0,
  };

  rows.forEach((row) => {
    if (row.updated_at && (!summary.updatedAt || row.updated_at > summary.updatedAt)) {
      summary.updatedAt = row.updated_at;
    }

    switch (row.submission_type) {
      case MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO:
        summary.puInfoCompleted = true;
        summary.electionId = row.election_id;
        summary.pollingUnitCode = row.polling_unit_code;
        summary.scope = row.scope_snapshot;
        summary.createdAt = row.created_at;
        break;
      case MONITOR_SUBMISSION_TYPES.OFFICER_ARRIVAL:
        summary.officerArrivalCompleted = true;
        break;
      case MONITOR_SUBMISSION_TYPES.RESULT_TRACKING:
        summary.resultTrackingCompleted = true;
        break;
      case MONITOR_SUBMISSION_TYPES.INCIDENT_REPORT:
        summary.incidentReportCompleted = true;
        summary.incidentReportCount += 1;
        break;
      default:
        break;
    }
  });

  const stepsCompleted = [
    summary.puInfoCompleted,
    summary.officerArrivalCompleted,
    summary.resultTrackingCompleted,
    summary.incidentReportCompleted,
  ].filter(Boolean).length;

  summary.completionPercentage = Math.round((stepsCompleted / 4) * 100);
  if (summary.incidentReportCompleted) {
    summary.status = 'completed';
    summary.completionPercentage = Math.max(summary.completionPercentage, 100);
  } else if (!summary.puInfoCompleted) {
    summary.status = 'not_started';
    summary.completionPercentage = 0;
  } else {
    summary.status = 'in_progress';
  }

  return summary;
};

const buildFormStatus = (statsMap, type, fallbackDate = null) => {
  const entry = statsMap.get(type);
  const count = entry?.count || 0;
  return {
    completed: count > 0,
    count,
    lastUpdated: entry?.last_updated || fallbackDate || null,
  };
};

export const monitoringService = {
  async checkPUCompletion(userId) {
    const result = await query(
      `SELECT 
        submission_id,
        election_id,
        polling_unit_code,
        scope_snapshot,
        submission_data,
        created_at,
        updated_at
      FROM monitor_submissions
      WHERE user_id = $1
        AND submission_type = $2
      ORDER BY created_at DESC
      LIMIT 1`,
      [userId, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO]
    );

    if (result.rows.length === 0) {
      return {
        hasPUSetup: false,
        puInfo: null,
      };
    }

    const row = result.rows[0];
    const data = row.submission_data || {};
    const scope = row.scope_snapshot || {};

    return {
      hasPUSetup: true,
      puInfo: {
        submission_id: row.submission_id,
        election_id: row.election_id,
        pu_code: row.polling_unit_code,
        pu_name: data.pollingUnitName || data.puName || scope.pollingUnitName || null,
        ward: data.wardName || scope.ward || null,
        lga: data.lgaName || scope.lga || null,
        state: data.stateName || scope.state || null,
        gps_coordinates: data.gpsCoordinates || scope.gpsCoordinates || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    };
  },

  async getMonitoringStatus(userId) {
    const userResult = await query(
      `SELECT 
         id,
         designation,
         monitoring_location,
         "votingState" as "votingState",
         "votingLGA" as "votingLGA",
         "votingWard" as "votingWard",
         "votingPU" as "votingPU",
         "assignedState",
         "assignedLGA",
         "assignedWard"
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found for monitoring status lookup');
    }

    const user = userResult.rows[0];

    let scope = parseMonitoringScope(user.monitoring_location);
    if (!scope) {
      try {
        scope = deriveMonitoringScopeFromUser(user);
      } catch (error) {
        if (error instanceof MonitoringScopeError) {
          return {
            needsPUSetup: false,
            puInfo: null,
            monitoringScope: null,
            formStatuses: {
              pollingUnit: { completed: false, count: 0, lastUpdated: null },
              officerArrival: { completed: false, count: 0, lastUpdated: null },
              resultTracking: { completed: false, count: 0, lastUpdated: null },
              incidentReporting: { completed: false, count: 0, lastUpdated: null },
            },
            blockingReason: error.message,
          };
        }

        throw error;
      }
    }

    const puCheck = await this.checkPUCompletion(userId);

    // Note: needsPUSetup is now informational only - not a blocker
    // Users can access the dashboard and fill forms in any order
    let needsPUSetup = false;
    let puInfo = puCheck.puInfo;

    if (scope?.level === 'polling_unit' && !puCheck.hasPUSetup) {
      // Don't block access, just indicate PU form hasn't been completed yet
      needsPUSetup = false; // Changed from true - PU setup is optional
      puInfo = puInfo || createScopePuSummary(scope);
    }

    const statsResult = await query(
      `SELECT submission_type, COUNT(*)::int AS count, MAX(updated_at) AS last_updated
       FROM monitor_submissions
       WHERE user_id = $1
       GROUP BY submission_type`,
      [userId]
    );

    const statsMap = new Map(statsResult.rows.map((row) => [row.submission_type, row]));

    return {
      needsPUSetup,
      monitoringScope: scope,
      puInfo,
      formStatuses: {
        pollingUnit: buildFormStatus(statsMap, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO, puInfo?.created_at),
        officerArrival: buildFormStatus(statsMap, MONITOR_SUBMISSION_TYPES.OFFICER_ARRIVAL),
        resultTracking: buildFormStatus(statsMap, MONITOR_SUBMISSION_TYPES.RESULT_TRACKING),
        incidentReporting: buildFormStatus(statsMap, MONITOR_SUBMISSION_TYPES.INCIDENT_REPORT),
      },
    };
  },

  async getRecentSubmissions(userId, limit = 10) {
    const result = await query(
      `SELECT 
         submission_id,
         submission_type,
         submission_data,
         scope_snapshot,
         created_at
       FROM monitor_submissions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) => {
      const scope = row.scope_snapshot || {};
      const data = row.submission_data || {};
      return {
        form_type: row.submission_type,
        id: row.submission_id,
        title:
          data.pollingUnitName ||
          data.title ||
          scope.pollingUnitName ||
          FORM_TYPE_TITLES[row.submission_type] ||
          'Monitoring Submission',
        description: FORM_TYPE_TITLES[row.submission_type] || 'Monitoring Submission',
        created_at: row.created_at,
      };
    });
  },

  async getSubmissionStatusForUser(userId, submissionId) {
    const result = await query(
      `SELECT 
         submission_id,
         submission_type,
         election_id,
         polling_unit_code,
         scope_snapshot,
         submission_data,
         status,
         created_at,
         updated_at
       FROM monitor_submissions
       WHERE user_id = $1
         AND submission_id = $2
       ORDER BY created_at ASC`,
      [userId, submissionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return computeSubmissionStatus(result.rows);
  },

  async listUserSubmissions(userId, { page = 1, limit = 10, status } = {}) {
    const baseResult = await query(
      `SELECT 
         submission_id,
         election_id,
         polling_unit_code,
         scope_snapshot,
         submission_data,
         status,
         created_at,
         updated_at
       FROM monitor_submissions
       WHERE user_id = $1
         AND submission_type = $2
       ORDER BY created_at DESC`,
      [userId, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO]
    );

    if (baseResult.rows.length === 0) {
      return { items: [], total: 0 };
    }

    const submissionIds = baseResult.rows.map((row) => row.submission_id);

    const allRowsResult = await query(
      `SELECT 
         submission_id,
         submission_type,
         election_id,
         polling_unit_code,
         scope_snapshot,
         submission_data,
         status,
         created_at,
         updated_at
       FROM monitor_submissions
       WHERE user_id = $1
         AND submission_id = ANY($2)
       ORDER BY created_at ASC`,
      [userId, submissionIds]
    );

    const grouped = new Map();
    allRowsResult.rows.forEach((row) => {
      if (!grouped.has(row.submission_id)) {
        grouped.set(row.submission_id, []);
      }
      grouped.get(row.submission_id).push(row);
    });

    let items = baseResult.rows.map((baseRow) => {
      const rows = grouped.get(baseRow.submission_id) || [baseRow];
      const summary = computeSubmissionStatus(rows);
      return {
        ...summary,
        submissionData: baseRow.submission_data,
      };
    });

    if (status) {
      items = items.filter((item) => item.status === status);
    }

    const total = items.length;
    const offset = Math.max(page - 1, 0) * limit;
    const pagedItems = items.slice(offset, offset + limit);

    return { items: pagedItems, total };
  },

  async getSubmissionDetails(userId, submissionId) {
    const result = await query(
      `SELECT 
         submission_id,
         submission_type,
         election_id,
         polling_unit_code,
         scope_snapshot,
         submission_data,
         attachments,
         status,
         created_at,
         updated_at
       FROM monitor_submissions
       WHERE user_id = $1
         AND submission_id = $2
       ORDER BY created_at ASC`,
      [userId, submissionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const rows = result.rows;
    const statusSummary = computeSubmissionStatus(rows);

    const pollingUnit = rows.find((row) => row.submission_type === MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO) || null;
    const officerArrival = rows.find((row) => row.submission_type === MONITOR_SUBMISSION_TYPES.OFFICER_ARRIVAL) || null;
    const resultTracking = rows.find((row) => row.submission_type === MONITOR_SUBMISSION_TYPES.RESULT_TRACKING) || null;
    const incidentReports = rows.filter((row) => row.submission_type === MONITOR_SUBMISSION_TYPES.INCIDENT_REPORT);

    return {
      pollingUnit,
      officerArrival,
      resultTracking,
      incidentReports,
      status: statusSummary,
    };
  },
};
