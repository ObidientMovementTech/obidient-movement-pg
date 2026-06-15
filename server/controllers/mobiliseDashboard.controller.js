import { query } from '../config/db.js';
import { getObidientVotersByState } from '../services/obidientVotersService.js';

/**
 * Helper function to convert location name to URL-friendly slug
 * e.g., "Aba North" -> "aba-north"
 */
const toSlug = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-').trim();
};

/**
 * Helper function to convert slug back to proper title case
 * e.g., "aba-north" -> "Aba North"
 */
const fromSlug = (slug) => {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Helper function to normalize location names for comparison
 * Handles both slug format and title case
 */
const normalizeLocationName = (name) => {
  if (!name) return '';
  // Convert to lowercase and replace spaces/hyphens with a consistent separator
  return name.toLowerCase().replace(/[\s\-]+/g, '-').trim();
};

/**
 * Helper function to check if two location names match
 * Accounts for different formats (slug vs title case)
 */
const locationNamesMatch = (name1, name2) => {
  if (!name1 || !name2) return false;
  return normalizeLocationName(name1) === normalizeLocationName(name2);
};

/** Empty stats object for when no data exists yet */
const EMPTY_STATS = {
  obidientRegisteredVoters: 0,
  obidientVotersWithPVC: 0,
  obidientVotersWithoutPVC: 0,
  pvcWithStatus: 0,
  pvcWithoutStatus: 0
};


/**
 * Get user's designation level and assigned location
 * This determines what initial data they should see
 */
export const getUserLevel = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get user's designation and assignment details using direct query
    const userQuery = `
      SELECT designation, "assignedState", "assignedLGA", "assignedWard", role
      FROM users 
      WHERE id = $1
    `;

    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const { designation, assignedState, assignedLGA, assignedWard, role } = user;

    

    // Determine user's access level and assigned location
    let userLevel = 'national'; // default
    let assignedLocation = null;
    let allowedLevels = ['national'];

    // Admin users get full national access regardless of designation
    if (role === 'admin') {
      userLevel = 'national';
      allowedLevels = ['national', 'state', 'lga', 'ward', 'pu'];
    } else {
      // Regular users get access based on their designation
      switch (designation) {
        case 'National Coordinator':
          userLevel = 'national';
          allowedLevels = ['national', 'state', 'lga', 'ward', 'pu'];
          break;
        case 'State Coordinator':
          userLevel = 'state';
          assignedLocation = {
            stateId: toSlug(assignedState),
            stateName: fromSlug(assignedState) || assignedState
          };
          allowedLevels = ['state', 'lga', 'ward', 'pu'];
          break;
        case 'LGA Coordinator':
          userLevel = 'lga';
          assignedLocation = {
            stateId: toSlug(assignedState),
            stateName: fromSlug(assignedState) || assignedState,
            lgaId: assignedLGA, // Keep original format for comparison
            lgaName: fromSlug(assignedLGA) || assignedLGA,
            lgaSlug: toSlug(assignedLGA) // Add slug version for URL construction
          };
          allowedLevels = ['lga', 'ward', 'pu'];
          break;
        case 'Ward Coordinator':
          userLevel = 'ward';
          assignedLocation = {
            stateId: toSlug(assignedState),
            stateName: fromSlug(assignedState) || assignedState,
            lgaId: assignedLGA, // Keep original format for comparison
            lgaName: fromSlug(assignedLGA) || assignedLGA,
            lgaSlug: toSlug(assignedLGA),
            wardId: assignedWard, // Keep original format for comparison
            wardName: fromSlug(assignedWard) || assignedWard,
            wardSlug: toSlug(assignedWard) // Add slug version for URL construction
          };
          allowedLevels = ['ward', 'pu'];
          break;
        default:
          userLevel = 'national';
      }
    }

    res.json({
      success: true,
      data: {
        userLevel,
        assignedLocation,
        allowedLevels,
        designation: designation,
        role: role
      }
    });

  } catch (error) {
    console.error('Error getting user level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user level',
      error: error.message
    });
  }
};

/**
 * Get National level dashboard data - all states
 */
