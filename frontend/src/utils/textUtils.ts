/**
 * Utility functions for text formatting
 */

/**
 * Converts a string to Title Case
 * Handles hyphens, spaces, and other separators properly
 */
export const toTitleCase = (str: string): string => {
  if (!str) return str;

  return str
    .toLowerCase()
    .split(/[\s\-_]+/) // Split on spaces, hyphens, underscores
    .map(word => {
      // Handle special cases for common abbreviations
      const upperCaseWords = ['LGA', 'FCT', 'ID', 'PVC', 'INEC'];
      if (upperCaseWords.includes(word.toUpperCase())) {
        return word.toUpperCase();
      }

      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' '); // Join with spaces
};

/**
 * Converts kebab-case or snake_case to Title Case
 * Examples: "aba-north" -> "Aba North", "federal_capital_territory" -> "Federal Capital Territory"
 */
export const formatLocationName = (name: string): string => {
  if (!name) return name;

  return name
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .split(' ')
    .map(word => {
      // Handle special abbreviations
      if (word.toLowerCase() === 'lga') return 'LGA';
      if (word.toLowerCase() === 'fct') return 'FCT';

      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Formats state name to proper title case
 */
export const formatStateName = (state: string): string => {
  if (!state) return state;

  // Special cases for state names
  const specialStates: Record<string, string> = {
    'fct': 'Federal Capital Territory',
    'federal capital territory': 'Federal Capital Territory',
    'akwa ibom': 'Akwa Ibom',
    'cross river': 'Cross River'
  };

  const lowerState = state.toLowerCase();
  if (specialStates[lowerState]) {
    return specialStates[lowerState];
  }

  return toTitleCase(state);
};
