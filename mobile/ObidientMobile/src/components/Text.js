import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

const Text = ({ style, ...props }) => {
  // Default Poppins font with fallback
  const defaultStyle = {
    fontFamily: 'Poppins-Regular',
  };

  // Merge default style with provided style
  const combinedStyle = StyleSheet.flatten([defaultStyle, style]);

  // If bold weight is specified, use Poppins-Bold
  if (combinedStyle.fontWeight === 'bold' || combinedStyle.fontWeight === '700') {
    combinedStyle.fontFamily = 'Poppins-Bold';
    delete combinedStyle.fontWeight; // Remove fontWeight as it's handled by font family
  }
  // If medium weight is specified, use Poppins-Medium  
  else if (combinedStyle.fontWeight === '600' || combinedStyle.fontWeight === '500') {
    combinedStyle.fontFamily = 'Poppins-Medium';
    delete combinedStyle.fontWeight;
  }

  return <RNText style={combinedStyle} {...props} />;
};

export default Text;
