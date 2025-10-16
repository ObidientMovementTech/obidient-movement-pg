import { createContext, useState, useEffect, useContext, useMemo, ReactNode } from 'react';
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
  securityValidation?: { profile_picture_url?: string };
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
  personalInfo: PersonalInfo;
  onboardingData: OnboardingData;
  userName?: string;
  gender?: string;
  ageRange?: string;
  stateOfOrigin?: string;
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  votingPU?: string;
  citizenship?: string;
  isVoter?: string;
  willVote?: string;
  countryCode?: string;
  designation?: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
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
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ---- PROVIDER ---- //
export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refreshProfile = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/auth/me`, { withCredentials: true });
      setProfile(res.data.user);
      console.log('✅ Profile refreshed:', res.data.user.name);
    } catch (err) {
      console.error('❌ Failed to refresh user profile:', err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      const res = await axios.patch(`${API_BASE}/users/me`, data, { withCredentials: true });
      setProfile(res.data.user);
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setProfile(null);
      setIsLoggingOut(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const value = useMemo(
    () => ({ profile, isLoading, refreshProfile, updateProfile, logout, isLoggingOut }),
    [profile, isLoading, isLoggingOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}

export const useUserContext = useUser;
