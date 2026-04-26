import { pool } from '../config/db.js';

/**
 * GET /api/locations/states
 * Public — returns all states.
 */
export const getStates = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, abbreviation, source_id
       FROM nigeria_locations
       WHERE level = 'state'
       ORDER BY name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch states' });
  }
};

/**
 * GET /api/locations/states/:stateId/lgas
 * Public — returns LGAs for a state.
 */
export const getLGAsByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const id = parseInt(stateId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid state ID' });
    }

    const { rows } = await pool.query(
      `SELECT id, name, abbreviation, source_id
       FROM nigeria_locations
       WHERE level = 'lga' AND parent_id = $1
       ORDER BY name ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching LGAs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch LGAs' });
  }
};

/**
 * GET /api/locations/lgas/:lgaId/wards
 * Public — returns wards for an LGA.
 */
export const getWardsByLGA = async (req, res) => {
  try {
    const { lgaId } = req.params;
    const id = parseInt(lgaId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid LGA ID' });
    }

    const { rows } = await pool.query(
      `SELECT id, name, abbreviation, source_id
       FROM nigeria_locations
       WHERE level = 'ward' AND parent_id = $1
       ORDER BY name ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching wards:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch wards' });
  }
};

/**
 * GET /api/locations/wards/:wardId/polling-units
 * Public — returns polling units for a ward.
 */
export const getPollingUnitsByWard = async (req, res) => {
  try {
    const { wardId } = req.params;
    const id = parseInt(wardId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ward ID' });
    }

    const { rows } = await pool.query(
      `SELECT id, name, abbreviation, delimitation, remark, source_id
       FROM nigeria_locations
       WHERE level = 'polling_unit' AND parent_id = $1
       ORDER BY name ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching polling units:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch polling units' });
  }
};

/**
 * GET /api/locations/search?q=ikeja&level=lga
 * Public — search locations by name. Optional level filter.
 */
export const searchLocations = async (req, res) => {
  try {
    const { q = '', level } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const validLevels = ['state', 'lga', 'ward', 'polling_unit'];
    const params = [`%${q}%`];
    let levelFilter = '';

    if (level && validLevels.includes(level)) {
      levelFilter = ' AND l.level = $2';
      params.push(level);
    }

    const { rows } = await pool.query(
      `SELECT l.id, l.name, l.abbreviation, l.level, l.parent_id,
              p.name AS parent_name
       FROM nigeria_locations l
       LEFT JOIN nigeria_locations p ON p.id = l.parent_id
       WHERE l.name ILIKE $1${levelFilter}
       ORDER BY l.level, l.name
       LIMIT 50`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error searching locations:', err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

/**
 * GET /api/locations/:id
 * Public — returns a single location with its parent chain (breadcrumbs).
 */
export const getLocationById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    // Recursive CTE to walk up the parent chain
    const { rows } = await pool.query(
      `WITH RECURSIVE chain AS (
         SELECT id, name, abbreviation, level, parent_id, delimitation, remark, source_id
         FROM nigeria_locations WHERE id = $1
         UNION ALL
         SELECT p.id, p.name, p.abbreviation, p.level, p.parent_id, p.delimitation, p.remark, p.source_id
         FROM nigeria_locations p
         JOIN chain c ON c.parent_id = p.id
       )
       SELECT * FROM chain`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const location = rows[0];
    const breadcrumbs = rows.reverse(); // root → … → self

    res.json({ success: true, data: { location, breadcrumbs } });
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch location' });
  }
};
