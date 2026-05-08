import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

const VALID_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
];

/* ─── In-memory cache (TTL: 5 minutes) ─── */
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map(); // key → { data, expiry }

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

/** Call this to invalidate all public leaders caches */
export function bustLeadersCache() {
  cache.clear();
}

/**
 * GET /api/public/leaders
 * Public endpoint — no auth required.
 * Supports filtering + pagination.
 *
 * Query params:
 *   designation - comma-separated (default: National Coordinator,State Coordinator)
 *   state      - filter by assignedState
 *   lga        - filter by assignedLGA
 *   page       - page number (default 1)
 *   limit      - results per page (default 50, max 100)
 */
router.get('/leaders', async (req, res) => {
  try {
    // Build cache key from query params
    const cacheKey = `leaders:${req.originalUrl}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const designationParam = req.query.designation;
    const designations = designationParam
      ? String(designationParam).split(',').map((d) => d.trim()).filter((d) => VALID_DESIGNATIONS.includes(d))
      : ['National Coordinator', 'State Coordinator'];

    if (designations.length === 0) {
      return res.json({ leaders: [], total: 0, page: 1, pages: 0 });
    }

    const state = req.query.state ? String(req.query.state) : null;
    const lga = req.query.lga ? String(req.query.lga) : null;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    // Designation filter — use ANY with array
    conditions.push(`designation = ANY($${paramIdx})`);
    params.push(designations);
    paramIdx++;

    if (state) {
      conditions.push(`"assignedState" ILIKE $${paramIdx}`);
      params.push(state);
      paramIdx++;
    }

    if (lga) {
      conditions.push(`"assignedLGA" ILIKE $${paramIdx}`);
      params.push(lga);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Data query
    const dataResult = await query(
      `SELECT id, name, phone, designation, "assignedState", "assignedLGA", "assignedWard",
              "profileImage"
       FROM users
       ${whereClause}
       ORDER BY
         CASE designation
           WHEN 'National Coordinator' THEN 1
           WHEN 'State Coordinator' THEN 2
           WHEN 'LGA Coordinator' THEN 3
           WHEN 'Ward Coordinator' THEN 4
         END,
         "assignedState" ASC NULLS FIRST,
         name ASC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    const leaders = dataResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      designation: row.designation,
      assignedState: row.assignedState,
      assignedLGA: row.assignedLGA,
      assignedWard: row.assignedWard,
      profileImage: row.profileImage,
    }));

    const response = { leaders, total, page, pages: Math.ceil(total / limit) };
    setCache(cacheKey, response);
    res.json(response);
  } catch (err) {
    console.error('Public leaders fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch leaders' });
  }
});

/**
 * GET /api/public/leaders/stats
 * Public endpoint — aggregate coordinator counts + total members.
 */
router.get('/leaders/stats', async (req, res) => {
  try {
    const cacheKey = 'leaders:stats';
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const [designationCounts, stateCoverage, memberCount] = await Promise.all([
      query(
        `SELECT designation, COUNT(*) as count
         FROM users
         WHERE designation IN ('National Coordinator', 'State Coordinator', 'LGA Coordinator', 'Ward Coordinator')
         GROUP BY designation`
      ),
      query(
        `SELECT COUNT(DISTINCT "assignedState") as states
         FROM users
         WHERE designation IN ('State Coordinator', 'LGA Coordinator', 'Ward Coordinator')
           AND "assignedState" IS NOT NULL`
      ),
      query(`SELECT COUNT(*) as total FROM users WHERE "emailVerified" = true`),
    ]);

    const byDesignation = {};
    let totalCoordinators = 0;
    for (const row of designationCounts.rows) {
      byDesignation[row.designation] = parseInt(row.count);
      totalCoordinators += parseInt(row.count);
    }

    const response = {
      totalCoordinators,
      byDesignation,
      statesWithCoordinators: parseInt(stateCoverage.rows[0]?.states || 0),
      totalMembers: parseInt(memberCount.rows[0]?.total || 0),
    };
    setCache(cacheKey, response);
    res.json(response);
  } catch (err) {
    console.error('Public leaders stats error:', err);
    res.status(500).json({ message: 'Failed to fetch leader stats' });
  }
});

export default router;
