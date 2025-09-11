import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { mobileAPI } from './api';
import { CommonActions } from '@react-navigation/native';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.navigationRef = null;
  }

  // Set navigation reference from App.js
  setNavigationRef(navigationRef) {
    this.navigationRef = navigationRef;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Push notification permission not granted');
        return false;
      }

      // Get FCM token
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      // Register token with backend
      await this.registerToken(fcmToken);

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        console.log('FCM Token refreshed:', newToken);
        await this.registerToken(newToken);
      });

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        this.showForegroundNotification(remoteMessage);
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message received:', remoteMessage);
      });

      // Handle notification open app
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened app:', remoteMessage);
        this.handleNotificationAction(remoteMessage);
      });

      // Handle app opened from quit state via notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('App opened from notification:', initialNotification);
        this.handleNotificationAction(initialNotification);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  async registerToken(token) {
    try {
      await mobileAPI.registerPushToken(token, Platform.OS);
      console.log('Token registered successfully');
    } catch (error) {
      console.error('Error registering token:', error);
    }
  }

  showForegroundNotification(remoteMessage) {
    const { notification } = remoteMessage;
    if (notification) {
      Alert.alert(
        notification.title || 'Obidient Movement',
        notification.body || 'You have a new notification',
        [
          {
            text: 'OK',
            onPress: () => this.handleNotificationAction(remoteMessage)
          }
        ]
      );
    }
  }

  handleNotificationAction(remoteMessage) {
    const { data } = remoteMessage;

    console.log('🔔 Handling notification action:', remoteMessage);
    console.log('🔔 Navigation ref available:', !!this.navigationRef);

    // Wait a bit to ensure navigation is ready
    setTimeout(() => {
      if (!this.navigationRef) {
        console.warn('⚠️  Navigation reference not available');
        return;
      }

      // Handle different notification types
      if (data?.type) {
        switch (data.type) {
          case 'feed':
          case 'test':
          case 'test_broadcast':
          case 'test_filtered':
            console.log('📱 Navigating to Feeds screen');
            this.navigationRef.dispatch(
              CommonActions.navigate({
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'Feeds' }],
                  index: 1, // Feeds tab is at index 1
                },
              })
            );
            break;
          case 'message':
            console.log('📱 Navigating to Messages screen');
            this.navigationRef.dispatch(
              CommonActions.navigate({
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'Messages' }],
                  index: 2, // Messages tab is at index 2
                },
              })
            );
            break;
          case 'notification':
            console.log('📱 Navigating to Notifications screen');
            this.navigationRef.dispatch(
              CommonActions.navigate({
                name: 'Notifications',
              })
            );
            break;
          default:
            console.log('📱 Default: Navigating to Feeds screen for type:', data.type);
            this.navigationRef.dispatch(
              CommonActions.navigate({
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'Feeds' }],
                  index: 1, // Feeds tab is at index 1
                },
              })
            );
        }
      } else {
        // Default action - go to Feeds
        console.log('📱 No type specified, navigating to Feeds');
        this.navigationRef.dispatch(
          CommonActions.navigate({
            name: 'MainTabs',
            state: {
              routes: [{ name: 'Feeds' }],
              index: 1,
            },
          })
        );
      }
    }, 1000); // Wait 1 second for navigation to be ready
  }

  async updatePushSettings(settings) {
    try {
      await mobileAPI.put('/push/settings', settings);
      return true;
    } catch (error) {
      console.error('Error updating push settings:', error);
      return false;
    }
  }

  async unsubscribe() {
    try {
      const token = await messaging().getToken();
      await mobileAPI.delete('/push/unregister-token', { data: { token } });
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      return false;
    }
  }
}

export default new PushNotificationService();
