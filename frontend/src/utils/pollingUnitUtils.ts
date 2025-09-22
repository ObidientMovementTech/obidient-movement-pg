/**
 * Polling Unit Utilities
 * Helper functions to work with StateLGAWardPollingUnits.ts efficiently
 * Handles filtering and data transformation for polling unit selection
 */

import { StateLGAWardPollingUnits, PollingUnit } from './StateLGAWardPollingUnits';

export interface PollingUnitOption {
  value: string;
  label: string;
  id: string;
  abbreviation: string;
  delimitation: string;
}

export interface VotingLocation {
  state?: string;
  lga?: string;
  ward?: string;
  pollingUnit?: string;
}

/**
 * Get polling units for a specific state, LGA, and ward combination
 * @param stateName - The state name (e.g., "ABIA")
 * @param lgaName - The LGA name (e.g., "ABA NORTH") 
 * @param wardName - The ward name (e.g., "EZIAMA")
 * @returns Array of polling units or empty array if not found
 */
export const getPollingUnitsForWard = (
  stateName: string,
  lgaName: string,
  wardName: string
): PollingUnitOption[] => {
  try {
    // Normalize inputs to handle case sensitivity and formatting
    const normalizedState = stateName?.toUpperCase().trim();
    const normalizedLGA = lgaName?.toUpperCase().trim();
    const normalizedWard = wardName?.toUpperCase().trim();

    // Navigate the data structure
    const state = StateLGAWardPollingUnits[normalizedState];
    if (!state) {
      console.warn(`State not found: ${normalizedState}`);
      return [];
    }

    const lga = state.lgas[normalizedLGA];
    if (!lga) {
      console.warn(`LGA not found: ${normalizedLGA} in ${normalizedState}`);
      return [];
    }

    const ward = lga.wards[normalizedWard];
    if (!ward) {
      console.warn(`Ward not found: ${normalizedWard} in ${normalizedLGA}, ${normalizedState}`);
      return [];
    }

    // Transform polling units to dropdown options
    return ward.pollingUnits.map((pu: PollingUnit) => ({
      value: pu.name,
      label: pu.name,
      id: pu.id,
      abbreviation: pu.abbreviation,
      delimitation: pu.delimitation
    }));

  } catch (error) {
    console.error('Error getting polling units:', error);
    return [];
  }
};

/**
 * Get all states from the new data structure
 * @returns Array of state names
 */
export const getAllStates = (): string[] => {
  return Object.keys(StateLGAWardPollingUnits).sort();
};

/**
 * Get all LGAs for a specific state
 * @param stateName - The state name
 * @returns Array of LGA names
 */
export const getLGAsForState = (stateName: string): string[] => {
  try {
    const normalizedState = stateName?.toUpperCase().trim();
    const state = StateLGAWardPollingUnits[normalizedState];

    if (!state) {
      return [];
    }

    return Object.keys(state.lgas).sort();
  } catch (error) {
    console.error('Error getting LGAs for state:', error);
    return [];
  }
};

/**
 * Get all wards for a specific state and LGA
 * @param stateName - The state name
 * @param lgaName - The LGA name
 * @returns Array of ward names
 */
export const getWardsForLGA = (stateName: string, lgaName: string): string[] => {
  try {
    const normalizedState = stateName?.toUpperCase().trim();
    const normalizedLGA = lgaName?.toUpperCase().trim();

    const state = StateLGAWardPollingUnits[normalizedState];
    if (!state) {
      return [];
    }

    const lga = state.lgas[normalizedLGA];
    if (!lga) {
      return [];
    }

    return Object.keys(lga.wards).sort();
  } catch (error) {
    console.error('Error getting wards for LGA:', error);
    return [];
  }
};

/**
 * Validate if a polling unit exists for the given location
 * @param location - The voting location object
 * @returns boolean indicating if the polling unit exists
 */
