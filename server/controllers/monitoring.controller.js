import { query, getClient } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { monitoringService, MONITOR_SUBMISSION_TYPES } from '../services/monitoringService.js';
import {
  deriveMonitoringScopeFromUser,
  parseMonitoringScope,
  createScopePuSummary,
  MonitoringScopeError,
} from '../utils/monitoringScope.js';
import { uploadToS3 } from '../utils/s3Upload.js';

const generateSubmissionId = (prefix = 'SUB') => `${prefix}-${uuidv4()}`;

const preferValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

/**
 * Validate that the submission polling unit matches the user's assigned polling unit
 * from monitoring scope (attached by middleware)
 */
const validatePollingUnitMatch = (req, submissionPUCode, submissionPUName) => {
  const { monitoringScope } = req;

  if (!monitoringScope || !monitoringScope.pollingUnit) {
    return {
      valid: false,
      message: 'No polling unit assigned to your account'
    };
  }

  const assignedPU = monitoringScope.pollingUnit;
  const assignedPULabel = monitoringScope.pollingUnitLabel || assignedPU;

  // Normalize for comparison (case-insensitive, trim whitespace)
  const normalize = (str) => (str || '').toString().trim().toUpperCase().replace(/\s+/g, ' ');

  const submittedPUNorm = normalize(submissionPUCode || submissionPUName);
  const assignedPUNorm = normalize(assignedPU);
  const assignedLabelNorm = normalize(assignedPULabel);

  // Check if submission matches assigned PU (by code or name)
  const isMatch = submittedPUNorm === assignedPUNorm || submittedPUNorm === assignedLabelNorm;

  if (!isMatch) {
    return {
      valid: false,
      message: `Submission polling unit mismatch. You can only submit for: ${assignedPULabel}`,
      details: {
        submitted: submissionPUCode || submissionPUName,
        assigned: assignedPULabel
      }
    };
  }

  return { valid: true };
};

const buildScopeSnapshot = (source = {}, baseSnapshot = {}) => {
  const snapshot = {
    state: baseSnapshot.state || null,
    stateCode: baseSnapshot.stateCode || null,
    lga: baseSnapshot.lga || null,
    lgaCode: baseSnapshot.lgaCode || null,
    ward: baseSnapshot.ward || null,
    wardCode: baseSnapshot.wardCode || null,
    pollingUnitName: baseSnapshot.pollingUnitName || null,
    pollingUnitCode: baseSnapshot.pollingUnitCode || null,
    gpsCoordinates: baseSnapshot.gpsCoordinates || null,
  };

  snapshot.state = preferValue(source.stateName, source.state, snapshot.state);
  snapshot.stateCode = preferValue(source.stateCode, snapshot.stateCode);
  snapshot.lga = preferValue(source.lgaName, source.lga, snapshot.lga);
  snapshot.lgaCode = preferValue(source.lgaCode, snapshot.lgaCode);
  snapshot.ward = preferValue(source.wardName, source.ward, snapshot.ward);
  snapshot.wardCode = preferValue(source.wardCode, snapshot.wardCode);
  snapshot.pollingUnitName = preferValue(source.pollingUnitName, source.puName, snapshot.pollingUnitName);
  snapshot.pollingUnitCode = preferValue(source.pollingUnitCode, source.puCode, snapshot.pollingUnitCode);
  snapshot.gpsCoordinates = preferValue(source.gpsCoordinates, snapshot.gpsCoordinates);

  return snapshot;
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
};

const stringifyJson = (value, fallback) => JSON.stringify(value ?? fallback ?? null);

const fetchBaseSubmission = async (client, submissionId, userId) => {
  const result = await client.query(
    `SELECT 
       id,
       submission_id,
       election_id,
       polling_unit_code,
       scope_snapshot,
       submission_data
     FROM monitor_submissions
     WHERE submission_id = $1
       AND user_id = $2
       AND submission_type = $3
     LIMIT 1`,
    [submissionId, userId, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO]
  );

  return result.rows[0] || null;
};

