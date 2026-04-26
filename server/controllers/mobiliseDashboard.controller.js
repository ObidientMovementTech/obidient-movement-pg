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

    // Get all states data
    const votersData = await getObidientVotersByState();

    const statesData = votersData.map(stateData => {
      const totalObidient = stateData.totalObidientUsers || 0;
      const votersWithPVC = stateData.votersWithPVC || 0;
      const votersWithoutPVC = stateData.votersWithoutPVC || 0;

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
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as without_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" IS NOT NULL AND "votingLGA" != ''
      GROUP BY "votingLGA"
      ORDER BY "votingLGA"
    `;
    const lgaResult = await query(lgaQuery, [stateName]);

    if (lgaResult.rows.length === 0) {
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
      const withoutPvc = parseInt(row.without_pvc) || 0;
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
        pvcWithoutStatus: withoutPvc
      };
    });


    // Calculate state totals
    const stateStats = lgasData.reduce((acc, lga) => ({
      obidientRegisteredVoters: acc.obidientRegisteredVoters + lga.obidientRegisteredVoters,
      obidientVotersWithPVC: acc.obidientVotersWithPVC + lga.obidientVotersWithPVC,
      obidientVotersWithoutPVC: acc.obidientVotersWithoutPVC + lga.obidientVotersWithoutPVC,
      pvcWithStatus: acc.pvcWithStatus + lga.pvcWithStatus,
      pvcWithoutStatus: acc.pvcWithoutStatus + lga.pvcWithoutStatus
    }), {
      obidientRegisteredVoters: 0,
      obidientVotersWithPVC: 0,
      obidientVotersWithoutPVC: 0,
      pvcWithStatus: 0,
      pvcWithoutStatus: 0
    });

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
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as without_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2
        AND "votingWard" IS NOT NULL AND "votingWard" != ''
      GROUP BY "votingWard"
      ORDER BY "votingWard"
    `;
    const wardResult = await query(wardQuery, [stateName, lgaName]);

    if (wardResult.rows.length === 0) {
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
      const withoutPvc = parseInt(row.without_pvc) || 0;
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

    // Calculate LGA totals
    const lgaStats = wardsData.reduce((acc, ward) => ({
      obidientRegisteredVoters: acc.obidientRegisteredVoters + ward.obidientRegisteredVoters,
      obidientVotersWithPVC: acc.obidientVotersWithPVC + ward.obidientVotersWithPVC,
      obidientVotersWithoutPVC: acc.obidientVotersWithoutPVC + ward.obidientVotersWithoutPVC,
      pvcWithStatus: acc.pvcWithStatus + ward.pvcWithStatus,
      pvcWithoutStatus: acc.pvcWithoutStatus + ward.pvcWithoutStatus
    }), {
      obidientRegisteredVoters: 0,
      obidientVotersWithPVC: 0,
      obidientVotersWithoutPVC: 0,
      pvcWithStatus: 0,
      pvcWithoutStatus: 0
    });

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
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as without_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3
        AND "votingPU" IS NOT NULL AND "votingPU" != ''
      GROUP BY "votingPU"
      ORDER BY "votingPU"
    `;
    const puResult = await query(puQuery, [stateName, lgaName, wardName]);

    const lgaId = `${stateId}-${lgaSlug}`;

    if (puResult.rows.length === 0) {
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
      const withoutPvc = parseInt(row.without_pvc) || 0;
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

    const wardStats = pollingUnitsData.reduce((acc, pu) => ({
      obidientRegisteredVoters: acc.obidientRegisteredVoters + pu.obidientRegisteredVoters,
      obidientVotersWithPVC: acc.obidientVotersWithPVC + pu.obidientVotersWithPVC,
      obidientVotersWithoutPVC: acc.obidientVotersWithoutPVC + pu.obidientVotersWithoutPVC,
      pvcWithStatus: acc.pvcWithStatus + pu.pvcWithStatus,
      pvcWithoutStatus: acc.pvcWithoutStatus + pu.pvcWithoutStatus
    }), { ...EMPTY_STATS });

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
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as without_pvc
      FROM users
      WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3 AND "votingPU" = $4
    `;
    const puResult = await query(puQuery, [stateName, lgaName, wardName, puName]);
    const row = puResult.rows[0] || { total: 0, with_pvc: 0, without_pvc: 0 };

    const total = parseInt(row.total) || 0;
    const withPvc = parseInt(row.with_pvc) || 0;
    const withoutPvc = parseInt(row.without_pvc) || 0;
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

