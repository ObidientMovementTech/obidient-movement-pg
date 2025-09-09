import './src/config/fontSetup'; // Apply global Poppins font setup
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import PushNotificationService from './src/services/pushNotificationService';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        console.log('🔔 Initializing push notifications...');
        // Add a small delay to ensure Firebase is fully initialized
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
        const initialized = await PushNotificationService.initialize();
        console.log('🔔 Push notifications initialized:', initialized);
      } catch (error) {
        console.error('❌ Failed to initialize push notifications:', error);
      }
    };

    initializePushNotifications();
  }, []);

  const handleSplashFinish = (route: string) => {
    setInitialRoute(route);
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <SplashScreen onFinish={handleSplashFinish} />
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator initialRoute={initialRoute} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