export const monitoringController = {
  // ================================
  // POLLING UNIT INFORMATION
  // ================================
  async submitPollingUnitInfo(req, res) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const userId = req.user.id;
      const {
        electionId,
        puCode,
        puName,
        ward,
        lga,
        state,
        gpsCoordinates,
        locationType,
        locationOther,
        clientSubmissionId,
        meta
      } = req.body;

      // Validate required fields
      const pollingUnitCode = puCode || req.body.pollingUnitCode;
      const pollingUnitName = puName || req.body.pollingUnitName;
      const wardName = ward || req.body.wardName;
      const lgaName = lga || req.body.lgaName;
      const stateName = state || req.body.stateName;

      if (!electionId || !pollingUnitCode || !pollingUnitName || !wardName || !lgaName || !stateName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required polling unit information'
        });
      }

      // PHASE 2: Validate polling unit matches user's monitoring scope
      const validation = validatePollingUnitMatch(req, pollingUnitCode, pollingUnitName);
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message: validation.message,
          details: validation.details
        });
      }

      // Build consolidated payload
      const scopeSnapshot = buildScopeSnapshot(req.body);
      const submissionData = {
        electionId,
        pollingUnitCode,
        pollingUnitName,
        wardName,
        lgaName,
        stateName,
        gpsCoordinates: gpsCoordinates || null,
        locationType: locationType || null,
        locationOther: locationOther || null,
        meta: meta ?? {},
        submittedAt: new Date().toISOString(),
        rawPayload: req.body,
      };

      const attachments = [];

      const existingResult = await client.query(
        `SELECT id, submission_id FROM monitor_submissions
         WHERE user_id = $1
           AND submission_type = $2
           AND polling_unit_code = $3
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO, pollingUnitCode]
      );

      let submissionId;

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        submissionId = existing.submission_id;

        await client.query(
          `UPDATE monitor_submissions
             SET election_id = $1,
                 scope_snapshot = $2::jsonb,
                 submission_data = $3::jsonb,
                 attachments = $4::jsonb,
                 status = 'submitted',
                 client_submission_id = COALESCE($5, client_submission_id),
                 updated_at = NOW()
           WHERE id = $6`,
          [
            electionId,
            stringifyJson(scopeSnapshot),
            stringifyJson(submissionData),
            stringifyJson(attachments, []),
            clientSubmissionId || null,
            existing.id,
          ]
        );
      } else {
        submissionId = generateSubmissionId('SUB');

        await client.query(
          `INSERT INTO monitor_submissions (
             submission_id,
             user_id,
             election_id,
             polling_unit_code,
             scope_snapshot,
             submission_type,
             submission_data,
             attachments,
             status,
             client_submission_id
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb,$9,$10)` ,
          [
            submissionId,
            userId,
            electionId,
            pollingUnitCode,
            stringifyJson(scopeSnapshot),
            MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO,
            stringifyJson(submissionData),
            stringifyJson(attachments, []),
            'submitted',
            clientSubmissionId || null,
          ]
        );
      }

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Polling unit information saved successfully',
        data: {
          submissionId
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting polling unit info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save polling unit information',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  },

  // ================================
  // OFFICER ARRIVAL REPORT
  // ================================
  async submitOfficerArrival(req, res) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const {
        submissionId,
        firstArrivalTime,
        lastArrivalTime,
        onTimeStatus,
        proofTypes,
        arrivalProofMedia,
        arrivalNotes,
        officerNames,
        uniformsProper,
        impersonators,
        votingStarted,
        actualStartTime,
        materialsPresent,
        securityPresent,
        clientSubmissionId
      } = req.body;

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
      }

      const userId = req.user.id;
      const baseSubmission = await fetchBaseSubmission(client, submissionId, userId);

      if (!baseSubmission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or access denied'
        });
      }

      // PHASE 2: Validate polling unit matches user's monitoring scope
      const submittedPU = baseSubmission.polling_unit_code || baseSubmission.scope_snapshot?.pollingUnitCode;
      const validation = validatePollingUnitMatch(req, submittedPU, null);
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message: validation.message,
          details: validation.details
        });
      }

      const scopeSnapshot = buildScopeSnapshot(req.body, baseSubmission.scope_snapshot || {});
      const submissionData = {
        submissionId,
        firstArrivalTime: firstArrivalTime || null,
        lastArrivalTime: lastArrivalTime || null,
        onTimeStatus: onTimeStatus || null,
        proofTypes: normalizeArray(proofTypes),
        arrivalProofMedia: normalizeArray(arrivalProofMedia),
        arrivalNotes: arrivalNotes || null,
        officerNames: normalizeArray(officerNames),
        uniformsProper: uniformsProper ?? null,
        impersonators: impersonators ?? null,
        votingStarted: votingStarted ?? null,
        actualStartTime: actualStartTime || null,
        materialsPresent: materialsPresent ?? null,
        securityPresent: securityPresent ?? null,
        submittedAt: new Date().toISOString(),
        rawPayload: req.body,
      };

      const attachments = normalizeArray(arrivalProofMedia);

      const existingResult = await client.query(
        `SELECT id FROM monitor_submissions
         WHERE submission_id = $1
           AND submission_type = $2
         LIMIT 1`,
        [submissionId, MONITOR_SUBMISSION_TYPES.OFFICER_ARRIVAL]
      );

      if (existingResult.rows.length > 0) {
        await client.query(
          `UPDATE monitor_submissions
             SET election_id = $1,
                 polling_unit_code = $2,
                 scope_snapshot = $3::jsonb,
                 submission_data = $4::jsonb,
                 attachments = $5::jsonb,
                 status = 'submitted',
                 client_submission_id = COALESCE($6, client_submission_id),
                 updated_at = NOW()
           WHERE id = $7`,
          [
            baseSubmission.election_id,
            baseSubmission.polling_unit_code,
            stringifyJson(scopeSnapshot, {}),
            stringifyJson(submissionData, {}),
            stringifyJson(attachments, []),
            clientSubmissionId || null,
            existingResult.rows[0].id,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO monitor_submissions (
             submission_id,
             user_id,
             election_id,
             polling_unit_code,
             scope_snapshot,
             submission_type,
             submission_data,
             attachments,
             status,
             client_submission_id
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb,$9,$10)` ,
          [
            submissionId,
            userId,
            baseSubmission.election_id,
            baseSubmission.polling_unit_code,
            stringifyJson(scopeSnapshot, {}),
            MONITOR_SUBMISSION_TYPES.OFFICER_ARRIVAL,
            stringifyJson(submissionData, {}),
            stringifyJson(attachments, []),
            'submitted',
            clientSubmissionId || null,
          ]
        );
      }

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Officer arrival report saved successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting officer arrival:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save officer arrival report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  },

  // ================================
  // RESULT TRACKING
  // ================================
  async submitResultTracking(req, res) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const {
        submissionId,
        officerName,
        resultAnnouncerPhoto,
        partyAgents,
        reporterName,
        reporterPhone,
        date,
        timeAnnounced,
        stats,
        discrepancies,
        signedByAgents,
        agentsSignedCount,
        resultPosted,
        bvasSeen,
        evidence,
        notes,
        clientSubmissionId
      } = req.body;

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
      }

      const userId = req.user.id;
      const baseSubmission = await fetchBaseSubmission(client, submissionId, userId);

      if (!baseSubmission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or access denied'
        });
      }

      // PHASE 2: Validate polling unit matches user's monitoring scope
      const submittedPU = baseSubmission.polling_unit_code || baseSubmission.scope_snapshot?.pollingUnitCode;
      const validation = validatePollingUnitMatch(req, submittedPU, null);
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message: validation.message,
          details: validation.details
        });
      }

      const scopeSnapshot = buildScopeSnapshot(req.body, baseSubmission.scope_snapshot || {});
      const submissionData = {
        submissionId,
        officerName: officerName || null,
        resultAnnouncerPhoto: resultAnnouncerPhoto || null,
        partyAgents: normalizeArray(partyAgents),
        reporterName: reporterName || null,
        reporterPhone: reporterPhone || null,
        announcementDate: date || null,
        timeAnnounced: timeAnnounced || null,
        stats: {
          registered: stats?.registered ?? null,
          accredited: stats?.accredited ?? null,
          valid: stats?.valid ?? null,
          rejected: stats?.rejected ?? null,
          total: stats?.total ?? null,
          votesPerParty: stats?.votesPerParty || null,
        },
        discrepancies: discrepancies || null,
        signedByAgents: signedByAgents ?? null,
        agentsSignedCount: agentsSignedCount ?? null,
        resultPosted: resultPosted ?? null,
        bvasSeen: bvasSeen ?? null,
        evidence: {
          ec8aPhoto: evidence?.ec8aPhoto || null,
          announcementVideo: evidence?.announcementVideo || null,
          wallPhoto: evidence?.wallPhoto || null,
          reporterSelfie: evidence?.reporterSelfie || null,
          additional: normalizeArray(evidence?.attachments),
        },
        notes: notes || null,
        submittedAt: new Date().toISOString(),
        rawPayload: req.body,
      };

      const attachments = normalizeArray([
        evidence?.ec8aPhoto,
        evidence?.announcementVideo,
        evidence?.wallPhoto,
        evidence?.reporterSelfie,
      ]).filter(Boolean);

      const existingResult = await client.query(
        `SELECT id FROM monitor_submissions
         WHERE submission_id = $1
           AND submission_type = $2
         LIMIT 1`,
        [submissionId, MONITOR_SUBMISSION_TYPES.RESULT_TRACKING]
      );

      if (existingResult.rows.length > 0) {
        await client.query(
          `UPDATE monitor_submissions
             SET election_id = $1,
                 polling_unit_code = $2,
                 scope_snapshot = $3::jsonb,
                 submission_data = $4::jsonb,
                 attachments = $5::jsonb,
                 status = 'submitted',
                 client_submission_id = COALESCE($6, client_submission_id),
                 updated_at = NOW()
           WHERE id = $7`,
          [
            baseSubmission.election_id,
            baseSubmission.polling_unit_code,
            stringifyJson(scopeSnapshot, {}),
            stringifyJson(submissionData, {}),
            stringifyJson(attachments, []),
            clientSubmissionId || null,
            existingResult.rows[0].id,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO monitor_submissions (
             submission_id,
             user_id,
             election_id,
             polling_unit_code,
             scope_snapshot,
             submission_type,
             submission_data,
             attachments,
             status,
             client_submission_id
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb,$9,$10)` ,
          [
            submissionId,
            userId,
            baseSubmission.election_id,
            baseSubmission.polling_unit_code,
            stringifyJson(scopeSnapshot, {}),
            MONITOR_SUBMISSION_TYPES.RESULT_TRACKING,
            stringifyJson(submissionData, {}),
            stringifyJson(attachments, []),
            'submitted',
            clientSubmissionId || null,
          ]
        );
      }

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Result tracking report saved successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting result tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save result tracking report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  },

  // ================================
  // INCIDENT REPORTING
  // ================================
  async submitIncidentReport(req, res) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const {
        submissionId,
        officerNameOrId,
        incidentDate,
        incidentStart,
        incidentEnd,
        captureMethod,
        conditions,
        irregularities,
        narrative,
        perpetrators,
        victims,
        officialsPresent,
        evidence,
        witnesses,
        escalation,
        clientSubmissionId,
        location
      } = req.body;

      const userId = req.user.id;

      let baseSubmission = null;
      if (submissionId) {
        baseSubmission = await fetchBaseSubmission(client, submissionId, userId);
        if (!baseSubmission) {
          return res.status(404).json({
            success: false,
            message: 'Submission not found or access denied'
          });
        }

        // PHASE 2: Validate polling unit matches user's monitoring scope
        const submittedPU = baseSubmission.polling_unit_code || baseSubmission.scope_snapshot?.pollingUnitCode;
        const validation = validatePollingUnitMatch(req, submittedPU, null);
        if (!validation.valid) {
          return res.status(403).json({
            success: false,
            message: validation.message,
            details: validation.details
          });
        }
      } else {
        // For standalone incidents, validate against monitoring scope directly
        const validation = validatePollingUnitMatch(req, location?.puCode, location?.puName);
        if (!validation.valid) {
          return res.status(403).json({
            success: false,
            message: validation.message,
            details: validation.details
          });
        }
      }

      let userScope = null;
      if (!baseSubmission) {
        const userResult = await client.query(
          `SELECT 
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

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          userScope = parseMonitoringScope(user.monitoring_location);
          if (!userScope) {
            try {
              userScope = deriveMonitoringScopeFromUser(user);
            } catch (err) {
              if (err instanceof MonitoringScopeError) {
                userScope = null;
              } else {
                throw err;
              }
            }
          }
        }
      }

      const initialSnapshot = baseSubmission?.scope_snapshot || {
        state: userScope?.stateLabel || userScope?.state || null,
        stateCode: userScope?.state || null,
        lga: userScope?.lgaLabel || userScope?.lga || null,
        lgaCode: userScope?.lga || null,
        ward: userScope?.wardLabel || userScope?.ward || null,
        wardCode: userScope?.ward || null,
        pollingUnitName: userScope?.pollingUnitLabel || userScope?.pollingUnit || null,
        pollingUnitCode: userScope?.pollingUnit || null,
      };

      const scopeSnapshot = buildScopeSnapshot(location || req.body, initialSnapshot);

      const submissionData = {
        linkedSubmissionId: submissionId || null,
        officerNameOrId: officerNameOrId || null,
        incidentDate: incidentDate || null,
        incidentStartTime: incidentStart || null,
        incidentEndTime: incidentEnd || null,
        captureMethod: normalizeArray(captureMethod),
        conditions: conditions || null,
        irregularities: normalizeArray(irregularities),
        narrative: narrative || null,
        perpetrators: perpetrators || null,
        victims: victims || null,
        officialsPresent: officialsPresent || null,
        evidence: {
          photoCount: evidence?.photoCount ?? null,
          videoCount: evidence?.videoCount ?? null,
          hasPhoneFootage: evidence?.hasPhoneFootage ?? null,
          mediaFilenames: normalizeArray(evidence?.mediaFilenames),
          hasMetadata: evidence?.hasMetadata ?? null,
        },
        witnesses: normalizeArray(witnesses),
        escalation: {
          reportedTo: escalation?.reportedTo || null,
          details: escalation?.details || null,
          interventionMade: escalation?.interventionMade ?? null,
          outcome: escalation?.outcome || null,
          loggedByINEC: escalation?.loggedByINEC ?? null,
        },
        submittedAt: new Date().toISOString(),
        rawPayload: req.body,
      };

      const attachments = normalizeArray(evidence?.mediaFilenames);

      const targetSubmissionId = submissionId || generateSubmissionId('INC');
      const electionId = baseSubmission?.election_id || null;
      const pollingUnitCode = baseSubmission?.polling_unit_code || scopeSnapshot.pollingUnitCode || null;

      let existingId = null;
      if (clientSubmissionId) {
        const existing = await client.query(
          `SELECT id FROM monitor_submissions
           WHERE user_id = $1
             AND submission_type = $2
             AND client_submission_id = $3
           LIMIT 1`,
          [userId, MONITOR_SUBMISSION_TYPES.INCIDENT_REPORT, clientSubmissionId]
        );
        existingId = existing.rows[0]?.id || null;
      }

      if (existingId) {
        await client.query(
          `UPDATE monitor_submissions
             SET submission_id = $1,
                 election_id = $2,
                 polling_unit_code = $3,
                 scope_snapshot = $4::jsonb,
                 submission_data = $5::jsonb,
                 attachments = $6::jsonb,
                 status = 'submitted',
                 updated_at = NOW()
           WHERE id = $7`,
          [
            targetSubmissionId,
            electionId,
            pollingUnitCode,
            stringifyJson(scopeSnapshot, {}),
            stringifyJson(submissionData, {}),
            stringifyJson(attachments, []),
            existingId,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO monitor_submissions (
             submission_id,
             user_id,
             election_id,
             polling_unit_code,
             scope_snapshot,
             submission_type,
             submission_data,
             attachments,
             status,
             client_submission_id
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb,$9,$10)` ,
          [
            targetSubmissionId,
            userId,
            electionId,
            pollingUnitCode,
            stringifyJson(scopeSnapshot, {}),
            MONITOR_SUBMISSION_TYPES.INCIDENT_REPORT,
            stringifyJson(submissionData, {}),
            stringifyJson(attachments, []),
            'submitted',
            clientSubmissionId || null,
          ]
        );
      }

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Incident report submitted successfully',
        data: {
          submissionId: targetSubmissionId,
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting incident report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit incident report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  },

  // ================================
  // GET SUBMISSION STATUS
  // ================================
  async getSubmissionStatus(req, res) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.id;

      const statusSummary = await monitoringService.getSubmissionStatusForUser(userId, submissionId);

      if (!statusSummary) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: statusSummary
      });

    } catch (error) {
      console.error('Error getting submission status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get submission status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ================================
  // GET USER'S SUBMISSIONS
  // ================================
  async getUserSubmissions(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const status = req.query.status || undefined;

      const { items, total } = await monitoringService.listUserSubmissions(userId, {
        page,
        limit,
        status,
      });

      res.status(200).json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
        },
      });

    } catch (error) {
      console.error('Error getting user submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get submissions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getSubmissionDetails(req, res) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.id;

      const details = await monitoringService.getSubmissionDetails(userId, submissionId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: details,
      });

    } catch (error) {
      console.error('Error getting submission details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get submission details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ================================
  // MONITORING DASHBOARD STATUS
  // ================================
  async getMonitoringStatus(req, res) {
    try {
      const userId = req.user.id;
      const status = await monitoringService.getMonitoringStatus(userId);

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Error getting monitoring status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monitoring status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getRecentSubmissions(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const submissions = await monitoringService.getRecentSubmissions(userId, limit);

      res.json({
        success: true,
        data: submissions
      });

    } catch (error) {
      console.error('Error getting recent submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent submissions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ================================
  // EVIDENCE UPLOAD
  // ================================
  async uploadEvidence(req, res) {
    try {
      // Check if user has active monitoring key
      const userId = req.user.id;
      const userCheck = await query(
        `SELECT monitor_unique_key, key_status FROM users WHERE id = $1`,
        [userId]
      );

      if (!userCheck.rows[0] || userCheck.rows[0].key_status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Active monitoring key required to upload evidence'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      // Validate file size (max 50MB for videos, 10MB for images)
      const maxSize = req.file.mimetype.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPG, PNG, MP4, MOV allowed'
        });
      }

      // Upload to S3
      const fileUrl = await uploadToS3(req.file, {
        folder: 'monitoring-evidence'
      });

      // Log the upload for audit trail
      console.log(`✅ Evidence uploaded by user ${userId}:`, {
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      });

      res.json({
        success: true,
        message: 'Evidence uploaded successfully',
        data: {
          url: fileUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error uploading evidence:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload evidence',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