export const validatePollingUnitLocation = (location: VotingLocation): boolean => {
  if (!location.state || !location.lga || !location.ward || !location.pollingUnit) {
    return false;
  }

  const pollingUnits = getPollingUnitsForWard(location.state, location.lga, location.ward);
  return pollingUnits.some(pu => pu.value === location.pollingUnit);
};

/**
 * Get polling unit details by name within a specific ward
 * @param stateName - The state name
 * @param lgaName - The LGA name
 * @param wardName - The ward name
 * @param pollingUnitName - The polling unit name
 * @returns Polling unit details or null if not found
 */
export const getPollingUnitDetails = (
  stateName: string,
  lgaName: string,
  wardName: string,
  pollingUnitName: string
): PollingUnit | null => {
  try {
    const pollingUnits = getPollingUnitsForWard(stateName, lgaName, wardName);
    const pollingUnit = pollingUnits.find(pu => pu.value === pollingUnitName);

    if (!pollingUnit) {
      return null;
    }

    return {
      id: pollingUnit.id,
      name: pollingUnit.label,
      abbreviation: pollingUnit.abbreviation,
      delimitation: pollingUnit.delimitation,
      remark: 'EXISTING PU' // Default remark as seen in the data structure
    };
  } catch (error) {
    console.error('Error getting polling unit details:', error);
    return null;
  }
};

/**
 * Convert old structure data to new structure format
 * Helper function for migration purposes
 * @param oldStateName - State name from old structure (e.g., "Abia")
 * @param oldLgaName - LGA name from old structure (e.g., "aba-north")
 * @param oldWardName - Ward name from old structure (e.g., "eziama")
 * @returns New structure format names or null if not found
 */
export const convertOldToNewFormat = (
  oldStateName: string,
  oldLgaName: string,
  oldWardName: string
): { state: string; lga: string; ward: string } | null => {
  try {
    // Convert state: "Abia" -> "ABIA"
    const newState = oldStateName.toUpperCase();

    // Convert LGA: "aba-north" -> "ABA NORTH"
    const newLGA = oldLgaName.replace(/-/g, ' ').toUpperCase();

    // Convert ward: "eziama" -> "EZIAMA"
    const newWard = oldWardName.replace(/-/g, ' ').toUpperCase();

    // Validate that the converted names exist in the new structure
    if (StateLGAWardPollingUnits[newState]?.lgas[newLGA]?.wards[newWard]) {
      return {
        state: newState,
        lga: newLGA,
        ward: newWard
      };
    }

    return null;
  } catch (error) {
    console.error('Error converting old format to new:', error);
    return null;
  }
};

/**
 * Search polling units by name across all locations
 * Useful for autocomplete or search functionality
 * @param searchTerm - The search term
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Array of polling units matching the search term
 */
export const searchPollingUnits = (
  searchTerm: string,
  maxResults: number = 20
): Array<PollingUnitOption & { location: string }> => {
  const results: Array<PollingUnitOption & { location: string }> = [];
  const normalizedSearch = searchTerm.toLowerCase().trim();

  if (!normalizedSearch || normalizedSearch.length < 2) {
    return results;
  }

  try {
    // Search across all states, LGAs, and wards
    for (const [stateName, state] of Object.entries(StateLGAWardPollingUnits)) {
      for (const [lgaName, lga] of Object.entries(state.lgas)) {
        for (const [wardName, ward] of Object.entries(lga.wards)) {
          for (const pollingUnit of ward.pollingUnits) {
            if (pollingUnit.name.toLowerCase().includes(normalizedSearch)) {
              results.push({
                value: pollingUnit.name,
                label: pollingUnit.name,
                id: pollingUnit.id,
                abbreviation: pollingUnit.abbreviation,
                delimitation: pollingUnit.delimitation,
                location: `${wardName}, ${lgaName}, ${stateName}`
              });

              if (results.length >= maxResults) {
                return results;
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error searching polling units:', error);
  }

  return results;
};