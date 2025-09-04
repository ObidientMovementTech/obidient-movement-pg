import { StyleSheet } from 'react-native';

// Obidient Movement Brand Colors
export const colors = {
  primary: '#077b32',      // Green from logo
  primaryDark: '#056d2b',  // Darker green
  primaryLight: '#39a965', // Lighter green
  white: '#ffffff',
  black: '#000000',
  gray: '#666666',
  lightGray: '#f5f5f5',
  darkGray: '#333333',
  background: '#f8f9fa',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  success: '#077b32',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
};

// Typography with Poppins
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
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  h4: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    fontWeight: '600',
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
    color: colors.text,
  },
  caption: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: colors.textLight,
  },
  button: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
};

// Common styles
export const globalStyles = StyleSheet.create({
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
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default globalStyles;
