import { query } from '../config/db.js';
// Import the hierarchical structure data
// Note: We'll need to access this from frontend utils or create a copy
// For now, we'll create the structure inline

const HIERARCHICAL_STRUCTURE = {
  // We'll populate this with the StateLGAWardPollingUnits data
  getStateStructure: (stateName) => {
    // This will be populated from the frontend utils file
    // For now, return null and we'll handle it dynamically
    return null;
  }
};

const stateDashboardController = {
  // Get dashboard data based on user's designation and assigned location
  getDashboardData: async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;

      // Get user's designation and assignment details
      const userQuery = `
        SELECT designation, "assignedState", "assignedLGA", "assignedWard"
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
      const { designation, assignedState, assignedLGA, assignedWard } = user;

      // Check if user has coordinator designation OR is admin
      const coordinatorDesignations = [
        'National Coordinator',
        'State Coordinator',
        'LGA Coordinator',
        'Ward Coordinator'
      ];

      const isCoordinator = coordinatorDesignations.includes(designation);
      const isAdmin = req.user.role === 'admin';

      if (!isCoordinator && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only coordinators and admins can access the State Dashboard.'
        });
      }

      let dashboardData = {};
      let assignedLocationDetails = null;

      // Get obidient voter data and INEC data
      const obidientVotersByState = await getObidientVotersByState();
      const detailedBreakdown = await getObidientVotersDetailed();
      const inecData = generateMockINECData(); // Mock INEC data

      // Build response based on designation level
      switch (designation) {
        case 'National Coordinator':
          // Can see all states and their data
          dashboardData = await getNationalData(obidientVotersByState, inecData);
          assignedLocationDetails = null; // National coordinators don't have assigned locations
          break;

        case 'State Coordinator':
          // Can see all LGAs in their assigned state
          if (!assignedState) {
            return res.status(400).json({
              success: false,
              message: 'State Coordinator must have an assigned state'
            });
          }
          dashboardData = await getStateData(assignedState, obidientVotersByState, detailedBreakdown, inecData);
          assignedLocationDetails = {
            id: assignedState,
            name: assignedState,
            type: 'state'
          };
          break;

        case 'LGA Coordinator':
          // Can see all wards in their assigned LGA
          if (!assignedState || !assignedLGA) {
            return res.status(400).json({
              success: false,
              message: 'LGA Coordinator must have assigned state and LGA'
            });
          }
          dashboardData = await getLGAData(assignedState, assignedLGA, obidientVotersByState, detailedBreakdown, inecData);
          assignedLocationDetails = {
            id: assignedLGA,
            name: assignedLGA,
            type: 'lga',
            state: {
              id: assignedState,
              name: assignedState
            }
          };
          break;

        case 'Ward Coordinator':
          // Can see their assigned ward data
          if (!assignedState || !assignedLGA || !assignedWard) {
            return res.status(400).json({
              success: false,
              message: 'Ward Coordinator must have assigned state, LGA, and ward'
            });
          }
          dashboardData = await getWardData(assignedState, assignedLGA, assignedWard, obidientVotersByState, detailedBreakdown, inecData);
          assignedLocationDetails = {
            id: assignedWard,
            name: assignedWard,
            type: 'ward',
            lga: {
              id: assignedLGA,
              name: assignedLGA,
              state: {
                id: assignedState,
                name: assignedState
              }
            }
          };
          break;

        default:
          // If user is admin but doesn't have coordinator designation, show national view
          if (isAdmin) {
            dashboardData = await getNationalData(obidientVotersByState, inecData);
            user.designation = 'National Coordinator';
            assignedLocationDetails = null;
          } else {
            return res.status(403).json({
              success: false,
              message: 'Invalid coordinator designation'
            });
          }
          break;
      }

      const responseData = {
        success: true,
        userDesignation: user.designation || designation,
        assignedLocation: assignedLocationDetails,
        dashboardData
      };

      res.json(responseData);

    } catch (error) {
      console.error('State Dashboard Controller Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching dashboard data'
      });
    }
  },

  // Get subordinate coordinators based on user's level
  getSubordinateCoordinators: async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;

      // Get user's designation and assignment details
      const userQuery = `
        SELECT designation, "assignedState", "assignedLGA", "assignedWard"
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
      const { designation, assignedState, assignedLGA, assignedWard } = user;

      let subordinates = [];

      switch (designation) {
        case 'National Coordinator':
          // Can see all State Coordinators
          subordinates = await getSubordinatesByLevel('State Coordinator');
          break;

        case 'State Coordinator':
          // Can see LGA Coordinators in their state
          subordinates = await getSubordinatesByLevel('LGA Coordinator', assignedState);
          break;

        case 'LGA Coordinator':
          // Can see Ward Coordinators in their LGA
          subordinates = await getSubordinatesByLevel('Ward Coordinator', assignedState, assignedLGA);
          break;

        case 'Ward Coordinator':
          // Can see Polling Unit Agents and Vote Defenders in their ward
          subordinates = await getSubordinatesByLevel(['Polling Unit Agents', 'Vote Defenders'], assignedState, assignedLGA, assignedWard);
          break;

        default:
          // If user is admin, show all State Coordinators (like National Coordinator)
          if (req.user.role === 'admin') {
            subordinates = await getSubordinatesByLevel('State Coordinator');
          } else {
            return res.status(403).json({
              success: false,
              message: 'Only coordinators and admins can view subordinates'
            });
          }
          break;
      }

      res.json({
        success: true,
        data: subordinates
      });

    } catch (error) {
      console.error('Get Subordinate Coordinators Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching subordinate coordinators'
      });
    }
  },

  // Get Obidient voter data aggregated by voting locations
  getObidientVoterData: async (req, res) => {
    try {
      // Get aggregated voter data by state
      const votersByState = await getObidientVotersByState();

      // Get detailed breakdown if requested
      const { includeBreakdown } = req.query;
      let detailedData = {};

      if (includeBreakdown === 'true') {
        detailedData = await getObidientVotersDetailed();
      }

      const responseData = {
        success: true,
        data: {
          votersByState,
          ...(includeBreakdown === 'true' && { detailedBreakdown: detailedData })
        }
      };

      res.json(responseData);

    } catch (error) {
      console.error('❌ Error fetching Obidient voter data:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching Obidient voter data'
      });
    }
  }
};

// Helper functions for data retrieval
async function getNationalData(obidientVotersByState, inecData) {
  const { mockStates, totalINEC } = inecData;

  // Merge mock INEC data with real Obidient data
  const mergedStates = mockStates.map(state => {
    const stateVoterData = obidientVotersByState[state.name] || {};
    const totalObidientUsers = stateVoterData.totalObidientUsers || 0;
    const votersWithPVC = stateVoterData.votersWithPVC || 0;
    const votersWithoutPVC = stateVoterData.votersWithoutPVC || 0;

    const unconverted = Math.max(0, state.inecRegisteredVoters - totalObidientUsers);
    const conversionRate = state.inecRegisteredVoters > 0
      ? ((totalObidientUsers / state.inecRegisteredVoters) * 100)
      : 0;

    return {
      ...state,
      obidientRegisteredVoters: totalObidientUsers,
      obidientVotersWithPVC: votersWithPVC,
      obidientVotersWithoutPVC: votersWithoutPVC,
      unconvertedVoters: unconverted,
      conversionRate: Number(conversionRate.toFixed(2)),
      pvcWithStatus: votersWithPVC,
      pvcWithoutStatus: votersWithoutPVC,
      realData: {
        totalObidientUsers,
        votersWithPVC,
        votersWithoutPVC,
        votersWithPhone: stateVoterData.votersWithPhone || 0,
        votersWithEmail: stateVoterData.votersWithEmail || 0,
        pvcCompletionRate: totalObidientUsers > 0 ? ((votersWithPVC / totalObidientUsers) * 100) : 0,
        isRealData: true
      }
    };
  });

  // Calculate national stats
  const totalObidient = mergedStates.reduce((sum, state) => sum + state.obidientRegisteredVoters, 0);
  const totalObidientWithPVC = mergedStates.reduce((sum, state) => sum + state.obidientVotersWithPVC, 0);
  const totalObidientWithoutPVC = mergedStates.reduce((sum, state) => sum + state.obidientVotersWithoutPVC, 0);
  const totalUnconverted = totalINEC - totalObidient;
  const nationalConversionRate = totalINEC > 0 ? ((totalObidient / totalINEC) * 100) : 0;
  const pvcCompletionRate = totalObidient > 0 ? ((totalObidientWithPVC / totalObidient) * 100) : 0;

  const nationalStats = {
    inecRegisteredVoters: totalINEC,
    obidientRegisteredVoters: totalObidient,
    obidientVotersWithPVC: totalObidientWithPVC,
    obidientVotersWithoutPVC: totalObidientWithoutPVC,
    unconvertedVoters: totalUnconverted,
    conversionRate: Number(nationalConversionRate.toFixed(2)),
    pvcWithStatus: totalObidientWithPVC,
    pvcWithoutStatus: totalObidientWithoutPVC,
    realData: {
      totalObidientUsers: totalObidient,
      votersWithPVC: totalObidientWithPVC,
      votersWithoutPVC: totalObidientWithoutPVC,
      votersWithPhone: 0,
      votersWithEmail: 0,
      pvcCompletionRate: Number(pvcCompletionRate.toFixed(2)),
      isRealData: true
    }
  };

  return {
    nationalStats,
    statesData: mergedStates,
    hierarchicalData: {} // Will be populated based on detailed breakdown
  };
}

