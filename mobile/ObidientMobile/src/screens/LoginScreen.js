import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI, storage } from '../services/api';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Obidient Movement</Text>
        <Text style={styles.subtitle}>Mobile App</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default LoginScreen;
