/**
 * Support Groups Configuration
 * List of support groups for Anambra election and other campaigns
 */

/**
 * Support groups for Anambra 2025 election
 */
export const ANAMBRA_SUPPORT_GROUPS = [
  'Obidient Movement',
  'Labour Party',
  'Odinani Group',
  'Grassroots Believers Initiative (GBI)',
  'Moghalu Youths Group',
  'Moghalu Volunteer Group',
  'COPDEM'
];

/**
 * Get all support groups
 * @returns {Array<string>}
 */
export const getAllSupportGroups = () => {
  return ANAMBRA_SUPPORT_GROUPS;
};

/**
 * Validate support group
 * @param {string} group 
 * @returns {boolean}
 */
export const isValidSupportGroup = (group) => {
  if (!group) return false;
  return ANAMBRA_SUPPORT_GROUPS.includes(group) || group === 'Other Support Groups';
};

/**
 * Get support group options for dropdown
 * @returns {Array<{value: string, label: string}>}
 */
export const getSupportGroupOptions = () => {
  return ANAMBRA_SUPPORT_GROUPS.map(group => ({
    value: group,
    label: group
  }));
};

