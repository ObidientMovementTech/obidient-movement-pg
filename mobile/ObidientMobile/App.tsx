// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import AppNavigator from './src/navigation/AppNavigator';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
// import PushNotificationService from './src/services/pushNotificationService';

const App = () => {
  // Temporarily disabled Firebase until google-services.json is added
  // useEffect(() => {
  //   // Initialize push notifications
  //   const initializePushNotifications = async () => {
  //     try {
  //       const initialized = await PushNotificationService.initialize();
  //       console.log('Push notifications initialized:', initialized);
  //     } catch (error) {
  //       console.error('Failed to initialize push notifications:', error);
  //     }
  //   };
  // 
  //   initializePushNotifications();
  // }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

// export default App;
