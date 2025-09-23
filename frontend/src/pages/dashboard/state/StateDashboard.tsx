import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
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
import {
  HierarchicalData,
  MobilizationStats,
  StateData,
  PUData,
  ViewLevel,
  BreadcrumbItem,
  SortField,
  SortOrder,
  PerformanceFilter
} from '../types/dashboard.types';
import StatsCards from '../components/StatsCards';
import { stateDashboardService } from '../../../services/stateDashboardService';

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

const StateDashboard: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');
  const [sortBy, setSortBy] = useState<SortField>('conversion');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
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
  const [currentData, setCurrentData] = useState<HierarchicalData[]>([]);
  const [hierarchicalData, setHierarchicalData] = useState<Record<string, any>>({});

  // User context for role-based access
  const [userDesignation, setUserDesignation] = useState<string>('');
  const [assignedLocation, setAssignedLocation] = useState<any>(null);
  const [allowedLevel, setAllowedLevel] = useState<ViewLevel>('national');

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

  // Calculate aggregated stats for current viewing level
  const calculateCurrentLevelStats = (): MobilizationStats | null => {
    if (!currentData || currentData.length === 0) {
      return nationalStats; // Fallback to national stats if no current data
    }

    // Aggregate all stats from current level data
    const aggregated = currentData.reduce(
      (acc, item) => ({
        inecRegisteredVoters: acc.inecRegisteredVoters + item.inecRegisteredVoters,
        obidientRegisteredVoters: acc.obidientRegisteredVoters + item.obidientRegisteredVoters,
        obidientVotersWithPVC: acc.obidientVotersWithPVC + (item.obidientVotersWithPVC || 0),
        obidientVotersWithoutPVC: acc.obidientVotersWithoutPVC + (item.obidientVotersWithoutPVC || 0),
        unconvertedVoters: acc.unconvertedVoters + item.unconvertedVoters,
        pvcWithStatus: acc.pvcWithStatus + item.pvcWithStatus,
        pvcWithoutStatus: acc.pvcWithoutStatus + item.pvcWithoutStatus,
        totalRealObidientUsers: acc.totalRealObidientUsers + (item.realData?.totalObidientUsers || 0),
        totalRealVotersWithPVC: acc.totalRealVotersWithPVC + (item.realData?.votersWithPVC || 0),
        totalRealVotersWithoutPVC: acc.totalRealVotersWithoutPVC + (item.realData?.votersWithoutPVC || 0),
        totalRealVotersWithPhone: acc.totalRealVotersWithPhone + (item.realData?.votersWithPhone || 0),
        totalRealVotersWithEmail: acc.totalRealVotersWithEmail + (item.realData?.votersWithEmail || 0),
        hasRealData: acc.hasRealData || (item.realData?.isRealData || false)
      }),
      {
        inecRegisteredVoters: 0,
        obidientRegisteredVoters: 0,
        obidientVotersWithPVC: 0,
        obidientVotersWithoutPVC: 0,
        unconvertedVoters: 0,
        pvcWithStatus: 0,
        pvcWithoutStatus: 0,
        totalRealObidientUsers: 0,
        totalRealVotersWithPVC: 0,
        totalRealVotersWithoutPVC: 0,
        totalRealVotersWithPhone: 0,
        totalRealVotersWithEmail: 0,
        hasRealData: false
      }
    );

    // Calculate conversion rate
    const conversionRate = aggregated.inecRegisteredVoters > 0
      ? (aggregated.obidientRegisteredVoters / aggregated.inecRegisteredVoters) * 100
      : 0;

    // Calculate PVC completion rate  
    const pvcCompletionRate = aggregated.totalRealObidientUsers > 0
      ? (aggregated.totalRealVotersWithPVC / aggregated.totalRealObidientUsers) * 100
      : (aggregated.pvcWithStatus / (aggregated.pvcWithStatus + aggregated.pvcWithoutStatus)) * 100;

    return {
      inecRegisteredVoters: aggregated.inecRegisteredVoters,
      obidientRegisteredVoters: aggregated.obidientRegisteredVoters,
      obidientVotersWithPVC: aggregated.obidientVotersWithPVC,
      obidientVotersWithoutPVC: aggregated.obidientVotersWithoutPVC,
      unconvertedVoters: aggregated.unconvertedVoters,
      conversionRate: Number(conversionRate.toFixed(2)),
      pvcWithStatus: aggregated.pvcWithStatus,
      pvcWithoutStatus: aggregated.pvcWithoutStatus,
      realData: {
        totalObidientUsers: aggregated.totalRealObidientUsers,
        votersWithPVC: aggregated.totalRealVotersWithPVC,
        votersWithoutPVC: aggregated.totalRealVotersWithoutPVC,
        votersWithPhone: aggregated.totalRealVotersWithPhone,
        votersWithEmail: aggregated.totalRealVotersWithEmail,
        pvcCompletionRate: Number(pvcCompletionRate.toFixed(2)),
        isRealData: aggregated.hasRealData
      }
    };
  };

  // Get current scope name based on breadcrumbs
  const getCurrentScopeName = (): string => {
    if (breadcrumbs.length === 0) return 'National Overview';
    const current = breadcrumbs[breadcrumbs.length - 1];
    return current.name;
  };

  // Generate dynamic dashboard title
  const getDashboardTitle = (): string => {
    switch (currentView) {
      case 'national':
        return 'National Mobilization Dashboard';
      case 'state':
        return `${getCurrentScopeName()} State Dashboard`;
      case 'lga':
        return `${getCurrentScopeName()} LGA Dashboard`;
      case 'ward':
        return `${getCurrentScopeName()} Ward Dashboard`;
      case 'pu':
        return `${getCurrentScopeName()} Dashboard`;
      default:
        return 'Mobilization Dashboard';
    }
  };

  // Generate dynamic dashboard description
  const getDashboardDescription = (): string => {
    switch (currentView) {
      case 'national':
        return 'Real-time voter registration and PVC tracking across all Nigerian states';
      case 'state':
        return `Voter registration and PVC tracking in ${getCurrentScopeName()}`;
      case 'lga':
        return `Voter registration and PVC tracking in ${getCurrentScopeName()} Local Government Area`;
      case 'ward':
        return `Voter registration and PVC tracking in ${getCurrentScopeName()} Ward`;
      case 'pu':
        return `Voter registration and PVC tracking at ${getCurrentScopeName()}`;
      default:
        return 'Real-time voter registration and PVC tracking analytics';
    }
  };

  // Mock INEC data generation using real state structure


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Attempting to fetch dashboard data from backend API...');

      // Use the role-based state dashboard API
      const response = await stateDashboardService.getDashboardData();
      console.log('Backend API response:', response);

      // Extract user context from response
      const { userDesignation, assignedLocation, dashboardData } = response;

      console.log('User designation:', userDesignation);
      console.log('Assigned location:', assignedLocation);

      // Set user context state
      setUserDesignation(userDesignation);
      setAssignedLocation(assignedLocation);

      // Determine the allowed level and initial view based on designation
      let allowedLevel: ViewLevel = 'national';
      let initialView: ViewLevel = 'national';
      let initialBreadcrumbs: BreadcrumbItem[] = [{ level: 'national', name: 'National Overview' }];

      switch (userDesignation) {
        case 'State Coordinator':
          allowedLevel = 'state';
          initialView = 'state';
          initialBreadcrumbs = [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: assignedLocation.name, id: assignedLocation.id }
          ];
          setSelectedStateId(assignedLocation.id);
          break;
        case 'LGA Coordinator':
          allowedLevel = 'lga';
          initialView = 'lga';
          initialBreadcrumbs = [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: assignedLocation.state.name, id: assignedLocation.state.id },
            { level: 'lga', name: assignedLocation.name, id: assignedLocation.id }
          ];
          setSelectedStateId(assignedLocation.state.id);
          setSelectedLGAId(assignedLocation.id);
          break;
        case 'Ward Coordinator':
          allowedLevel = 'ward';
          initialView = 'ward';
          initialBreadcrumbs = [
            { level: 'national', name: 'National Overview' },
            { level: 'state', name: assignedLocation.lga.state.name, id: assignedLocation.lga.state.id },
            { level: 'lga', name: assignedLocation.lga.name, id: assignedLocation.lga.id },
            { level: 'ward', name: assignedLocation.name, id: assignedLocation.id }
          ];
          setSelectedStateId(assignedLocation.lga.state.id);
          setSelectedLGAId(assignedLocation.lga.id);
          setSelectedWardId(assignedLocation.id);
          break;
        default:
          // National Coordinator or default - full access
          allowedLevel = 'national';
          initialView = 'national';
          break;
      }

      setAllowedLevel(allowedLevel);
      setCurrentView(initialView);
      setBreadcrumbs(initialBreadcrumbs);

      // Process the dashboard data
      const { nationalStats, statesData, hierarchicalData } = dashboardData;

      console.log('🔍 Debug - Dashboard data received:', {
        nationalStats,
        statesData,
        hierarchicalData,
        assignedLocation,
        initialView
      });

      setNationalStats(nationalStats);
      setStatesData(statesData);
      setHierarchicalData(hierarchicalData || {});

      // Set current data based on initial view
      // Note: The backend returns the appropriate data level in statesData
      // For National Coordinator: statesData contains states
      // For State Coordinator: statesData contains LGAs  
      // For LGA Coordinator: statesData contains wards
      // For Ward Coordinator: statesData contains polling units
      console.log('Setting current data from statesData:', statesData);
      setCurrentData(statesData || []);

    } catch (err: any) {
      console.error('Dashboard API Error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };



  // Fetch additional voter details for enhanced metrics

  // Navigation handlers
  const navigateToState = (stateId: string, stateName: string) => {
    // Check if user has access to navigate to this state
    if (userDesignation === 'State Coordinator' || userDesignation === 'LGA Coordinator' || userDesignation === 'Ward Coordinator') {
      // For state/LGA/ward coordinators, only allow navigation within their assigned area
      if (!assignedLocation || (
        userDesignation === 'State Coordinator' && assignedLocation.id !== stateId
      ) || (
          userDesignation === 'LGA Coordinator' && assignedLocation.state.id !== stateId
        ) || (
          userDesignation === 'Ward Coordinator' && assignedLocation.lga.state.id !== stateId
        )) {
        return; // Block unauthorized navigation
      }
    }

    setSelectedStateId(stateId);
    setCurrentView('state');
    setBreadcrumbs([
      { level: 'national', name: 'National Overview' },
      { level: 'state', name: stateName, id: stateId }
    ]);

    // Use hierarchical data from backend API instead of generating mock data
    if (hierarchicalData && hierarchicalData[stateName]) {
      const stateHierarchicalData = hierarchicalData[stateName];
      const lgaList = Object.keys(stateHierarchicalData).map(lgaName => {
        // Calculate LGA totals from its ward data
        const lgaWards = stateHierarchicalData[lgaName];
        let lgaObidientTotal = 0;
        let lgaPVCTotal = 0;
        let lgaNonPVCTotal = 0;

        Object.values(lgaWards).forEach((wardData: any) => {
          Object.values(wardData).forEach((puData: any) => {
            lgaObidientTotal += puData.total_obidient_users || 0;
            lgaPVCTotal += puData.voters_with_pvc || 0;
            lgaNonPVCTotal += puData.voters_without_pvc || 0;
          });
        });

        // Find INEC data for the state to calculate proportions
        const stateStats = statesData.find(s => s.name === stateName);
        const stateINECTotal = stateStats?.inecRegisteredVoters || 0;
        const stateObidientTotal = statesData.reduce((sum, state) => sum + state.obidientRegisteredVoters, 0);

        // Estimate LGA INEC voters proportionally
        const lgaINECEstimate = stateObidientTotal > 0
          ? Math.round((lgaObidientTotal / stateObidientTotal) * stateINECTotal)
          : Math.round(stateINECTotal * 0.1);

        const unconverted = Math.max(0, lgaINECEstimate - lgaObidientTotal);
        const conversionRate = lgaINECEstimate > 0 ? ((lgaObidientTotal / lgaINECEstimate) * 100) : 0;

        return {
          id: lgaName.toLowerCase().replace(/\s+/g, '-'),
          name: lgaName,
          stateId: stateId,
          inecRegisteredVoters: lgaINECEstimate,
          obidientRegisteredVoters: lgaObidientTotal,
          obidientVotersWithPVC: lgaPVCTotal,
          obidientVotersWithoutPVC: lgaNonPVCTotal,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          pvcWithStatus: lgaPVCTotal,
          pvcWithoutStatus: lgaNonPVCTotal,
          wards: [],
          realData: {
            totalObidientUsers: lgaObidientTotal,
            votersWithPVC: lgaPVCTotal,
            votersWithoutPVC: lgaNonPVCTotal,
            votersWithPhone: 0,
            votersWithEmail: 0,
            pvcCompletionRate: lgaObidientTotal > 0 ? ((lgaPVCTotal / lgaObidientTotal) * 100) : 0,
            isRealData: true
          }
        };
      });

      console.log('🔍 Generated LGA data from hierarchical data:', lgaList);
      setCurrentData(lgaList);
    } else {
      console.log('❌ No hierarchical data available for state:', stateName);
      setCurrentData([]);
    }
  };

  const navigateToLGA = (lgaId: string, lgaName: string, stateName: string) => {
    // Check if user has access to navigate to this LGA
    if (userDesignation === 'LGA Coordinator' || userDesignation === 'Ward Coordinator') {
      // For LGA/ward coordinators, only allow navigation within their assigned area
      if (!assignedLocation || (
        userDesignation === 'LGA Coordinator' && assignedLocation.id !== lgaId
      ) || (
          userDesignation === 'Ward Coordinator' && assignedLocation.lga.id !== lgaId
        )) {
        return; // Block unauthorized navigation
      }
    } else if (userDesignation === 'State Coordinator') {
      // State coordinators can navigate to any LGA within their state
      if (!assignedLocation || assignedLocation.name !== stateName) {
        return; // Block unauthorized navigation
      }
    }

    setSelectedLGAId(lgaId);
    setCurrentView('lga');
    setBreadcrumbs([
      { level: 'national', name: 'National Overview' },
      { level: 'state', name: stateName, id: selectedStateId! },
      { level: 'lga', name: lgaName, id: lgaId }
    ]);

    // Use hierarchical data to get ward information for this LGA
    if (hierarchicalData && hierarchicalData[stateName] && hierarchicalData[stateName][lgaName]) {
      const lgaHierarchicalData = hierarchicalData[stateName][lgaName];
      const wardList = Object.keys(lgaHierarchicalData).map(wardName => {
        // Calculate ward totals from its polling unit data
        const wardPollingUnits = lgaHierarchicalData[wardName];
        let wardObidientTotal = 0;
        let wardPVCTotal = 0;
        let wardNonPVCTotal = 0;

        Object.values(wardPollingUnits).forEach((puData: any) => {
          wardObidientTotal += puData.total_obidient_users || 0;
          wardPVCTotal += puData.voters_with_pvc || 0;
          wardNonPVCTotal += puData.voters_without_pvc || 0;
        });

        // Find current LGA stats to calculate proportions
        const lgaStats = currentData.find((lga: any) => lga.name === lgaName);
        const lgaINECTotal = lgaStats?.inecRegisteredVoters || 0;
        const lgaObidientTotal = lgaStats?.obidientRegisteredVoters || 1;

        // Estimate ward INEC voters proportionally
        const wardINECEstimate = lgaObidientTotal > 0
          ? Math.round((wardObidientTotal / lgaObidientTotal) * lgaINECTotal)
          : Math.round(lgaINECTotal * 0.2); // 20% fallback

        const unconverted = Math.max(0, wardINECEstimate - wardObidientTotal);
        const conversionRate = wardINECEstimate > 0 ? ((wardObidientTotal / wardINECEstimate) * 100) : 0;

        return {
          id: `${lgaId}-${wardName}`.toLowerCase().replace(/\s+/g, '-'),
          name: wardName,
          lgaId: lgaId,
          stateId: selectedStateId!,
          inecRegisteredVoters: wardINECEstimate,
          obidientRegisteredVoters: wardObidientTotal,
          obidientVotersWithPVC: wardPVCTotal,
          obidientVotersWithoutPVC: wardNonPVCTotal,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          pvcWithStatus: wardPVCTotal,
          pvcWithoutStatus: wardNonPVCTotal,
          pollingUnits: [],
          realData: {
            totalObidientUsers: wardObidientTotal,
            votersWithPVC: wardPVCTotal,
            votersWithoutPVC: wardNonPVCTotal,
            votersWithPhone: 0,
            votersWithEmail: 0,
            pvcCompletionRate: wardObidientTotal > 0 ? ((wardPVCTotal / wardObidientTotal) * 100) : 0,
            isRealData: true
          }
        };
      });

      console.log('🔍 Generated Ward data from hierarchical data:', wardList);
      setCurrentData(wardList);

      // Update stats to show LGA-level stats
      const lgaStats = statesData.find((lga: any) => lga.name === lgaName);
      if (lgaStats) {
        setNationalStats(lgaStats as MobilizationStats);
        console.log('📈 Updated stats to LGA level:', lgaStats);
      }
    } else {
      console.log('❌ No hierarchical data available for LGA:', lgaName, 'in state:', stateName);
      setCurrentData([]);
    }
  };

  const navigateToWard = (wardId: string, wardName: string, lgaName: string, stateName: string) => {
    // Check if user has access to navigate to this ward
    if (userDesignation === 'Ward Coordinator') {
      // Ward coordinators can only navigate to their assigned ward
      if (!assignedLocation || assignedLocation.id !== wardId) {
        return; // Block unauthorized navigation
      }
    } else if (userDesignation === 'LGA Coordinator') {
      // LGA coordinators can navigate to any ward within their LGA
      if (!assignedLocation || assignedLocation.name !== lgaName) {
        return; // Block unauthorized navigation
      }
    } else if (userDesignation === 'State Coordinator') {
      // State coordinators can navigate to any ward within their state
      if (!assignedLocation || assignedLocation.name !== stateName) {
        return; // Block unauthorized navigation
      }
    }

    setSelectedWardId(wardId);
    setCurrentView('ward');
    setBreadcrumbs([
      { level: 'national', name: 'National Overview' },
      { level: 'state', name: stateName, id: selectedStateId! },
      { level: 'lga', name: lgaName, id: selectedLGAId! },
      { level: 'ward', name: wardName, id: wardId }
    ]);

    // Use hierarchical data to get polling unit information for this ward
    if (hierarchicalData && hierarchicalData[stateName] && hierarchicalData[stateName][lgaName] && hierarchicalData[stateName][lgaName][wardName]) {
      const wardHierarchicalData = hierarchicalData[stateName][lgaName][wardName];
      const pollingUnitList = Object.keys(wardHierarchicalData).map((puName, index) => {
        // Get polling unit data directly from hierarchical data
        const puData = wardHierarchicalData[puName];
        const puObidientUsers = puData.total_obidient_users || 0;
        const puPVCUsers = puData.voters_with_pvc || 0;
        const puNonPVCUsers = puData.voters_without_pvc || 0;

        // Find current ward stats to calculate proportions
        const wardStats = currentData.find((ward: any) => ward.name === wardName);
        const wardINECTotal = wardStats?.inecRegisteredVoters || 0;
        const wardObidientTotal = wardStats?.obidientRegisteredVoters || 1;

        // Estimate polling unit INEC voters proportionally
        const puINECEstimate = wardObidientTotal > 0
          ? Math.round((puObidientUsers / wardObidientTotal) * wardINECTotal)
          : Math.round(wardINECTotal * 0.1); // 10% fallback

        const unconverted = Math.max(0, puINECEstimate - puObidientUsers);
        const conversionRate = puINECEstimate > 0 ? ((puObidientUsers / puINECEstimate) * 100) : 0;

        return {
          id: `${wardId}-${puName}`.toLowerCase().replace(/\s+/g, '-'),
          name: puName,
          code: puData.polling_unit_code || `PU-${index + 1}`,
          wardId: wardId,
          lgaId: selectedLGAId!,
          stateId: selectedStateId!,
          inecRegisteredVoters: puINECEstimate,
          obidientRegisteredVoters: puObidientUsers,
          obidientVotersWithPVC: puPVCUsers,
          obidientVotersWithoutPVC: puNonPVCUsers,
          unconvertedVoters: unconverted,
          conversionRate: Number(conversionRate.toFixed(2)),
          pvcWithStatus: puPVCUsers,
          pvcWithoutStatus: puNonPVCUsers,
          realData: {
            totalObidientUsers: puObidientUsers,
            votersWithPVC: puPVCUsers,
            votersWithoutPVC: puNonPVCUsers,
            votersWithPhone: puData.voters_with_phone || 0,
            votersWithEmail: puData.voters_with_email || 0,
            pvcCompletionRate: puObidientUsers > 0 ? ((puPVCUsers / puObidientUsers) * 100) : 0,
            isRealData: true
          }
        };
      });

      console.log('🔍 Generated Polling Unit data from hierarchical data:', pollingUnitList);
      setCurrentData(pollingUnitList);

      // Update stats to show ward-level stats
      const wardStats = currentData.find((ward: any) => ward.name === wardName);
      if (wardStats) {
        setNationalStats(wardStats as MobilizationStats);
        console.log('📈 Updated stats to Ward level:', wardStats);
      }
    } else {
      console.log('❌ No hierarchical data available for Ward:', wardName, 'in LGA:', lgaName, 'in state:', stateName);
      setCurrentData([]);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    const targetLevel = newBreadcrumbs[newBreadcrumbs.length - 1];

    // Check if user has access to navigate to this level
    if (targetLevel.level === 'national' && userDesignation !== 'National Coordinator' && allowedLevel !== 'national') {
      return; // Block unauthorized navigation to national level
    }

    setBreadcrumbs(newBreadcrumbs);
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
    // Always show full numbers with comma separators for better precision
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
                {getDashboardTitle()}
              </h1>
              <p className="text-gray-600 mt-1">{getDashboardDescription()}</p>
              {/* User Context */}
              {userDesignation && assignedLocation && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {userDesignation}
                  </div>
                  <span className="text-sm text-gray-600">
                    Assigned to: <span className="font-medium">{assignedLocation.name}</span>
                  </span>
                </div>
              )}
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
            {breadcrumbs.map((crumb, index) => {
              // Check if this breadcrumb should be clickable based on user access
              const isClickable = !(crumb.level === 'national' && userDesignation !== 'National Coordinator' && allowedLevel !== 'national');

              return (
                <React.Fragment key={index}>
                  {isClickable ? (
                    <button
                      onClick={() => navigateToBreadcrumb(index)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {crumb.name}
                    </button>
                  ) : (
                    <span className="text-gray-500 cursor-not-allowed">
                      {crumb.name}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          currentStats={calculateCurrentLevelStats()}
          currentView={currentView}
          currentScope={getCurrentScopeName()}
          loading={loading}
          formatNumber={formatNumber}
        />

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
                  showOnlyWithObidients) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterRegion('all');
                        setPerformanceFilter('all');
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
                          {item.obidientVotersWithPVC !== undefined && item.obidientVotersWithoutPVC !== undefined && (
                            <span className="text-xs text-blue-600">
                              (PVC: {formatNumber(item.obidientVotersWithPVC)},
                              No-PVC: {formatNumber(item.obidientVotersWithoutPVC)})
                            </span>
                          )}
                          <span>Unconverted: {formatNumber(item.unconvertedVoters)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
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