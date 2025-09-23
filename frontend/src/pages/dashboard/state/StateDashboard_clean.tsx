import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Shield,
  Award,
  ChevronRight,
  Search,
  BarChart3,
  Target,
  Phone,
  MessageSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
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
import { StateLGAWardPollingUnits, getStateNames } from '../../../utils/StateLGAWardPollingUnits';

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

interface MobilizationStats {
  inecRegisteredVoters: number;
  obidientRegisteredVoters: number;
  unconvertedVoters: number;
  conversionRate: number;
  reachedCalls: number;
  reachedTexts: number;
  pvcWithStatus: number;
  pvcWithoutStatus: number;
  agentCoverage: number;
}

interface StateData extends MobilizationStats {
  id: string;
  name: string;
  lgas: LGAData[];
}

interface LGAData extends MobilizationStats {
  id: string;
  name: string;
  stateId: string;
  wards: WardData[];
}

interface WardData extends MobilizationStats {
  id: string;
  name: string;
  lgaId: string;
  pollingUnits: PUData[];
}

interface PUData extends MobilizationStats {
  id: string;
  name: string;
  wardId: string;
  code: string;
}

type ViewLevel = 'national' | 'state' | 'lga' | 'ward' | 'pu';

interface BreadcrumbItem {
  level: ViewLevel;
  name: string;
  id?: string;
}