export const getNationalData = async (req, res) => {
  try {
    // Check if user has access to national data using direct query
    const userId = req.user.userId || req.user.id;
    const userQuery = `
      SELECT designation, role FROM users WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { designation, role } = userResult.rows[0];

    // Allow National Coordinators and Admin users to access national data
    if (designation !== 'National Coordinator' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. National data requires National Coordinator role or admin privileges.'
      });
    }

    // Get all states data with reconciled PVC math
    const votersData = await getObidientVotersByState();

    const statesData = votersData.map(stateData => {
      const totalObidient = stateData.totalObidientUsers || 0;
      const votersWithPVC = stateData.votersWithPVC || 0;
      // Reconcile: without = total - with (guarantees donut adds up)
      const votersWithoutPVC = totalObidient - votersWithPVC;

      return {
        id: stateData.state.toLowerCase().replace(/\s+/g, '-'),
        name: stateData.state,
        code: stateData.state.substring(0, 2).toUpperCase(),
        level: 'state',
        obidientRegisteredVoters: totalObidient,
        obidientVotersWithPVC: votersWithPVC,
        obidientVotersWithoutPVC: votersWithoutPVC,
        pvcWithStatus: votersWithPVC,
        pvcWithoutStatus: votersWithoutPVC
      };
    });

    // Calculate national totals
    const nationalStats = statesData.reduce((acc, state) => ({
      obidientRegisteredVoters: acc.obidientRegisteredVoters + state.obidientRegisteredVoters,
      obidientVotersWithPVC: acc.obidientVotersWithPVC + state.obidientVotersWithPVC,
      obidientVotersWithoutPVC: acc.obidientVotersWithoutPVC + state.obidientVotersWithoutPVC,
      pvcWithStatus: acc.pvcWithStatus + state.pvcWithStatus,
      pvcWithoutStatus: acc.pvcWithoutStatus + state.pvcWithoutStatus
    }), {
      obidientRegisteredVoters: 0,
      obidientVotersWithPVC: 0,
      obidientVotersWithoutPVC: 0,
      pvcWithStatus: 0,
      pvcWithoutStatus: 0
    });

    // Count users with no votingState at all (invisible across all states)
    const noStateResult = await query(`
      SELECT COUNT(*) AS n FROM users
      WHERE "votingState" IS NULL OR "votingState" = ''
    `);
    const unassignedCount = parseInt(noStateResult.rows[0]?.n) || 0;
    nationalStats.unassignedCount = unassignedCount;
    nationalStats.unassignedLabel = 'No State Set';

    res.json({
      success: true,
      data: {
        level: 'national',
        stats: nationalStats,
        items: statesData,
        breadcrumbs: [{ level: 'national', name: 'National Overview' }]
      }
    });

  } catch (error) {
    console.error('Error getting national data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get national data',
      error: error.message
    });
  }
};

/**
 * Get State level dashboard data - all LGAs in a state
 */
export const getStateData = async (req, res) => {
  try {
    const { stateId } = req.params;

    // Resolve slug to canonical UPPERCASE state name from nigeria_locations
    const statesResult = await query(`SELECT name FROM nigeria_locations WHERE level='state' ORDER BY name`);
    let stateName = null;
    for (const r of statesResult.rows) {
      if (toSlug(r.name) === stateId) { stateName = r.name; break; }
    }
    if (!stateName) stateName = fromSlug(stateId).toUpperCase();

    // Check if user has access to this state using direct query
    const userId = req.user.userId || req.user.id;
    const userQuery = `
      SELECT designation, "assignedState", role FROM users WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { designation, assignedState, role } = userResult.rows[0];

    // Allow admin users full access
    if (role !== 'admin') {
      // For non-admin users, check specific access permissions
      if (designation === 'State Coordinator' && !locationNamesMatch(assignedState, stateName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You can only view data for your assigned state. Your assigned: "${assignedState}", Requested: "${stateName}"`
        });
      }
      if (designation === 'LGA Coordinator' && !locationNamesMatch(assignedState, stateName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You can only view data for your assigned state. Your assigned: "${assignedState}", Requested: "${stateName}"`
        });
      }
      if (designation === 'Ward Coordinator' && !locationNamesMatch(assignedState, stateName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You can only view data for your assigned state. Your assigned: "${assignedState}", Requested: "${stateName}"`
        });
      }
    }

    // Direct scoped query — only fetch LGAs for this state
    const lgaQuery = `
      SELECT 
        "votingLGA" as lga,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" IS NOT NULL AND "votingLGA" != ''
      GROUP BY "votingLGA"
      ORDER BY "votingLGA"
    `;
    const lgaResult = await query(lgaQuery, [stateName]);

    // Direct headline total for this state (matches national path exactly)
    const headlineQuery = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS with_pvc,
        COUNT(*) FILTER (WHERE "votingLGA" IS NULL OR "votingLGA" = '') AS unassigned_lga
      FROM users
      WHERE "votingState" = $1
    `;
    const headlineResult = await query(headlineQuery, [stateName]);
    const headline = headlineResult.rows[0] || { total: '0', with_pvc: '0', unassigned_lga: '0' };
    const headlineTotal = parseInt(headline.total) || 0;
    const headlineWithPVC = parseInt(headline.with_pvc) || 0;
    const unassignedLGA = parseInt(headline.unassigned_lga) || 0;

    // Check for cross-state LGAs (LGA doesn't belong to this state in nigeria_locations)
    const validLgasResult = await query(
      `SELECT l.name FROM nigeria_locations l
       JOIN nigeria_locations s ON l.parent_id = s.id AND s.level='state' AND s.name = $1
       WHERE l.level='lga'`,
      [stateName]
    );
    const validLgaNames = new Set(validLgasResult.rows.map(r => r.name));

    if (lgaResult.rows.length === 0 && unassignedLGA === 0) {
      console.log(`⚠️ No voter data yet for state: ${stateName} — returning empty dashboard`);
      return res.json({
        success: true,
        data: {
          level: 'state',
          stats: { ...EMPTY_STATS },
          items: [],
          breadcrumbs: [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: stateName, id: stateId }
          ]
        }
      });
    }

    const lgasData = lgaResult.rows.map(row => {
      const total = parseInt(row.total) || 0;
      const withPvc = parseInt(row.with_pvc) || 0;
      const withoutPvc = total - withPvc; // Reconciled
      const isInvalidLocation = !validLgaNames.has(row.lga);
      return {
        id: `${stateId}-${toSlug(row.lga)}`,
        name: row.lga,
        code: row.lga.substring(0, 3).toUpperCase(),
        level: 'lga',
        stateId,
        stateName,
        obidientRegisteredVoters: total,
        obidientVotersWithPVC: withPvc,
        obidientVotersWithoutPVC: withoutPvc,
        pvcWithStatus: withPvc,
        pvcWithoutStatus: withoutPvc,
        ...(isInvalidLocation && { isInvalidLocation: true })
      };
    });

    // Append synthetic "Unassigned LGA" row if any exist
    if (unassignedLGA > 0) {
      const unassignedPvcResult = await query(
        `SELECT COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS with_pvc
         FROM users WHERE "votingState" = $1 AND ("votingLGA" IS NULL OR "votingLGA" = '')`,
        [stateName]
      );
      const unassignedWithPvc = parseInt(unassignedPvcResult.rows[0]?.with_pvc) || 0;
      lgasData.push({
        id: `${stateId}-unassigned`,
        name: 'Unassigned LGA',
        code: '—',
        level: 'lga',
        stateId,
        stateName,
        obidientRegisteredVoters: unassignedLGA,
        obidientVotersWithPVC: unassignedWithPvc,
        obidientVotersWithoutPVC: unassignedLGA - unassignedWithPvc,
        pvcWithStatus: unassignedWithPvc,
        pvcWithoutStatus: unassignedLGA - unassignedWithPvc,
        isUnassigned: true
      });
    }

    // State stats use the direct headline (reconciled, never drifts from national)
    const stateStats = {
      obidientRegisteredVoters: headlineTotal,
      obidientVotersWithPVC: headlineWithPVC,
      obidientVotersWithoutPVC: headlineTotal - headlineWithPVC,
      pvcWithStatus: headlineWithPVC,
      pvcWithoutStatus: headlineTotal - headlineWithPVC,
      unassignedCount: unassignedLGA,
      unassignedLabel: 'No LGA Set'
    };

    res.json({
      success: true,
      data: {
        level: 'state',
        stats: stateStats,
        items: lgasData,
        breadcrumbs: [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: stateName, id: stateId }
        ]
      }
    });

  } catch (error) {
    console.error('Error getting state data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get state data',
      error: error.message
    });
  }
};

