import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI, storage } from '../services/api';
import { colors, typography, globalStyles } from '../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (loading) return; // Prevent double-tap

    setLoading(true);
    try {
      // Attempt login
      console.log('Attempting login...');
      const response = await authAPI.login(email, password);

      if (response.data.success) {
        // Store auth data
        await storage.setAuthToken(response.data.token);
        await storage.setUser(response.data.user);

        // Navigate directly to main screen without alert
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        config: error.config?.baseURL,
        url: error.config?.url,
        timeout: error.config?.timeout
      });

      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = `Cannot connect to server at ${error.config?.baseURL || 'unknown'}. Please check your network connection.`;
      } else if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const registerURL = 'https://member.obidients.com/auth/sign-up';

    try {
      console.log('Attempting to open register URL:', registerURL);
      await Linking.openURL(registerURL);
    } catch (error) {
      console.error('Error opening register URL:', error);

      // Show fallback with the URL
      Alert.alert(
        'Registration',
        `Please open this link in your browser:\n\n${registerURL}`,
        [
          {
            text: 'Copy Link', onPress: () => {
              // You could implement clipboard copy here if needed
              console.log('User requested to copy:', registerURL);
            }
          },
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const handleForgotPassword = async () => {
    const forgotPasswordURL = 'https://member.obidients.com/auth/forgot-password';

    try {
      console.log('Attempting to open forgot password URL:', forgotPasswordURL);
      await Linking.openURL(forgotPasswordURL);
    } catch (error) {
      console.error('Error opening forgot password URL:', error);

      // Show fallback with the URL
      Alert.alert(
        'Forgot Password',
        `Please open this link in your browser:\n\n${forgotPasswordURL}`,
        [
          {
            text: 'Copy Link', onPress: () => {
              // You could implement clipboard copy here if needed
              console.log('User requested to copy:', forgotPasswordURL);
            }
          },
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.container]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/images/obi-logo-icon.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Obidient Movement</Text>
            <Text style={styles.subtitle}>Mobile App</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[globalStyles.input, styles.input]}
              placeholder="Email"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[globalStyles.input, styles.input]}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[globalStyles.button, styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[globalStyles.buttonText, styles.buttonText]}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[globalStyles.secondaryButton, styles.registerButton]}
              onPress={handleRegister}
            >
              <Text style={[globalStyles.secondaryButtonText, styles.registerButtonText]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    // backgroundColor: colors.white,
    // borderRadius: 60,
    padding: 16,
    // marginBottom: 20,
    // ...globalStyles.shadow,
  },
  iconImage: {
    width: 80,
    height: 80,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textLight,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginBottom: 16,
  },
  buttonText: {
    // Using global button text style
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textLight,
    opacity: 0.3,
  },
  dividerText: {
    ...typography.body2,
    color: colors.textLight,
    marginHorizontal: 15,
  },
  registerButton: {
    marginTop: 8,
  },
  registerButtonText: {
    // Using global secondary button text style
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
});

export default LoginScreen;
