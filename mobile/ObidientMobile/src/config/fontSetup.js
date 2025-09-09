import { Text, TextInput } from 'react-native';

// Set default props for Text component to use Poppins font
Text.defaultProps = {
  ...Text.defaultProps,
  style: [{ fontFamily: 'Poppins-Regular' }, Text.defaultProps?.style],
};

// Set default props for TextInput component to use Poppins font
TextInput.defaultProps = {
  ...TextInput.defaultProps,
  style: [{ fontFamily: 'Poppins-Regular' }, TextInput.defaultProps?.style],
};

console.log('✅ Global Poppins font setup applied');
