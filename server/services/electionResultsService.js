import { query } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';

export const electionResultsService = {
  /**
   * Get all active elections
   */
  async getActiveElections() {
    try {
      const result = await query(
        `SELECT * FROM elections 
         WHERE status = 'active' 
         ORDER BY election_date DESC, created_at DESC`
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching active elections:', error);
      throw error;
    }
  },

  /**
   * Aggregate results for a specific election
   */
  async aggregateElectionResults(electionId) {
    try {
      // Get all result submissions for this election
      const resultsQuery = `
        SELECT 
          rtr.id,
          rtr.submission_id,
          rtr.registered_voters,
          rtr.accredited_voters,
          rtr.valid_votes,
          rtr.rejected_votes,
          rtr.total_votes_cast,
          rtr.votes_per_party,
          rtr.announcement_time,
          rtr.created_at,
          pus.polling_unit_code,
          pus.polling_unit_name,
          pus.ward_name,
          pus.lga_name,
          pus.state_name,
          pus.monitor_name
        FROM result_tracking_reports rtr
        JOIN polling_unit_submissions pus ON rtr.submission_id = pus.submission_id
        WHERE pus.election_id = $1
        ORDER BY rtr.created_at DESC
      `;

      const results = await query(resultsQuery, [electionId]);

      if (results.rows.length === 0) {
        return {
          electionId,
          totalSubmissions: 0,
          aggregatedResults: {},
          pollingUnitResults: [],
          lastUpdated: null
        };
      }

      // Aggregate votes per party across all polling units
      const partyTotals = {};
      let totalRegisteredVoters = 0;
      let totalAccreditedVoters = 0;
      let totalValidVotes = 0;
      let totalRejectedVotes = 0;
      let totalVotesCast = 0;

      results.rows.forEach(result => {
        // Sum up totals
        totalRegisteredVoters += result.registered_voters || 0;
        totalAccreditedVoters += result.accredited_voters || 0;
        totalValidVotes += result.valid_votes || 0;
        totalRejectedVotes += result.rejected_votes || 0;
        totalVotesCast += result.total_votes_cast || 0;

        // Aggregate party votes
        if (result.votes_per_party && Array.isArray(result.votes_per_party)) {
          result.votes_per_party.forEach(partyVote => {
            const partyKey = partyVote.party || partyVote.candidate;
            if (partyKey) {
              if (!partyTotals[partyKey]) {
                partyTotals[partyKey] = {
                  party: partyKey,
                  totalVotes: 0,
                  pollingUnits: []
                };
              }
              partyTotals[partyKey].totalVotes += parseInt(partyVote.votes) || 0;
              partyTotals[partyKey].pollingUnits.push({
                code: result.polling_unit_code,
                name: result.polling_unit_name,
                votes: partyVote.votes
              });
            }
          });
        }
      });

      // Calculate percentages for each party
      const partyResults = Object.values(partyTotals).map(party => ({
        party: party.party,
        totalVotes: party.totalVotes,
        percentage: totalValidVotes > 0
          ? ((party.totalVotes / totalValidVotes) * 100).toFixed(2)
          : 0,
        pollingUnitsReported: party.pollingUnits.length
      })).sort((a, b) => b.totalVotes - a.totalVotes);

      // Get leading party
      const leadingParty = partyResults.length > 0 ? partyResults[0] : null;

      // Calculate voter turnout
      const voterTurnout = totalRegisteredVoters > 0
        ? ((totalVotesCast / totalRegisteredVoters) * 100).toFixed(2)
        : 0;

      return {
        electionId,
        totalSubmissions: results.rows.length,
        statistics: {
          totalRegisteredVoters,
          totalAccreditedVoters,
          totalValidVotes,
          totalRejectedVotes,
          totalVotesCast,
          voterTurnout: parseFloat(voterTurnout)
        },
        partyResults,
        leadingParty,
        pollingUnitResults: results.rows.map(row => ({
          submissionId: row.submission_id,
          pollingUnitCode: row.polling_unit_code,
          pollingUnitName: row.polling_unit_name,
          ward: row.ward_name,
          lga: row.lga_name,
          state: row.state_name,
          monitorName: row.monitor_name,
          registeredVoters: row.registered_voters,
          accreditedVoters: row.accredited_voters,
          validVotes: row.valid_votes,
          rejectedVotes: row.rejected_votes,
          totalVotes: row.total_votes_cast,
          votesPerParty: row.votes_per_party,
          announcementTime: row.announcement_time,
          submittedAt: row.created_at
        })),
        lastUpdated: results.rows[0].created_at
      };
    } catch (error) {
      logger.error(`Error aggregating results for election ${electionId}:`, error);
      throw error;
    }
  },

  /**
   * Get submission progress for an election
   */
  async getSubmissionProgress(electionId) {
    try {
      // Get total polling units assigned to this election
      const totalPUsQuery = `
        SELECT COUNT(DISTINCT polling_unit_code) as total
        FROM polling_unit_submissions
        WHERE election_id = $1
      `;
      const totalPUs = await query(totalPUsQuery, [electionId]);

      // Get polling units with completed results
      const submittedPUsQuery = `
        SELECT COUNT(DISTINCT pus.polling_unit_code) as submitted
        FROM polling_unit_submissions pus
        JOIN result_tracking_reports rtr ON pus.submission_id = rtr.submission_id
        WHERE pus.election_id = $1
      `;
      const submittedPUs = await query(submittedPUsQuery, [electionId]);

      const total = parseInt(totalPUs.rows[0].total) || 0;
      const submitted = parseInt(submittedPUs.rows[0].submitted) || 0;
      const percentage = total > 0 ? ((submitted / total) * 100).toFixed(2) : 0;

      return {
        totalPollingUnits: total,
        submittedPollingUnits: submitted,
        pendingPollingUnits: total - submitted,
        completionPercentage: parseFloat(percentage)
      };
    } catch (error) {
      logger.error(`Error fetching submission progress for election ${electionId}:`, error);
      throw error;
    }
  },

  /**
   * Get recent result submissions across all elections
   */
  async getRecentSubmissions(limit = 10) {
    try {
      const recentQuery = `
        SELECT 
          rtr.submission_id,
          rtr.created_at,
          pus.polling_unit_code,
          pus.polling_unit_name,
          pus.lga_name,
          pus.state_name,
          pus.election_id,
          e.election_name,
          e.election_type
        FROM result_tracking_reports rtr
        JOIN polling_unit_submissions pus ON rtr.submission_id = pus.submission_id
        LEFT JOIN elections e ON pus.election_id = e.election_id
        ORDER BY rtr.created_at DESC
        LIMIT $1
      `;

      const results = await query(recentQuery, [limit]);
      return results.rows;
    } catch (error) {
      logger.error('Error fetching recent submissions:', error);
      throw error;
    }
  },

  /**
   * Get comprehensive live results for all active elections
   */
  async getAllLiveResults() {
    try {
      const activeElections = await this.getActiveElections();

      const liveResults = await Promise.all(
        activeElections.map(async (election) => {
          const [aggregatedResults, progress] = await Promise.all([
            this.aggregateElectionResults(election.election_id),
            this.getSubmissionProgress(election.election_id)
          ]);

          return {
            election: {
              id: election.id,
              electionId: election.election_id,
              name: election.election_name,
              type: election.election_type,
              state: election.state,
              lga: election.lga,
              date: election.election_date,
              status: election.status
            },
            results: aggregatedResults,
            progress
          };
        })
      );

      return liveResults;
    } catch (error) {
      logger.error('Error fetching all live results:', error);
      throw error;
    }
  },

  /**
   * Get results by state
   */
  async getResultsByState(state) {
    try {
      const electionsQuery = `
        SELECT * FROM elections 
        WHERE state ILIKE $1 AND status IN ('active', 'completed')
        ORDER BY election_date DESC
      `;
      const elections = await query(electionsQuery, [`%${state}%`]);

      const results = await Promise.all(
        elections.rows.map(async (election) => {
          const aggregated = await this.aggregateElectionResults(election.election_id);
          return {
            election,
            results: aggregated
          };
        })
      );

      return results;
    } catch (error) {
      logger.error(`Error fetching results for state ${state}:`, error);
      throw error;
    }
  },

  /**
   * Get election summary with key statistics
   */
  async getElectionSummary(electionId) {
    try {
      // Get election details
      const electionQuery = await query(
        'SELECT * FROM elections WHERE election_id = $1',
        [electionId]
      );

      if (electionQuery.rows.length === 0) {
        throw new Error('Election not found');
      }

      const election = electionQuery.rows[0];
      const [aggregated, progress] = await Promise.all([
        this.aggregateElectionResults(electionId),
        this.getSubmissionProgress(electionId)
      ]);

      return {
        election,
        summary: {
          totalSubmissions: aggregated.totalSubmissions,
          statistics: aggregated.statistics,
          leadingParty: aggregated.leadingParty,
          progress,
          lastUpdated: aggregated.lastUpdated
        }
      };
    } catch (error) {
      logger.error(`Error fetching election summary for ${electionId}:`, error);
      throw error;
    }
  }
};

export default electionResultsService;