/**
 * Get LGA level dashboard data - all Wards in an LGA
 */
export const getLGAData = async (req, res) => {
  try {
    const { lgaId } = req.params;

    // Resolve the composite slug (e.g. "cross-river-calabar-municipality") by
    // matching against known states in nigeria_locations
    const statesResult = await query(`SELECT DISTINCT name FROM nigeria_locations WHERE level='state' ORDER BY name`);
    const stateNames = statesResult.rows.map(r => r.name);

    let stateId, stateName, lgaSlugPart, lgaName;
    let foundMatch = false;
    for (const sName of stateNames) {
      const slug = toSlug(sName);
      if (lgaId.startsWith(slug + '-')) {
        stateId = slug;
        stateName = sName;
        lgaSlugPart = lgaId.substring(slug.length + 1);
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      const parts = lgaId.split('-');
      stateId = parts[0];
      stateName = fromSlug(stateId).toUpperCase();
      lgaSlugPart = lgaId.replace(`${stateId}-`, '');
    }

    // Resolve the LGA name from the slug by matching against known LGAs in that state
    const lgasLookup = await query(
      `SELECT nl.name FROM nigeria_locations nl
       JOIN nigeria_locations s ON nl.parent_id = s.id AND s.level='state' AND s.name = $1
       WHERE nl.level='lga' ORDER BY nl.name`,
      [stateName]
    );
    const knownLgas = lgasLookup.rows.map(r => r.name);

    lgaName = null;
    for (const name of knownLgas) {
      if (toSlug(name) === lgaSlugPart) {
        lgaName = name;
        break;
      }
    }
    if (!lgaName) {
      // Fallback: title-case the slug
      lgaName = fromSlug(lgaSlugPart).toUpperCase();
    }

    // Check if user has access to this LGA using direct query
    const userId = req.user.userId || req.user.id;
    const userQuery = `
      SELECT designation, "assignedLGA", "assignedState", role FROM users WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { designation, assignedLGA, assignedState, role } = userResult.rows[0];

    // Allow admin users full access
    if (role !== 'admin') {
      if ((designation === 'LGA Coordinator' || designation === 'Ward Coordinator') &&
          !locationNamesMatch(assignedState, stateName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. State mismatch. Your assigned: "${assignedState}", Requested: "${stateName}"`
        });
      }
      if ((designation === 'LGA Coordinator' || designation === 'Ward Coordinator') &&
          !locationNamesMatch(assignedLGA, lgaName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. LGA mismatch. Your assigned: "${assignedLGA}", Requested: "${lgaName}"`
        });
      }
    }

    // Direct scoped query — only fetch wards for this state+LGA
    const wardQuery = `
      SELECT
        "votingWard" as ward,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2
        AND "votingWard" IS NOT NULL AND "votingWard" != ''
      GROUP BY "votingWard"
      ORDER BY "votingWard"
    `;
    const wardResult = await query(wardQuery, [stateName, lgaName]);

    // Direct headline total for this LGA (matches state-level count for this LGA exactly)
    const headlineQuery = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS with_pvc,
        COUNT(*) FILTER (WHERE "votingWard" IS NULL OR "votingWard" = '') AS unassigned_ward
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2
    `;
    const headlineResult = await query(headlineQuery, [stateName, lgaName]);
    const headline = headlineResult.rows[0] || { total: '0', with_pvc: '0', unassigned_ward: '0' };
    const headlineTotal = parseInt(headline.total) || 0;
    const headlineWithPVC = parseInt(headline.with_pvc) || 0;
    const unassignedWard = parseInt(headline.unassigned_ward) || 0;

    if (wardResult.rows.length === 0 && unassignedWard === 0) {
      console.log(`⚠️ No voter data yet for LGA: ${lgaName} in state: ${stateName} — returning empty dashboard`);
      return res.json({
        success: true,
        data: {
          level: 'lga',
          stats: { ...EMPTY_STATS },
          items: [],
          breadcrumbs: [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: stateName, id: stateId },
            { level: 'lga', name: lgaName, id: lgaId }
          ]
        }
      });
    }

    const wardsData = wardResult.rows.map(row => {
      const total = parseInt(row.total) || 0;
      const withPvc = parseInt(row.with_pvc) || 0;
      const withoutPvc = total - withPvc; // Reconciled
      return {
        id: `${lgaId}-${toSlug(row.ward)}`,
        name: row.ward,
        code: row.ward.substring(0, 3).toUpperCase(),
        level: 'ward',
        lgaId,
        lgaName,
        stateId,
        stateName,
        obidientRegisteredVoters: total,
        obidientVotersWithPVC: withPvc,
        obidientVotersWithoutPVC: withoutPvc,
        pvcWithStatus: withPvc,
        pvcWithoutStatus: withoutPvc
      };
    });

    // Append synthetic "Unassigned Ward" row if any exist
    if (unassignedWard > 0) {
      const unassignedPvcResult = await query(
        `SELECT COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS with_pvc
         FROM users WHERE "votingState" = $1 AND "votingLGA" = $2 AND ("votingWard" IS NULL OR "votingWard" = '')`,
        [stateName, lgaName]
      );
      const unassignedWithPvc = parseInt(unassignedPvcResult.rows[0]?.with_pvc) || 0;
      wardsData.push({
        id: `${lgaId}-unassigned`,
        name: 'Unassigned Ward',
        code: '—',
        level: 'ward',
        lgaId,
        lgaName,
        stateId,
        stateName,
        obidientRegisteredVoters: unassignedWard,
        obidientVotersWithPVC: unassignedWithPvc,
        obidientVotersWithoutPVC: unassignedWard - unassignedWithPvc,
        pvcWithStatus: unassignedWithPvc,
        pvcWithoutStatus: unassignedWard - unassignedWithPvc,
        isUnassigned: true
      });
    }

    // LGA stats use the direct headline (reconciled)
    const lgaStats = {
      obidientRegisteredVoters: headlineTotal,
      obidientVotersWithPVC: headlineWithPVC,
      obidientVotersWithoutPVC: headlineTotal - headlineWithPVC,
      pvcWithStatus: headlineWithPVC,
      pvcWithoutStatus: headlineTotal - headlineWithPVC,
      unassignedCount: unassignedWard,
      unassignedLabel: 'No Ward Set'
    };

    res.json({
      success: true,
      data: {
        level: 'lga',
        stats: lgaStats,
        items: wardsData,
        breadcrumbs: [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: stateName, id: stateId },
          { level: 'lga', name: lgaName, id: lgaId }
        ]
      }
    });

  } catch (error) {
    console.error('Error getting LGA data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get LGA data',
      error: error.message
    });
  }
};

