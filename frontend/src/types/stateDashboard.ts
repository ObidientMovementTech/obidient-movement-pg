export interface StateDashboardUser {
  userDesignation: string;
  assignedLocation: {
    state: string | null;
    lga: string | null;
    ward: string | null;
  };
}

export interface StateData {
  state: string;
  total_members: number;
  state_coordinators: number;
  lga_coordinators: number;
  ward_coordinators: number;
  polling_agents: number;
  vote_defenders: number;
}

export interface LGAData {
  lga: string;
  total_members: number;
  lga_coordinators: number;
  ward_coordinators: number;
  polling_agents: number;
  vote_defenders: number;
}

export interface WardData {
  ward: string;
  total_members: number;
  ward_coordinators: number;
  polling_agents: number;
  vote_defenders: number;
}

export interface WardMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface NationalDashboardData {
  states: StateData[];
  totalMembers: number;
}

export interface StateDashboardData {
  state: string;
  lgas: LGAData[];
  totalMembers: number;
}

export interface LGADashboardData {
  state: string;
  lga: string;
  wards: WardData[];
  totalMembers: number;
}

export interface WardDashboardData {
  state: string;
  lga: string;
  ward: string;
  members: WardMember[];
  totalMembers: number;
}

export interface SubordinateCoordinator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  assignedState: string | null;
  assignedLGA: string | null;
  assignedWard: string | null;
  phoneNumber?: string;
  createdAt: string;
}

export interface StateDashboardResponse {
  success: boolean;
  data: {
    userDesignation: string;
    assignedLocation: {
      state: string | null;
      lga: string | null;
      ward: string | null;
    };
    dashboardData: NationalDashboardData | StateDashboardData | LGADashboardData | WardDashboardData;
  };
}

export interface SubordinateCoordinatorsResponse {
  success: boolean;
  data: SubordinateCoordinator[];
}
