export interface LeaderContact {
  email?: string;
  whatsapp?: string;
}

export interface ManifestoItem {
  title: string;
  status: "Fulfilled" | "In Progress" | "Broken";
}

export interface CorruptionCase {
  summary: string;
  status: string;
  publicResponse?: string;
  sources: string[];
}

export interface PolicyAction {
  title: string;
  description?: string;
  impactScore?: number;
  date?: string;
}

export interface AttendanceRecord {
  totalSessions?: string;
  sessionsAttended?: string;
  notes?: string;
}

export interface BillsRecord {
  sponsored?: string;
  passed?: string;
  achievements?: string;
}

export interface Performance {
  attendance?: AttendanceRecord;
  bills?: BillsRecord;
}

export interface LiveFeedItem {
  type: "news" | "video" | "alert";
  content: string;
  link?: string;
}

export interface AlertPreferences {
  corruptionUpdates: boolean;
  missedVotes: boolean;
  newManifestos: boolean;
  controversialAppearances: boolean;
}

export interface Leader {
  _id?: string;
  id?: string;
  slug: string;
  fullName: string;
  officeHeld: string;
  politicalParty: string;
  level: "Federal" | "State" | "Local";
  state: string;
  lga: string;
  ward: string;
  imageUrl?: string;
  image?: string; // For the base64 version when uploading
  contact: LeaderContact;
  positioning?: string;
  activeYears?: string;
  nationality?: string;
  dateOfBirth?: string;
  religion?: string;
  stateOfOrigin?: string;
  town?: string;
  disputedFields?: string[];
  previousOffices?: string[];
  ideology?: string;
  manifesto?: ManifestoItem[];
  corruptionCases?: CorruptionCase[];
  policyDecisions?: PolicyAction[];
  performanceTracking?: Performance;
  liveFeed?: LiveFeedItem[];
  alertPreferences?: AlertPreferences;
  accountabilityScore?: number;
  compareAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  completionStatus?: {
    basicInfo: boolean;
    contactInfo: boolean;
    ideology: boolean;
    manifesto: boolean;
    corruptionCases: boolean;
    policyDecisions: boolean;
    performanceTracking: boolean;
  };
  isPublished?: boolean;
}