/**
 * Get Ward level dashboard data - all Polling Units in a Ward
 */
export const getWardData = async (req, res) => {
  try {
    const { wardId } = req.params;

    // Resolve composite slug using nigeria_locations for state and LGA matching
    const statesResult = await query(`SELECT DISTINCT name FROM nigeria_locations WHERE level='state' ORDER BY name`);
    const stateNames = statesResult.rows.map(r => r.name);

    let stateId, stateName, lgaSlug, lgaName, wardSlug, wardName;
    let foundValidCombination = false;

    for (const sName of stateNames) {
      const stSlug = toSlug(sName);
      if (!wardId.startsWith(stSlug + '-')) continue;

      const remainder = wardId.substring(stSlug.length + 1);

      // Look up LGAs for this state
      const lgasLookup = await query(
        `SELECT nl.name FROM nigeria_locations nl
         JOIN nigeria_locations s ON nl.parent_id = s.id AND s.level='state' AND s.name = $1
         WHERE nl.level='lga' ORDER BY LENGTH(nl.name) DESC`,
        [sName]
      );

      for (const lgRow of lgasLookup.rows) {
        const lgSlug = toSlug(lgRow.name);
        if (!remainder.startsWith(lgSlug + '-')) continue;

        const wardRemainder = remainder.substring(lgSlug.length + 1);
        if (!wardRemainder) continue;

        stateId = stSlug;
        stateName = sName;
        lgaSlug = lgSlug;
        lgaName = lgRow.name;
        wardSlug = wardRemainder;
        foundValidCombination = true;
        break;
      }
      if (foundValidCombination) break;
    }

    if (!foundValidCombination) {
      return res.json({
        success: true,
        data: {
          level: 'ward',
          stats: { ...EMPTY_STATS },
          items: [],
          breadcrumbs: [
            { level: 'national', name: 'National Overview' },
            { level: 'ward', name: wardId, id: wardId }
          ]
        }
      });
    }

    // Resolve ward name by matching slug against actual user data
    const wardLookup = await query(
      `SELECT DISTINCT "votingWard" FROM users
       WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" IS NOT NULL AND "votingWard" != ''`,
      [stateName, lgaName]
    );
    wardName = null;
    for (const r of wardLookup.rows) {
      if (toSlug(r.votingWard) === wardSlug) {
        wardName = r.votingWard;
        break;
      }
    }
    if (!wardName) wardName = fromSlug(wardSlug).toUpperCase();

    // Check access
    const userId = req.user.userId || req.user.id;
    const userResult = await query(
      `SELECT designation, "assignedWard", "assignedLGA", "assignedState", role FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { designation, assignedWard, assignedLGA, assignedState, role } = userResult.rows[0];

    if (role !== 'admin' && designation === 'Ward Coordinator') {
      if (!locationNamesMatch(assignedState, stateName))
        return res.status(403).json({ success: false, message: `Access denied. State mismatch.` });
      if (!locationNamesMatch(assignedLGA, lgaName))
        return res.status(403).json({ success: false, message: `Access denied. LGA mismatch.` });
      if (!locationNamesMatch(assignedWard, wardName))
        return res.status(403).json({ success: false, message: `Access denied. Ward mismatch.` });
    }

    // Direct scoped query — only fetch PUs for this state+LGA+ward
    const puQuery = `
      SELECT
        "votingPU" as pu,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3
        AND "votingPU" IS NOT NULL AND "votingPU" != ''
      GROUP BY "votingPU"
      ORDER BY "votingPU"
    `;
    const puResult = await query(puQuery, [stateName, lgaName, wardName]);

    const lgaId = `${stateId}-${lgaSlug}`;

    // Direct headline total for this ward
    const headlineQuery = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS with_pvc,
        COUNT(*) FILTER (WHERE "votingPU" IS NULL OR "votingPU" = '') AS unassigned_pu
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3
    `;
    const headlineResult = await query(headlineQuery, [stateName, lgaName, wardName]);
    const headline = headlineResult.rows[0] || { total: '0', with_pvc: '0', unassigned_pu: '0' };
    const headlineTotal = parseInt(headline.total) || 0;
    const headlineWithPVC = parseInt(headline.with_pvc) || 0;
    const unassignedPU = parseInt(headline.unassigned_pu) || 0;

    if (puResult.rows.length === 0 && unassignedPU === 0) {
      return res.json({
        success: true,
        data: {
          level: 'ward',
          stats: { ...EMPTY_STATS },
          items: [],
          breadcrumbs: [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: stateName, id: stateId },
            { level: 'lga', name: lgaName, id: lgaId },
            { level: 'ward', name: wardName, id: wardId }
          ]
        }
      });
    }

    const pollingUnitsData = puResult.rows.map(row => {
      const total = parseInt(row.total) || 0;
      const withPvc = parseInt(row.with_pvc) || 0;
      const withoutPvc = total - withPvc; // Reconciled
      return {
        id: `${wardId}-${toSlug(row.pu)}`,
        name: row.pu,
        code: `PU-${row.pu.substring(0, 3).toUpperCase()}`,
        level: 'pu',
        wardId,
        wardName,
        lgaId,
        lgaName,
        stateId,
        stateName,
        obidientRegisteredVoters: total,
        obidientVotersWithPVC: withPvc,
        obidientVotersWithoutPVC: withoutPvc,
        pvcWithStatus: withPvc,
        pvcWithoutStatus: withoutPvc
      };
    });

    // Append synthetic "Unassigned PU" row if any exist
    if (unassignedPU > 0) {
      const unassignedPvcResult = await query(
        `SELECT COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS with_pvc
         FROM users WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3
           AND ("votingPU" IS NULL OR "votingPU" = '')`,
        [stateName, lgaName, wardName]
      );
      const unassignedWithPvc = parseInt(unassignedPvcResult.rows[0]?.with_pvc) || 0;
      pollingUnitsData.push({
        id: `${wardId}-unassigned`,
        name: 'Unassigned Polling Unit',
        code: '—',
        level: 'pu',
        wardId,
        wardName,
        lgaId,
        lgaName,
        stateId,
        stateName,
        obidientRegisteredVoters: unassignedPU,
        obidientVotersWithPVC: unassignedWithPvc,
        obidientVotersWithoutPVC: unassignedPU - unassignedWithPvc,
        pvcWithStatus: unassignedWithPvc,
        pvcWithoutStatus: unassignedPU - unassignedWithPvc,
        isUnassigned: true
      });
    }

    // Ward stats use the direct headline (reconciled)
    const wardStats = {
      obidientRegisteredVoters: headlineTotal,
      obidientVotersWithPVC: headlineWithPVC,
      obidientVotersWithoutPVC: headlineTotal - headlineWithPVC,
      pvcWithStatus: headlineWithPVC,
      pvcWithoutStatus: headlineTotal - headlineWithPVC,
      unassignedCount: unassignedPU,
      unassignedLabel: 'No Polling Unit Set'
    };

    res.json({
      success: true,
      data: {
        level: 'ward',
        stats: wardStats,
        items: pollingUnitsData,
        breadcrumbs: [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: stateName, id: stateId },
          { level: 'lga', name: lgaName, id: lgaId },
          { level: 'ward', name: wardName, id: wardId }
        ]
      }
    });

  } catch (error) {
    console.error('Error getting ward data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ward data',
      error: error.message
    });
  }
};

