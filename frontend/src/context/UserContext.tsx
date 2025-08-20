import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ---- TYPES ---- //

export interface PersonalInfo {
  first_name: string;
  middle_name?: string;
  last_name: string;
  user_name: string;
  phone_number: string;
  country_code: string;
  gender: string;
  lga: string;
  ward: string;
  age_range: string;
  state_of_origin: string;
  voting_engagement_state: string;
  // Add survey fields
  citizenship?: string;
  isVoter?: string;
  willVote?: string;
}

export interface ValidID {
  idType: 'NIN' | 'Driver\'s License' | 'International Passport';
  idNumber: string;
  idImageUrl: string;
}

export interface OnboardingData {
  securityValidation?: {
    profile_picture_url?: string;
  };
  demographics?: {
    ethnicity?: string;
    religion?: string;
    occupation?: string;
    level_of_education?: string;
    marital_status?: string;
  };
  engagementAndMobilization?: {
    is_volunteering?: string;
    past_election_participation?: string;
  };
  votingBehavior?: {
    likely_to_vote?: string;
    is_registered?: string;
    registration_date?: string;
  };
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  kycStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  kycRejectionReason?: string;

  // Legacy nested structure (for backward compatibility)
  personalInfo: PersonalInfo;
  onboardingData: OnboardingData;

  // New flat structure (post-migration fields)
  userName?: string;
  gender?: string;
  ageRange?: string;
  stateOfOrigin?: string;
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  citizenship?: string;
  isVoter?: string;
  willVote?: string;
  countryCode?: string;

  // Coordinator designation fields
  designation?: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;

  // Existing fields
  selfieImageUrl?: string;
  validID: ValidID;
  joinedCauses: string[];
  ownedCauses: string[];
  createdAt?: string;
  updatedAt?: string;
  hasTakenCauseSurvey?: boolean;
  twoFactorEnabled?: boolean;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    broadcast: boolean;
  };
}

// ---- CONTEXT ---- //

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  isLoggingOut: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ---- PROVIDER ---- //

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refreshProfile = async () => {
    // Don't attempt to refresh profile if user is logging out
    if (isLoggingOut) return;

    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/auth/me`, {
        withCredentials: true,
      });
      console.log('👤 User profile loaded:', {
        name: res.data.user.name,
        designation: res.data.user.designation,
        assignedState: res.data.user.assignedState,
        role: res.data.user.role
      });
      setProfile(res.data.user);
    } catch (err) {
      console.error('❌ Failed to load user:', err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      const res = await axios.patch(`${API_BASE}/users/me`, data, {
        withCredentials: true,
      });
      setProfile(res.data.user);
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    setProfile(null);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <UserContext.Provider value={{ profile, isLoading, refreshProfile, updateProfile, logout, isLoggingOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}

export function useUserContext() {
  return useUser();
}
