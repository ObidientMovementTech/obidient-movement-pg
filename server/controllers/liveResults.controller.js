/**
 * Live Results Controller
 * Provides real-time election results with caching
 * Uses Redis for performance optimization
 */

import { query } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';
import crypto from 'crypto';

// In-memory cache fallback if Redis is not available
const memoryCache = new Map();
const CACHE_TTL = 60000; // 60 seconds in milliseconds

/**
 * Get or initialize Redis client
 * Falls back to memory cache if Redis unavailable
 */
let redisClient = null;
let useRedis = false;

const initializeCache = async () => {
  if (redisClient) return redisClient;

  try {
    // Try to import and connect to Redis
    const redis = await import('redis');
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.warn('Redis connection failed, falling back to memory cache');
            return false; // Stop retrying
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
      useRedis = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected for live results caching');
      useRedis = true;
    });

    await redisClient.connect();
    return redisClient;

  } catch (error) {
    logger.warn('Redis not available, using memory cache', { error: error.message });
    useRedis = false;
    return null;
  }
};

/**
 * Get cached data
 */
const getFromCache = async (key) => {
  if (useRedis && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error', { key, error: error.message });
      return null;
    }
  }

  // Memory cache fallback
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

/**
 * Set cached data with TTL
 */
const setInCache = async (key, data, ttlSeconds = 60) => {
  if (useRedis && redisClient) {
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      logger.error('Redis set error', { key, error: error.message });
    }
  }

  // Always update memory cache as fallback
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Generate ETag from data
 */
const generateETag = (data) => {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
};

/**
 * Aggregate live results for an election
 */
const aggregateLiveResults = async (electionId) => {
  // Fetch election details
  const electionResult = await query(
    `SELECT election_id, election_name, election_type, 
            state, lga, election_date, status
     FROM elections 
     WHERE election_id = $1`,
    [electionId]
  );

  if (electionResult.rows.length === 0) {
    return null;
  }

  const election = electionResult.rows[0];

  // Fetch party definitions with aliases
  const partiesResult = await query(
    `SELECT 
       ep.id,
       ep.party_code,
       ep.party_name,
       ep.display_name,
       ep.color,
       ep.display_order,
       ep.metadata,
       COALESCE(
         (SELECT array_agg(alias ORDER BY alias)
          FROM election_party_aliases
          WHERE party_id = ep.id),
         ARRAY[]::varchar[]
       ) as aliases
     FROM election_parties ep
     WHERE ep.election_id = $1
     ORDER BY ep.display_order NULLS LAST, ep.party_name`,
    [electionId]
  );

  // Fetch result submissions
  const resultsQuery = `
    SELECT 
      ms.id,
      ms.submission_id,
      ms.polling_unit_code,
      ms.scope_snapshot,
      ms.submission_data,
      ms.created_at,
      ms.updated_at
    FROM monitor_submissions ms
    WHERE ms.election_id = $1
      AND ms.submission_type = 'result_tracking'
      AND ms.status = 'submitted'
    ORDER BY ms.created_at DESC
  `;

  const resultsData = await query(resultsQuery, [electionId]);

  // Build alias-to-code mapping
  const aliasToCode = new Map();
  const partyMap = new Map();

  partiesResult.rows.forEach((party) => {
    const code = party.party_code.toUpperCase();
    aliasToCode.set(code, code);
    partyMap.set(code, {
      partyCode: code,
      partyName: party.party_name,
      displayName: party.display_name,
      color: party.color,
      displayOrder: party.display_order,
      metadata: party.metadata || {},
      aliases: party.aliases || [],
      totalVotes: 0,
      pollingUnitsReported: 0
    });

    // Map aliases
    (party.aliases || []).forEach((alias) => {
      aliasToCode.set(alias.toUpperCase(), code);
    });
  });

  // Process submissions
  const pollingUnitsReported = new Set();
  let totalRegisteredVoters = 0;
  let totalAccreditedVoters = 0;
  let totalValidVotes = 0;
  let totalRejectedVotes = 0;
  let totalVotesCast = 0;

  resultsData.rows.forEach((row) => {
    const data = row.submission_data || {};
    const stats = data.stats || {};
    const scope = row.scope_snapshot || {};

    // Track unique polling units
    const puCode = row.polling_unit_code || scope.pollingUnitCode;
    if (puCode) {
      pollingUnitsReported.add(puCode);
    }

    // Aggregate totals
    totalRegisteredVoters += parseInt(stats.registeredVoters || 0, 10);
    totalAccreditedVoters += parseInt(stats.accreditedVoters || 0, 10);
    totalValidVotes += parseInt(stats.validVotes || 0, 10);
    totalRejectedVotes += parseInt(stats.rejectedVotes || 0, 10);
    totalVotesCast += parseInt(stats.totalVotesCast || 0, 10);

    // Process party votes
    const votesPerParty = stats.votesPerParty || [];
    votesPerParty.forEach((vote) => {
      const partyKey = String(vote.party || vote.candidate || '').trim().toUpperCase();
      if (!partyKey) return;

      const partyCode = aliasToCode.get(partyKey) || partyKey;
      const votes = parseInt(vote.votes || 0, 10);

      let partyEntry = partyMap.get(partyCode);
      if (!partyEntry) {
        // Unknown party not in definitions
        partyEntry = {
          partyCode,
          partyName: partyCode,
          displayName: null,
          color: null,
          displayOrder: null,
          metadata: {},
          aliases: [],
          totalVotes: 0,
          pollingUnitsReported: 0
        };
        partyMap.set(partyCode, partyEntry);
      }

      partyEntry.totalVotes += votes;
      partyEntry.pollingUnitsReported = pollingUnitsReported.size;
    });
  });

  // Convert party map to sorted array
  const partyResults = Array.from(partyMap.values())
    .sort((a, b) => {
      // Sort by display order first, then by votes
      if (a.displayOrder !== null && b.displayOrder !== null) {
        return a.displayOrder - b.displayOrder;
      }
      if (a.displayOrder !== null) return -1;
      if (b.displayOrder !== null) return 1;
      return b.totalVotes - a.totalVotes;
    });

  // Calculate percentages
  const totalValidVotesForPercentage = totalValidVotes || 1; // Avoid division by zero
  partyResults.forEach((party) => {
    party.percentage = ((party.totalVotes / totalValidVotesForPercentage) * 100).toFixed(2);
  });

  return {
    election: {
      electionId: election.election_id,
      electionName: election.election_name,
      electionType: election.election_type,
      state: election.state,
      lga: election.lga,
      electionDate: election.election_date,
      status: election.status
    },
    summary: {
      pollingUnitsReported: pollingUnitsReported.size,
      totalRegisteredVoters,
      totalAccreditedVoters,
      totalValidVotes,
      totalRejectedVotes,
      totalVotesCast,
      voterTurnout: totalRegisteredVoters > 0
        ? ((totalVotesCast / totalRegisteredVoters) * 100).toFixed(2)
        : '0.00'
    },
    parties: partyResults,
    lastUpdated: new Date().toISOString(),
    submissionsCount: resultsData.rows.length
  };
};