async function getStateData(assignedState, obidientVotersByState, detailedBreakdown, inecData) {
  // For State Coordinators, return LGA-level data for their assigned state
  console.log(`🔍 Getting state data for: ${assignedState}`);
  console.log('📊 Detailed breakdown keys:', Object.keys(detailedBreakdown));
  console.log(`📊 State data in breakdown:`, detailedBreakdown[assignedState] ? Object.keys(detailedBreakdown[assignedState]) : 'Not found');

  const stateVoterData = obidientVotersByState[assignedState] || {
    totalObidientUsers: 0,
    votersWithPVC: 0,
    votersWithoutPVC: 0,
    votersWithPhone: 0,
    votersWithEmail: 0
  };

  const stateINECData = inecData.mockStates.find(s => s.name === assignedState) || {};

  // Get LGA data from the detailed breakdown
  const lgasData = [];

  if (detailedBreakdown[assignedState]) {
    console.log(`✅ Found state data for ${assignedState} in detailed breakdown`);

    for (const [lgaName, lgaData] of Object.entries(detailedBreakdown[assignedState])) {
      // Skip if this is not an LGA data object (might be nested structure)
      if (typeof lgaData === 'object' && lgaData.totalObidientUsers !== undefined) {
        console.log(`📍 Processing LGA: ${lgaName}`, {
          totalObidientUsers: lgaData.totalObidientUsers,
          votersWithPVC: lgaData.votersWithPVC,
          votersWithoutPVC: lgaData.votersWithoutPVC
        });

        const lgaObidientUsers = lgaData.totalObidientUsers || 0;
        const lgaPVCUsers = lgaData.votersWithPVC || 0;
        const lgaNonPVCUsers = lgaData.votersWithoutPVC || 0;

        // Calculate proportional INEC data for this LGA
        const totalStateObidient = stateVoterData.totalObidientUsers || 1; // Avoid division by zero
        const lgaRatio = lgaObidientUsers / totalStateObidient;
        const lgaINECVoters = Math.round((stateINECData.inecRegisteredVoters || 0) * lgaRatio);

        const unconverted = Math.max(0, lgaINECVoters - lgaObidientUsers);
        const conversionRate = lgaINECVoters > 0 ? ((lgaObidientUsers / lgaINECVoters) * 100) : 0;

        lgasData.push({
          id: lgaName.toLowerCase().replace(/\s+/g, '-'),
          name: lgaName,
          stateId: assignedState.toLowerCase().replace(/\s+/g, '-'),
          inecRegisteredVoters: lgaINECVoters,
          obidientRegisteredVoters: lgaObidientUsers,
          obidientVotersWithPVC: lgaPVCUsers,
          obidientVotersWithoutPVC: lgaNonPVCUsers,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          pvcWithStatus: lgaPVCUsers,
          pvcWithoutStatus: lgaNonPVCUsers,
          wards: [],
          realData: {
            totalObidientUsers: lgaObidientUsers,
            votersWithPVC: lgaPVCUsers,
            votersWithoutPVC: lgaNonPVCUsers,
            votersWithPhone: 0,
            votersWithEmail: 0,
            pvcCompletionRate: lgaObidientUsers > 0 ? ((lgaPVCUsers / lgaObidientUsers) * 100) : 0,
            isRealData: true
          }
        });
      }
    }
  } else {
    console.warn(`⚠️ No detailed breakdown data found for state: ${assignedState}`);

    // Fallback to using the aggregate state data and creating mock LGAs
    const mockLGAs = ['LGA 1', 'LGA 2', 'LGA 3']; // Minimal fallback

    mockLGAs.forEach((lgaName, index) => {
      const lgaRatio = 1 / mockLGAs.length;
      const lgaObidientUsers = Math.round((stateVoterData.totalObidientUsers || 0) * lgaRatio);
      const lgaPVCUsers = Math.round((stateVoterData.votersWithPVC || 0) * lgaRatio);
      const lgaNonPVCUsers = Math.round((stateVoterData.votersWithoutPVC || 0) * lgaRatio);
      const lgaINECVoters = Math.round((stateINECData.inecRegisteredVoters || 0) * lgaRatio);

      const unconverted = Math.max(0, lgaINECVoters - lgaObidientUsers);
      const conversionRate = lgaINECVoters > 0 ? ((lgaObidientUsers / lgaINECVoters) * 100) : 0;

      lgasData.push({
        id: lgaName.toLowerCase().replace(/\s+/g, '-'),
        name: lgaName,
        stateId: assignedState.toLowerCase().replace(/\s+/g, '-'),
        inecRegisteredVoters: lgaINECVoters,
        obidientRegisteredVoters: lgaObidientUsers,
        obidientVotersWithPVC: lgaPVCUsers,
        obidientVotersWithoutPVC: lgaNonPVCUsers,
        unconvertedVoters: unconverted,
        conversionRate: Number(conversionRate.toFixed(2)),
        pvcWithStatus: lgaPVCUsers,
        pvcWithoutStatus: lgaNonPVCUsers,
        wards: [],
        realData: {
          totalObidientUsers: lgaObidientUsers,
          votersWithPVC: lgaPVCUsers,
          votersWithoutPVC: lgaNonPVCUsers,
          votersWithPhone: 0,
          votersWithEmail: 0,
          pvcCompletionRate: lgaObidientUsers > 0 ? ((lgaPVCUsers / lgaObidientUsers) * 100) : 0,
          isRealData: false // This is fallback data
        }
      });
    });
  }

  console.log(`📈 Generated ${lgasData.length} LGAs for ${assignedState}`);

  // Calculate state-level stats
  const stateStats = {
    inecRegisteredVoters: stateINECData.inecRegisteredVoters || 0,
    obidientRegisteredVoters: stateVoterData.totalObidientUsers || 0,
    obidientVotersWithPVC: stateVoterData.votersWithPVC || 0,
    obidientVotersWithoutPVC: stateVoterData.votersWithoutPVC || 0,
    unconvertedVoters: Math.max(0, (stateINECData.inecRegisteredVoters || 0) - (stateVoterData.totalObidientUsers || 0)),
    conversionRate: (stateINECData.inecRegisteredVoters || 0) > 0
      ? Number((((stateVoterData.totalObidientUsers || 0) / (stateINECData.inecRegisteredVoters || 0)) * 100).toFixed(2))
      : 0,
    pvcWithStatus: stateVoterData.votersWithPVC || 0,
    pvcWithoutStatus: stateVoterData.votersWithoutPVC || 0,
    realData: {
      totalObidientUsers: stateVoterData.totalObidientUsers || 0,
      votersWithPVC: stateVoterData.votersWithPVC || 0,
      votersWithoutPVC: stateVoterData.votersWithoutPVC || 0,
      votersWithPhone: stateVoterData.votersWithPhone || 0,
      votersWithEmail: stateVoterData.votersWithEmail || 0,
      pvcCompletionRate: (stateVoterData.totalObidientUsers || 0) > 0
        ? Number((((stateVoterData.votersWithPVC || 0) / (stateVoterData.totalObidientUsers || 0)) * 100).toFixed(2))
        : 0,
      isRealData: true
    }
  };

  return {
    nationalStats: stateStats, // For this level, the "national" stats are actually state stats
    statesData: lgasData, // For this level, "states" are actually LGAs
    hierarchicalData: detailedBreakdown // Pass full hierarchical data for navigation
  };
}

