import { query } from '../config/db.js';

/**
 * Get Obidient voter data aggregated by state
 */
export async function getObidientVotersByState() {
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

/**
 * Get detailed Obidient voter data hierarchically structured
 */
export async function getObidientVotersDetailed() {
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
      detailedData[row.state] = {
        ...createLocationData(row),
        lgas: {}
      };
    });

    console.log('📊 Processing LGAs data...');
    console.log('📊 LGAs count:', lgasResult.rows.length);

    // Add LGAs to each state
    lgasResult.rows.forEach((row, index) => {
      console.log(`📊 Processing LGA ${index + 1}/${lgasResult.rows.length}:`, {
        state: row.state,
        lga: row.lga,
        total_obidient_users: row.total_obidient_users
      });

      if (!detailedData[row.state]) {
        console.log(`🔧 Creating state: ${row.state}`);
        detailedData[row.state] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          lgas: {}
        };
      }
      if (!detailedData[row.state].lgas) {
        console.log(`🔧 Creating lgas object for state: ${row.state}`);
        detailedData[row.state].lgas = {};
      }
      console.log(`🔧 Setting LGA data: ${row.lga}`);
      detailedData[row.state].lgas[row.lga] = createLocationData(row);
      console.log(`✅ Successfully set LGA: ${row.lga}`);
    });

    console.log('📊 Processing wards data...');
    console.log('📊 Wards count:', wardsResult.rows.length);

    // Add Wards to each LGA
    wardsResult.rows.forEach((row, index) => {
      console.log(`📊 Processing ward ${index + 1}/${wardsResult.rows.length}:`, {
        state: row.state,
        lga: row.lga,
        ward: row.ward,
        total_obidient_users: row.total_obidient_users
      });

      if (!detailedData[row.state]) {
        console.log(`🔧 Creating state: ${row.state}`);
        detailedData[row.state] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          lgas: {}
        };
      }
      if (!detailedData[row.state].lgas) {
        console.log(`🔧 Creating lgas object for state: ${row.state}`);
        detailedData[row.state].lgas = {};
      }
      if (!detailedData[row.state].lgas[row.lga]) {
        console.log(`🔧 Creating LGA: ${row.lga} in state: ${row.state}`);
        detailedData[row.state].lgas[row.lga] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          wards: {}
        };
      }
      console.log(`🔧 Setting ward data: ${row.ward}`);
      detailedData[row.state].lgas[row.lga].wards[row.ward] = createLocationData(row);
      console.log(`✅ Successfully set ward: ${row.ward}`);
    });

    console.log('📊 Processing polling units data...');
    console.log('📊 Polling units count:', pollingUnitsResult.rows.length);

    // Add Polling Units to each Ward
    pollingUnitsResult.rows.forEach((row, index) => {
      console.log(`📊 Processing polling unit ${index + 1}/${pollingUnitsResult.rows.length}:`, {
        state: row.state,
        lga: row.lga,
        ward: row.ward,
        polling_unit: row.polling_unit,
        total_obidient_users: row.total_obidient_users
      });

      // Ensure state exists
      if (!detailedData[row.state]) {
        console.log(`🔧 Creating state: ${row.state}`);
        detailedData[row.state] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          lgas: {}
        };
      }

      // Ensure lgas object exists
      if (!detailedData[row.state].lgas) {
        console.log(`🔧 Creating lgas object for state: ${row.state}`);
        detailedData[row.state].lgas = {};
      }

      // Ensure LGA exists
      if (!detailedData[row.state].lgas[row.lga]) {
        console.log(`🔧 Creating LGA: ${row.lga} in state: ${row.state}`);
        detailedData[row.state].lgas[row.lga] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          wards: {}
        };
      }

      // Ensure wards object exists
      if (!detailedData[row.state].lgas[row.lga].wards) {
        console.log(`🔧 Creating wards object for LGA: ${row.lga}`);
        detailedData[row.state].lgas[row.lga].wards = {};
      }

      // Ensure Ward exists
      if (!detailedData[row.state].lgas[row.lga].wards[row.ward]) {
        console.log(`🔧 Creating Ward: ${row.ward} in LGA: ${row.lga}`);
        detailedData[row.state].lgas[row.lga].wards[row.ward] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          pollingUnits: {}
        };
      }

      // Ensure pollingUnits object exists
      if (!detailedData[row.state].lgas[row.lga].wards[row.ward].pollingUnits) {
        console.log(`🔧 Creating pollingUnits object for Ward: ${row.ward}`);
        detailedData[row.state].lgas[row.lga].wards[row.ward].pollingUnits = {};
      }

      // Now safely set the polling unit data
      console.log(`🔧 Setting polling unit data: ${row.polling_unit}`);
      detailedData[row.state].lgas[row.lga].wards[row.ward].pollingUnits[row.polling_unit] = createLocationData(row);
      console.log(`✅ Successfully set polling unit: ${row.polling_unit}`);
    });

    console.log('🔍 DEBUG - Final detailed data structure:', JSON.stringify(detailedData, null, 2));
    return detailedData;
  } catch (error) {
    console.error('❌ Error fetching detailed voter data:', error);
    throw error;
  }
}