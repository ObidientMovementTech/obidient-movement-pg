import { query } from '../config/db.js';

const stateDashboardController = {
  // Get dashboard data based on user's designation and assigned location
  getDashboardData: async (req, res) => {
    try {
      console.log('🔍 getDashboardData called for user:', req.user.email);
      console.log('🆔 User ID details:', {
        userId: req.user.userId,
        id: req.user.id,
        userIdType: typeof req.user.userId,
        idType: typeof req.user.id
      });

      const userId = req.user.userId || req.user.id;

      // Get user's designation and assignment details
      const userQuery = `
        SELECT designation, "assignedState", "assignedLGA", "assignedWard"
        FROM users 
        WHERE id = $1
      `;

      console.log('🔍 About to query with userId:', userId, 'type:', typeof userId);

      const userResult = await query(userQuery, [userId]);

      console.log('📋 User query result:', userResult.rows[0]);

      if (userResult.rows.length === 0) {
        console.log('❌ User not found');
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const { designation, assignedState, assignedLGA, assignedWard } = user;

      console.log('👤 User details:', { designation, assignedState, assignedLGA, assignedWard });

      // Check if user has coordinator designation OR is admin
      const coordinatorDesignations = [
        'National Coordinator',
        'State Coordinator',
        'LGA Coordinator',
        'Ward Coordinator'
      ];

      const isCoordinator = coordinatorDesignations.includes(designation);
      const isAdmin = req.user.role === 'admin';

      console.log('🔐 Access check:', { designation, isCoordinator, isAdmin, userRole: req.user.role });

      if (!isCoordinator && !isAdmin) {
        console.log('❌ Access denied');
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only coordinators and admins can access the State Dashboard.'
        });
      }

      let dashboardData = {};

      console.log('🏗️ Building dashboard data based on designation:', designation);

      // Build query based on designation level
      switch (designation) {
        case 'National Coordinator':
          // Can see all states and their data
          console.log('📊 Fetching National data');
          dashboardData = await getNationalData();
          break;

        case 'State Coordinator':
          // Can see all LGAs in their assigned state
          if (!assignedState) {
            return res.status(400).json({
              success: false,
              message: 'State Coordinator must have an assigned state'
            });
          }
          console.log('📊 Fetching State data for:', assignedState);
          dashboardData = await getStateData(assignedState);
          break;

        case 'LGA Coordinator':
          // Can see all wards in their assigned LGA
          if (!assignedState || !assignedLGA) {
            return res.status(400).json({
              success: false,
              message: 'LGA Coordinator must have assigned state and LGA'
            });
          }
          console.log('📊 Fetching LGA data for:', assignedState, assignedLGA);
          dashboardData = await getLGAData(assignedState, assignedLGA);
          break;

        case 'Ward Coordinator':
          // Can see their assigned ward data
          if (!assignedState || !assignedLGA || !assignedWard) {
            return res.status(400).json({
              success: false,
              message: 'Ward Coordinator must have assigned state, LGA, and ward'
            });
          }
          console.log('📊 Fetching Ward data for:', assignedState, assignedLGA, assignedWard);
          dashboardData = await getWardData(assignedState, assignedLGA, assignedWard);
          break;

        default:
          // If user is admin but doesn't have coordinator designation, show national view
          if (isAdmin) {
            console.log('📊 Admin user - showing National data');
            dashboardData = await getNationalData();
            // Override designation for frontend display
            user.designation = 'National Coordinator';
          } else {
            console.log('❌ Invalid designation:', designation);
            return res.status(403).json({
              success: false,
              message: 'Invalid coordinator designation'
            });
          }
          break;
      }

      console.log('✅ Successfully fetched dashboard data');

      const responseData = {
        success: true,
        data: {
          userDesignation: user.designation || designation,
          assignedLocation: {
            state: assignedState,
            lga: assignedLGA,
            ward: assignedWard
          },
          dashboardData
        }
      };

      console.log('📤 Sending response:', {
        userDesignation: responseData.data.userDesignation,
        hasData: !!responseData.data.dashboardData
      });

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
      console.log('🔍 getSubordinateCoordinators called for user:', req.user.email);
      console.log('🆔 User ID details:', {
        userId: req.user.userId,
        id: req.user.id,
        userIdType: typeof req.user.userId,
        idType: typeof req.user.id
      });

      const userId = req.user.userId || req.user.id;

      // Get user's designation and assignment details
      const userQuery = `
        SELECT designation, "assignedState", "assignedLGA", "assignedWard"
        FROM users 
        WHERE id = $1
      `;

      console.log('🔍 About to query subordinates with userId:', userId, 'type:', typeof userId);

      const userResult = await query(userQuery, [userId]);

      console.log('📋 User query result for subordinates:', userResult.rows[0]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const { designation, assignedState, assignedLGA, assignedWard } = user;

      console.log('👥 Fetching subordinates for:', { designation, assignedState, assignedLGA, assignedWard });

      let subordinates = [];

      switch (designation) {
        case 'National Coordinator':
          // Can see all State Coordinators
          console.log('👥 Fetching State Coordinators');
          subordinates = await getSubordinatesByLevel('State Coordinator');
          break;

        case 'State Coordinator':
          // Can see LGA Coordinators in their state
          console.log('👥 Fetching LGA Coordinators for state:', assignedState);
          subordinates = await getSubordinatesByLevel('LGA Coordinator', assignedState);
          break;

        case 'LGA Coordinator':
          // Can see Ward Coordinators in their LGA
          console.log('👥 Fetching Ward Coordinators for LGA:', assignedState, assignedLGA);
          subordinates = await getSubordinatesByLevel('Ward Coordinator', assignedState, assignedLGA);
          break;

        case 'Ward Coordinator':
          // Can see Polling Unit Agents and Vote Defenders in their ward
          console.log('👥 Fetching agents/defenders for ward:', assignedState, assignedLGA, assignedWard);
          subordinates = await getSubordinatesByLevel(['Polling Unit Agents', 'Vote Defenders'], assignedState, assignedLGA, assignedWard);
          break;

        default:
          // If user is admin, show all State Coordinators (like National Coordinator)
          if (req.user.role === 'admin') {
            console.log('👥 Admin user - fetching State Coordinators');
            subordinates = await getSubordinatesByLevel('State Coordinator');
          } else {
            console.log('❌ Invalid designation for subordinates:', designation);
            return res.status(403).json({
              success: false,
              message: 'Only coordinators and admins can view subordinates'
            });
          }
          break;
      }

      console.log('✅ Found subordinates:', subordinates.length);

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
  }
};

// Helper functions for data retrieval
async function getNationalData() {
  const sqlQuery = `
    SELECT 
      "votingState" as state,
      COUNT(*) as total_members,
      COUNT(CASE WHEN designation = 'State Coordinator' THEN 1 END) as state_coordinators,
      COUNT(CASE WHEN designation = 'LGA Coordinator' THEN 1 END) as lga_coordinators,
      COUNT(CASE WHEN designation = 'Ward Coordinator' THEN 1 END) as ward_coordinators,
      COUNT(CASE WHEN designation = 'Polling Unit Agents' THEN 1 END) as polling_agents,
      COUNT(CASE WHEN designation = 'Vote Defenders' THEN 1 END) as vote_defenders
    FROM users 
    WHERE "votingState" IS NOT NULL
    GROUP BY "votingState"
    ORDER BY "votingState"
  `;

  const result = await query(sqlQuery);
  return {
    states: result.rows,
    totalMembers: result.rows.reduce((sum, state) => sum + parseInt(state.total_members), 0)
  };
}

async function getStateData(assignedState) {
  const sqlQuery = `
    SELECT 
      "votingLGA" as lga,
      COUNT(*) as total_members,
      COUNT(CASE WHEN designation = 'LGA Coordinator' THEN 1 END) as lga_coordinators,
      COUNT(CASE WHEN designation = 'Ward Coordinator' THEN 1 END) as ward_coordinators,
      COUNT(CASE WHEN designation = 'Polling Unit Agents' THEN 1 END) as polling_agents,
      COUNT(CASE WHEN designation = 'Vote Defenders' THEN 1 END) as vote_defenders
    FROM users 
    WHERE "votingState" = $1 AND "votingLGA" IS NOT NULL
    GROUP BY "votingLGA"
    ORDER BY "votingLGA"
  `;

  const result = await query(sqlQuery, [assignedState]);
  return {
    state: assignedState,
    lgas: result.rows,
    totalMembers: result.rows.reduce((sum, lga) => sum + parseInt(lga.total_members), 0)
  };
}

async function getLGAData(assignedState, assignedLGA) {
  const sqlQuery = `
    SELECT 
      "votingWard" as ward,
      COUNT(*) as total_members,
      COUNT(CASE WHEN designation = 'Ward Coordinator' THEN 1 END) as ward_coordinators,
      COUNT(CASE WHEN designation = 'Polling Unit Agents' THEN 1 END) as polling_agents,
      COUNT(CASE WHEN designation = 'Vote Defenders' THEN 1 END) as vote_defenders
    FROM users 
    WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" IS NOT NULL
    GROUP BY "votingWard"
    ORDER BY "votingWard"
  `;

  const result = await query(sqlQuery, [assignedState, assignedLGA]);
  return {
    state: assignedState,
    lga: assignedLGA,
    wards: result.rows,
    totalMembers: result.rows.reduce((sum, ward) => sum + parseInt(ward.total_members), 0)
  };
}

async function getWardData(assignedState, assignedLGA, assignedWard) {
  const sqlQuery = `
    SELECT 
      id,
      "firstName",
      "lastName", 
      email,
      designation,
      "phoneNumber",
      "createdAt"
    FROM users 
    WHERE "votingState" = $1 AND "votingLGA" = $2 AND "votingWard" = $3
    ORDER BY "createdAt" DESC
  `;

  const result = await query(sqlQuery, [assignedState, assignedLGA, assignedWard]);
  return {
    state: assignedState,
    lga: assignedLGA,
    ward: assignedWard,
    members: result.rows,
    totalMembers: result.rows.length
  };
}

async function getSubordinatesByLevel(designations, state = null, lga = null, ward = null) {
  let sqlQuery = `
    SELECT 
      id,
      "firstName",
      "lastName",
      email,
      designation,
      "assignedState",
      "assignedLGA", 
      "assignedWard",
      "phoneNumber",
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

export default stateDashboardController;
