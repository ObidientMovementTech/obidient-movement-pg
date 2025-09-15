import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useUser } from '../context';
import { colors, typography, globalStyles } from '../styles/globalStyles';

/**
 * Demo component showing how to use the UserContext with dark theme
 * This can be placed on any screen to display user info
 */
const UserProfileDemo = () => {
  const {
    user,
    loading,
    error,
    isProfileComplete,
    profileCompletionPercentage,
    isMonitor,
    hasElectionAccess,
    getUserLocation,
    refreshUserProfile
  } = useUser();

  const handleRefresh = async () => {
    try {
      await refreshUserProfile();
      Alert.alert('Success', 'Profile refreshed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  if (error && !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  const location = getUserLocation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile Demo</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Status Badges */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: isProfileComplete ? colors.success : colors.warning }]}>
              <Text style={styles.badgeText}>
                {profileCompletionPercentage}% Complete
              </Text>
            </View>

            {user.role && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
              </View>
            )}

            {isMonitor && (
              <View style={[styles.badge, { backgroundColor: colors.info }]}>
                <Text style={styles.badgeText}>MONITOR</Text>
              </View>
            )}

            {hasElectionAccess && (
              <View style={[styles.badge, { backgroundColor: colors.success }]}>
                <Text style={styles.badgeText}>ELECTION ACCESS</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Quick Info</Text>
          <Text style={styles.infoText}>Phone: {user.phone || 'Not provided'}</Text>
          <Text style={styles.infoText}>Location: {location?.state || 'Unknown'}</Text>
          <Text style={styles.infoText}>Voting Ward: {location?.ward || 'Not assigned'}</Text>
          <Text style={styles.infoText}>KYC Status: {user.kycStatus || 'Pending'}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Profile Stats</Text>
          <Text style={styles.infoText}>Email Verified: {user.emailVerified ? '✅' : '❌'}</Text>
          <Text style={styles.infoText}>2FA Enabled: {user.twoFactorEnabled ? '✅' : '❌'}</Text>
          <Text style={styles.infoText}>Push Notifications: {user.pushNotificationsEnabled ? '✅' : '❌'}</Text>
          <Text style={styles.infoText}>
            Last Seen: {user.mobileLastSeen ? new Date(user.mobileLastSeen).toLocaleString() : 'Never'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  card: {
    ...globalStyles.card,
    ...globalStyles.shadow,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 16,
  },
  userName: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
  userEmail: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    ...globalStyles.badge,
  },
  badgeText: {
    ...globalStyles.badgeText,
  },
  infoSection: {
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 4,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    ...globalStyles.errorText,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    ...globalStyles.button,
    alignSelf: 'center',
  },
  retryButtonText: {
    ...globalStyles.buttonText,
  },
});

export default UserProfileDemo;
