import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Loading from '../../../components/Loader';
import {
  HierarchicalData,
  MobilizationStats,
  ViewLevel,
  BreadcrumbItem,
  SortField,
  SortOrder,
  PerformanceFilter
} from '../types/dashboard.types';
import { mobiliseDashboardService } from '../../../services/mobiliseDashboardService';
import DashboardCharts from '../components/DashboardCharts';
import StatsCards from '../components/StatsCards';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface UserLevelData {
  userLevel: string;
  designation: string;
  assignedLocation: any;
  allowedLevels: string[];
}

const StateDashboard: React.FC = () => {
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

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showOnlyWithObidients, setShowOnlyWithObidients] = useState(false);

  // Nigeria geopolitical zones mapping
  const getStateRegion = (stateName: string): string => {
    const regions: Record<string, string[]> = {
      'North Central': [
        'Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'FCT'
      ],
      'North East': [
        'Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'
      ],
      'North West': [
        'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'
      ],
      'South East': [
        'Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'
      ],
      'South South': [
        'Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'
      ],
      'South West': [
        'Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo'
      ]
    };

    for (const [region, states] of Object.entries(regions)) {
      if (states.some(state =>
        stateName.toLowerCase().includes(state.toLowerCase()) ||
        state.toLowerCase().includes(stateName.toLowerCase())
      )) {
        return region;
      }
    }
    return 'Other';
  };

  // Performance categorization
  const getPerformanceCategory = (conversionRate: number): 'high' | 'medium' | 'low' => {
    if (conversionRate >= 70) return 'high';
    if (conversionRate >= 40) return 'medium';
    return 'low';
  };

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      console.log('🚀 Initializing dashboard...');

      // Step 1: Get user level and permissions
      const userLevelResponse = await mobiliseDashboardService.getUserLevel();
      const userData = userLevelResponse.data;
      setUserLevel(userData);

      console.log('👤 User context:', userData);

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

    console.log('🔍 DEBUG - Response data:', response.data);
    console.log('📊 DEBUG - Stats received:', stats);
    console.log('📋 DEBUG - Items received:', items);
    console.log('🍞 DEBUG - Breadcrumbs received:', serverBreadcrumbs);

    setNationalStats(stats);
    setCurrentData(items || []);
    setCurrentView(view);

    // Filter breadcrumbs based on user permissions before setting them
    const breadcrumbsToUse = serverBreadcrumbs || breadcrumbsToSet;
    const filteredBreadcrumbs = filterBreadcrumbsByPermissions(breadcrumbsToUse);
    setBreadcrumbs(filteredBreadcrumbs);

    console.log(`✅ Dashboard loaded: ${view} level, ${items?.length || 0} items`);
    console.log('📊 DEBUG - Final stats state:', stats);
    console.log('📋 DEBUG - Final current data:', items || []);
  };

  // Navigation functions
  const navigateToState = async (stateId: string, stateName: string) => {
    try {
      setLoading(true);
      console.log(`🔍 Navigating to state: ${stateName} (ID: ${stateId})`);

      const response = await mobiliseDashboardService.getStateData(stateId);
      console.log('🔍 DEBUG - Navigation response:', response);

      const { stats, items, breadcrumbs } = response.data;
      console.log('📊 DEBUG - Navigation stats:', stats);
      console.log('📋 DEBUG - Navigation items:', items);

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

      console.log(`✅ Navigated to ${stateName}`);
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
      console.log(`🔍 Navigating to LGA: ${lgaName}`);

      const response = await mobiliseDashboardService.getLGAData(lgaId);
      const { stats, items, breadcrumbs } = response.data;

      setSelectedLGAId(lgaId);
      setSelectedWardId(null);
      setCurrentView('lga');
      setNationalStats(stats);
      setCurrentData(items || []);
      setBreadcrumbs(filterBreadcrumbsByPermissions(breadcrumbs || []));

      console.log(`✅ Navigated to ${lgaName}`);
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
      console.log(`🔍 Navigating to Ward: ${wardName}`);

      const response = await mobiliseDashboardService.getWardData(wardId);
      const { stats, items, breadcrumbs } = response.data;

      setSelectedWardId(wardId);
      setCurrentView('ward');
      setNationalStats(stats);
      setCurrentData(items || []);
      setBreadcrumbs(filterBreadcrumbsByPermissions(breadcrumbs || []));

      console.log(`✅ Navigated to ${wardName}`);
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

      console.log(`🔍 Navigating to breadcrumb: ${targetBreadcrumb.name}`);

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

      console.log(`✅ Navigated to ${targetBreadcrumb.name}`);
    } catch (error) {
      console.error(`❌ Breadcrumb navigation error:`, error);
      setError('Failed to navigate to selected level');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getConversionColor = (rate: number): string => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Data filtering and sorting
  const filteredAndSortedData = React.useMemo(() => {
    let filtered = [...currentData];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) =>
        item.name?.toLowerCase().includes(query)
      );
    }

    // Apply region filter (only for state view)
    if (filterRegion !== 'all' && currentView === 'national') {
      filtered = filtered.filter((item: any) =>
        getStateRegion(item.name) === filterRegion
      );
    }

    // Apply performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter((item: any) => {
        const conversionRate = item.inecRegisteredVoters > 0
          ? (item.obidientRegisteredVoters / item.inecRegisteredVoters) * 100
          : 0;
        return getPerformanceCategory(conversionRate) === performanceFilter;
      });
    }

    // Apply obidients-only filter
    if (showOnlyWithObidients) {
      filtered = filtered.filter((item: any) => item.obidientRegisteredVoters > 0);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'inec':
          aVal = a.inecRegisteredVoters || 0;
          bVal = b.inecRegisteredVoters || 0;
          break;
        case 'obidient':
          aVal = a.obidientRegisteredVoters || 0;
          bVal = b.obidientRegisteredVoters || 0;
          break;
        case 'conversion':
          aVal = a.inecRegisteredVoters > 0 ? (a.obidientRegisteredVoters / a.inecRegisteredVoters) * 100 : 0;
          bVal = b.inecRegisteredVoters > 0 ? (b.obidientRegisteredVoters / b.inecRegisteredVoters) * 100 : 0;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return filtered;
  }, [currentData, searchQuery, filterRegion, performanceFilter, showOnlyWithObidients, sortBy, sortOrder, currentView]);

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
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
        const stateBreadcrumb = breadcrumbs.find(b => b.level === 'state');
        return stateBreadcrumb ? `${stateBreadcrumb.name} State` : 'State Overview';
      case 'lga':
        const lgaBreadcrumb = breadcrumbs.find(b => b.level === 'lga');
        return lgaBreadcrumb ? `${lgaBreadcrumb.name} LGA` : 'LGA Overview';
      case 'ward':
        const wardBreadcrumb = breadcrumbs.find(b => b.level === 'ward');
        return wardBreadcrumb ? `${wardBreadcrumb.name} Ward` : 'Ward Overview';
      default:
        return 'Dashboard';
    }
  };

  // Get next level label
  const getNextLevelLabel = (): string => {
    switch (currentView) {
      case 'national':
        return 'States';
      case 'state':
        return 'LGAs';
      case 'lga':
        return 'Wards';
      case 'ward':
        return 'Polling Units';
      default:
        return 'Items';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getCurrentLevelTitle()}
          </h1>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            {breadcrumbs.map((breadcrumb, index) => {
              const isCurrentPage = index === breadcrumbs.length - 1;

              return (
                <React.Fragment key={index}>
                  <button
                    onClick={() => !isCurrentPage ? navigateToBreadcrumb(index) : null}
                    className={`transition-colors ${isCurrentPage
                      ? 'text-gray-900 font-medium cursor-default'
                      : 'hover:text-blue-600 cursor-pointer'
                      }`}
                    disabled={isCurrentPage}
                  >
                    {breadcrumb.name}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>          {/* User context info */}
          {userLevel && (
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{userLevel.designation}</span>
              {userLevel.assignedLocation && (
                <span className="ml-2">
                  • {userLevel.assignedLocation.stateName || userLevel.assignedLocation.name}
                </span>
              )}
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Access Level: {userLevel.userLevel.charAt(0).toUpperCase() + userLevel.userLevel.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {nationalStats && (
          <StatsCards
            currentStats={{
              ...nationalStats,
              // Calculate any additional stats needed by the component
              unconvertedVoters: nationalStats.inecRegisteredVoters - nationalStats.obidientRegisteredVoters,
              conversionRate: nationalStats.inecRegisteredVoters > 0
                ? (nationalStats.obidientRegisteredVoters / nationalStats.inecRegisteredVoters) * 100
                : 0,
              // Adding PVC data if available
              pvcWithStatus: nationalStats.obidientVotersWithPVC || 0,
              pvcWithoutStatus: nationalStats.obidientVotersWithoutPVC || 0
            }}
            currentView={currentView}
            currentScope={(() => {
              // Get the current scope name from breadcrumbs
              switch (currentView) {
                case 'national':
                  return 'National';
                case 'state':
                  return breadcrumbs.find(b => b.level === 'state')?.name || '';
                case 'lga':
                  return breadcrumbs.find(b => b.level === 'lga')?.name || '';
                case 'ward':
                  return breadcrumbs.find(b => b.level === 'ward')?.name || '';
                default:
                  return '';
              }
            })()}
            loading={loading}
            formatNumber={formatNumber}
          />
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Region Filter (only for national view) */}
            {currentView === 'national' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Regions</option>
                  <option value="North Central">North Central</option>
                  <option value="North East">North East</option>
                  <option value="North West">North West</option>
                  <option value="South East">South East</option>
                  <option value="South South">South South</option>
                  <option value="South West">South West</option>
                </select>
              </div>
            )}

            {/* Performance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance
              </label>
              <select
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value as PerformanceFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Performance</option>
                <option value="high">High (≥70%)</option>
                <option value="medium">Medium (40-69%)</option>
                <option value="low">Low (&lt;40%)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="inec">Registered</option>
                  <option value="obidient">Obidients</option>
                  <option value="conversion">Rate</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyWithObidients}
                onChange={(e) => setShowOnlyWithObidients(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Only show areas with Obidient voters</span>
            </label>
          </div>
        </div>

        {/* Discrepancy Notice - Shown when there's a discrepancy between parent and children counts */}
        {nationalStats && currentData.length > 0 && (
          <React.Fragment>
            {(() => {
              // Calculate the sum of children's obidient voters
              const childrenSum = filteredAndSortedData.reduce((sum, item) => sum + (item.obidientRegisteredVoters || 0), 0);
              const parentTotalVoters = nationalStats.obidientRegisteredVoters;
              const discrepancy = parentTotalVoters - childrenSum;

              // Only show the message if there's a discrepancy of at least 1
              if (discrepancy > 0) {
                // Determine the appropriate message based on current view
                let message = '';
                let childType = '';

                switch (currentView) {
                  case 'national':
                    message = `There ${discrepancy === 1 ? 'is' : 'are'} <span class="font-bold">${discrepancy}</span> user${discrepancy !== 1 ? 's' : ''} with no State assignment. These users are included in the national total but not in any State count.`;
                    childType = 'State';
                    break;
                  case 'state':
                    const stateName = breadcrumbs.find(b => b.level === 'state')?.name || '';
                    message = `There ${discrepancy === 1 ? 'is' : 'are'} <span class="font-bold">${discrepancy}</span> user${discrepancy !== 1 ? 's' : ''} in ${stateName} with no LGA assignment. These users are included in the state total but not in any LGA count.`;
                    childType = 'LGA';
                    break;
                  case 'lga':
                    const lgaName = breadcrumbs.find(b => b.level === 'lga')?.name || '';
                    message = `There ${discrepancy === 1 ? 'is' : 'are'} <span class="font-bold">${discrepancy}</span> user${discrepancy !== 1 ? 's' : ''} in ${lgaName} with no Ward assignment. These users are included in the LGA total but not in any Ward count.`;
                    childType = 'Ward';
                    break;
                  case 'ward':
                    const wardName = breadcrumbs.find(b => b.level === 'ward')?.name || '';
                    message = `There ${discrepancy === 1 ? 'is' : 'are'} <span class="font-bold">${discrepancy}</span> user${discrepancy !== 1 ? 's' : ''} in ${wardName} with no Polling Unit assignment. These users are included in the Ward total but not in any Polling Unit count.`;
                    childType = 'Polling Unit';
                    break;
                  default:
                    return null;
                }

                return (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-amber-700 flex items-center">
                          <span className="font-medium">Data Discrepancy: </span>
                          <span dangerouslySetInnerHTML={{ __html: message }}></span>
                          <span className="relative group ml-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 w-64 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                              When a user registers but doesn't provide complete location information, they're still counted in the parent total but can't be displayed in child locations.
                            </div>
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-amber-600">
                          <span className="font-medium">Tip for admins: </span>
                          These users need their {childType.toLowerCase()} information updated in the database to ensure accurate reporting.
                        </p>
                        {userLevel && userLevel.designation.includes('Admin') && (
                          <button
                            onClick={() => {
                              // This would trigger an export or report generation in a real implementation
                              alert(`Export of ${discrepancy} users with missing ${childType} data will be prepared and sent to your email.`);
                            }}
                            className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded flex items-center w-fit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export List
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </React.Fragment>
        )}

        {/* Charts Section */}
        {nationalStats && (
          <DashboardCharts
            nationalStats={nationalStats}
            currentView={currentView}
            currentData={currentData}
            formatNumber={formatNumber}
          />
        )}

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getNextLevelLabel()} ({filteredAndSortedData.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obidient Voters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  {currentView === 'national' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((item: any, index) => {
                  const conversionRate = item.inecRegisteredVoters > 0
                    ? (item.obidientRegisteredVoters / item.inecRegisteredVoters) * 100
                    : 0;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(item.inecRegisteredVoters || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(item.obidientRegisteredVoters || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getConversionColor(conversionRate)}`}>
                          {conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      {currentView === 'national' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getStateRegion(item.name)}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentView !== 'ward' && (
                          <button
                            onClick={() => {
                              switch (currentView) {
                                case 'national':
                                  navigateToState(item.id, item.name);
                                  break;
                                case 'state':
                                  navigateToLGA(item.id, item.name);
                                  break;
                                case 'lga':
                                  navigateToWard(item.id, item.name);
                                  break;
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data matches your current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StateDashboard;