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

    setLoading(true);
    try {
      // Test connection first
      console.log('Testing connection...');
      await authAPI.testConnection();
      console.log('Connection successful!');

      // Attempt login
      console.log('Attempting login...');
      const response = await authAPI.login(email, password);

      if (response.data.success) {
        // Store auth data
        await storage.setAuthToken(response.data.token);
        await storage.setUser(response.data.user);

        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => navigation.replace('Main') }
        ]);
      }
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection...');
      const response = await authAPI.testConnection();
      console.log('Test response:', response.data);
      Alert.alert('Connection Test', 'Server connection successful!');
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert('Connection Test', 'Failed to connect to server');
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
              style={[globalStyles.secondaryButton, styles.testButton]}
              onPress={testConnection}
            >
              <Text style={[globalStyles.secondaryButtonText, styles.testButtonText]}>
                Test Connection
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
    backgroundColor: colors.white,
    borderRadius: 60,
    padding: 16,
    marginBottom: 20,
    ...globalStyles.shadow,
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
  testButton: {
    marginTop: 8,
  },
  testButtonText: {
    // Using global secondary button text style
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
});

export default LoginScreen;
