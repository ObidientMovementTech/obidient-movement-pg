import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../context';
import { colors, typography, globalStyles } from '../styles/globalStyles';

const UserInfoCard = () => {
  const {
    user,
    loading,
    isProfileComplete,
    profileCompletionPercentage,
    isMonitor,
    hasElectionAccess,
    getUserLocation
  } = useUser();

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading user info...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  const location = getUserLocation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.name || 'Unknown User'}</Text>
        <Text style={styles.role}>{user.role?.toUpperCase() || 'MEMBER'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phone || 'Not provided'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>
          {location?.state || 'Unknown'} • {location?.lga || 'Unknown'}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: isProfileComplete ? colors.success : colors.warning }]}>
          <Text style={styles.statusText}>
            Profile {profileCompletionPercentage}% Complete
          </Text>
        </View>

        {isMonitor && (
          <View style={[styles.statusBadge, { backgroundColor: colors.info }]}>
            <Text style={styles.statusText}>Monitor</Text>
          </View>
        )}

        {hasElectionAccess && (
          <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.statusText}>Election Access</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...globalStyles.card,
    ...globalStyles.shadow,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...globalStyles.errorText,
    ...typography.body1,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  name: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    flex: 1,
  },
  role: {
    ...globalStyles.badgeText,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    ...typography.body2,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    ...globalStyles.badge,
  },
  statusText: {
    ...globalStyles.badgeText,
  },
});

export default UserInfoCard;