/**
 * GET /elections/:electionId/live-summary
 * Returns cached live results with ETag support
 */
export const getLiveSummary = async (req, res) => {
  try {
    await initializeCache();

    const { electionId } = req.params;
    const cacheKey = `live-results:${electionId}`;

    // Check if client sent If-None-Match (ETag)
    const clientETag = req.headers['if-none-match'];

    // Try to get from cache
    let results = await getFromCache(cacheKey);

    if (!results) {
      // Cache miss - aggregate from database
      logger.info('Cache miss - aggregating live results', { electionId });

      results = await aggregateLiveResults(electionId);

      if (!results) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      // Store in cache
      await setInCache(cacheKey, results, 60); // 60 seconds TTL
    } else {
      logger.debug('Cache hit for live results', { electionId });
    }

    // Generate ETag
    const etag = generateETag(results);

    // Check if client's cached version is still valid
    if (clientETag === etag) {
      return res.status(304).send(); // Not Modified
    }

    // Set cache headers
    res.set({
      'ETag': etag,
      'Cache-Control': 'public, max-age=60', // Client can cache for 60 seconds
      'Last-Modified': new Date(results.lastUpdated).toUTCString()
    });

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Error fetching live summary', {
      electionId: req.params.electionId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch live results',
      error: error.message
    });
  }
};

/**
 * POST /elections/:electionId/invalidate-cache
 * Admin endpoint to manually invalidate cache
 */
export const invalidateCache = async (req, res) => {
  try {
    await initializeCache();

    const { electionId } = req.params;
    const cacheKey = `live-results:${electionId}`;

    if (useRedis && redisClient) {
      await redisClient.del(cacheKey);
    }

    memoryCache.delete(cacheKey);

    logger.info('Live results cache invalidated', { electionId });

    res.json({
      success: true,
      message: 'Cache invalidated successfully'
    });

  } catch (error) {
    logger.error('Error invalidating cache', {
      electionId: req.params.electionId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
      error: error.message
    });
  }
};

export default {
  getLiveSummary,
  invalidateCache
};