async function getLGAData(assignedState, assignedLGA, obidientVotersByState, detailedBreakdown, inecData) {
  console.log('🔍 getLGAData called for:', { assignedState, assignedLGA });
  console.log('📊 Available detailed breakdown keys:', Object.keys(detailedBreakdown));

  // Get real ward data from detailedBreakdown
  const stateData = detailedBreakdown[assignedState];
  if (!stateData) {
    console.log('❌ No state data found in detailedBreakdown for:', assignedState);
    return { nationalStats: null, statesData: [], hierarchicalData: {} };
  }

  const lgaData = stateData[assignedLGA];
  if (!lgaData) {
    console.log('❌ No LGA data found for:', assignedLGA, 'Available LGAs:', Object.keys(stateData));
    return { nationalStats: null, statesData: [], hierarchicalData: {} };
  }

  console.log('✅ Found LGA data for:', assignedLGA, 'Wards:', Object.keys(lgaData));

  // Get INEC data for the state to calculate proportions
  const stateINECData = inecData.mockStates.find(s => s.name === assignedState) || {};
  const stateINECTotal = stateINECData.inecRegisteredVoters || 0;

  // Calculate LGA totals from ward data
  let lgaObidientTotal = 0;
  let lgaPVCTotal = 0;
  let lgaNonPVCTotal = 0;

  const wardsData = [];

  // Process each ward in the LGA
  Object.entries(lgaData).forEach(([wardName, wardData]) => {
    const wardObidientUsers = wardData.total_obidient_users || 0;
    const wardPVCUsers = wardData.voters_with_pvc || 0;
    const wardNonPVCUsers = wardData.voters_without_pvc || 0;

    // Add to LGA totals
    lgaObidientTotal += wardObidientUsers;
    lgaPVCTotal += wardPVCUsers;
    lgaNonPVCTotal += wardNonPVCUsers;

    // Estimate INEC voters for this ward (proportional to obidient users)
    const stateObidientTotal = obidientVotersByState[assignedState]?.totalObidientUsers || 1;
    const wardINECEstimate = stateObidientTotal > 0
      ? Math.round((wardObidientUsers / stateObidientTotal) * stateINECTotal)
      : Math.round(stateINECTotal * 0.01); // 1% fallback

    const unconverted = Math.max(0, wardINECEstimate - wardObidientUsers);
    const conversionRate = wardINECEstimate > 0 ? ((wardObidientUsers / wardINECEstimate) * 100) : 0;

    wardsData.push({
      id: `${assignedLGA}-${wardName}`.toLowerCase().replace(/\s+/g, '-'),
      name: wardName,
      lgaId: assignedLGA.toLowerCase().replace(/\s+/g, '-'),
      stateId: assignedState.toLowerCase().replace(/\s+/g, '-'),
      inecRegisteredVoters: wardINECEstimate,
      obidientRegisteredVoters: wardObidientUsers,
      obidientVotersWithPVC: wardPVCUsers,
      obidientVotersWithoutPVC: wardNonPVCUsers,
      unconvertedVoters: unconverted,
      conversionRate: Number(conversionRate.toFixed(2)),
      pvcWithStatus: wardPVCUsers,
      pvcWithoutStatus: wardNonPVCUsers,
      pollingUnits: [], // Will be populated if needed
      realData: {
        totalObidientUsers: wardObidientUsers,
        votersWithPVC: wardPVCUsers,
        votersWithoutPVC: wardNonPVCUsers,
        votersWithPhone: wardData.voters_with_phone || 0,
        votersWithEmail: wardData.voters_with_email || 0,
        pvcCompletionRate: wardObidientUsers > 0 ? ((wardPVCUsers / wardObidientUsers) * 100) : 0,
        isRealData: true
      }
    });
  });

  // Calculate LGA-level stats
  const lgaINECEstimate = Math.round(stateINECTotal * 0.1); // Rough estimate
  const lgaUnconverted = Math.max(0, lgaINECEstimate - lgaObidientTotal);
  const lgaConversionRate = lgaINECEstimate > 0 ? ((lgaObidientTotal / lgaINECEstimate) * 100) : 0;

  const lgaStats = {
    inecRegisteredVoters: lgaINECEstimate,
    obidientRegisteredVoters: lgaObidientTotal,
    obidientVotersWithPVC: lgaPVCTotal,
    obidientVotersWithoutPVC: lgaNonPVCTotal,
    unconvertedVoters: lgaUnconverted,
    conversionRate: Number(lgaConversionRate.toFixed(2)),
    pvcWithStatus: lgaPVCTotal,
    pvcWithoutStatus: lgaNonPVCTotal,
    realData: {
      totalObidientUsers: lgaObidientTotal,
      votersWithPVC: lgaPVCTotal,
      votersWithoutPVC: lgaNonPVCTotal,
      votersWithPhone: 0,
      votersWithEmail: 0,
      pvcCompletionRate: lgaObidientTotal > 0 ? ((lgaPVCTotal / lgaObidientTotal) * 100) : 0,
      isRealData: true
    }
  };

  console.log('📈 LGA Stats calculated:', lgaStats);
  console.log('📋 Wards data length:', wardsData.length);

  return {
    nationalStats: lgaStats, // For this level, the "national" stats are actually LGA stats
    statesData: wardsData, // For this level, "states" are actually wards
    hierarchicalData: detailedBreakdown // Pass full hierarchical data for navigation
  };
}

