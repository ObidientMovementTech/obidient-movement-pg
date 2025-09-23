import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  Users,
  TrendingUp,
  MapPin,
  BarChart3,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
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
        if (!assignedLocation?.stateId || !assignedLocation?.lgaId) {
          throw new Error('LGA location data incomplete');
        }
        const lgaStateId = assignedLocation.stateId.toLowerCase().replace(/\s+/g, '-');
        const lgaId = assignedLocation.lgaId.toLowerCase().replace(/\s+/g, '-');
        const fullLgaId = `${lgaStateId}-${lgaId}`;
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
        if (!assignedLocation?.stateId || !assignedLocation?.lgaId || !assignedLocation?.wardId) {
          throw new Error('Ward location data incomplete');
        }
        const wardStateId = assignedLocation.stateId.toLowerCase().replace(/\s+/g, '-');
        const wardLgaId = assignedLocation.lgaId.toLowerCase().replace(/\s+/g, '-');
        const wardId = assignedLocation.wardId.toLowerCase().replace(/\s+/g, '-');
        const fullWardId = `${wardStateId}-${wardLgaId}-${wardId}`;
        response = await mobiliseDashboardService.getWardData(fullWardId);
        view = 'ward';
        breadcrumbsToSet = [
          { level: 'national', name: 'National Overview' },
          { level: 'state', name: assignedLocation.stateName, id: wardStateId },
          { level: 'lga', name: assignedLocation.lgaName, id: `${wardStateId}-${wardLgaId}` },
          { level: 'ward', name: assignedLocation.wardName, id: fullWardId }
        ];
        setSelectedStateId(wardStateId);
        setSelectedLGAId(`${wardStateId}-${wardLgaId}`);
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
    setBreadcrumbs(serverBreadcrumbs || breadcrumbsToSet);

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
      setBreadcrumbs(breadcrumbs || [
        { level: 'national', name: 'National Overview' },
        { level: 'state', name: stateName, id: stateId }
      ]);

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
      setBreadcrumbs(breadcrumbs || []);

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
      setBreadcrumbs(breadcrumbs || []);

      console.log(`✅ Navigated to ${wardName}`);
    } catch (error) {
      console.error(`❌ Navigation error:`, error);
      setError(`Failed to load data for ${wardName}`);
    } finally {
      setLoading(false);
    }
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
      setBreadcrumbs(newBreadcrumbs?.slice(0, index + 1) || breadcrumbs.slice(0, index + 1));

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

  // Chart data preparation
  const chartData = React.useMemo(() => {
    if (!nationalStats) return null;

    return {
      labels: ['Obidient Voters', 'Other Voters'],
      datasets: [
        {
          data: [
            nationalStats.obidientRegisteredVoters,
            nationalStats.inecRegisteredVoters - nationalStats.obidientRegisteredVoters
          ],
          backgroundColor: ['#22c55e', '#e5e7eb'],
          borderColor: ['#16a34a', '#d1d5db'],
          borderWidth: 2,
        },
      ],
    };
  }, [nationalStats]);

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
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="hover:text-blue-600 transition-colors"
                  disabled={index === breadcrumbs.length - 1}
                >
                  {breadcrumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* User context info */}
          {userLevel && (
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{userLevel.designation}</span>
              {userLevel.assignedLocation && (
                <span className="ml-2">
                  • {userLevel.assignedLocation.stateName || userLevel.assignedLocation.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {nationalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Registered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(nationalStats.inecRegisteredVoters)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Obidient Voters</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(nationalStats.obidientRegisteredVoters)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {nationalStats.inecRegisteredVoters > 0
                      ? ((nationalStats.obidientRegisteredVoters / nationalStats.inecRegisteredVoters) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total {getNextLevelLabel()}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(currentData.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
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

        {/* Chart Section */}
        {chartData && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Voter Distribution
            </h3>
            <div className="max-w-md mx-auto">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                    title: {
                      display: true,
                      text: 'Obidient vs Other Voters'
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateDashboard;