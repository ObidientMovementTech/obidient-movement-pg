/**
 * TypeScript type definitions for the Dashboard components
 * Centralized types for better maintainability and reusability
 */

// Core data interfaces
export interface MobilizationStats {
  inecRegisteredVoters: number;
  obidientRegisteredVoters: number; // Total Obidient users (PVC + non-PVC)
  obidientVotersWithPVC?: number; // New field for users with PVC
  obidientVotersWithoutPVC?: number; // New field for users without PVC
  unconvertedVoters: number;
  conversionRate: number;
  pvcWithStatus: number;
  pvcWithoutStatus: number;
  // Additional real data tracking
  realData?: {
    totalObidientUsers: number;
    votersWithPVC: number;
    votersWithoutPVC: number;
    votersWithPhone: number;
    votersWithEmail: number;
    pvcCompletionRate: number;
    isRealData: boolean;
  };
}

// API response interface for voter data
export interface VoterStateData {
  totalObidientUsers: number;
  obidientVoters: number; // PVC holders (for backward compatibility)
  votersWithPVC: number;
  votersWithoutPVC: number;
  votersWithPhone: number;
  votersWithEmail: number;
}

export interface StateData extends MobilizationStats {
  id: string;
  name: string;
  lgas: LGAData[];
}

export interface LGAData extends MobilizationStats {
  id: string;
  name: string;
  stateId: string;
  wards: WardData[];
}

export interface WardData extends MobilizationStats {
  id: string;
  name: string;
  lgaId: string;
  pollingUnits: PUData[];
}

export interface PUData extends MobilizationStats {
  id: string;
  name: string;
  wardId: string;
  code: string;
}

// Navigation and view types
export type ViewLevel = 'national' | 'state' | 'lga' | 'ward' | 'pu';

export interface BreadcrumbItem {
  level: ViewLevel;
  name: string;
  id?: string;
}

// Filter and sort types
export type PerformanceFilter = 'all' | 'high' | 'medium' | 'low';
export type MobilizationFilter = 'all' | 'above-average' | 'below-average';
export type SortField = 'name' | 'inec' | 'obidient' | 'conversion';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  searchQuery: string;
  filterRegion: string;
  performanceFilter: PerformanceFilter;
  mobilizationFilter: MobilizationFilter;
  sortBy: SortField;
  sortOrder: SortOrder;
  showOnlyWithObidients: boolean;
}

// Union type for hierarchical data
export type HierarchicalData = StateData | LGAData | WardData | PUData;

// API response types
export interface DashboardApiResponse {
  nationalStats: MobilizationStats;
  statesData: StateData[];
}

// Chart data interfaces
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Component prop interfaces
export interface StatsCardProps {
  currentStats: MobilizationStats | null;
  currentView: ViewLevel;
  currentScope: string; // Name of current state/LGA/ward being viewed
  loading: boolean;
}

export interface FilterPanelProps extends FilterOptions {
  currentView: ViewLevel;
  totalItems: number;
  filteredItems: number;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
}

export interface DataTableProps {
  data: HierarchicalData[];
  currentView: ViewLevel;
  loading: boolean;
  onNavigate: (id: string, name: string, level: ViewLevel) => void;
  formatNumber: (num: number) => string;
  getConversionColor: (rate: number) => string;
  getConversionBg: (rate: number) => string;
}

export interface ChartsSectionProps {
  nationalStats: MobilizationStats | null;
  currentData: HierarchicalData[];
  formatNumber: (num: number) => string;
}

export interface DashboardHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

// Hook return types
export interface UseDashboardDataReturn {
  loading: boolean;
  error: string | null;
  nationalStats: MobilizationStats | null;
  statesData: StateData[];
  currentData: HierarchicalData[];
  refreshData: () => Promise<void>;
  setCurrentData: (data: HierarchicalData[]) => void;
}

export interface UseDashboardFilterReturn extends FilterOptions {
  filteredData: HierarchicalData[];
  setSearchQuery: (query: string) => void;
  setFilterRegion: (region: string) => void;
  setPerformanceFilter: (filter: PerformanceFilter) => void;
  setMobilizationFilter: (filter: MobilizationFilter) => void;
  setSortBy: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setShowOnlyWithObidients: (show: boolean) => void;
  clearAllFilters: () => void;
}

// Nigerian regions type
export type NigerianRegion =
  | 'North Central'
  | 'North East'
  | 'North West'
  | 'South East'
  | 'South South'
  | 'South West';

// Performance categories
export type PerformanceCategory = 'high' | 'medium' | 'low';