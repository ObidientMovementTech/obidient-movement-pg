export interface DemographicsData {
  kpis: {
    total: number;
    hasPvc: number;
    noPvc: number;
    willVote: number;
    profileComplete: number;
    active30d: number;
  };
  gender: { male: number; female: number; unknown: number };
  ageRanges: { label: string; count: number }[];
  pvcStatus: { yes: number; no: number };
  votingIntent: { yes: number; no: number; unknown: number };
  profileHealth: { complete: number; high: number; medium: number; low: number };
  signupTrend: { week: string; count: number }[];
  insights: {
    needsAttention: number;
    ghosts: number;
    champions: number;
    noLocation: number;
    noStateCount: number;
    genderGapAlert: boolean;
    youthGapAlert: boolean;
  };
}

export interface PersonRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  ageRange: string | null;
  isVoter: string | null;
  willVote: string | null;
  votingState: string | null;
  votingLGA: string | null;
  votingWard: string | null;
  votingPU: string | null;
  profileCompletionPercentage: number;
  profileImage: string | null;
  stateOfOrigin: string | null;
  citizenship: string | null;
  designation: string | null;
  lastActive: string | null;
  createdAt: string;
}

export interface PeopleFilters {
  gender?: string;
  ageRange?: string;
  pvc?: string;
  willVote?: string;
  profileHealth?: string;
  activity?: string;
  lga?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
