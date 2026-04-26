import type { UserProfile } from "../context/UserContext";

/** The 12 fields required for a complete profile (matches Flutter). */
const REQUIRED_FIELDS: {
  key: string;
  label: string;
  getValue: (p: UserProfile) => unknown;
}[] = [
  { key: "profileImage", label: "Profile Photo", getValue: (p) => p.profileImage },
  { key: "name", label: "Full Name", getValue: (p) => p.name },
  { key: "phone", label: "Phone Number", getValue: (p) => p.phone },
  { key: "gender", label: "Gender", getValue: (p) => p.gender || p.personalInfo?.gender },
  { key: "ageRange", label: "Age Range", getValue: (p) => p.ageRange || p.personalInfo?.age_range },
  { key: "stateOfOrigin", label: "State of Origin", getValue: (p) => p.stateOfOrigin || p.personalInfo?.state_of_origin },
  { key: "votingState", label: "Voting State", getValue: (p) => p.votingState || p.personalInfo?.voting_engagement_state },
  { key: "votingLGA", label: "Voting LGA", getValue: (p) => p.votingLGA || p.personalInfo?.lga },
  { key: "votingWard", label: "Voting Ward", getValue: (p) => p.votingWard || p.personalInfo?.ward },
  { key: "votingPU", label: "Polling Unit", getValue: (p) => p.votingPU },
  { key: "isVoter", label: "Voter Status", getValue: (p) => p.isVoter || p.onboardingData?.votingBehavior?.is_registered },
  { key: "willVote", label: "Voting Intention", getValue: (p) => p.willVote || p.onboardingData?.votingBehavior?.likely_to_vote },
];

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

export interface ProfileCompletenessResult {
  isComplete: boolean;
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingFields: string[];
}

export function getProfileCompleteness(profile: UserProfile): ProfileCompletenessResult {
  const missing: string[] = [];
  let completed = 0;

  for (const field of REQUIRED_FIELDS) {
    if (isFilled(field.getValue(profile))) {
      completed++;
    } else {
      missing.push(field.label);
    }
  }

  const total = REQUIRED_FIELDS.length;
  return {
    isComplete: missing.length === 0,
    percentage: Math.round((completed / total) * 100),
    completedCount: completed,
    totalCount: total,
    missingFields: missing,
  };
}

export function isProfileComplete(profile: UserProfile): boolean {
  return getProfileCompleteness(profile).isComplete;
}
