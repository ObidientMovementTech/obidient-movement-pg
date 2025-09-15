import React, { createContext, useContext, useState, useEffect } from 'react';
import { mobileAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user profile from the server
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileAPI.getCurrentUserProfile();

      if (response.data?.success && response.data?.user) {
        const userProfile = response.data.user;
        setUser(userProfile);

        // Cache the user profile locally
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));

        console.log('✅ User profile fetched and cached successfully');
        return userProfile;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching user profile:', err);
      setError(err.message || 'Failed to fetch user profile');

      // Try to load cached profile as fallback
      try {
        const cachedProfile = await AsyncStorage.getItem('userProfile');
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile);
          setUser(parsedProfile);
          console.log('📱 Loaded cached user profile as fallback');
          return parsedProfile;
        }
      } catch (cacheError) {
        console.error('❌ Error loading cached profile:', cacheError);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile (force fetch from server)
  const refreshUserProfile = async () => {
    return await fetchUserProfile();
  };

  // Update user profile locally (for optimistic updates)
  const updateUserLocally = async (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update cached profile
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating cached profile:', error);
      }
    }
  };

  // Clear user data (for logout)
  const clearUser = async () => {
    setUser(null);
    setError(null);
    try {
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Error clearing cached profile:', error);
    }
  };

  // Check if user profile is complete
  const isProfileComplete = () => {
    if (!user) return false;

    // Define required fields for a complete profile
    const requiredFields = [
      'name',
      'email',
      'phone',
      'gender',
      'ageRange',
      'citizenship',
      'stateOfOrigin',
      'votingState',
      'votingLGA',
      'votingWard'
    ];

    return requiredFields.every(field => {
      const value = user[field];
      return value !== null && value !== undefined && value !== '';
    });
  };

  // Get profile completion percentage
  const getProfileCompletionPercentage = () => {
    return user?.profileCompletionPercentage || 0;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has election access
  const hasElectionAccess = () => {
    return user?.electionAccessLevel && user.electionAccessLevel !== null;
  };

  // Check if user is a monitor
  const isMonitor = () => {
    return user?.monitorUniqueKey && user.keyStatus === 'active';
  };

  // Get user's location info
  const getUserLocation = () => {
    if (!user) return null;

    return {
      state: user.votingState,
      lga: user.votingLGA,
      ward: user.votingWard,
      stateOfOrigin: user.stateOfOrigin,
      assignedState: user.assignedState,
      assignedLGA: user.assignedLGA,
      assignedWard: user.assignedWard
    };
  };

  // Initialize user data when component mounts
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user is authenticated
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          await fetchUserProfile();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const contextValue = {
    // State
    user,
    loading,
    error,

    // Actions
    fetchUserProfile,
    refreshUserProfile,
    updateUserLocally,
    clearUser,

    // Computed values
    isProfileComplete: isProfileComplete(),
    profileCompletionPercentage: getProfileCompletionPercentage(),

    // Helper functions
    hasRole,
    hasElectionAccess,
    isMonitor,
    getUserLocation
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