async function getWardData(assignedState, assignedLGA, assignedWard, obidientVotersByState, detailedBreakdown, inecData) {
  console.log('🔍 getWardData called for:', { assignedState, assignedLGA, assignedWard });

  // Get real polling unit data from detailedBreakdown
  const stateData = detailedBreakdown[assignedState];
  if (!stateData) {
    console.log('❌ No state data found in detailedBreakdown for:', assignedState);
    return { nationalStats: null, statesData: [], hierarchicalData: {} };
  }

  const lgaData = stateData[assignedLGA];
  if (!lgaData) {
    console.log('❌ No LGA data found for:', assignedLGA);
    return { nationalStats: null, statesData: [], hierarchicalData: {} };
  }

  const wardData = lgaData[assignedWard];
  if (!wardData) {
    console.log('❌ No ward data found for:', assignedWard, 'Available wards:', Object.keys(lgaData));
    return { nationalStats: null, statesData: [], hierarchicalData: {} };
  }

  console.log('✅ Found ward data for:', assignedWard, 'Polling Units:', Object.keys(wardData));

  // Get INEC data for the state to calculate proportions
  const stateINECData = inecData.mockStates.find(s => s.name === assignedState) || {};
  const stateINECTotal = stateINECData.inecRegisteredVoters || 0;

  // Calculate ward totals from polling unit data
  let wardObidientTotal = 0;
  let wardPVCTotal = 0;
  let wardNonPVCTotal = 0;

  const pollingUnitsData = [];

  // Process each polling unit in the ward
  Object.entries(wardData).forEach(([puName, puData]) => {
    const puObidientUsers = puData.total_obidient_users || 0;
    const puPVCUsers = puData.voters_with_pvc || 0;
    const puNonPVCUsers = puData.voters_without_pvc || 0;

    // Add to ward totals
    wardObidientTotal += puObidientUsers;
    wardPVCTotal += puPVCUsers;
    wardNonPVCTotal += puNonPVCUsers;

    // Estimate INEC voters for this polling unit
    const stateObidientTotal = obidientVotersByState[assignedState]?.totalObidientUsers || 1;
    const puINECEstimate = stateObidientTotal > 0
      ? Math.round((puObidientUsers / stateObidientTotal) * stateINECTotal)
      : Math.round(stateINECTotal * 0.001); // 0.1% fallback

    const unconverted = Math.max(0, puINECEstimate - puObidientUsers);
    const conversionRate = puINECEstimate > 0 ? ((puObidientUsers / puINECEstimate) * 100) : 0;

    pollingUnitsData.push({
      id: `${assignedWard}-${puName}`.toLowerCase().replace(/\s+/g, '-'),
      name: puName,
      wardId: assignedWard.toLowerCase().replace(/\s+/g, '-'),
      lgaId: assignedLGA.toLowerCase().replace(/\s+/g, '-'),
      stateId: assignedState.toLowerCase().replace(/\s+/g, '-'),
      inecRegisteredVoters: puINECEstimate,
      obidientRegisteredVoters: puObidientUsers,
      obidientVotersWithPVC: puPVCUsers,
      obidientVotersWithoutPVC: puNonPVCUsers,
      unconvertedVoters: unconverted,
      conversionRate: Number(conversionRate.toFixed(2)),
      pvcWithStatus: puPVCUsers,
      pvcWithoutStatus: puNonPVCUsers,
      realData: {
        totalObidientUsers: puObidientUsers,
        votersWithPVC: puPVCUsers,
        votersWithoutPVC: puNonPVCUsers,
        votersWithPhone: puData.voters_with_phone || 0,
        votersWithEmail: puData.voters_with_email || 0,
        pvcCompletionRate: puObidientUsers > 0 ? ((puPVCUsers / puObidientUsers) * 100) : 0,
        isRealData: true
      }
    });
  });

  // Calculate ward-level stats
  const wardINECEstimate = Math.round(stateINECTotal * 0.01); // Rough estimate
  const wardUnconverted = Math.max(0, wardINECEstimate - wardObidientTotal);
  const wardConversionRate = wardINECEstimate > 0 ? ((wardObidientTotal / wardINECEstimate) * 100) : 0;

  const wardStats = {
    inecRegisteredVoters: wardINECEstimate,
    obidientRegisteredVoters: wardObidientTotal,
    obidientVotersWithPVC: wardPVCTotal,
    obidientVotersWithoutPVC: wardNonPVCTotal,
    unconvertedVoters: wardUnconverted,
    conversionRate: Number(wardConversionRate.toFixed(2)),
    pvcWithStatus: wardPVCTotal,
    pvcWithoutStatus: wardNonPVCTotal,
    realData: {
      totalObidientUsers: wardObidientTotal,
      votersWithPVC: wardPVCTotal,
      votersWithoutPVC: wardNonPVCTotal,
      votersWithPhone: 0,
      votersWithEmail: 0,
      pvcCompletionRate: wardObidientTotal > 0 ? ((wardPVCTotal / wardObidientTotal) * 100) : 0,
      isRealData: true
    }
  };

  console.log('📈 Ward Stats calculated:', wardStats);
  console.log('📋 Polling Units data length:', pollingUnitsData.length);

  return {
    nationalStats: wardStats, // For this level, the "national" stats are actually ward stats
    statesData: pollingUnitsData, // For this level, "states" are actually polling units
    hierarchicalData: detailedBreakdown // Pass full hierarchical data
  };
}

