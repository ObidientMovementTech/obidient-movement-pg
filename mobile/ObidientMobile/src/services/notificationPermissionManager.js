import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationPermissionManager {
  constructor() {
    this.PERMISSION_ASKED_KEY = 'notification_permission_asked';
    this.LAST_PERMISSION_STATUS_KEY = 'last_permission_status';
  }

  async hasAskedForPermission() {
    try {
      const asked = await AsyncStorage.getItem(this.PERMISSION_ASKED_KEY);
      return asked === 'true';
    } catch (error) {
      console.error('Error checking permission status:', error);
      return false;
    }
  }

  async markPermissionAsked() {
    try {
      await AsyncStorage.setItem(this.PERMISSION_ASKED_KEY, 'true');
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }

  async setLastKnownPermissionStatus(status) {
    try {
      await AsyncStorage.setItem(this.LAST_PERMISSION_STATUS_KEY, status.toString());
      console.log('🔔 Saved last known permission status:', status);
    } catch (error) {
      console.error('❌ Error saving last known permission status:', error);
    }
  }

  async getLastKnownPermissionStatus() {
    try {
      const status = await AsyncStorage.getItem(this.LAST_PERMISSION_STATUS_KEY);
      return status ? parseInt(status, 10) : null;
    } catch (error) {
      console.error('❌ Error getting last known permission status:', error);
      return null;
    }
  }

  // For testing purposes - reset permission state
  async resetPermissionState() {
    try {
      await AsyncStorage.removeItem(this.PERMISSION_ASKED_KEY);
      await AsyncStorage.removeItem(this.LAST_PERMISSION_STATUS_KEY);
      console.log('🔄 Permission state reset - will ask again on next check');
    } catch (error) {
      console.error('Error resetting permission state:', error);
    }
  }

  async getCurrentPermissionStatus() {
    try {
      const authStatus = await messaging().hasPermission();
      // Update our saved status whenever we check
      await this.setLastKnownPermissionStatus(authStatus);
      return authStatus;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return messaging.AuthorizationStatus.DENIED;
    }
  }

  async requestNotificationPermission() {
    try {
      console.log('🔔 Requesting notification permission...');

      const authStatus = await messaging().requestPermission({
        sound: true,
        announcement: true,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
      });

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('🔔 Permission status:', authStatus);
      console.log('🔔 Notifications enabled:', enabled);

      await this.markPermissionAsked();
      await this.setLastKnownPermissionStatus(authStatus);

      return {
        granted: enabled,
        status: authStatus
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      await this.markPermissionAsked(); // Don't ask again if there's an error
      await this.setLastKnownPermissionStatus(messaging.AuthorizationStatus.DENIED);
      return {
        granted: false,
        status: messaging.AuthorizationStatus.DENIED,
        error: error.message
      };
    }
  }

  async showPermissionDialog() {
    return new Promise((resolve) => {
      Alert.alert(
        '🔔 Stay Updated!',
        'Get notified about important updates, new feeds, and announcements from the Obidient Movement.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: async () => {
              console.log('User declined notification permission');
              await this.markPermissionAsked();
              await this.setLastKnownPermissionStatus(messaging.AuthorizationStatus.DENIED);
              resolve(false);
            }
          },
          {
            text: 'Allow Notifications',
            style: 'default',
            onPress: async () => {
              console.log('User accepted notification dialog');
              const result = await this.requestNotificationPermission();
              resolve(result.granted);
            }
          }
        ],
        {
          cancelable: false
        }
      );
    });
  }

  async shouldRequestPermission() {
    try {
      // First, check current system permission status
      const currentStatus = await messaging().hasPermission();
      console.log('🔔 Current system permission status:', currentStatus);

      // If system permissions are currently granted, don't ask
      if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        currentStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('🔔 System permissions currently granted');
        await this.markPermissionAsked(); // Mark as handled
        return false;
      }

      // Check if we've asked before
      const hasAsked = await this.hasAskedForPermission();

      // Get the last known permission status
      const lastKnownStatus = await this.getLastKnownPermissionStatus();

      // If permissions are disabled in system settings, we should ask again
      // This handles the case where user previously granted permissions but later disabled them in settings
      if (currentStatus === messaging.AuthorizationStatus.DENIED ||
        currentStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {

        // If we previously had permissions granted but now they're disabled, ask again
        if (lastKnownStatus === messaging.AuthorizationStatus.AUTHORIZED && hasAsked) {
          console.log('🔔 Permissions were previously granted but now disabled in system settings - asking again');
          return true;
        }

        // If user actively denied in our app before, don't keep asking
        if (hasAsked && lastKnownStatus === messaging.AuthorizationStatus.DENIED) {
          console.log('🔔 User previously denied permissions in app - not asking again');
          return false;
        }

        // If we haven't asked before, or status is NOT_DETERMINED, ask
        if (!hasAsked || currentStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
          console.log('🔔 Should ask for permissions - hasAsked:', hasAsked, 'currentStatus:', currentStatus);
          return true;
        }
      }

      // Haven't asked before and permissions not granted - should ask
      console.log('🔔 Should request permission, current status:', currentStatus);
      return true;
    } catch (error) {
      console.error('Error checking if should request permission:', error);
      return false;
    }
  }

  async handleNotificationPermissionFlow() {
    try {
      const shouldRequest = await this.shouldRequestPermission();

      if (!shouldRequest) {
        return { success: true, alreadyHandled: true };
      }

      console.log('🔔 Starting notification permission flow...');

      // Show custom dialog first
      const userAccepted = await this.showPermissionDialog();

      if (userAccepted) {
        return { success: true, granted: true };
      } else {
        return { success: true, granted: false, userDeclined: true };
      }
    } catch (error) {
      console.error('Error in notification permission flow:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationPermissionManager();
