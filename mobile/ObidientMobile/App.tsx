import './src/config/fontSetup'; // Apply global Poppins font setup
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import PushNotificationService from './src/services/pushNotificationService';
import { UserProvider } from './src/context';
import { colors } from './src/styles/globalStyles';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const navigationRef = useRef(null);

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

  // Set navigation reference when navigation container is ready
  const onNavigationReady = () => {
    PushNotificationService.setNavigationRef(navigationRef.current);
    console.log('📱 Navigation reference set for push notifications');
  };

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
      <UserProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
          <AppNavigator initialRoute={initialRoute} />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
};

export default App;