async function getSubordinatesByLevel(designations, state = null, lga = null, ward = null) {
  let sqlQuery = `
    SELECT 
      id,
      "name",
      email,
      designation,
      "assignedState",
      "assignedLGA", 
      "assignedWard",
      "phone",
      "createdAt"
    FROM users 
    WHERE 1=1
  `;

  const params = [];

  // Handle designation filter
  if (Array.isArray(designations)) {
    sqlQuery += ` AND designation = ANY($${params.length + 1})`;
    params.push(designations);
  } else {
    sqlQuery += ` AND designation = $${params.length + 1}`;
    params.push(designations);
  }

  // Apply location filters based on level
  if (state) {
    sqlQuery += ` AND "assignedState" = $${params.length + 1}`;
    params.push(state);
  }

  if (lga) {
    sqlQuery += ` AND "assignedLGA" = $${params.length + 1}`;
    params.push(lga);
  }

  if (ward) {
    sqlQuery += ` AND "assignedWard" = $${params.length + 1}`;
    params.push(ward);
  }

  sqlQuery += ` ORDER BY "createdAt" DESC`;

  const result = await query(sqlQuery, params);
  return result.rows;
}

// Helper functions for Obidient voter data
async function getObidientVotersByState() {
  try {
    const sqlQuery = `
      SELECT 
        "votingState" as state,
        COUNT(*) as total_obidient_users,
        COUNT(CASE WHEN "isVoter" = 'Yes' THEN 1 END) as voters_with_pvc,
        COUNT(CASE WHEN "isVoter" = 'No' OR "isVoter" IS NULL THEN 1 END) as voters_without_pvc,
        COUNT(CASE WHEN "phone" IS NOT NULL AND "phone" != '' THEN 1 END) as voters_with_phone,
        COUNT(CASE WHEN "email" IS NOT NULL AND "email" != '' THEN 1 END) as voters_with_email
      FROM users 
      WHERE "votingState" IS NOT NULL 
        AND "votingState" != ''
      GROUP BY "votingState"
      ORDER BY "votingState"
    `;

    const result = await query(sqlQuery);

    // Transform into the format expected by frontend
    const votersByState = {};
    result.rows.forEach(row => {
      votersByState[row.state] = {
        totalObidientUsers: parseInt(row.total_obidient_users),
        obidientVoters: parseInt(row.voters_with_pvc), // Keep for backward compatibility
        votersWithPVC: parseInt(row.voters_with_pvc),
        votersWithoutPVC: parseInt(row.voters_without_pvc),
        votersWithPhone: parseInt(row.voters_with_phone),
        votersWithEmail: parseInt(row.voters_with_email)
      };
    });

    return votersByState;
  } catch (error) {
    console.error('Error fetching voters by state:', error);
    throw error;
  }
}

