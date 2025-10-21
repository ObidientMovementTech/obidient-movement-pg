import electionResultsService from '../services/electionResultsService.js';
import { logger } from '../middlewares/security.middleware.js';

export const electionResultsController = {
  /**
   * GET /api/election-results/live
   * Get live results for all active elections
   */
  async getLiveResults(req, res) {
    try {
      const liveResults = await electionResultsService.getAllLiveResults();

      res.status(200).json({
        success: true,
        message: 'Live results fetched successfully',
        data: liveResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching live results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live results',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/election-results/live/:electionId
   * Get live results for a specific election
   */
  async getLiveElectionResults(req, res) {
    try {
      const { electionId } = req.params;

      const [aggregatedResults, progress] = await Promise.all([
        electionResultsService.aggregateElectionResults(electionId),
        electionResultsService.getSubmissionProgress(electionId)
      ]);

      res.status(200).json({
        success: true,
        message: 'Election results fetched successfully',
        data: {
          results: aggregatedResults,
          progress
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching results for election ${req.params.electionId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch election results',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/election-results/:electionId/polling-units
   * Get all polling unit results for an election
   */
  async getElectionPollingUnitResults(req, res) {
    try {
      const { electionId } = req.params;
      const { ward, lga, state } = req.query;

      const aggregated = await electionResultsService.aggregateElectionResults(electionId);

      let pollingUnitResults = aggregated.pollingUnitResults;

      // Apply filters if provided
      if (state) {
        pollingUnitResults = pollingUnitResults.filter(pu =>
          pu.state.toLowerCase().includes(state.toLowerCase())
        );
      }
      if (lga) {
        pollingUnitResults = pollingUnitResults.filter(pu =>
          pu.lga.toLowerCase().includes(lga.toLowerCase())
        );
      }
      if (ward) {
        pollingUnitResults = pollingUnitResults.filter(pu =>
          pu.ward.toLowerCase().includes(ward.toLowerCase())
        );
      }

      res.status(200).json({
        success: true,
        message: 'Polling unit results fetched successfully',
        data: {
          electionId,
          totalPollingUnits: pollingUnitResults.length,
          pollingUnits: pollingUnitResults
        }
      });
    } catch (error) {
      logger.error(`Error fetching polling unit results for election ${req.params.electionId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch polling unit results',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/election-results/:electionId/summary
   * Get quick summary statistics for an election
   */
  async getElectionSummary(req, res) {
    try {
      const { electionId } = req.params;

      const summary = await electionResultsService.getElectionSummary(electionId);

      res.status(200).json({
        success: true,
        message: 'Election summary fetched successfully',
        data: summary
      });
    } catch (error) {
      logger.error(`Error fetching election summary for ${req.params.electionId}:`, error);

      if (error.message === 'Election not found') {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch election summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/election-results/state/:state
   * Get results for all elections in a specific state
   */
  async getResultsByState(req, res) {
    try {
      const { state } = req.params;

      const results = await electionResultsService.getResultsByState(state);

      res.status(200).json({
        success: true,
        message: `Results for ${state} fetched successfully`,
        data: results
      });
    } catch (error) {
      logger.error(`Error fetching results for state ${req.params.state}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch state results',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/election-results/recent
   * Get recent result submissions
   */
  async getRecentSubmissions(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const recentSubmissions = await electionResultsService.getRecentSubmissions(limit);

      res.status(200).json({
        success: true,
        message: 'Recent submissions fetched successfully',
        data: recentSubmissions
      });
    } catch (error) {
      logger.error('Error fetching recent submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent submissions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default electionResultsController;
