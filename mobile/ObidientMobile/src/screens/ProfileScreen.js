import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, globalStyles } from '../styles/globalStyles';
import { storage } from '../services/api';
import { useUser } from '../context';

const ProfileScreen = ({ navigation }) => {
  const {
    user,
    loading,
    error,
    refreshUserProfile,
    clearUser,
    isProfileComplete,
    profileCompletionPercentage,
    hasRole,
    isMonitor,
    hasElectionAccess,
    getUserLocation
  } = useUser();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear stored data
              await storage.clearAuth();
              await clearUser();

              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Render profile detail row
  const renderDetailRow = (label, value, isImportant = false) => {
    if (!value) return null;

    // Handle object values by converting to string or specific formatting
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
      // If it's an object with location properties
      if (value.state || value.lga || value.ward) {
        const locationParts = [value.ward, value.lga, value.state].filter(Boolean);
        displayValue = locationParts.length > 0 ? locationParts.join(', ') : 'Not specified';
      } else {
        // For other objects, check if it's empty or try to stringify safely
        const keys = Object.keys(value);
        if (keys.length === 0) {
          return null; // Don't render empty objects
        }
        displayValue = JSON.stringify(value);
      }
    }

    return (
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, isImportant && styles.importantLabel]}>
          {label}:
        </Text>
        <Text style={[styles.detailValue, isImportant && styles.importantValue]}>
          {displayValue}
        </Text>
      </View>
    );
  };

  // Render section header
  const renderSectionHeader = (title) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {!isProfileComplete && (
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>
                {profileCompletionPercentage}% Complete
              </Text>
            </View>
          )}
        </View>

        {/* Profile Picture and Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
                defaultSource={require('../assets/images/default-avatar.png')}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {user?.emailVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          {user?.userName && <Text style={styles.userHandle}>@{user.userName}</Text>}
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}

          {/* Role & Status Badges */}
          <View style={styles.badgesContainer}>
            {user?.role && (
              <View style={[styles.badge, styles.roleBadge]}>
                <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
              </View>
            )}
            {isMonitor && (
              <View style={[styles.badge, styles.monitorBadge]}>
                <Text style={styles.badgeText}>MONITOR</Text>
              </View>
            )}
            {hasElectionAccess && (
              <View style={[styles.badge, styles.electionBadge]}>
                <Text style={styles.badgeText}>ELECTION ACCESS</Text>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.detailsSection}>
          {renderSectionHeader('Personal Information')}
          {renderDetailRow('Full Name', user?.name)}
          {renderDetailRow('Phone', user?.phone)}
          {renderDetailRow('Gender', user?.gender)}
          {renderDetailRow('Age Range', user?.ageRange)}
          {renderDetailRow('Citizenship', user?.citizenship)}
          {renderDetailRow('Country Code', user?.countryCode)}
          {renderDetailRow('Country of Residence', user?.countryOfResidence)}
        </View>

        {/* Location Information */}
        <View style={styles.detailsSection}>
          {renderSectionHeader('Location Information')}
          {renderDetailRow('State of Origin', user?.stateOfOrigin)}
          {renderDetailRow('LGA', user?.lga)}
          {renderDetailRow('Ward', user?.ward)}
        </View>

        {/* Voting Information */}
        <View style={styles.detailsSection}>
          {renderSectionHeader('Voting Information')}
          {renderDetailRow('Voting State', user?.votingState, true)}
          {renderDetailRow('Voting LGA', user?.votingLGA, true)}
          {renderDetailRow('Voting Ward', user?.votingWard, true)}
          {renderDetailRow('Is Voter', user?.isVoter ? 'Yes' : 'No')}
          {renderDetailRow('Will Vote', user?.willVote ? 'Yes' : 'No')}
          {renderDetailRow('Voting Engagement State', user?.votingEngagementState)}
        </View>

        {/* Assignment Information */}
        {(user?.designation || user?.assignedState) && (
          <View style={styles.detailsSection}>
            {renderSectionHeader('Assignment Information')}
            {renderDetailRow('Designation', user?.designation, true)}
            {renderDetailRow('Assigned State', user?.assignedState)}
            {renderDetailRow('Assigned LGA', user?.assignedLGA)}
            {renderDetailRow('Assigned Ward', user?.assignedWard)}
          </View>
        )}

        {/* Election & Monitoring */}
        {(user?.monitorUniqueKey || user?.electionAccessLevel) && (
          <View style={styles.detailsSection}>
            {renderSectionHeader('Election & Monitoring')}
            {renderDetailRow('Monitor Key', user?.monitorUniqueKey)}
            {renderDetailRow('Key Status', user?.keyStatus)}
            {renderDetailRow('Key Assigned Date', user?.keyAssignedDate ?
              new Date(user.keyAssignedDate).toLocaleDateString() : null)}
            {renderDetailRow('Election Access Level', user?.electionAccessLevel)}
            {renderDetailRow('Monitoring Location', user?.monitoringLocation)}
          </View>
        )}

        {/* Account Status */}
        <View style={styles.detailsSection}>
          {renderSectionHeader('Account Status')}
          {renderDetailRow('KYC Status', user?.kycStatus)}
          {renderDetailRow('Email Verified', user?.emailVerified ? 'Yes' : 'No')}
          {renderDetailRow('2FA Enabled', user?.twoFactorEnabled ? 'Yes' : 'No')}
          {renderDetailRow('Push Notifications', user?.pushNotificationsEnabled ? 'Enabled' : 'Disabled')}
          {renderDetailRow('Has Taken Survey', user?.hasTakenCauseSurvey ? 'Yes' : 'No')}
          {renderDetailRow('Member Since', user?.createdAt ?
            new Date(user.createdAt).toLocaleDateString() : 'N/A')}
          {renderDetailRow('Last Seen (Mobile)', user?.mobileLastSeen ?
            new Date(user.mobileLastSeen).toLocaleString() : 'Never')}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    ...globalStyles.loadingContainer,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...globalStyles.errorText,
    ...typography.body1,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    ...globalStyles.button,
  },
  retryButtonText: {
    ...globalStyles.buttonText,
  },
  header: {
    backgroundColor: colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  completionBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.surface,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  verifiedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userHandle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  userEmail: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  badge: {
    ...globalStyles.badge,
    marginHorizontal: 4,
  },
  roleBadge: {
    backgroundColor: colors.primary,
  },
  monitorBadge: {
    backgroundColor: colors.info,
  },
  electionBadge: {
    backgroundColor: colors.success,
  },
  badgeText: {
    ...globalStyles.badgeText,
  },
  detailsSection: {
    backgroundColor: colors.surface,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    ...typography.body2,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  importantLabel: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  importantValue: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  editButton: {
    ...globalStyles.button,
    borderRadius: 12,
  },
  editButtonText: {
    ...globalStyles.buttonText,
  },
  refreshButton: {
    ...globalStyles.secondaryButton,
    backgroundColor: colors.info,
    borderColor: colors.info,
    borderRadius: 12,
  },
  refreshButtonText: {
    ...globalStyles.buttonText,
    color: colors.white,
  },
  logoutButton: {
    ...globalStyles.button,
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  logoutButtonText: {
    ...globalStyles.buttonText,
  },
});

export default ProfileScreen;