async function getObidientVotersDetailed() {
  try {
    // Get data at multiple aggregation levels
    const queries = {
      // State level aggregation
      states: `
        SELECT 
          "votingState" as state,
          COUNT(*) as total_obidient_users,
          COUNT(CASE WHEN "isVoter" = 'Yes' THEN 1 END) as voters_with_pvc,
          COUNT(CASE WHEN "isVoter" = 'No' OR "isVoter" IS NULL THEN 1 END) as voters_without_pvc
        FROM users 
        WHERE "votingState" IS NOT NULL AND "votingState" != ''
        GROUP BY "votingState"
        ORDER BY "votingState"
      `,

      // LGA level aggregation  
      lgas: `
        SELECT 
          "votingState" as state,
          "votingLGA" as lga,
          COUNT(*) as total_obidient_users,
          COUNT(CASE WHEN "isVoter" = 'Yes' THEN 1 END) as voters_with_pvc,
          COUNT(CASE WHEN "isVoter" = 'No' OR "isVoter" IS NULL THEN 1 END) as voters_without_pvc
        FROM users 
        WHERE "votingState" IS NOT NULL AND "votingState" != ''
          AND "votingLGA" IS NOT NULL AND "votingLGA" != ''
        GROUP BY "votingState", "votingLGA"
        ORDER BY "votingState", "votingLGA"
      `,

      // Ward level aggregation
      wards: `
        SELECT 
          "votingState" as state,
          "votingLGA" as lga,
          "votingWard" as ward,
          COUNT(*) as total_obidient_users,
          COUNT(CASE WHEN "isVoter" = 'Yes' THEN 1 END) as voters_with_pvc,
          COUNT(CASE WHEN "isVoter" = 'No' OR "isVoter" IS NULL THEN 1 END) as voters_without_pvc
        FROM users 
        WHERE "votingState" IS NOT NULL AND "votingState" != ''
          AND "votingLGA" IS NOT NULL AND "votingLGA" != ''
          AND "votingWard" IS NOT NULL AND "votingWard" != ''
        GROUP BY "votingState", "votingLGA", "votingWard"
        ORDER BY "votingState", "votingLGA", "votingWard"
      `,

      // Polling Unit level aggregation
      pollingUnits: `
        SELECT 
          "votingState" as state,
          "votingLGA" as lga,
          "votingWard" as ward,
          "votingPU" as polling_unit,
          COUNT(*) as total_obidient_users,
          COUNT(CASE WHEN "isVoter" = 'Yes' THEN 1 END) as voters_with_pvc,
          COUNT(CASE WHEN "isVoter" = 'No' OR "isVoter" IS NULL THEN 1 END) as voters_without_pvc
        FROM users 
        WHERE "votingState" IS NOT NULL AND "votingState" != ''
          AND "votingLGA" IS NOT NULL AND "votingLGA" != ''
          AND "votingWard" IS NOT NULL AND "votingWard" != ''
          AND "votingPU" IS NOT NULL AND "votingPU" != ''
        GROUP BY "votingState", "votingLGA", "votingWard", "votingPU"
        ORDER BY "votingState", "votingLGA", "votingWard", "votingPU"
      `
    };

    // Execute all queries in parallel
    const [statesResult, lgasResult, wardsResult, pollingUnitsResult] = await Promise.all([
      query(queries.states),
      query(queries.lgas),
      query(queries.wards),
      query(queries.pollingUnits)
    ]);

    // Structure the data hierarchically
    const detailedData = {};

    // Helper function to create location data object
    const createLocationData = (row) => ({
      totalObidientUsers: parseInt(row.total_obidient_users),
      obidientVoters: parseInt(row.voters_with_pvc), // Keep for backward compatibility
      votersWithPVC: parseInt(row.voters_with_pvc),
      votersWithoutPVC: parseInt(row.voters_without_pvc)
    });

    // Build state structure first
    statesResult.rows.forEach(row => {
      detailedData[row.state] = createLocationData(row);
    });

    // Add LGAs to each state
    lgasResult.rows.forEach(row => {
      if (!detailedData[row.state]) {
        detailedData[row.state] = {};
      }
      if (!detailedData[row.state][row.lga]) {
        detailedData[row.state][row.lga] = createLocationData(row);
      }
    });

    // Add Wards to each LGA
    wardsResult.rows.forEach(row => {
      if (!detailedData[row.state]) {
        detailedData[row.state] = {};
      }
      if (!detailedData[row.state][row.lga]) {
        detailedData[row.state][row.lga] = {};
      }
      if (!detailedData[row.state][row.lga][row.ward]) {
        detailedData[row.state][row.lga][row.ward] = createLocationData(row);
      }
    });

    // Add Polling Units to each Ward
    pollingUnitsResult.rows.forEach(row => {
      if (!detailedData[row.state]) {
        detailedData[row.state] = {};
      }
      if (!detailedData[row.state][row.lga]) {
        detailedData[row.state][row.lga] = {};
      }
      if (!detailedData[row.state][row.lga][row.ward]) {
        detailedData[row.state][row.lga][row.ward] = {};
      }
      if (!detailedData[row.state][row.lga][row.ward][row.polling_unit]) {
        detailedData[row.state][row.lga][row.ward][row.polling_unit] = createLocationData(row);
      }
    });

    return detailedData;
  } catch (error) {
    console.error('❌ Error fetching detailed voter data:', error);
    throw error;
  }
}

