import { query, getClient } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { monitoringService } from '../services/monitoringService.js';

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
        locationOther
      } = req.body;

      // Validate required fields
      if (!electionId || !puCode || !puName || !ward || !lga || !state) {
        return res.status(400).json({
          success: false,
          message: 'Missing required polling unit information'
        });
      }

      // Check if user has active monitoring key
      const userCheck = await client.query(
        `SELECT monitor_unique_key, key_status FROM users WHERE id = $1`,
        [userId]
      );

      if (!userCheck.rows[0] || userCheck.rows[0].key_status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Active monitoring key required'
        });
      }

      // Generate unique submission ID
      const submissionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Insert polling unit information
      const puResult = await client.query(`
        INSERT INTO polling_unit_submissions (
          submission_id, monitor_user_id, election_id, polling_unit_code, polling_unit_name, 
          ward_name, lga_name, state_name, gps_coordinates, location_type, location_other,
          monitor_name, monitor_phone, monitor_email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING submission_id
      `, [
        submissionId, userId, electionId, puCode, puName, ward, lga, state,
        gpsCoordinates, locationType, locationOther,
        'Monitor', '', '' // Use simple defaults since we have monitor_user_id
      ]);

      const finalSubmissionId = puResult.rows[0].submission_id;

      // TODO: Add submission status tracking later when schema is confirmed
      // For now, just return success with the submission ID

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Polling unit information saved successfully',
        data: {
          submissionId: finalSubmissionId
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
        securityPresent
      } = req.body;

      // Validate submission exists and belongs to user
      const submissionCheck = await client.query(
        'SELECT id FROM polling_unit_submissions WHERE submission_id = $1 AND monitor_user_id = $2',
        [submissionId, req.user.id]
      );

      if (submissionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or access denied'
        });
      }

      // Insert or update officer arrival report
      await client.query(`
        INSERT INTO officer_arrival_reports (
          submission_id, first_arrival_time, last_arrival_time, on_time_status,
          proof_types, arrival_proof_media, arrival_notes, officer_names,
          uniforms_proper, impersonators, voting_started, actual_start_time,
          materials_present, security_present
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (submission_id)
        DO UPDATE SET 
          first_arrival_time = EXCLUDED.first_arrival_time,
          last_arrival_time = EXCLUDED.last_arrival_time,
          on_time_status = EXCLUDED.on_time_status,
          proof_types = EXCLUDED.proof_types,
          arrival_proof_media = EXCLUDED.arrival_proof_media,
          arrival_notes = EXCLUDED.arrival_notes,
          officer_names = EXCLUDED.officer_names,
          uniforms_proper = EXCLUDED.uniforms_proper,
          impersonators = EXCLUDED.impersonators,
          voting_started = EXCLUDED.voting_started,
          actual_start_time = EXCLUDED.actual_start_time,
          materials_present = EXCLUDED.materials_present,
          security_present = EXCLUDED.security_present,
          updated_at = CURRENT_TIMESTAMP
      `, [
        submissionId, firstArrivalTime, lastArrivalTime, onTimeStatus,
        proofTypes, arrivalProofMedia, arrivalNotes, JSON.stringify(officerNames),
        uniformsProper, impersonators, votingStarted, actualStartTime,
        materialsPresent, securityPresent
      ]);

      // Update submission status
      await client.query(`
        UPDATE submission_status 
        SET officer_arrival_completed = true,
            completion_percentage = GREATEST(completion_percentage, 50),
            updated_at = CURRENT_TIMESTAMP
        WHERE submission_id = $1
      `, [submissionId]);

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
        notes
      } = req.body;

      // Validate submission exists and belongs to user
      const submissionCheck = await client.query(
        'SELECT id FROM polling_unit_submissions WHERE submission_id = $1 AND monitor_user_id = $2',
        [submissionId, req.user.id]
      );

      if (submissionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or access denied'
        });
      }

      // Insert or update result tracking
      await client.query(`
        INSERT INTO result_tracking_reports (
          submission_id, officer_name, result_announcer_photo, party_agents,
          reporter_name, reporter_phone, announcement_date, time_announced,
          registered_voters, accredited_voters, valid_votes, rejected_votes,
          total_votes, votes_per_party, discrepancies, signed_by_agents,
          agents_signed_count, result_posted, bvas_seen, ec8a_photo,
          announcement_video, wall_photo, reporter_selfie, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (submission_id)
        DO UPDATE SET 
          officer_name = EXCLUDED.officer_name,
          result_announcer_photo = EXCLUDED.result_announcer_photo,
          party_agents = EXCLUDED.party_agents,
          reporter_name = EXCLUDED.reporter_name,
          reporter_phone = EXCLUDED.reporter_phone,
          announcement_date = EXCLUDED.announcement_date,
          time_announced = EXCLUDED.time_announced,
          registered_voters = EXCLUDED.registered_voters,
          accredited_voters = EXCLUDED.accredited_voters,
          valid_votes = EXCLUDED.valid_votes,
          rejected_votes = EXCLUDED.rejected_votes,
          total_votes = EXCLUDED.total_votes,
          votes_per_party = EXCLUDED.votes_per_party,
          discrepancies = EXCLUDED.discrepancies,
          signed_by_agents = EXCLUDED.signed_by_agents,
          agents_signed_count = EXCLUDED.agents_signed_count,
          result_posted = EXCLUDED.result_posted,
          bvas_seen = EXCLUDED.bvas_seen,
          ec8a_photo = EXCLUDED.ec8a_photo,
          announcement_video = EXCLUDED.announcement_video,
          wall_photo = EXCLUDED.wall_photo,
          reporter_selfie = EXCLUDED.reporter_selfie,
          notes = EXCLUDED.notes,
          updated_at = CURRENT_TIMESTAMP
      `, [
        submissionId, officerName, resultAnnouncerPhoto, JSON.stringify(partyAgents),
        reporterName, reporterPhone, date, timeAnnounced,
        stats?.registered, stats?.accredited, stats?.valid, stats?.rejected,
        stats?.total, JSON.stringify(stats?.votesPerParty), discrepancies,
        signedByAgents, agentsSignedCount, resultPosted, bvasSeen,
        evidence?.ec8aPhoto, evidence?.announcementVideo, evidence?.wallPhoto,
        evidence?.reporterSelfie, notes
      ]);

      // Update submission status
      await client.query(`
        UPDATE submission_status 
        SET result_tracking_completed = true,
            completion_percentage = GREATEST(completion_percentage, 75),
            updated_at = CURRENT_TIMESTAMP
        WHERE submission_id = $1
      `, [submissionId]);

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
        escalation
      } = req.body;

      // Validate submission exists and belongs to user (if provided)
      if (submissionId) {
        const submissionCheck = await client.query(
          'SELECT id FROM polling_unit_submissions WHERE submission_id = $1 AND monitor_user_id = $2',
          [submissionId, req.user.id]
        );

        if (submissionCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Submission not found or access denied'
          });
        }
      }

      // Insert incident report
      await client.query(`
        INSERT INTO incident_reports (
          submission_id, officer_name_or_id, incident_date, incident_start_time,
          incident_end_time, capture_method, conditions, irregularities, narrative,
          perpetrators, victims, officials_present, photo_count, video_count,
          has_phone_footage, media_filenames, has_metadata, witnesses,
          reported_to, escalation_details, intervention_made, outcome, logged_by_inec
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      `, [
        submissionId, officerNameOrId, incidentDate, incidentStart, incidentEnd,
        captureMethod, conditions, irregularities, narrative, perpetrators,
        victims, officialsPresent, evidence?.photoCount, evidence?.videoCount,
        evidence?.hasPhoneFootage, evidence?.mediaFilenames, evidence?.hasMetadata,
        JSON.stringify(witnesses), escalation?.reportedTo, escalation?.details,
        escalation?.interventionMade, escalation?.outcome, escalation?.loggedByINEC
      ]);

      // Update submission status if linked to a submission
      if (submissionId) {
        await client.query(`
          UPDATE submission_status 
          SET incident_report_completed = true,
              completion_percentage = 100,
              status = 'completed',
              updated_at = CURRENT_TIMESTAMP
          WHERE submission_id = $1
        `, [submissionId]);
      }

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Incident report submitted successfully'
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

      const result = await query(`
        SELECT 
          ss.*,
          pu.pu_code,
          pu.pu_name,
          pu.ward,
          pu.lga,
          pu.state,
          pu.election_id
        FROM submission_status ss
        JOIN polling_unit_submissions pu ON ss.submission_id = pu.submission_id
        WHERE ss.submission_id = $1 AND pu.monitor_user_id = $2
      `, [submissionId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
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
      const { page = 1, limit = 10, status } = req.query;

      let whereClause = 'WHERE pu.monitor_user_id = $1';
      let queryParams = [userId];

      if (status) {
        whereClause += ' AND ss.status = $2';
        queryParams.push(status);
      }

      const result = await query(`
        SELECT 
          pu.submission_id,
          pu.pu_code,
          pu.pu_name,
          pu.ward,
          pu.lga,
          pu.state,
          pu.election_id,
          pu.created_at,
          ss.status,
          ss.completion_percentage,
          ss.pu_info_completed,
          ss.officer_arrival_completed,
          ss.result_tracking_completed,
          ss.incident_report_completed
        FROM polling_unit_submissions pu
        LEFT JOIN submission_status ss ON pu.submission_id = ss.submission_id
        ${whereClause}
        ORDER BY pu.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `, [...queryParams, limit, (page - 1) * limit]);

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.rows.length
        }
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
  }
};
