import { StyleSheet } from 'react-native';

// Obidient Movement Dark Theme Colors
export const colors = {
  // Primary brand colors (keeping the green identity)
  primary: '#077b32',        // Brighter green for dark theme
  primaryDark: '#00A856',    // Darker variant
  primaryLight: '#33D083',   // Lighter variant

  // Dark theme backgrounds
  background: '#0F0F0F',     // Almost black background
  surface: '#1A1A1A',       // Card/surface background
  surfaceVariant: '#2D2D2D', // Alternative surface

  // Text colors for dark theme
  text: '#FFFFFF',           // Primary text (white)
  textSecondary: '#B8B8B8',  // Secondary text (light gray)
  textTertiary: '#8A8A8A',   // Tertiary text (darker gray)
  textMuted: '#666666',      // Muted text

  // Border and divider colors
  border: '#333333',         // Subtle borders
  borderLight: '#444444',    // Lighter borders
  divider: '#2A2A2A',       // Dividers

  // Status colors adjusted for dark theme
  success: '#00C267',        // Green success
  error: '#FF5252',          // Red error
  warning: '#FFB74D',        // Orange warning
  info: '#42A5F5',          // Blue info

  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#333333',      // Inverted for dark theme
  darkGray: '#CCCCCC',       // Inverted for dark theme

  // Interactive colors
  ripple: '#FFFFFF1A',       // 10% white for ripple effect
  overlay: '#00000080',      // Semi-transparent overlay

  // Navigation and tab colors
  tabActive: '#00C267',      // Active tab
  tabInactive: '#666666',    // Inactive tab
  tabBackground: '#1A1A1A',  // Tab bar background
};

// Typography with Poppins - Dark Theme Optimized
export const typography = {
  h1: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  h2: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  h3: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  h4: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  h5: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  body1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
  },
  body2: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
  },
  button: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  link: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
};

// Common styles for Dark Theme
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header styles
  header: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },

  // Button styles
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceVariant,
  },
  inputLabel: {
    ...typography.body2,
    marginBottom: 8,
    color: colors.textSecondary,
  },

  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompact: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Shadow styles (adjusted for dark theme)
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shadowLight: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // List styles
  listContainer: {
    backgroundColor: colors.background,
    paddingVertical: 8,
  },
  listItem: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemText: {
    ...typography.body1,
  },

  // Navigation styles
  tabBar: {
    backgroundColor: colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 8,
  },

  // Modal styles
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  modalOverlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Status bar
  statusBarStyle: 'light-content', // For dark theme

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },

  // Badge styles
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },

  // Error styles
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Utility functions for theme
export const getThemeColor = (lightColor, darkColor) => darkColor; // Always return dark color

// Priority colors for feeds (dark theme optimized)
export const priorityColors = {
  urgent: '#FF5252',
  high: '#FF8A50',
  medium: '#66BB6A',
  low: '#42A5F5',
  info: '#78C6F0',
};

export default globalStyles;
