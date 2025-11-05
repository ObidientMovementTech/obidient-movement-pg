import { query } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';
import { MONITOR_SUBMISSION_TYPES } from './monitoringService.js';

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const ensureArray = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object') {
    return Object.values(value);
  }
  return [];
};

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
      const resultsQuery = `
        SELECT 
          result.submission_id,
          result.submission_data AS result_data,
          result.scope_snapshot AS result_scope,
          result.attachments AS result_attachments,
          result.created_at AS result_created_at,
          base.submission_data AS base_data,
          base.scope_snapshot AS base_scope,
          base.created_at AS base_created_at,
          u.name AS monitor_name,
          u."userName" AS monitor_username
        FROM monitor_submissions result
        LEFT JOIN monitor_submissions base
          ON base.submission_id = result.submission_id
         AND base.submission_type = $2
        LEFT JOIN users u
          ON u.id = result.user_id
        WHERE result.election_id = $1
          AND result.submission_type = $3
        ORDER BY result.created_at DESC
      `;

      const results = await query(resultsQuery, [
        electionId,
        MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO,
        MONITOR_SUBMISSION_TYPES.RESULT_TRACKING,
      ]);

      const partiesResult = await query(
        `SELECT 
           ep.party_code,
           ep.party_name,
           ep.display_name,
           ep.color,
           ep.metadata,
           COALESCE(array_remove(array_agg(DISTINCT alias.alias), NULL), ARRAY[]::text[]) AS aliases
         FROM election_parties ep
         LEFT JOIN election_party_aliases alias ON alias.party_id = ep.id
         WHERE ep.election_id = $1
         GROUP BY ep.id
         ORDER BY ep.party_code ASC`,
        [electionId]
      );

      const partyDefinitions = partiesResult.rows.map((row) => ({
        ...row,
        metadata: row.metadata || {},
        aliases: row.aliases || [],
      }));

      if (results.rows.length === 0) {
        const partyResults = partyDefinitions.map((party) => ({
          party: party.party_code,
          partyCode: party.party_code,
          partyName: party.party_name,
          displayName: party.display_name || party.party_name,
          color: party.color,
          metadata: party.metadata || {},
          aliases: party.aliases || [],
          totalVotes: 0,
          percentage: '0.00',
          pollingUnitsReported: 0,
        }));

        return {
          electionId,
          totalSubmissions: 0,
          pollingUnitResults: [],
          partyResults,
          partyDefinitions,
          leadingParty: partyResults[0] || null,
          lastUpdated: null,
          statistics: {
            totalRegisteredVoters: 0,
            totalAccreditedVoters: 0,
            totalValidVotes: 0,
            totalRejectedVotes: 0,
            totalVotesCast: 0,
            voterTurnout: 0,
          },
        };
      }

      const aliasToCode = new Map();
      partyDefinitions.forEach((party) => {
        aliasToCode.set(party.party_code.toUpperCase(), party.party_code);
        (party.aliases || []).forEach((alias) => {
          aliasToCode.set(alias.toUpperCase(), party.party_code);
        });
      });

      const partyTotals = new Map(
        partyDefinitions.map((party) => [
          party.party_code,
          {
            partyCode: party.party_code,
            partyName: party.party_name,
            displayName: party.display_name,
            color: party.color,
            metadata: party.metadata || {},
            aliases: party.aliases || [],
            totalVotes: 0,
            pollingUnits: [],
          },
        ])
      );
      let totalRegisteredVoters = 0;
      let totalAccreditedVoters = 0;
      let totalValidVotes = 0;
      let totalRejectedVotes = 0;
      let totalVotesCast = 0;

      const pollingUnitResults = results.rows.map((row) => {
        const resultData = row.result_data || {};
        const stats = resultData.stats || {};
        const baseData = row.base_data || {};
        const scope = row.result_scope || row.base_scope || {};

        const registered = toNumber(stats.registered);
        const accredited = toNumber(stats.accredited);
        const valid = toNumber(stats.valid);
        const rejected = toNumber(stats.rejected);
        const total = toNumber(stats.total);
        const votesPerParty = ensureArray(stats.votesPerParty);

        totalRegisteredVoters += registered;
        totalAccreditedVoters += accredited;
        totalValidVotes += valid;
        totalRejectedVotes += rejected;
        totalVotesCast += total;

        votesPerParty.forEach((partyVote) => {
          const partyKey = partyVote?.party || partyVote?.candidate;
          if (!partyKey) {
            return;
          }
          const partyCodeRaw = String(partyKey).trim().toUpperCase();
          const partyCode = aliasToCode.get(partyCodeRaw) || partyCodeRaw;
          let partyEntry = partyTotals.get(partyCode);
          if (!partyEntry) {
            partyEntry = {
              partyCode,
              partyName: partyCode,
              displayName: null,
              color: null,
              metadata: {},
              aliases: partyCode === partyCodeRaw ? [] : [partyKey],
              totalVotes: 0,
              pollingUnits: [],
            };
            partyTotals.set(partyCode, partyEntry);
            if (!aliasToCode.has(partyCodeRaw)) {
              aliasToCode.set(partyCodeRaw, partyCode);
            }
          }
          const votes = toNumber(partyVote?.votes);
          partyEntry.totalVotes += votes;
          partyEntry.pollingUnits.push({
            code: scope.pollingUnitCode || baseData.pollingUnitCode || null,
            name: scope.pollingUnitName || baseData.pollingUnitName || null,
            votes: partyVote?.votes ?? votes,
          });
        });

        const monitorName =
          baseData.monitorName ||
          resultData.reporterName ||
          row.monitor_name ||
          row.monitor_username ||
          null;

        return {
          submissionId: row.submission_id,
          pollingUnitCode: scope.pollingUnitCode || baseData.pollingUnitCode || null,
          pollingUnitName: scope.pollingUnitName || baseData.pollingUnitName || null,
          ward: scope.ward || baseData.wardName || null,
          lga: scope.lga || baseData.lgaName || null,
          state: scope.state || baseData.stateName || null,
          monitorName,
          registeredVoters: registered,
          accreditedVoters: accredited,
          validVotes: valid,
          rejectedVotes: rejected,
          totalVotes: total,
          votesPerParty,
          announcementTime: resultData.timeAnnounced || null,
          announcementDate: resultData.announcementDate || null,
          submittedAt: row.result_created_at,
        };
      });

      const partyResults = Array.from(partyTotals.values())
        .map((party) => ({
          party: party.partyCode,
          partyCode: party.partyCode,
          partyName: party.partyName,
          displayName: party.displayName || party.partyName || party.partyCode,
          color: party.color,
          metadata: party.metadata || {},
          aliases: party.aliases || [],
          totalVotes: party.totalVotes,
          percentage:
            totalValidVotes > 0
              ? ((party.totalVotes / totalValidVotes) * 100).toFixed(2)
              : '0.00',
          pollingUnitsReported: party.pollingUnits.length,
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes);

      const leadingParty = partyResults.length > 0 ? partyResults[0] : null;

      const voterTurnout =
        totalRegisteredVoters > 0
          ? Number(((totalVotesCast / totalRegisteredVoters) * 100).toFixed(2))
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
          voterTurnout,
        },
        partyResults,
        leadingParty,
        partyDefinitions,
        pollingUnitResults,
        lastUpdated: results.rows[0].result_created_at
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
      const totalPUsQuery = `
        SELECT COUNT(DISTINCT polling_unit_code) AS total
        FROM monitor_submissions
        WHERE election_id = $1
          AND submission_type = $2
      `;
      const totalPUs = await query(totalPUsQuery, [
        electionId,
        MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO,
      ]);

      const submittedPUsQuery = `
        SELECT COUNT(DISTINCT polling_unit_code) AS submitted
        FROM monitor_submissions
        WHERE election_id = $1
          AND submission_type = $2
      `;
      const submittedPUs = await query(submittedPUsQuery, [
        electionId,
        MONITOR_SUBMISSION_TYPES.RESULT_TRACKING,
      ]);

      const total = toNumber(totalPUs.rows[0]?.total);
      const submitted = toNumber(submittedPUs.rows[0]?.submitted);
      const percentage = total > 0 ? Number(((submitted / total) * 100).toFixed(2)) : 0;

      return {
        totalPollingUnits: total,
        submittedPollingUnits: submitted,
        pendingPollingUnits: Math.max(total - submitted, 0),
        completionPercentage: percentage
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
          result.submission_id,
          result.created_at,
          result.polling_unit_code,
          result.scope_snapshot AS result_scope,
          base.submission_data AS base_data,
          e.election_name,
          e.election_type,
          e.election_id
        FROM monitor_submissions result
        LEFT JOIN monitor_submissions base
          ON base.submission_id = result.submission_id
         AND base.submission_type = $2
        LEFT JOIN elections e
          ON e.election_id = result.election_id
        WHERE result.submission_type = $3
        ORDER BY result.created_at DESC
        LIMIT $1
      `;

      const results = await query(recentQuery, [
        limit,
        MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO,
        MONITOR_SUBMISSION_TYPES.RESULT_TRACKING,
      ]);

      return results.rows.map((row) => {
        const baseData = row.base_data || {};
        const scope = row.result_scope || {};
        return {
          submission_id: row.submission_id,
          created_at: row.created_at,
          polling_unit_code: row.polling_unit_code || scope.pollingUnitCode || baseData.pollingUnitCode || null,
          polling_unit_name: scope.pollingUnitName || baseData.pollingUnitName || null,
          lga_name: scope.lga || baseData.lgaName || null,
          state_name: scope.state || baseData.stateName || null,
          election_id: row.election_id,
          election_name: row.election_name,
          election_type: row.election_type,
        };
      });
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
        parties: aggregated.partyDefinitions,
        summary: {
          totalSubmissions: aggregated.totalSubmissions,
          statistics: aggregated.statistics,
          leadingParty: aggregated.leadingParty,
          partyResults: aggregated.partyResults,
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