/**
 * Get specific Polling Unit details
 */
export const getPollingUnitData = async (req, res) => {
  try {
    const { puId } = req.params;

    // Resolve composite slug using nigeria_locations
    const statesResult = await query(`SELECT DISTINCT name FROM nigeria_locations WHERE level='state' ORDER BY name`);
    const stateNames = statesResult.rows.map(r => r.name);

    let stateId, stateName, lgaSlug, lgaName, wardSlug, wardName, puSlug, puName;
    let found = false;

    for (const sName of stateNames) {
      const stSlug = toSlug(sName);
      if (!puId.startsWith(stSlug + '-')) continue;

      const remainder = puId.substring(stSlug.length + 1);
      const lgasLookup = await query(
        `SELECT nl.name FROM nigeria_locations nl
         JOIN nigeria_locations s ON nl.parent_id = s.id AND s.level='state' AND s.name = $1
         WHERE nl.level='lga' ORDER BY LENGTH(nl.name) DESC`,
        [sName]
      );

      for (const lgRow of lgasLookup.rows) {
        const lgSlug = toSlug(lgRow.name);
        if (!remainder.startsWith(lgSlug + '-')) continue;

        const afterLga = remainder.substring(lgSlug.length + 1);
        if (!afterLga) continue;

        // Resolve ward name from actual user data
        const wardLookup = await query(
          `SELECT DISTINCT "votingWard" FROM users
           WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" IS NOT NULL AND "votingWard" != ''`,
          [sName, lgRow.name]
        );

        for (const wRow of wardLookup.rows) {
          const wSlug = toSlug(wRow.votingWard);
          if (!afterLga.startsWith(wSlug + '-')) continue;

          const afterWard = afterLga.substring(wSlug.length + 1);
          if (!afterWard) continue;

          stateId = stSlug; stateName = sName;
          lgaSlug = lgSlug; lgaName = lgRow.name;
          wardSlug = wSlug; wardName = wRow.votingWard;
          puSlug = afterWard;
          found = true;
          break;
        }
        if (found) break;
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ success: false, message: `Could not resolve polling unit: ${puId}` });
    }

    // Resolve PU name
    const puLookup = await query(
      `SELECT DISTINCT "votingPU" FROM users
       WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3 AND "votingPU" IS NOT NULL AND "votingPU" != ''`,
      [stateName, lgaName, wardName]
    );
    puName = null;
    for (const r of puLookup.rows) {
      if (toSlug(r.votingPU) === puSlug) { puName = r.votingPU; break; }
    }
    if (!puName) puName = fromSlug(puSlug).toUpperCase();

    // Direct scoped query
    const puQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3 AND "votingPU" = $4
    `;
    const puResult = await query(puQuery, [stateName, lgaName, wardName, puName]);
    const row = puResult.rows[0] || { total: 0, with_pvc: 0 };

    const total = parseInt(row.total) || 0;
    const withPvc = parseInt(row.with_pvc) || 0;
    const withoutPvc = total - withPvc; // Reconciled
    const lgaId = `${stateId}-${lgaSlug}`;
    const wardId = `${lgaId}-${wardSlug}`;

    const pollingUnitDetails = {
      id: puId,
      name: puName,
      code: `PU-${puName.substring(0, 3).toUpperCase()}`,
      level: 'pu',
      wardId,
      wardName,
      lgaId,
      lgaName,
      stateId,
      stateName,
      obidientRegisteredVoters: total,
      obidientVotersWithPVC: withPvc,
      obidientVotersWithoutPVC: withoutPvc,
      pvcWithStatus: withPvc,
      pvcWithoutStatus: withoutPvc,
      realData: {
        totalObidientUsers: total,
        votersWithPVC: withPvc,
        votersWithoutPVC: withoutPvc,
        pvcCompletionRate: total > 0 ? (withPvc / total) * 100 : 0,
        isRealData: true
      }
    };

    res.json({
      success: true,
      data: {
        level: 'pu',
        stats: pollingUnitDetails,
        item: pollingUnitDetails,
        breadcrumbs: [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: stateName, id: stateId },
          { level: 'lga', name: lgaName, id: lgaId },
          { level: 'ward', name: wardName, id: wardId },
          { level: 'pu', name: puName, id: puId }
        ]
      }
    });

  } catch (error) {
    console.error('Error getting polling unit data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get polling unit data',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// ANALYTICAL DASHBOARD ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Build a WHERE clause + params for scoping queries to a location level.
 * If canonicalName is provided (from frontend), use it directly.
 * Otherwise fall back to fromSlug (unreliable for uppercase/spaced names).
 */
function buildLocationScope(level, locationId, canonicalName) {
  const locationName = canonicalName || fromSlug(locationId);
  switch (level) {
    case 'state':
      return { clause: `"votingState" ILIKE $1`, params: [locationName], nextIdx: 2 };
    case 'lga':
      return { clause: `"votingLGA" ILIKE $1`, params: [locationName], nextIdx: 2 };
    case 'ward':
      return { clause: `"votingWard" ILIKE $1`, params: [locationName], nextIdx: 2 };
    case 'pu':
      return { clause: `"votingPU" ILIKE $1`, params: [locationName], nextIdx: 2 };
    case 'noState':
      return { clause: `("votingState" IS NULL OR "votingState" = '')`, params: [], nextIdx: 1 };
    default:
      return { clause: `"votingState" IS NOT NULL`, params: [], nextIdx: 1 };
  }
}

/**
 * GET /mobilise-dashboard/:level/:locationId/demographics
 * Returns all aggregate analytics in a single response.
 */
export const getDemographics = async (req, res) => {
  try {
    const { level, locationId } = req.params;
    const canonicalName = req.query.name || null;
    const { clause, params } = buildLocationScope(level, locationId, canonicalName);

    const sql = `
      SELECT
        -- KPIs
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') AS has_pvc,
        COUNT(*) FILTER (WHERE "willVote" = 'Yes') AS will_vote,
        COUNT(*) FILTER (WHERE "profileCompletionPercentage" = 100) AS profile_complete,
        COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '30 days') AS active_30d,

        -- Gender
        COUNT(*) FILTER (WHERE gender = 'Male') AS gender_male,
        COUNT(*) FILTER (WHERE gender = 'Female') AS gender_female,
        COUNT(*) FILTER (WHERE gender IS NULL OR gender = '' OR gender NOT IN ('Male','Female')) AS gender_unknown,

        -- Age ranges
        COUNT(*) FILTER (WHERE "ageRange" LIKE '18-24%') AS age_18_24,
        COUNT(*) FILTER (WHERE "ageRange" LIKE '25-34%') AS age_25_34,
        COUNT(*) FILTER (WHERE "ageRange" LIKE '35-44%') AS age_35_44,
        COUNT(*) FILTER (WHERE "ageRange" LIKE '45-54%') AS age_45_54,
        COUNT(*) FILTER (WHERE "ageRange" LIKE '55-64%') AS age_55_64,
        COUNT(*) FILTER (WHERE "ageRange" LIKE '65%') AS age_65_plus,
        COUNT(*) FILTER (WHERE "ageRange" IS NULL OR "ageRange" = '') AS age_unknown,

        -- Voting intent
        COUNT(*) FILTER (WHERE "willVote" = 'No') AS will_vote_no,
        COUNT(*) FILTER (WHERE "willVote" IS NULL OR "willVote" = '' OR "willVote" NOT IN ('Yes','No')) AS will_vote_unknown,

        -- Profile health
        COUNT(*) FILTER (WHERE "profileCompletionPercentage" >= 80 AND "profileCompletionPercentage" < 100) AS profile_high,
        COUNT(*) FILTER (WHERE "profileCompletionPercentage" >= 50 AND "profileCompletionPercentage" < 80) AS profile_medium,
        COUNT(*) FILTER (WHERE "profileCompletionPercentage" < 50) AS profile_low,

        -- Insights
        COUNT(*) FILTER (WHERE "isVoter" != 'Yes' AND ("willVote" != 'Yes' OR "willVote" IS NULL) AND "profileCompletionPercentage" < 50) AS needs_attention,
        COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '90 days' OR last_login_at IS NULL) AS ghosts,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes' AND "willVote" = 'Yes' AND "profileCompletionPercentage" = 100) AS champions,
        COUNT(*) FILTER (WHERE "votingLGA" IS NULL OR "votingLGA" = '') AS no_location
      FROM users
      WHERE ${clause}
    `;

    const result = await query(sql, params);
    const r = result.rows[0];

    // Signup trend - last 12 weeks
    const trendSql = `
      SELECT
        DATE_TRUNC('week', "createdAt") AS week,
        COUNT(*) AS count
      FROM users
      WHERE ${clause} AND "createdAt" > NOW() - INTERVAL '12 weeks'
      GROUP BY 1
      ORDER BY 1
    `;
    const trendResult = await query(trendSql, params);

    const total = parseInt(r.total);
    const genderFemale = parseInt(r.gender_female);
    const age1824 = parseInt(r.age_18_24);

    // Count users with no state (only relevant at national level)
    let noStateCount = 0;
    if (level === 'national' || !level) {
      const noStateRes = await query(`SELECT COUNT(*) FROM users WHERE "votingState" IS NULL OR "votingState" = ''`);
      noStateCount = parseInt(noStateRes.rows[0].count);
    }

    res.json({
      success: true,
      data: {
        kpis: {
          total,
          hasPvc: parseInt(r.has_pvc),
          noPvc: total - parseInt(r.has_pvc),
          willVote: parseInt(r.will_vote),
          profileComplete: parseInt(r.profile_complete),
          active30d: parseInt(r.active_30d)
        },
        gender: {
          male: parseInt(r.gender_male),
          female: genderFemale,
          unknown: parseInt(r.gender_unknown)
        },
        ageRanges: [
          { label: '18-24', count: age1824 },
          { label: '25-34', count: parseInt(r.age_25_34) },
          { label: '35-44', count: parseInt(r.age_35_44) },
          { label: '45-54', count: parseInt(r.age_45_54) },
          { label: '55-64', count: parseInt(r.age_55_64) },
          { label: '65+', count: parseInt(r.age_65_plus) },
          { label: 'Unknown', count: parseInt(r.age_unknown) }
        ],
        pvcStatus: {
          yes: parseInt(r.has_pvc),
          no: total - parseInt(r.has_pvc)
        },
        votingIntent: {
          yes: parseInt(r.will_vote),
          no: parseInt(r.will_vote_no),
          unknown: parseInt(r.will_vote_unknown)
        },
        profileHealth: {
          complete: parseInt(r.profile_complete),
          high: parseInt(r.profile_high),
          medium: parseInt(r.profile_medium),
          low: parseInt(r.profile_low)
        },
        signupTrend: trendResult.rows.map(row => ({
          week: row.week,
          count: parseInt(row.count)
        })),
        insights: {
          needsAttention: parseInt(r.needs_attention),
          ghosts: parseInt(r.ghosts),
          champions: parseInt(r.champions),
          noLocation: parseInt(r.no_location),
          noStateCount,
          genderGapAlert: total > 0 && (genderFemale / total) < 0.15,
          youthGapAlert: total > 0 && (age1824 / total) < 0.08
        }
      }
    });
  } catch (error) {
    console.error('Error getting demographics:', error);
    res.status(500).json({ success: false, message: 'Failed to get demographics', error: error.message });
  }
};

/**
 * GET /mobilise-dashboard/:level/:locationId/people
 * Paginated, filtered, sortable list of actual users.
 */
export const getPeople = async (req, res) => {
  try {
    const { level, locationId } = req.params;
    const {
      page = 1,
      limit = 50,
      gender,
      ageRange,
      pvc,
      willVote,
      profileHealth,
      activity,
      lga,
      search,
      sortBy = 'createdAt',
      sortDir = 'desc',
      name: canonicalName
    } = req.query;

    const { clause, params, nextIdx } = buildLocationScope(level, locationId, canonicalName || null);
    let idx = nextIdx;
    const filters = [clause];

    if (gender) {
      if (gender === 'unknown') {
        filters.push(`(gender IS NULL OR gender = '' OR gender NOT IN ('Male','Female'))`);
      } else {
        filters.push(`gender = $${idx}`);
        params.push(gender);
        idx++;
      }
    }
    if (ageRange) {
      if (ageRange === 'unknown') {
        filters.push(`("ageRange" IS NULL OR "ageRange" = '')`);
      } else {
        filters.push(`"ageRange" LIKE $${idx}`);
        params.push(`${ageRange}%`);
        idx++;
      }
    }
    if (pvc) {
      if (pvc === 'Yes') {
        filters.push(`"isVoter" = 'Yes'`);
      } else {
        filters.push(`("isVoter" IS NULL OR "isVoter" != 'Yes')`);
      }
    }
    if (willVote) {
      if (willVote === 'Yes') {
        filters.push(`"willVote" = 'Yes'`);
      } else if (willVote === 'No') {
        filters.push(`"willVote" = 'No'`);
      } else {
        filters.push(`("willVote" IS NULL OR "willVote" = '' OR "willVote" NOT IN ('Yes','No'))`);
      }
    }
    if (profileHealth) {
      switch (profileHealth) {
        case 'complete': filters.push(`"profileCompletionPercentage" = 100`); break;
        case 'high': filters.push(`"profileCompletionPercentage" >= 80 AND "profileCompletionPercentage" < 100`); break;
        case 'medium': filters.push(`"profileCompletionPercentage" >= 50 AND "profileCompletionPercentage" < 80`); break;
        case 'low': filters.push(`"profileCompletionPercentage" < 50`); break;
      }
    }
    if (activity) {
      switch (activity) {
        case 'active': filters.push(`last_login_at > NOW() - INTERVAL '30 days'`); break;
        case 'inactive': filters.push(`last_login_at BETWEEN NOW() - INTERVAL '90 days' AND NOW() - INTERVAL '30 days'`); break;
        case 'dormant': filters.push(`(last_login_at < NOW() - INTERVAL '90 days' OR last_login_at IS NULL)`); break;
      }
    }
    if (lga) {
      filters.push(`"votingLGA" = $${idx}`);
      params.push(fromSlug(lga));
      idx++;
    }
    if (search) {
      filters.push(`(name ILIKE $${idx} OR phone ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = filters.join(' AND ');

    // Allowed sort columns (whitelist to prevent SQL injection)
    const allowedSorts = { name: 'name', gender: 'gender', ageRange: '"ageRange"', pvc: '"isVoter"', willVote: '"willVote"', lga: '"votingLGA"', profile: '"profileCompletionPercentage"', lastActive: 'last_login_at', createdAt: '"createdAt"' };
    const sortColumn = allowedSorts[sortBy] || '"createdAt"';
    const direction = sortDir === 'asc' ? 'ASC' : 'DESC';

    // Count
    const countSql = `SELECT COUNT(*) FROM users WHERE ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    // Paginated data
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dataSql = `
      SELECT id, name, phone, email, gender, "ageRange" AS "ageRange", "isVoter", "willVote",
             "votingState", "votingLGA", "votingWard", "votingPU", "profileCompletionPercentage",
             "profileImage", "stateOfOrigin", citizenship, designation,
             last_login_at, "createdAt"
      FROM users
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${direction} NULLS LAST
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(parseInt(limit), offset);

    const dataResult = await query(dataSql, params);

    res.json({
      success: true,
      data: dataResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email || null,
        gender: row.gender || null,
        ageRange: row.ageRange || null,
        isVoter: row.isVoter || null,
        willVote: row.willVote || null,
        votingState: row.votingState || null,
        votingLGA: row.votingLGA || null,
        votingWard: row.votingWard || null,
        votingPU: row.votingPU || null,
        profileCompletionPercentage: row.profileCompletionPercentage || 0,
        profileImage: row.profileImage || null,
        stateOfOrigin: row.stateOfOrigin || null,
        citizenship: row.citizenship || null,
        designation: row.designation || null,
        lastActive: row.last_login_at || null,
        createdAt: row.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting people:', error);
    res.status(500).json({ success: false, message: 'Failed to get people', error: error.message });
  }
};

/**
 * GET /mobilise-dashboard/:level/:locationId/people/export
 * CSV export of filtered people.
 */
export const exportPeople = async (req, res) => {
  try {
    const { level, locationId } = req.params;
    const { gender, ageRange, pvc, willVote, profileHealth, activity, lga, search, name: canonicalName } = req.query;

    const { clause, params, nextIdx } = buildLocationScope(level, locationId, canonicalName || null);
    let idx = nextIdx;
    const filters = [clause];

    if (gender) {
      if (gender === 'unknown') {
        filters.push(`(gender IS NULL OR gender = '' OR gender NOT IN ('Male','Female'))`);
      } else {
        filters.push(`gender = $${idx}`);
        params.push(gender);
        idx++;
      }
    }
    if (ageRange) {
      if (ageRange === 'unknown') {
        filters.push(`("ageRange" IS NULL OR "ageRange" = '')`);
      } else {
        filters.push(`"ageRange" LIKE $${idx}`);
        params.push(`${ageRange}%`);
        idx++;
      }
    }
    if (pvc) {
      if (pvc === 'Yes') {
        filters.push(`"isVoter" = 'Yes'`);
      } else {
        filters.push(`("isVoter" IS NULL OR "isVoter" != 'Yes')`);
      }
    }
    if (willVote) {
      if (willVote === 'Yes') {
        filters.push(`"willVote" = 'Yes'`);
      } else if (willVote === 'No') {
        filters.push(`"willVote" = 'No'`);
      } else {
        filters.push(`("willVote" IS NULL OR "willVote" = '' OR "willVote" NOT IN ('Yes','No'))`);
      }
    }
    if (profileHealth) {
      switch (profileHealth) {
        case 'complete': filters.push(`"profileCompletionPercentage" = 100`); break;
        case 'high': filters.push(`"profileCompletionPercentage" >= 80 AND "profileCompletionPercentage" < 100`); break;
        case 'medium': filters.push(`"profileCompletionPercentage" >= 50 AND "profileCompletionPercentage" < 80`); break;
        case 'low': filters.push(`"profileCompletionPercentage" < 50`); break;
      }
    }
    if (activity) {
      switch (activity) {
        case 'active': filters.push(`last_login_at > NOW() - INTERVAL '30 days'`); break;
        case 'inactive': filters.push(`last_login_at BETWEEN NOW() - INTERVAL '90 days' AND NOW() - INTERVAL '30 days'`); break;
        case 'dormant': filters.push(`(last_login_at < NOW() - INTERVAL '90 days' OR last_login_at IS NULL)`); break;
      }
    }
    if (lga) {
      filters.push(`"votingLGA" = $${idx}`);
      params.push(fromSlug(lga));
      idx++;
    }
    if (search) {
      filters.push(`(name ILIKE $${idx} OR phone ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = filters.join(' AND ');

    const sql = `
      SELECT name, phone, gender, "ageRange", "isVoter", "willVote",
             "votingState", "votingLGA", "votingWard", "votingPU",
             "profileCompletionPercentage", last_login_at, "createdAt"
      FROM users
      WHERE ${whereClause}
      ORDER BY name ASC
    `;
    const result = await query(sql, params);

    // Build CSV
    const headers = ['Name', 'Phone', 'Gender', 'Age Range', 'Has PVC', 'Will Vote', 'State', 'LGA', 'Ward', 'Polling Unit', 'Profile %', 'Last Active', 'Joined'];
    const rows = result.rows.map(r => [
      r.name || '',
      r.phone || '',
      r.gender || '',
      r.ageRange || '',
      r.isVoter || '',
      r.willVote || '',
      r.votingState || '',
      r.votingLGA || '',
      r.votingWard || '',
      r.votingPU || '',
      r.profileCompletionPercentage || 0,
      r.last_login_at ? new Date(r.last_login_at).toISOString().split('T')[0] : '',
      r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="members_${level}_${locationId}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting people:', error);
    res.status(500).json({ success: false, message: 'Failed to export', error: error.message });
  }
};