// Generate mock INEC data for all Nigerian states
function generateMockINECData() {
  const mockStatesINEC = {
    'Abia': 2381762,
    'Adamawa': 2439999,
    'Akwa Ibom': 2972907,
    'Anambra': 2525471,
    'Bauchi': 4270966,
    'Bayelsa': 1143270,
    'Benue': 2965218,
    'Borno': 2508949,
    'Cross River': 1986988,
    'Delta': 3363881,
    'Ebonyi': 1605637,
    'Edo': 2370748,
    'Ekiti': 988923,
    'Enugu': 1704935,
    'Federal Capital Territory': 1379516,
    'Gombe': 1871267,
    'Imo': 2524692,
    'Jigawa': 2944813,
    'Kaduna': 4335208,
    'Kano': 5921370,
    'Katsina': 4302265,
    'Kebbi': 2092350,
    'Kogi': 2154302,
    'Kwara': 1820860,
    'Lagos': 7060195,
    'Nasarawa': 1605847,
    'Niger': 3389014,
    'Ogun': 2375003,
    'Ondo': 2170045,
    'Osun': 1955657,
    'Oyo': 3924919,
    'Plateau': 2480052,
    'Rivers': 3018934,
    'Sokoto': 2423311,
    'Taraba': 1898476,
    'Yobe': 1321519,
    'Zamfara': 2087225
  };

  const mockStates = Object.entries(mockStatesINEC).map(([name, inecRegisteredVoters]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    inecRegisteredVoters
  }));

  return {
    mockStates,
    totalINEC: Object.values(mockStatesINEC).reduce((sum, count) => sum + count, 0),
    totalPVCWith: Math.round(Object.values(mockStatesINEC).reduce((sum, count) => sum + count, 0) * 0.75),
    totalPVCWithout: Math.round(Object.values(mockStatesINEC).reduce((sum, count) => sum + count, 0) * 0.25)
  };
}

export default stateDashboardController;