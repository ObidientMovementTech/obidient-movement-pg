import { query } from '../config/db.js';

/**
 * Helper function to normalize location names for consistency
 * Converts to title case and handles common variations
 */
function normalizeLocationName(name) {
  if (!name) return '';

  // Convert to title case and handle common patterns
  const normalized = name
    .toLowerCase()
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .replace(/-/g, ' ')    // Convert hyphens to spaces
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase()); // Title case

  return normalized;
}

/**
 * Helper function to create a normalized key for location names
 * This ensures consistent grouping regardless of case or spacing
 */
function createLocationKey(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[\s\-]+/g, '-').trim();
}

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

    const result = await query(sqlQuery);


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


    const [statesResult, lgasResult, wardsResult, pollingUnitsResult] = await Promise.all([
      query(statesQuery),
      query(lgasQuery),
      query(wardsQuery),
      query(pollingUnitsQuery)
    ]);


    // Build hierarchical data structure
    const detailedData = {};

    // Start with states
    statesResult.rows.forEach((row, index) => {
      // Skip rows with empty/null state values
      if (!row.state) {
        console.log(`⚠️ Skipping state ${index + 1} due to empty state value`);
        return;
      }

      // console.log(`📊 Processing state ${index + 1}/${statesResult.rows.length}:`, {
      //   state: row.state,
      //   total_obidient_users: row.total_obidient_users
      // });

      detailedData[row.state] = {
        ...createLocationData(row),
        lgas: {}
      };
      console.log(`✅ Successfully set state: ${row.state}`);
    });

    // Add LGAs to each state with normalization and aggregation
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

      // Normalize the LGA name and create a consistent key
      const normalizedLgaName = normalizeLocationName(row.lga);
      const lgaKey = createLocationKey(normalizedLgaName);


      if (!detailedData[row.state]) {
        console.log(`Creating state: ${row.state}`);
        detailedData[row.state] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          lgas: {}
        };
      }
      if (!detailedData[row.state].lgas) {
        console.log(`Creating lgas object for state: ${row.state}`);
        detailedData[row.state].lgas = {};
      }

      // Check if we already have this LGA (by normalized name)
      if (detailedData[row.state].lgas[normalizedLgaName]) {
        // Aggregate the data if we have duplicate entries
        console.log(`Aggregating duplicate LGA data: ${normalizedLgaName} (original: ${row.lga})`);
        const existing = detailedData[row.state].lgas[normalizedLgaName];
        const newData = createLocationData(row);

        detailedData[row.state].lgas[normalizedLgaName] = {
          inecRegisteredVoters: existing.inecRegisteredVoters + newData.inecRegisteredVoters,
          obidientRegisteredVoters: existing.obidientRegisteredVoters + newData.obidientRegisteredVoters,
          obidientVotersWithPVC: existing.obidientVotersWithPVC + newData.obidientVotersWithPVC,
          obidientVotersWithoutPVC: existing.obidientVotersWithoutPVC + newData.obidientVotersWithoutPVC,
          wards: existing.wards || {}
        };
        console.log(`✅ Aggregated LGA data: ${normalizedLgaName}`, detailedData[row.state].lgas[normalizedLgaName]);
      } else {
        // Create new LGA entry
        console.log(`🔧 Setting LGA data: ${normalizedLgaName}`);
        detailedData[row.state].lgas[normalizedLgaName] = {
          ...createLocationData(row),
          wards: {}
        };
        console.log(`✅ Successfully set LGA: ${normalizedLgaName}`);
      }
    });

    // Add Wards to each LGA with normalization and aggregation
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

      // Normalize the location names
      const normalizedLgaName = normalizeLocationName(row.lga);
      const normalizedWardName = normalizeLocationName(row.ward);

      

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
      if (!detailedData[row.state].lgas[normalizedLgaName]) {
        console.log(`🔧 Creating LGA: ${normalizedLgaName} in state: ${row.state}`);
        detailedData[row.state].lgas[normalizedLgaName] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          wards: {}
        };
      }
      if (!detailedData[row.state].lgas[normalizedLgaName].wards) {
        console.log(`🔧 Creating wards object for LGA: ${normalizedLgaName}`);
        detailedData[row.state].lgas[normalizedLgaName].wards = {};
      }

      // Check if we already have this ward (by normalized name)
      if (detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName]) {
        // Aggregate the data if we have duplicate entries
        console.log(`🔄 Aggregating duplicate Ward data: ${normalizedWardName} (original: ${row.ward})`);
        const existing = detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName];
        const newData = createLocationData(row);

        detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName] = {
          inecRegisteredVoters: existing.inecRegisteredVoters + newData.inecRegisteredVoters,
          obidientRegisteredVoters: existing.obidientRegisteredVoters + newData.obidientRegisteredVoters,
          obidientVotersWithPVC: existing.obidientVotersWithPVC + newData.obidientVotersWithPVC,
          obidientVotersWithoutPVC: existing.obidientVotersWithoutPVC + newData.obidientVotersWithoutPVC,
          pollingUnits: existing.pollingUnits || {}
        };
        // console.log(`Aggregated Ward data: ${normalizedWardName}`, detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName]);
      } else {
        // Create new ward entry
        console.log(`🔧 Setting ward data: ${normalizedWardName}`);
        detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName] = {
          ...createLocationData(row),
          pollingUnits: {}
        };
        console.log(`✅ Successfully set ward: ${normalizedWardName}`);
      }
    });

    // Add Polling Units to each Ward with normalization and aggregation

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

      // Normalize the location names
      const normalizedLgaName = normalizeLocationName(row.lga);
      const normalizedWardName = normalizeLocationName(row.ward);
      const normalizedPUName = normalizeLocationName(row.polling_unit);

      

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
      if (!detailedData[row.state].lgas[normalizedLgaName]) {
        console.log(`🔧 Creating LGA: ${normalizedLgaName} in state: ${row.state}`);
        detailedData[row.state].lgas[normalizedLgaName] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          wards: {}
        };
      }

      // Ensure wards object exists
      if (!detailedData[row.state].lgas[normalizedLgaName].wards) {
        console.log(`🔧 Creating wards object for LGA: ${normalizedLgaName}`);
        detailedData[row.state].lgas[normalizedLgaName].wards = {};
      }

      // Ensure Ward exists
      if (!detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName]) {
        console.log(`🔧 Creating Ward: ${normalizedWardName} in LGA: ${normalizedLgaName}`);
        detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName] = {
          ...createLocationData({ total_obidient_users: 0, voters_with_pvc: 0, voters_without_pvc: 0 }),
          pollingUnits: {}
        };
      }

      // Ensure pollingUnits object exists
      if (!detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits) {
        console.log(`🔧 Creating pollingUnits object for Ward: ${normalizedWardName}`);
        detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits = {};
      }

      // Check if we already have this polling unit (by normalized name)
      if (detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits[normalizedPUName]) {
        // Aggregate the data if we have duplicate entries
        console.log(`🔄 Aggregating duplicate PU data: ${normalizedPUName} (original: ${row.polling_unit})`);
        const existing = detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits[normalizedPUName];
        const newData = createLocationData(row);

        detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits[normalizedPUName] = {
          inecRegisteredVoters: existing.inecRegisteredVoters + newData.inecRegisteredVoters,
          obidientRegisteredVoters: existing.obidientRegisteredVoters + newData.obidientRegisteredVoters,
          obidientVotersWithPVC: existing.obidientVotersWithPVC + newData.obidientVotersWithPVC,
          obidientVotersWithoutPVC: existing.obidientVotersWithoutPVC + newData.obidientVotersWithoutPVC
        };
        console.log(`✅ Aggregated PU data: ${normalizedPUName}`, detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits[normalizedPUName]);
      } else {
        // Create new polling unit entry
        console.log(`🔧 Setting polling unit data: ${normalizedPUName}`);
        detailedData[row.state].lgas[normalizedLgaName].wards[normalizedWardName].pollingUnits[normalizedPUName] = createLocationData(row);
        console.log(`✅ Successfully set polling unit: ${normalizedPUName}`);
      }
    });


    return detailedData;
  } catch (error) {
    console.error('❌ Error fetching detailed voter data:', error);
    throw error;
  }
}