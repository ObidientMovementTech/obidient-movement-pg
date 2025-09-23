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
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as voters_with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as voters_without_pvc
      FROM users 
      WHERE "votingState" IS NOT NULL AND "votingState" != ''
      GROUP BY "votingState"
      ORDER BY "votingState"
    `;

    console.log('🔍 DEBUG - Executing getObidientVotersByState query:', sqlQuery);
    const result = await query(sqlQuery);

    console.log('🔍 DEBUG - getObidientVotersByState result count:', result.rows.length);
    console.log('🔍 DEBUG - Sample state data:', result.rows[0]);

    return result.rows.map(row => ({
      state: row.state,
      totalObidientUsers: parseInt(row.total_obidient_users) || 0,
      votersWithPVC: parseInt(row.voters_with_pvc) || 0,
      votersWithoutPVC: parseInt(row.voters_without_pvc) || 0
    }));
  } catch (error) {
    console.error('❌ Error in getObidientVotersByState:', error);
    throw error;
  }
}

/**
 * Helper function to create location data structure
 */
function createLocationData(row) {
  const totalObidientUsers = parseInt(row.total_obidient_users) || 0;
  const votersWithPVC = parseInt(row.voters_with_pvc) || 0;
  const votersWithoutPVC = parseInt(row.voters_without_pvc) || 0;

  return {
    inecRegisteredVoters: 0, // This would come from INEC data
    obidientRegisteredVoters: totalObidientUsers,
    obidientVotersWithPVC: votersWithPVC,
    obidientVotersWithoutPVC: votersWithoutPVC,
    unconvertedVoters: 0, // This would be calculated
    conversionRate: 0, // This would be calculated
    pvcWithStatus: votersWithPVC,
    pvcWithoutStatus: votersWithoutPVC,
    realData: {
      totalObidientUsers: totalObidientUsers,
      votersWithPVC: votersWithPVC,
      votersWithoutPVC: votersWithoutPVC,
      votersWithPhone: 0, // This would need to be calculated
      votersWithEmail: 0, // This would need to be calculated
      pvcCompletionRate: totalObidientUsers > 0 ? (votersWithPVC / totalObidientUsers) * 100 : 0,
      isRealData: true
    }
  };
}

/**
 * Get detailed hierarchical voter data for all states, LGAs, wards, and polling units
 */
export async function getObidientVotersDetailed() {
  try {
    console.log('🚀 Starting getObidientVotersDetailed...');

    // Query for state-level data
    const statesQuery = `
      SELECT 
        "votingState" as state,
        COUNT(*) as total_obidient_users,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as voters_with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as voters_without_pvc
      FROM users 
      WHERE "votingState" IS NOT NULL AND "votingState" != ''
      GROUP BY "votingState"
      ORDER BY "votingState"
    `;

    // Query for LGA-level data
    const lgasQuery = `
      SELECT 
        "votingState" as state,
        "votingLGA" as lga,
        COUNT(*) as total_obidient_users,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as voters_with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as voters_without_pvc
      FROM users 
      WHERE "votingState" IS NOT NULL AND "votingState" != '' AND "votingLGA" IS NOT NULL
      GROUP BY "votingState", "votingLGA"
      ORDER BY "votingState", "votingLGA"
    `;

    // Query for Ward-level data
    const wardsQuery = `
      SELECT 
        "votingState" as state,
        "votingLGA" as lga,
        "votingWard" as ward,
        COUNT(*) as total_obidient_users,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as voters_with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as voters_without_pvc
      FROM users 
      WHERE "votingState" IS NOT NULL AND "votingState" != '' AND "votingLGA" IS NOT NULL AND "votingWard" IS NOT NULL
      GROUP BY "votingState", "votingLGA", "votingWard"
      ORDER BY "votingState", "votingLGA", "votingWard"
    `;

    // Query for Polling Unit-level data
    const pollingUnitsQuery = `
      SELECT 
        "votingState" as state,
        "votingLGA" as lga,
        "votingWard" as ward,
        "votingPU" as polling_unit,
        COUNT(*) as total_obidient_users,
        COUNT(*) FILTER (WHERE "isVoter" = 'Yes') as voters_with_pvc,
        COUNT(*) FILTER (WHERE "isVoter" = 'No' OR "isVoter" IS NULL) as voters_without_pvc
      FROM users 
      WHERE "votingState" IS NOT NULL AND "votingState" != '' AND "votingLGA" IS NOT NULL 
        AND "votingWard" IS NOT NULL AND "votingPU" IS NOT NULL
      GROUP BY "votingState", "votingLGA", "votingWard", "votingPU"
      ORDER BY "votingState", "votingLGA", "votingWard", "votingPU"
    `;

    console.log('🔍 Executing queries...');

    const [statesResult, lgasResult, wardsResult, pollingUnitsResult] = await Promise.all([
      query(statesQuery),
      query(lgasQuery),
      query(wardsQuery),
      query(pollingUnitsQuery)
    ]);

    console.log('📊 Query results:');
    console.log('  - States:', statesResult.rows.length);
    console.log('  - LGAs:', lgasResult.rows.length);
    console.log('  - Wards:', wardsResult.rows.length);
    console.log('  - Polling Units:', pollingUnitsResult.rows.length);

    // Build hierarchical data structure
    const detailedData = {};

    // Start with states
    console.log('📊 Processing states data...');
    statesResult.rows.forEach((row, index) => {
      // Skip rows with empty/null state values
      if (!row.state) {
        console.log(`⚠️ Skipping state ${index + 1} due to empty state value`);
        return;
      }

      console.log(`📊 Processing state ${index + 1}/${statesResult.rows.length}:`, {
        state: row.state,
        total_obidient_users: row.total_obidient_users
      });

      detailedData[row.state] = {
        ...createLocationData(row),
        lgas: {}
      };
      console.log(`✅ Successfully set state: ${row.state}`);
    });

    // Add LGAs to each state
    console.log('📊 Processing LGAs data...');
    console.log('📊 LGAs count:', lgasResult.rows.length);

    lgasResult.rows.forEach((row, index) => {
      // Skip rows with empty/null critical values
      if (!row.state || !row.lga) {
        console.log(`⚠️ Skipping LGA ${index + 1} due to empty values:`, {
          state: row.state,
          lga: row.lga
        });
        return;
      }

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

    // Add Wards to each LGA
    console.log('📊 Processing wards data...');
    console.log('📊 Wards count:', wardsResult.rows.length);

    wardsResult.rows.forEach((row, index) => {
      // Skip rows with empty/null critical values
      if (!row.state || !row.lga || !row.ward) {
        console.log(`⚠️ Skipping ward ${index + 1} due to empty values:`, {
          state: row.state,
          lga: row.lga,
          ward: row.ward
        });
        return;
      }

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
      if (!detailedData[row.state].lgas[row.lga].wards) {
        console.log(`🔧 Creating wards object for LGA: ${row.lga}`);
        detailedData[row.state].lgas[row.lga].wards = {};
      }
      console.log(`🔧 Setting ward data: ${row.ward}`);
      detailedData[row.state].lgas[row.lga].wards[row.ward] = createLocationData(row);
      console.log(`✅ Successfully set ward: ${row.ward}`);
    });

    // Add Polling Units to each Ward
    console.log('📊 Processing polling units data...');
    console.log('📊 Polling units count:', pollingUnitsResult.rows.length);

    pollingUnitsResult.rows.forEach((row, index) => {
      // Skip rows with empty/null critical values
      if (!row.state || !row.lga || !row.ward || !row.polling_unit) {
        console.log(`⚠️ Skipping polling unit ${index + 1} due to empty values:`, {
          state: row.state,
          lga: row.lga,
          ward: row.ward,
          polling_unit: row.polling_unit
        });
        return;
      }

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
      try {
        detailedData[row.state].lgas[row.lga].wards[row.ward].pollingUnits[row.polling_unit] = createLocationData(row);
        console.log(`✅ Successfully set polling unit: ${row.polling_unit}`);
      } catch (error) {
        console.error(`❌ Error setting polling unit ${row.polling_unit}:`, error);
        console.error('Current data structure:', {
          state: row.state,
          hasState: !!detailedData[row.state],
          hasLgas: !!detailedData[row.state]?.lgas,
          hasLga: !!detailedData[row.state]?.lgas?.[row.lga],
          hasWards: !!detailedData[row.state]?.lgas?.[row.lga]?.wards,
          hasWard: !!detailedData[row.state]?.lgas?.[row.lga]?.wards?.[row.ward],
          hasPollingUnits: !!detailedData[row.state]?.lgas?.[row.lga]?.wards?.[row.ward]?.pollingUnits
        });
        throw error;
      }
    });

    console.log('🔍 DEBUG - Final detailed data structure keys:', Object.keys(detailedData));
    console.log('🔍 DEBUG - Sample state structure:', Object.keys(detailedData[Object.keys(detailedData)[0]] || {}));

    return detailedData;
  } catch (error) {
    console.error('❌ Error fetching detailed voter data:', error);
    throw error;
  }
}