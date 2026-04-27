import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronRight,
  Search,
  Users,
  UserPlus
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Loading from '../../../components/Loader';
import {
  HierarchicalData,
  MobilizationStats,
  ViewLevel,
  BreadcrumbItem,
} from '../types/dashboard.types';
import { mobiliseDashboardService } from '../../../services/mobiliseDashboardService';
import DashboardCharts from '../components/DashboardCharts';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface UserLevelData {
  userLevel: string;
  designation: string;
  role: string;
  assignedLocation: any;
  allowedLevels: string[];
}

const COORDINATOR_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
];

const StateDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [currentData, setCurrentData] = useState<HierarchicalData[]>([]);
  const [nationalStats, setNationalStats] = useState<MobilizationStats | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { level: 'national', name: 'National Overview' }
  ]);

  // View state
  const [currentView, setCurrentView] = useState<ViewLevel>('national');
  const [_selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [_selectedLGAId, setSelectedLGAId] = useState<string | null>(null);
  const [_selectedWardId, setSelectedWardId] = useState<string | null>(null);

  // User context
  const [userLevel, setUserLevel] = useState<UserLevelData | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Step 1: Get user level and permissions
      const userLevelResponse = await mobiliseDashboardService.getUserLevel();
      const userData = userLevelResponse.data;
      setUserLevel(userData);


      // Step 2: Load initial data based on user level
      await loadInitialData(userData);

      setError(null);
    } catch (err) {
      console.error('❌ Dashboard initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async (userData: UserLevelData) => {
    const { userLevel: level, assignedLocation, designation } = userData;

    let response;
    let view: ViewLevel;
    let breadcrumbsToSet: BreadcrumbItem[];

    console.log(`📊 Loading initial data for ${level} level (${designation})`);

    switch (level) {
      case 'national':
        response = await mobiliseDashboardService.getNationalData();
        view = 'national';
        breadcrumbsToSet = [{ level: 'national', name: 'National Overview' }];
        break;

      case 'state':
        if (!assignedLocation?.stateId) throw new Error('State ID not found');
        const stateId = assignedLocation.stateId.toLowerCase().replace(/\s+/g, '-');
        response = await mobiliseDashboardService.getStateData(stateId);
        view = 'state';
        breadcrumbsToSet = [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: assignedLocation.stateName, id: stateId }
        ];
        setSelectedStateId(stateId);
        break;

      case 'lga':
        if (!assignedLocation?.stateId || !assignedLocation?.lgaSlug) {
          throw new Error('LGA location data incomplete');
        }
        const lgaStateId = assignedLocation.stateId; // Already in slug format from backend
        const lgaSlug = assignedLocation.lgaSlug; // Already in slug format from backend
        const fullLgaId = `${lgaStateId}-${lgaSlug}`;
        response = await mobiliseDashboardService.getLGAData(fullLgaId);
        view = 'lga';
        breadcrumbsToSet = [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: assignedLocation.stateName, id: lgaStateId },
          { level: 'lga', name: assignedLocation.lgaName, id: fullLgaId }
        ];
        setSelectedStateId(lgaStateId);
        setSelectedLGAId(fullLgaId);
        break;

      case 'ward':
        if (!assignedLocation?.stateId || !assignedLocation?.lgaSlug || !assignedLocation?.wardSlug) {
          throw new Error('Ward location data incomplete');
        }
        const wardStateId = assignedLocation.stateId; // Already in slug format from backend
        const wardLgaSlug = assignedLocation.lgaSlug; // Already in slug format from backend
        const wardSlug = assignedLocation.wardSlug; // Already in slug format from backend
        const fullWardId = `${wardStateId}-${wardLgaSlug}-${wardSlug}`;
        response = await mobiliseDashboardService.getWardData(fullWardId);
        view = 'ward';
        breadcrumbsToSet = [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: assignedLocation.stateName, id: wardStateId },
          { level: 'lga', name: assignedLocation.lgaName, id: `${wardStateId}-${wardLgaSlug}` },
          { level: 'ward', name: assignedLocation.wardName, id: fullWardId }
        ];
        setSelectedStateId(wardStateId);
        setSelectedLGAId(`${wardStateId}-${wardLgaSlug}`);
        setSelectedWardId(fullWardId);
        break;

      default:
        throw new Error(`Invalid user level: ${level}`);
    }

    // Set the data
    const { stats, items, breadcrumbs: serverBreadcrumbs } = response.data;

    

    setNationalStats(stats);
    setCurrentData(items || []);
    setCurrentView(view);

    // Filter breadcrumbs based on user permissions before setting them
    const breadcrumbsToUse = serverBreadcrumbs || breadcrumbsToSet;
    const filteredBreadcrumbs = filterBreadcrumbsByPermissions(breadcrumbsToUse);
    setBreadcrumbs(filteredBreadcrumbs);
  };

  // Navigation functions
  const navigateToState = async (stateId: string, stateName: string) => {
    try {
      setLoading(true);

      const response = await mobiliseDashboardService.getStateData(stateId);

      const { stats, items, breadcrumbs } = response.data;

      setSelectedStateId(stateId);
      setSelectedLGAId(null);
      setSelectedWardId(null);
      setCurrentView('state');
      setNationalStats(stats);
      setCurrentData(items || []);

      const fallbackBreadcrumbs = [
        { level: 'national', name: 'National Overview' },
        { level: 'state', name: stateName, id: stateId }
      ];
      const breadcrumbsToUse = breadcrumbs || fallbackBreadcrumbs;
      setBreadcrumbs(filterBreadcrumbsByPermissions(breadcrumbsToUse));

    } catch (error) {
      console.error(`❌ Navigation error:`, error);
      setError(`Failed to load data for ${stateName}`);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLGA = async (lgaId: string, lgaName: string) => {
    try {
      setLoading(true);

      const response = await mobiliseDashboardService.getLGAData(lgaId);
      const { stats, items, breadcrumbs } = response.data;

      setSelectedLGAId(lgaId);
      setSelectedWardId(null);
      setCurrentView('lga');
      setNationalStats(stats);
      setCurrentData(items || []);
      setBreadcrumbs(filterBreadcrumbsByPermissions(breadcrumbs || []));

    } catch (error) {
      console.error(`❌ Navigation error:`, error);
      setError(`Failed to load data for ${lgaName}`);
    } finally {
      setLoading(false);
    }
  };

  const navigateToWard = async (wardId: string, wardName: string) => {
    try {
      setLoading(true);

      const response = await mobiliseDashboardService.getWardData(wardId);
      const { stats, items, breadcrumbs } = response.data;

      setSelectedWardId(wardId);
      setCurrentView('ward');
      setNationalStats(stats);
      setCurrentData(items || []);
      setBreadcrumbs(filterBreadcrumbsByPermissions(breadcrumbs || []));

    } catch (error) {
      console.error(`❌ Navigation error:`, error);
      setError(`Failed to load data for ${wardName}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user can access a specific level
  // const canAccessLevel = (level: string): boolean => {
  //   if (!userLevel || !userLevel.allowedLevels) return false;
  //   return userLevel.allowedLevels.includes(level);
  // };

  // Helper function to filter breadcrumbs based on user permissions
  const filterBreadcrumbsByPermissions = (breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] => {
    if (!userLevel) return breadcrumbs;

    // Define the hierarchy order (from highest to lowest permission level)
    const levelHierarchy = ['national', 'state', 'lga', 'ward', 'pu'];
    const userCurrentLevel = userLevel.userLevel;
    const userCurrentIndex = levelHierarchy.indexOf(userCurrentLevel);

    // If user level is not found, return empty array for security
    if (userCurrentIndex === -1) return [];

    // Filter out breadcrumbs that are above the user's permission level
    return breadcrumbs.filter(breadcrumb => {
      const breadcrumbIndex = levelHierarchy.indexOf(breadcrumb.level);
      return breadcrumbIndex >= userCurrentIndex;
    });
  };

  const navigateToBreadcrumb = async (index: number) => {
    try {
      setLoading(true);
      const targetBreadcrumb = breadcrumbs[index];


      let response;

      switch (targetBreadcrumb.level) {
        case 'national':
          response = await mobiliseDashboardService.getNationalData();
          setSelectedStateId(null);
          setSelectedLGAId(null);
          setSelectedWardId(null);
          setCurrentView('national');
          break;

        case 'state':
          if (!targetBreadcrumb.id) throw new Error('State ID required');
          response = await mobiliseDashboardService.getStateData(targetBreadcrumb.id);
          setSelectedStateId(targetBreadcrumb.id);
          setSelectedLGAId(null);
          setSelectedWardId(null);
          setCurrentView('state');
          break;

        case 'lga':
          if (!targetBreadcrumb.id) throw new Error('LGA ID required');
          response = await mobiliseDashboardService.getLGAData(targetBreadcrumb.id);
          setSelectedLGAId(targetBreadcrumb.id);
          setSelectedWardId(null);
          setCurrentView('lga');
          break;

        case 'ward':
          if (!targetBreadcrumb.id) throw new Error('Ward ID required');
          response = await mobiliseDashboardService.getWardData(targetBreadcrumb.id);
          setSelectedWardId(targetBreadcrumb.id);
          setCurrentView('ward');
          break;

        default:
          throw new Error(`Unknown level: ${targetBreadcrumb.level}`);
      }

      const { stats, items, breadcrumbs: newBreadcrumbs } = response.data;
      setNationalStats(stats);
      setCurrentData(items || []);

      const breadcrumbsToUse = newBreadcrumbs?.slice(0, index + 1) || breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(filterBreadcrumbsByPermissions(breadcrumbsToUse));

    } catch (error) {
      console.error(`❌ Breadcrumb navigation error:`, error);
      setError('Failed to navigate to selected level');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Filtered data (search only)
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return currentData;
    const q = searchQuery.toLowerCase();
    return currentData.filter((item: any) => item.name?.toLowerCase().includes(q));
  }, [currentData, searchQuery]);

  // Is coordinator or admin?
  const isCoordOrAdmin = userLevel
    ? userLevel.role === 'admin' || COORDINATOR_DESIGNATIONS.includes(userLevel.designation)
    : false;

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={initializeDashboard}
            className="px-4 py-2.5 bg-accent-green text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Get current level title
  const getCurrentLevelTitle = (): string => {
    switch (currentView) {
      case 'national':
        return 'National Overview';
      case 'state':
        return breadcrumbs.find(b => b.level === 'state')?.name
          ? `${breadcrumbs.find(b => b.level === 'state')!.name} State`
          : 'State Overview';
      case 'lga':
        return breadcrumbs.find(b => b.level === 'lga')?.name
          ? `${breadcrumbs.find(b => b.level === 'lga')!.name} LGA`
          : 'LGA Overview';
      case 'ward':
        return breadcrumbs.find(b => b.level === 'ward')?.name
          ? `${breadcrumbs.find(b => b.level === 'ward')!.name} Ward`
          : 'Ward Overview';
      default:
        return 'Dashboard';
    }
  };

  // Navigate to item based on current level
  const handleItemClick = (item: any) => {
    switch (currentView) {
      case 'national': navigateToState(item.id, item.name); break;
      case 'state': navigateToLGA(item.id, item.name); break;
      case 'lga': navigateToWard(item.id, item.name); break;
    }
  };

  const canDrillDown = currentView !== 'ward';

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {getCurrentLevelTitle()}
            </h1>
            {/* Coordinator action buttons */}
            {isCoordOrAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/my-team')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">My Team</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/assign-leader')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-accent-green rounded-lg hover:bg-green-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Assign Leader</span>
                </button>
              </div>
            )}
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-sm mb-4 overflow-x-auto">
              {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => !isLast && navigateToBreadcrumb(index)}
                      disabled={isLast}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                        isLast
                          ? 'bg-green-50 text-accent-green font-semibold cursor-default'
                          : 'text-gray-500 hover:text-accent-green hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {breadcrumb.name}
                    </button>
                    {!isLast && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
        </div>

        {/* Stats card — matching mobile layout */}
        {nationalStats && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
              Total Obidients
            </p>
            <div className="flex items-end gap-2 mb-5">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                {formatNumber(nationalStats.obidientRegisteredVoters)}
              </span>
              <span className="text-sm text-gray-500 pb-0.5">registered</span>
            </div>
            <div className="h-px bg-gray-100 mb-4" />
            {/* PVC breakdown */}
            <div className="flex items-center gap-5">
              {/* Mini donut visual */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-14 h-14">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="#0B6739" strokeWidth="3"
                    strokeDasharray={`${
                      nationalStats.obidientRegisteredVoters > 0
                        ? ((nationalStats.obidientVotersWithPVC || 0) / nationalStats.obidientRegisteredVoters) * 88
                        : 0
                    } 88`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-900">
                  {nationalStats.obidientRegisteredVoters > 0
                    ? `${Math.round(((nationalStats.obidientVotersWithPVC || 0) / nationalStats.obidientRegisteredVoters) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                  <span className="text-xs text-gray-500 flex-1">With PVC</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(nationalStats.obidientVotersWithPVC || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <span className="text-xs text-gray-500 flex-1">Without PVC</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(nationalStats.obidientVotersWithoutPVC || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts — Obidients vs PVC comparison */}
        {currentData.length > 0 && (
          <DashboardCharts
            nationalStats={nationalStats}
            currentView={currentView}
            currentData={currentData}
            formatNumber={(n) => n.toLocaleString()}
          />
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Location cards list */}
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">No results</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map((item: any, index) => {
              const total = item.obidientRegisteredVoters || 0;
              const withPvc = item.obidientVotersWithPVC || 0;
              const pvcRate = total > 0 ? withPvc / total : 0;

              return (
                <button
                  key={item.id || index}
                  onClick={canDrillDown ? () => handleItemClick(item) : undefined}
                  disabled={!canDrillDown}
                  className={`w-full bg-white rounded-xl border border-gray-100 px-4 py-3.5 text-left transition-colors ${
                    canDrillDown ? 'hover:border-gray-200 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {/* Top: name + percentage */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900 truncate flex-1">
                      {item.name}
                    </span>
                    <span className="text-[13px] font-bold text-gray-900 tracking-tight">
                      {(pvcRate * 100).toFixed(0)}%
                    </span>
                    {canDrillDown && (
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-accent-green rounded-full"
                      style={{ width: `${Math.min(pvcRate * 100, 100)}%` }}
                    />
                  </div>
                  {/* Meta row */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-gray-900">{formatNumber(total)}</span>
                    <span className="text-gray-500">Obidients</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-300 mx-1.5" />
                    <span className="font-semibold text-gray-900">{formatNumber(withPvc)}</span>
                    <span className="text-gray-500">with PVC</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateDashboard;