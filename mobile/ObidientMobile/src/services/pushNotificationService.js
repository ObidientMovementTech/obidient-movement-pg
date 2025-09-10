import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { mobileAPI } from './api';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
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

    // Handle different notification types
    if (data?.type) {
      switch (data.type) {
        case 'feed':
          // Navigate to feeds screen
          console.log('Navigate to feeds');
          break;
        case 'message':
          // Navigate to messages screen
          console.log('Navigate to messages');
          break;
        case 'election_alert':
          // Show election alert
          console.log('Show election alert');
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    }
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
