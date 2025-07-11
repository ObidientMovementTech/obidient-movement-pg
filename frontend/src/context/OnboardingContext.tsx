import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// 1. Define the flattened shape for all onboarding fields
export interface ProfileDetails {
  // Security & Validation
  profile_picture_url?: string;

  // Personal Info
  first_name: string;
  middle_name: string;
  last_name: string;
  user_name: string;
  phone_number: string;
  country_code?: string;
  gender: string;
  age_range: string;
  state_of_origin: string;
  voting_engagement_state: string;
  lga: string;
  ward: string;

  // Demographics
  ethnicity: string;
  religion: string;
  occupation: string;
  level_of_education: string;
  marital_status: string;
  household_size: string;
  income_bracket: string;

  // Political Preferences
  party_affiliation: string;
  top_political_issues: string[];

  // Engagement & Mobilization
  is_volunteering: string;
  past_election_participation: string;
  preferred_method_of_communication: string[];

  // Technology & Access
  has_internet_access: string;
  preferred_social_media: string[];
  is_smartphone_user: string;

  // Voting Behavior
  likely_to_vote: string;
  is_registered: string;
  registration_date: string;
  voter_id_number: string;

  // Survey Questions
  vote_impact: string;
  trust_in_election_body: string;

  // Completion
  has_onboarded: boolean;
  member_id?: string;

  role: "member" | "verified" | "admin";
  emailVerified: boolean;
  is_active: boolean;
}

// 2. Context payload type including loading flag
interface OnboardingContextType {
  profileDetails: ProfileDetails;
  updateProfileDetails: (patch: Partial<ProfileDetails>) => void;
  isLoaded: boolean;
}

// 3. Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// 4. Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  // initial default values for all fields
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({
    profile_picture_url: "",

    first_name: "",
    middle_name: "",
    last_name: "",
    user_name: "",
    phone_number: "",
    country_code: "",
    gender: "",
    age_range: "",
    state_of_origin: "",
    voting_engagement_state: "",
    lga: "",
    ward: "",

    ethnicity: "",
    religion: "",
    occupation: "",
    level_of_education: "",
    marital_status: "",
    household_size: "",
    income_bracket: "",

    party_affiliation: "",
    top_political_issues: [],

    is_volunteering: "",
    past_election_participation: "",
    preferred_method_of_communication: [],

    has_internet_access: "",
    preferred_social_media: [],
    is_smartphone_user: "",

    likely_to_vote: "",
    is_registered: "",
    registration_date: "",
    voter_id_number: "",

    vote_impact: "",
    trust_in_election_body: "",

    has_onboarded: false,
    member_id: "",

    role: "member",
    emailVerified: false,
    is_active: true,

  });
  // loading flag
  const [isLoaded, setIsLoaded] = useState(false);

  // patch helper
  function updateProfileDetails(patch: Partial<ProfileDetails>) {
    setProfileDetails((prev) => ({ ...prev, ...patch }));
  }

  // fetch existing user data on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const user = await res.json();

        // Map subdocuments into flattened context
        setProfileDetails((prev) => ({
          ...prev,
          // securityValidation
          profile_picture_url: user.personalInfo?.profile_picture_url || prev.profile_picture_url,

          // personalInfo
          ...user.personalInfo,

          // onboardingData
          ...user.onboardingData.securityValidation,
          ...user.onboardingData.demographics,
          ...user.onboardingData.politicalPreferences,
          ...user.onboardingData.engagementAndMobilization,
          ...user.onboardingData.technologyAccess,
          ...user.onboardingData.votingBehavior,
          ...user.onboardingData.surveyQuestions,

          has_onboarded: user.has_onboarded,
          member_id: user.member_id || prev.member_id,
          role: user.role || prev.role,
          emailVerified: user.emailVerified || prev.emailVerified,
          is_active: user.is_active || prev.is_active,
        }));
      } catch (err) {
        console.error("OnboardingContext load error:", err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  return (
    <OnboardingContext.Provider value={{ profileDetails, updateProfileDetails, isLoaded }}>
      {children}
    </OnboardingContext.Provider>
  );
}

// 5. Hook for easy access
export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be inside OnboardingProvider");
  return ctx;
}
