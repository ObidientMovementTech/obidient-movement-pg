import { query } from '../config/db.js';
import { getObidientVotersByState, getObidientVotersDetailed } from '../services/obidientVotersService.js';

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

/**
 * Find a state key in detailedData using case-insensitive matching
 * Returns the actual key as stored in the data, or null
 */
const findStateKey = (detailedData, targetStateName) => {
  if (!detailedData || !targetStateName) return null;
  // Try exact match first
  if (detailedData[targetStateName]) return targetStateName;
  // Try case-insensitive match
  const normalized = normalizeLocationName(targetStateName);
  for (const key of Object.keys(detailedData)) {
    if (normalizeLocationName(key) === normalized) return key;
  }
  return null;
};

/**
 * Find an LGA key within a state's lgas using case-insensitive matching
 * Returns the actual key as stored in the data, or null
 */
const findLgaKey = (stateData, targetLgaName) => {
  if (!stateData?.lgas || !targetLgaName) return null;
  if (stateData.lgas[targetLgaName]) return targetLgaName;
  const normalized = normalizeLocationName(targetLgaName);
  for (const key of Object.keys(stateData.lgas)) {
    if (normalizeLocationName(key) === normalized) return key;
  }
  return null;
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
    const stateName = fromSlug(stateId);

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

    // Get detailed voter data for the state
    const detailedData = await getObidientVotersDetailed();

    const matchedStateKey = findStateKey(detailedData, stateName);
    const stateData = matchedStateKey ? detailedData[matchedStateKey] : null;

    if (!stateData) {
      console.log(`⚠️ No voter data yet for state: ${stateName} — returning empty dashboard`);
      // Return empty dashboard instead of 404 so coordinators see a blank dashboard
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

    // Process LGA data

    const lgasData = Object.entries(stateData.lgas || {}).map(([lgaName, lgaData]) => {

      const totalObidient = lgaData.obidientRegisteredVoters || 0;
      const votersWithPVC = lgaData.obidientVotersWithPVC || 0;
      const votersWithoutPVC = lgaData.obidientVotersWithoutPVC || 0;

      const lgaResult = {
        id: `${stateId}-${lgaName.toLowerCase().replace(/\s+/g, '-')}`,
        name: lgaName,
        code: lgaName.substring(0, 3).toUpperCase(),
        level: 'lga',
        stateId: stateId,
        stateName: stateName,
        obidientRegisteredVoters: totalObidient,
        obidientVotersWithPVC: votersWithPVC,
        obidientVotersWithoutPVC: votersWithoutPVC,
        pvcWithStatus: votersWithPVC,
        pvcWithoutStatus: votersWithoutPVC
      };

      return lgaResult;
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

    // Get detailed voter data early so we can use it for smart parsing
    const detailedData = await getObidientVotersDetailed();

    // Smart parsing: find the state slug by matching against known states
    // This handles multi-word states like "cross-river" correctly
    let stateId, stateName, lgaSlugPart, lgaName, matchedStateKey;

    const stateKeys = Object.keys(detailedData);
    let foundMatch = false;
    for (const key of stateKeys) {
      const slug = toSlug(key);
      if (lgaId.startsWith(slug + '-')) {
        matchedStateKey = key;
        stateId = slug;
        stateName = key;
        lgaSlugPart = lgaId.substring(slug.length + 1);
        lgaName = fromSlug(lgaSlugPart);
        foundMatch = true;
        break;
      }
    }

    // Fallback: split on first hyphen (single-word state)
    if (!foundMatch) {
      const parts = lgaId.split('-');
      stateId = parts[0];
      stateName = fromSlug(stateId);
      lgaSlugPart = lgaId.replace(`${stateId}-`, '');
      lgaName = fromSlug(lgaSlugPart);
      matchedStateKey = findStateKey(detailedData, stateName);
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
      // For non-admin users, check specific access permissions
      if (designation === 'LGA Coordinator') {
        // Check both state and LGA match
        if (!locationNamesMatch(assignedState, stateName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. State mismatch. Your assigned: "${assignedState}", Requested: "${stateName}"`
          });
        }
        if (!locationNamesMatch(assignedLGA, lgaName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. LGA mismatch. Your assigned: "${assignedLGA}", Requested: "${lgaName}"`
          });
        }
      }
      if (designation === 'Ward Coordinator') {
        // Check both state and LGA match
        if (!locationNamesMatch(assignedState, stateName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. State mismatch. Your assigned: "${assignedState}", Requested: "${stateName}"`
          });
        }
        if (!locationNamesMatch(assignedLGA, lgaName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. LGA mismatch. Your assigned: "${assignedLGA}", Requested: "${lgaName}"`
          });
        }
      }
    }

    // Get data for the state and LGA
    const stateData = matchedStateKey ? detailedData[matchedStateKey] : null;
    const lgaKey = stateData ? findLgaKey(stateData, lgaName) : null;

    if (!stateData || !lgaKey) {
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

    const lgaData = stateData.lgas[lgaKey];

    // Process Ward data
    const wardsData = Object.entries(lgaData.wards || {}).map(([wardName, wardData]) => {
      const totalObidient = wardData.obidientRegisteredVoters || 0;
      const votersWithPVC = wardData.obidientVotersWithPVC || 0;
      const votersWithoutPVC = wardData.obidientVotersWithoutPVC || 0;

      return {
        id: `${lgaId}-${wardName.toLowerCase().replace(/\s+/g, '-')}`,
        name: wardName,
        code: wardName.substring(0, 3).toUpperCase(),
        level: 'ward',
        lgaId: lgaId,
        lgaName: lgaName,
        stateId: stateId,
        stateName: stateName,
        obidientRegisteredVoters: totalObidient,
        obidientVotersWithPVC: votersWithPVC,
        obidientVotersWithoutPVC: votersWithoutPVC,
        pvcWithStatus: votersWithPVC,
        pvcWithoutStatus: votersWithoutPVC
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

    // Get detailed voter data early for smart parsing
    const detailedData = await getObidientVotersDetailed();

    // Smart parsing: find state slug, LGA slug, ward slug by matching against known data
    let stateId, lgaSlug, wardSlug, stateName, lgaName, wardName;
    let matchedStateKey, matchedLgaKey, matchedWardKey;
    let foundValidCombination = false;

    // Try to match state from known keys (handles multi-word states)
    for (const stKey of Object.keys(detailedData)) {
      const stSlug = toSlug(stKey);
      if (!wardId.startsWith(stSlug + '-')) continue;

      const remainder = wardId.substring(stSlug.length + 1); // e.g. "aguata-igbo-ukwu-i"
      const stateObj = detailedData[stKey];
      if (!stateObj?.lgas) continue;

      // Try to match LGA from known keys within this state
      for (const lgKey of Object.keys(stateObj.lgas)) {
        const lgSlug = toSlug(lgKey);
        if (!remainder.startsWith(lgSlug + '-')) continue;

        const wardRemainder = remainder.substring(lgSlug.length + 1); // e.g. "igbo-ukwu-i"
        const lgaObj = stateObj.lgas[lgKey];
        if (!lgaObj?.wards) continue;

        // Try to match ward from known keys within this LGA
        for (const wdKey of Object.keys(lgaObj.wards)) {
          if (toSlug(wdKey) === wardRemainder) {
            matchedStateKey = stKey;
            matchedLgaKey = lgKey;
            matchedWardKey = wdKey;
            stateId = stSlug;
            lgaSlug = lgSlug;
            wardSlug = wardRemainder;
            stateName = stKey;
            lgaName = lgKey;
            wardName = wdKey;
            foundValidCombination = true;
            break;
          }
        }
        if (foundValidCombination) break;
      }
      if (foundValidCombination) break;
    }

    if (!foundValidCombination) {
      // Fallback parsing for breadcrumbs when no data exists
      const wardIdParts = wardId.split('-');
      const fbState = fromSlug(wardIdParts[0]);
      const fbLga = wardIdParts.length >= 3 ? fromSlug(wardIdParts.slice(1, -1).join('-')) : '';
      const fbWard = wardIdParts.length >= 3 ? fromSlug(wardIdParts[wardIdParts.length - 1]) : '';

      stateId = wardIdParts[0];
      lgaSlug = wardIdParts.length >= 3 ? wardIdParts.slice(1, -1).join('-') : '';
      stateName = fbState;
      lgaName = fbLga;
      wardName = fbWard;

      console.log(`⚠️ No voter data for ward: ${wardId} — returning empty dashboard`);
      return res.json({
        success: true,
        data: {
          level: 'ward',
          stats: { ...EMPTY_STATS },
          items: [],
          breadcrumbs: [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: fbState, id: wardIdParts[0] },
            { level: 'lga', name: fbLga, id: `${wardIdParts[0]}-${lgaSlug}` },
            { level: 'ward', name: fbWard, id: wardId }
          ]
        }
      });
    }

    // Check if user has access to this Ward using direct query
    const userId = req.user.userId || req.user.id;
    const userQuery = `
      SELECT designation, "assignedWard", "assignedLGA", "assignedState", role FROM users WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { designation, assignedWard, assignedLGA, assignedState, role } = userResult.rows[0];


    // Allow admin users full access
    if (role !== 'admin') {
      // For Ward Coordinators, check state, LGA, and ward match
      if (designation === 'Ward Coordinator') {
        if (!locationNamesMatch(assignedState, stateName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. State mismatch. Your assigned: "${assignedState}", Requested: "${stateName}"`
          });
        }
        if (!locationNamesMatch(assignedLGA, lgaName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. LGA mismatch. Your assigned: "${assignedLGA}", Requested: "${lgaName}"`
          });
        }
        if (!locationNamesMatch(assignedWard, wardName)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Ward mismatch. Your assigned: "${assignedWard}", Requested: "${wardName}"`
          });
        }
      }
    }

    // We already have detailedData from the smart parsing above
    // Use the matched keys directly
    const wardData = detailedData[matchedStateKey].lgas[matchedLgaKey].wards[matchedWardKey];

    // Process Polling Unit data
    const pollingUnitsData = Object.entries(wardData.pollingUnits || {}).map(([puName, puData]) => {
      const totalObidient = puData.obidientRegisteredVoters || 0;
      const votersWithPVC = puData.obidientVotersWithPVC || 0;
      const votersWithoutPVC = puData.obidientVotersWithoutPVC || 0;

      return {
        id: `${wardId}-${puName.toLowerCase().replace(/\\s+/g, '-')}`,
        name: puName,
        code: puData.polling_unit_code || `PU-${puName.substring(0, 3).toUpperCase()}`,
        level: 'pu',
        wardId: wardId,
        wardName: wardName,
        lgaId: `${stateId}-${lgaSlug}`,
        lgaName: lgaName,
        stateId: stateId,
        stateName: stateName,
        obidientRegisteredVoters: totalObidient,
        obidientVotersWithPVC: votersWithPVC,
        obidientVotersWithoutPVC: votersWithoutPVC,
        pvcWithStatus: votersWithPVC,
        pvcWithoutStatus: votersWithoutPVC
      };
    });

    // Calculate Ward totals
    const wardStats = pollingUnitsData.reduce((acc, pu) => ({
      obidientRegisteredVoters: acc.obidientRegisteredVoters + pu.obidientRegisteredVoters,
      obidientVotersWithPVC: acc.obidientVotersWithPVC + pu.obidientVotersWithPVC,
      obidientVotersWithoutPVC: acc.obidientVotersWithoutPVC + pu.obidientVotersWithoutPVC,
      pvcWithStatus: acc.pvcWithStatus + pu.pvcWithStatus,
      pvcWithoutStatus: acc.pvcWithoutStatus + pu.pvcWithoutStatus
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
        level: 'ward',
        stats: wardStats,
        items: pollingUnitsData,
        breadcrumbs: [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: stateName, id: stateId },
          { level: 'lga', name: lgaName, id: `${stateId}-${lgaSlug}` },
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

    // Parse PU ID to extract components
    const puIdParts = puId.split('-');
    if (puIdParts.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid polling unit ID format'
      });
    }

    const stateId = puIdParts[0];
    const lgaSlug = puIdParts[1];
    const wardSlug = puIdParts[2];
    const puSlug = puIdParts.slice(3).join('-');

    const stateName = stateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const lgaName = lgaSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const wardName = wardSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const puName = puSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Get detailed voter data
    const detailedData = await getObidientVotersDetailed();
    const stateData = detailedData[stateName];

    if (!stateData || !stateData.lgas[lgaName] || !stateData.lgas[lgaName].wards[wardName] ||
      !stateData.lgas[lgaName].wards[wardName].pollingUnits[puName]) {
      return res.status(404).json({
        success: false,
        message: `No data found for Polling Unit: ${puName}`
      });
    }

    const puData = stateData.lgas[lgaName].wards[wardName].pollingUnits[puName];

    const totalObidient = puData.obidientRegisteredVoters || 0;
    const votersWithPVC = puData.obidientVotersWithPVC || 0;
    const votersWithoutPVC = puData.obidientVotersWithoutPVC || 0;
    const estimatedINECVoters = Math.round(totalObidient * (Math.random() * 15 + 20));

    const pollingUnitDetails = {
      id: puId,
      name: puName,
      code: puData.polling_unit_code || `PU-${puName.substring(0, 3).toUpperCase()}`,
      level: 'pu',
      wardId: `${stateId}-${lgaSlug}-${wardSlug}`,
      wardName: wardName,
      lgaId: `${stateId}-${lgaSlug}`,
      lgaName: lgaName,
      stateId: stateId,
      stateName: stateName,
      inecRegisteredVoters: estimatedINECVoters,
      obidientRegisteredVoters: totalObidient,
      obidientVotersWithPVC: votersWithPVC,
      obidientVotersWithoutPVC: votersWithoutPVC,
      unconvertedVoters: Math.max(0, estimatedINECVoters - totalObidient),
      conversionRate: estimatedINECVoters > 0 ? Number(((totalObidient / estimatedINECVoters) * 100).toFixed(2)) : 0,
      pvcWithStatus: votersWithPVC,
      pvcWithoutStatus: votersWithoutPVC,
      realData: {
        totalObidientUsers: totalObidient,
        votersWithPVC: votersWithPVC,
        votersWithoutPVC: votersWithoutPVC,
        votersWithPhone: puData.voters_with_phone || 0,
        votersWithEmail: puData.voters_with_email || 0,
        pvcCompletionRate: totalObidient > 0 ? ((votersWithPVC / totalObidient) * 100) : 0,
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
          { level: 'lga', name: lgaName, id: `${stateId}-${lgaSlug}` },
          { level: 'ward', name: wardName, id: `${stateId}-${lgaSlug}-${wardSlug}` },
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