const StateDashboard: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [mobilizationFilter, setMobilizationFilter] = useState<'all' | 'above-average' | 'below-average'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'inec' | 'obidient' | 'conversion' | 'reached'>('conversion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showOnlyWithObidients, setShowOnlyWithObidients] = useState(false);

  // Navigation state
  const [currentView, setCurrentView] = useState<ViewLevel>('national');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { level: 'national', name: 'National Overview' }
  ]);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedLGAId, setSelectedLGAId] = useState<string | null>(null);
  const [_selectedWardId, setSelectedWardId] = useState<string | null>(null);

  // Data state
  const [nationalStats, setNationalStats] = useState<MobilizationStats | null>(null);
  const [statesData, setStatesData] = useState<StateData[]>([]);
  const [currentData, setCurrentData] = useState<(StateData | LGAData | WardData | PUData)[]>([]);

  // Regional categorization of Nigerian states
  const getStateRegion = (stateName: string): string => {
    const regions: Record<string, string[]> = {
      'North Central': [
        'FCT', 'Benue State', 'Kogi State', 'Kwara State', 'Nasarawa State',
        'Niger State', 'Plateau State'
      ],
      'North East': [
        'Adamawa State', 'Bauchi State', 'Borno State', 'Gombe State',
        'Taraba State', 'Yobe State'
      ],
      'North West': [
        'Jigawa State', 'Kaduna State', 'Kano State', 'Katsina State',
        'Kebbi State', 'Sokoto State', 'Zamfara State'
      ],
      'South East': [
        'Abia State', 'Anambra State', 'Ebonyi State', 'Enugu State', 'Imo State'
      ],
      'South South': [
        'Akwa Ibom State', 'Bayelsa State', 'Cross River State', 'Delta State',
        'Edo State', 'Rivers State'
      ],
      'South West': [
        'Ekiti State', 'Lagos State', 'Ogun State', 'Ondo State', 'Osun State', 'Oyo State'
      ]
    };

    for (const [region, states] of Object.entries(regions)) {
      if (states.includes(stateName)) return region;
    }
    return 'Unknown';
  };

  // Performance categorization helper
  const getPerformanceCategory = (conversionRate: number): 'high' | 'medium' | 'low' => {
    if (conversionRate >= 4.0) return 'high';
    if (conversionRate >= 2.0) return 'medium';
    return 'low';
  };

  // Mock INEC data generation using real state structure
  const generateMockINECData = () => {
    const stateNames = getStateNames();

    // Mock INEC registration numbers for major states
    const inecDataMap: Record<string, number> = {
      'Lagos State': 7200000,
      'Anambra State': 2800000,
      'Kano State': 5600000,
      'Rivers State': 3400000,
      'Kaduna State': 4200000,
      'Ogun State': 2100000,
      'Oyo State': 3800000,
      'Delta State': 2900000,
      'Edo State': 2200000,
      'Cross River State': 1800000,
      'Enugu State': 2100000,
      'Imo State': 2400000,
      'Abia State': 1900000,
      'Akwa Ibom State': 2600000,
      'Bayelsa State': 1200000,
      'Ebonyi State': 1400000,
      'Osun State': 2000000,
      'Ondo State': 2100000,
      'Ekiti State': 1500000,
      'Kwara State': 1700000,
      'Niger State': 3000000,
      'FCT': 1800000,
      'Plateau State': 2300000,
      'Benue State': 2800000,
      'Kogi State': 2100000,
      'Nasarawa State': 1600000,
      'Taraba State': 1900000,
      'Adamawa State': 2400000,
      'Gombe State': 1700000,
      'Bauchi State': 3200000,
      'Yobe State': 1800000,
      'Borno State': 2900000,
      'Jigawa State': 2800000,
      'Katsina State': 4100000,
      'Kebbi State': 2200000,
      'Sokoto State': 2700000,
      'Zamfara State': 2100000
    };

    const mockStates: StateData[] = stateNames.map((stateName) => {
      const stateData = StateLGAWardPollingUnits[stateName];
      const inecVoters = inecDataMap[stateName] || Math.floor(Math.random() * 1000000) + 500000;

      // Generate realistic mobilization data
      const reachedCalls = Math.floor(inecVoters * (Math.random() * 0.15 + 0.05));
      const reachedTexts = Math.floor(inecVoters * (Math.random() * 0.20 + 0.08));
      const pvcWith = Math.floor(inecVoters * (Math.random() * 0.25 + 0.15));
      const pvcWithout = Math.floor(inecVoters * (Math.random() * 0.15 + 0.05));
      const agentCoverage = Math.random() * 40 + 20;

      return {
        id: stateData.id.toString(),
        name: stateName,
        inecRegisteredVoters: inecVoters,
        obidientRegisteredVoters: 0,
        unconvertedVoters: 0,
        conversionRate: 0,
        reachedCalls,
        reachedTexts,
        pvcWithStatus: pvcWith,
        pvcWithoutStatus: pvcWithout,
        agentCoverage: Number(agentCoverage.toFixed(1)),
        lgas: []
      };
    });

    // Calculate national totals
    const totalINEC = mockStates.reduce((sum, state) => sum + state.inecRegisteredVoters, 0);
    const totalReachedCalls = mockStates.reduce((sum, state) => sum + state.reachedCalls, 0);
    const totalReachedTexts = mockStates.reduce((sum, state) => sum + state.reachedTexts, 0);
    const totalPVCWith = mockStates.reduce((sum, state) => sum + state.pvcWithStatus, 0);
    const totalPVCWithout = mockStates.reduce((sum, state) => sum + state.pvcWithoutStatus, 0);
    const averageAgentCoverage = mockStates.reduce((sum, state) => sum + state.agentCoverage, 0) / mockStates.length;

    return {
      mockStates,
      totalINEC,
      totalReachedCalls,
      totalReachedTexts,
      totalPVCWith,
      totalPVCWithout,
      averageAgentCoverage: Number(averageAgentCoverage.toFixed(1))
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const {
        mockStates,
        totalINEC,
        totalReachedCalls,
        totalReachedTexts,
        totalPVCWith,
        totalPVCWithout,
        averageAgentCoverage
      } = generateMockINECData();

      const obidientVotersByState = await fetchObidientVotersByState();

      const mergedStates = mockStates.map(state => {
        const obidientCount = obidientVotersByState[state.name] || Math.floor(Math.random() * state.inecRegisteredVoters * 0.05);
        const unconverted = Math.max(0, state.inecRegisteredVoters - obidientCount);
        const conversionRate = state.inecRegisteredVoters > 0
          ? ((obidientCount / state.inecRegisteredVoters) * 100)
          : 0;

        return {
          ...state,
          obidientRegisteredVoters: obidientCount,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2))
        };
      });

      const totalObidient = mergedStates.reduce((sum, state) => sum + state.obidientRegisteredVoters, 0);
      const totalUnconverted = totalINEC - totalObidient;
      const nationalConversionRate = totalINEC > 0 ? ((totalObidient / totalINEC) * 100) : 0;

      const national: MobilizationStats = {
        inecRegisteredVoters: totalINEC,
        obidientRegisteredVoters: totalObidient,
        unconvertedVoters: totalUnconverted,
        conversionRate: Number(nationalConversionRate.toFixed(2)),
        reachedCalls: totalReachedCalls,
        reachedTexts: totalReachedTexts,
        pvcWithStatus: totalPVCWith,
        pvcWithoutStatus: totalPVCWithout,
        agentCoverage: averageAgentCoverage
      };

      setNationalStats(national);
      setStatesData(mergedStates);
      setCurrentData(mergedStates);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchObidientVotersByState = async (): Promise<Record<string, number>> => {
    try {
      const stateNames = getStateNames();
      const mockObidientData: Record<string, number> = {};

      stateNames.forEach(stateName => {
        const baseConversion: Record<string, number> = {
          'Lagos State': 180000,
          'Anambra State': 95000,
          'Kano State': 65000,
          'Rivers State': 78000,
          'Kaduna State': 52000,
          'Ogun State': 48000,
          'Oyo State': 72000,
          'Delta State': 45000,
          'Edo State': 38000,
          'Cross River State': 28000,
          'Enugu State': 55000,
          'Imo State': 48000,
          'Abia State': 42000,
          'Akwa Ibom State': 35000,
          'Bayelsa State': 18000,
          'Ebonyi State': 25000,
          'Osun State': 38000,
          'Ondo State': 32000,
          'Ekiti State': 25000,
          'Kwara State': 28000,
          'Niger State': 35000,
          'FCT': 85000,
          'Plateau State': 42000,
          'Benue State': 38000,
          'Kogi State': 28000,
          'Nasarawa State': 22000,
          'Taraba State': 25000,
          'Adamawa State': 32000,
          'Gombe State': 18000,
          'Bauchi State': 28000,
          'Yobe State': 15000,
          'Borno State': 35000,
          'Jigawa State': 22000,
          'Katsina State': 28000,
          'Kebbi State': 18000,
          'Sokoto State': 25000,
          'Zamfara State': 15000
        };

        mockObidientData[stateName] = baseConversion[stateName] || Math.floor(Math.random() * 30000) + 10000;
      });

      return mockObidientData;

    } catch (error) {
      console.error('Error fetching Obidient voter data:', error);
      const stateNames = getStateNames();
      const fallbackData: Record<string, number> = {};
      stateNames.forEach(stateName => {
        fallbackData[stateName] = Math.floor(Math.random() * 20000) + 5000;
      });
      return fallbackData;
    }
  };

  // Navigation handlers
  const navigateToState = (stateId: string, stateName: string) => {
    setSelectedStateId(stateId);
    setCurrentView('state');
    setBreadcrumbs([
      { level: 'national', name: 'National Overview' },
      { level: 'state', name: stateName, id: stateId }
    ]);

    // Generate LGA data for the selected state
    const stateData = StateLGAWardPollingUnits[stateName];
    if (stateData) {
      const lgasData: LGAData[] = Object.values(stateData.lgas).map(lga => {
        const inecVoters = Math.floor(Math.random() * 500000) + 100000;
        const obidientVoters = Math.floor(inecVoters * (Math.random() * 0.08 + 0.01));
        const unconverted = inecVoters - obidientVoters;
        const conversionRate = (obidientVoters / inecVoters) * 100;

        return {
          id: lga.id,
          name: lga.name,
          stateId: stateId,
          inecRegisteredVoters: inecVoters,
          obidientRegisteredVoters: obidientVoters,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          reachedCalls: Math.floor(inecVoters * (Math.random() * 0.1 + 0.03)),
          reachedTexts: Math.floor(inecVoters * (Math.random() * 0.15 + 0.05)),
          pvcWithStatus: Math.floor(inecVoters * (Math.random() * 0.2 + 0.1)),
          pvcWithoutStatus: Math.floor(inecVoters * (Math.random() * 0.1 + 0.03)),
          agentCoverage: Number((Math.random() * 40 + 15).toFixed(1)),
          wards: []
        };
      });

      setCurrentData(lgasData);
    }
  };

  const navigateToLGA = (lgaId: string, lgaName: string, stateName: string) => {
    setSelectedLGAId(lgaId);
    setCurrentView('lga');
    setBreadcrumbs([
      { level: 'national', name: 'National Overview' },
      { level: 'state', name: stateName, id: selectedStateId! },
      { level: 'lga', name: lgaName, id: lgaId }
    ]);

    // Generate Ward data for the selected LGA
    const stateData = StateLGAWardPollingUnits[stateName];
    if (stateData && stateData.lgas[lgaName]) {
      const lgaData = stateData.lgas[lgaName];
      const wardsData: WardData[] = Object.values(lgaData.wards).map(ward => {
        const inecVoters = Math.floor(Math.random() * 100000) + 20000;
        const obidientVoters = Math.floor(inecVoters * (Math.random() * 0.08 + 0.01));
        const unconverted = inecVoters - obidientVoters;
        const conversionRate = (obidientVoters / inecVoters) * 100;

        return {
          id: ward.id,
          name: ward.name,
          lgaId: lgaId,
          inecRegisteredVoters: inecVoters,
          obidientRegisteredVoters: obidientVoters,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          reachedCalls: Math.floor(inecVoters * (Math.random() * 0.12 + 0.02)),
          reachedTexts: Math.floor(inecVoters * (Math.random() * 0.18 + 0.04)),
          pvcWithStatus: Math.floor(inecVoters * (Math.random() * 0.25 + 0.08)),
          pvcWithoutStatus: Math.floor(inecVoters * (Math.random() * 0.12 + 0.02)),
          agentCoverage: Number((Math.random() * 35 + 10).toFixed(1)),
          pollingUnits: []
        };
      });

      setCurrentData(wardsData);
    }
  };

  const navigateToWard = (wardId: string, wardName: string, lgaName: string, stateName: string) => {
    setSelectedWardId(wardId);
    setCurrentView('ward');
    setBreadcrumbs([
      { level: 'national', name: 'National Overview' },
      { level: 'state', name: stateName, id: selectedStateId! },
      { level: 'lga', name: lgaName, id: selectedLGAId! },
      { level: 'ward', name: wardName, id: wardId }
    ]);

    // Generate Polling Unit data for the selected Ward
    const stateData = StateLGAWardPollingUnits[stateName];
    if (stateData && stateData.lgas[lgaName] && stateData.lgas[lgaName].wards[wardName]) {
      const wardData = stateData.lgas[lgaName].wards[wardName];
      const pollingUnitsData: PUData[] = wardData.pollingUnits.map((pu: any) => {
        const inecVoters = Math.floor(Math.random() * 2000) + 500;
        const obidientVoters = Math.floor(inecVoters * (Math.random() * 0.10 + 0.005));
        const unconverted = inecVoters - obidientVoters;
        const conversionRate = (obidientVoters / inecVoters) * 100;

        return {
          id: pu.id,
          name: pu.name,
          code: pu.abbreviation || pu.id,
          wardId: wardId,
          inecRegisteredVoters: inecVoters,
          obidientRegisteredVoters: obidientVoters,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          reachedCalls: Math.floor(inecVoters * (Math.random() * 0.15 + 0.01)),
          reachedTexts: Math.floor(inecVoters * (Math.random() * 0.20 + 0.02)),
          pvcWithStatus: Math.floor(inecVoters * (Math.random() * 0.30 + 0.05)),
          pvcWithoutStatus: Math.floor(inecVoters * (Math.random() * 0.15 + 0.01)),
          agentCoverage: Number((Math.random() * 30 + 5).toFixed(1))
        };
      });

      setCurrentData(pollingUnitsData);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const targetLevel = newBreadcrumbs[newBreadcrumbs.length - 1];
    setCurrentView(targetLevel.level);

    if (targetLevel.level === 'national') {
      setSelectedStateId(null);
      setSelectedLGAId(null);
      setSelectedWardId(null);
      setCurrentData(statesData);
    } else if (targetLevel.level === 'state') {
      setSelectedLGAId(null);
      setSelectedWardId(null);
      // Regenerate LGA data for the selected state
      navigateToState(targetLevel.id!, targetLevel.name);
    } else if (targetLevel.level === 'lga') {
      setSelectedWardId(null);
      // Regenerate Ward data for the selected LGA
      const stateName = breadcrumbs[1].name;
      navigateToLGA(targetLevel.id!, targetLevel.name, stateName);
    }
  };

  // Utility functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
  };

  const getConversionColor = (rate: number): string => {
    if (rate >= 4.0) return 'text-green-600';
    if (rate >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConversionBg = (rate: number): string => {
    if (rate >= 4.0) return 'bg-green-50 border-green-200';
    if (rate >= 2.0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Enhanced filtered and sorted data
  const filteredData = currentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterRegion !== 'all' && currentView === 'national') {
      const itemRegion = getStateRegion(item.name);
      if (itemRegion !== filterRegion) return false;
    }

    if (performanceFilter !== 'all') {
      const performanceCategory = getPerformanceCategory(item.conversionRate);
      if (performanceCategory !== performanceFilter) return false;
    }

    if (mobilizationFilter !== 'all') {
      const totalReached = item.reachedCalls + item.reachedTexts;
      const reachRate = (totalReached / item.inecRegisteredVoters) * 100;

      if (mobilizationFilter === 'above-average' && reachRate < 15) return false;
      if (mobilizationFilter === 'below-average' && reachRate >= 15) return false;
    }

    if (showOnlyWithObidients && item.obidientRegisteredVoters === 0) return false;

    return true;
  }).sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'name':
        aVal = a.name;
        bVal = b.name;
        break;
      case 'inec':
        aVal = a.inecRegisteredVoters;
        bVal = b.inecRegisteredVoters;
        break;
      case 'obidient':
        aVal = a.obidientRegisteredVoters;
        bVal = b.obidientRegisteredVoters;
        break;
      case 'conversion':
        aVal = a.conversionRate;
        bVal = b.conversionRate;
        break;
      case 'reached':
        aVal = a.reachedCalls + a.reachedTexts;
        bVal = b.reachedCalls + b.reachedTexts;
        break;
      default:
        return 0;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // Chart configurations
  const getConversionChartData = () => {
    if (!nationalStats) return null;

    return {
      labels: ['Obidient Voters', 'Unconverted Voters'],
      datasets: [{
        data: [nationalStats.obidientRegisteredVoters, nationalStats.unconvertedVoters],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2
      }]
    };
  };

  const getStateComparisonChartData = () => {
    if (!currentData.length) return null;

    const topStates = currentData.slice(0, 6);

    return {
      labels: topStates.map(state => state.name.replace(' State', '')),
      datasets: [
        {
          label: 'INEC Registered',
          data: topStates.map(state => state.inecRegisteredVoters),
          backgroundColor: '#3B82F6',
        },
        {
          label: 'Obidient Voters',
          data: topStates.map(state => state.obidientRegisteredVoters),
          backgroundColor: '#10B981',
        }
      ]
    };
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error Loading Dashboard</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mobilization Dashboard - {
                  currentView === 'national' ? 'National' :
                    currentView === 'state' ? breadcrumbs[1]?.name || 'State' :
                      currentView === 'lga' ? breadcrumbs[2]?.name || 'LGA' :
                        currentView === 'ward' ? breadcrumbs[3]?.name || 'Ward' :
                          'Polling Units'
                }
              </h1>
              <p className="text-gray-600 mt-1">Real-time voter conversion and mobilization analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Live Data
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {nationalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Obidient Voters</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(nationalStats.obidientRegisteredVoters)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Registered Voters</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(nationalStats.inecRegisteredVoters)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unconverted Voters</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(nationalStats.unconvertedVoters)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{nationalStats.conversionRate.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats Section */}
        {nationalStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone size={20} />
                <h3 className="text-lg font-semibold">Outreach Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Calls Made</span>
                  <span className="font-bold">{formatNumber(nationalStats.reachedCalls)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Texts Sent</span>
                  <span className="font-bold">{formatNumber(nationalStats.reachedTexts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Reached</span>
                  <span className="font-bold">{formatNumber(nationalStats.reachedCalls + nationalStats.reachedTexts)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} />
                <h3 className="text-lg font-semibold">PVC Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">With PVC</span>
                  <span className="font-bold">{formatNumber(nationalStats.pvcWithStatus)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Without PVC</span>
                  <span className="font-bold">{formatNumber(nationalStats.pvcWithoutStatus)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">PVC Rate</span>
                  <span className="font-bold">
                    {((nationalStats.pvcWithStatus / (nationalStats.pvcWithStatus + nationalStats.pvcWithoutStatus)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} />
                <h3 className="text-lg font-semibold">Agent Coverage</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-bold">{nationalStats.agentCoverage.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-gray-500">
                  Average coverage across all states
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">National Conversion Overview</h3>
            <div className="h-80 flex items-center justify-center">
              {getConversionChartData() && (
                <Doughnut
                  data={getConversionChartData()!}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatNumber(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top States Comparison</h3>
            <div className="h-80">
              {getStateComparisonChartData() && (
                <Bar
                  data={getStateComparisonChartData()!}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatNumber(value as number)
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder={`Search ${currentView === 'national' ? 'states' : currentView}s...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-64"
                  />
                </div>

                {currentView === 'national' && (
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Regions</option>
                    <option value="North Central">North Central</option>
                    <option value="North East">North East</option>
                    <option value="North West">North West</option>
                    <option value="South East">South East</option>
                    <option value="South South">South South</option>
                    <option value="South West">South West</option>
                  </select>
                )}

                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Performance</option>
                  <option value="high">High (≥4%)</option>
                  <option value="medium">Medium (2-4%)</option>
                  <option value="low">Low (&lt;2%)</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="conversion">Conversion Rate</option>
                    <option value="obidient">Obidient Voters</option>
                    <option value="inec">INEC Voters</option>
                    <option value="reached">Total Reached</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 flex-wrap">
                <select
                  value={mobilizationFilter}
                  onChange={(e) => setMobilizationFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Mobilization</option>
                  <option value="above-average">Above Average (≥15%)</option>
                  <option value="below-average">Below Average (&lt;15%)</option>
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showOnlyWithObidients}
                    onChange={(e) => setShowOnlyWithObidients(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Only areas with Obidient voters</span>
                </label>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">
                  Showing {filteredData.length} of {currentData.length} {currentView === 'national' ? 'states' : currentView}s
                </span>
                {(searchQuery || filterRegion !== 'all' || performanceFilter !== 'all' ||
                  mobilizationFilter !== 'all' || showOnlyWithObidients) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterRegion('all');
                        setPerformanceFilter('all');
                        setMobilizationFilter('all');
                        setShowOnlyWithObidients(false);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filters
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentView === 'national' ? 'States Overview' :
                  currentView === 'state' ? 'LGAs Overview' :
                    currentView === 'lga' ? 'Wards Overview' : 'Polling Units Overview'}
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 gap-4 p-6">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${currentView !== 'ward' ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  onClick={() => {
                    if (currentView === 'national') {
                      navigateToState(item.id, item.name);
                    } else if (currentView === 'state') {
                      const stateName = breadcrumbs[1].name;
                      navigateToLGA(item.id, item.name, stateName);
                    } else if (currentView === 'lga') {
                      const stateName = breadcrumbs[1].name;
                      const lgaName = breadcrumbs[2].name;
                      navigateToWard(item.id, item.name, lgaName, stateName);
                    }
                    // No navigation for PU level (final level)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getConversionBg(item.conversionRate)}`}>
                        <span className={`text-lg font-bold ${getConversionColor(item.conversionRate)}`}>
                          {item.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          {currentView === 'ward' && 'code' in item && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              PU: {(item as PUData).code}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 space-x-4">
                          <span>INEC: {formatNumber(item.inecRegisteredVoters)}</span>
                          <span>Obidient: {formatNumber(item.obidientRegisteredVoters)}</span>
                          <span>Unconverted: {formatNumber(item.unconvertedVoters)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Phone size={14} className="text-blue-500" />
                          <span>{formatNumber(item.reachedCalls)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} className="text-green-500" />
                          <span>{formatNumber(item.reachedTexts)}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-gray-500 text-xs">Agent Coverage</div>
                        <div className="font-semibold">{item.agentCoverage.toFixed(1)}%</div>
                      </div>

                      {currentView !== 'ward' && (
                        <ChevronRight size={20} className="text-gray-400" />
                      )}
                      {currentView === 'ward' && (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No data matches your current filters</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterRegion('all');
                  setPerformanceFilter('all');
                  setMobilizationFilter('all');
                  setShowOnlyWithObidients(false);
                }}
                className="text-blue-600 hover:text-blue-800 underline mt-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StateDashboard;