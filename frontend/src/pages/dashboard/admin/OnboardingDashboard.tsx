import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Users, MapPin, TrendingUp, Search, X,
  ChevronDown, ChevronRight as ChevronRightIcon,
  Building2, Loader2, Download, Plus, RefreshCw, Calendar, Award, Filter,
  Copy, Link2, CheckCircle2, ExternalLink, User, Phone, Mail
} from 'lucide-react'; const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface OnboardingStats {
  overview: {
    total_onboarded: number;
    pu_agents: number;
    ward_coordinators: number;
    lga_coordinators: number;
    state_coordinators: number;
    unique_support_groups: number;
    google_oauth_users: number;
    active_users: number;
    completed_pu_agents: number;
    pending_pu_agents: number;
  };
  coverage: Array<{
    votingState: string;
    votingLGA: string;
    votingWard: string;
    votingPU: string;
    agent_count: number;
    support_group_count: number;
    support_groups: string[] | null;
  }>;
  activeTokens: Array<{
    id: number;
    designation: string;
    created_at: string;
    expires_at: string;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    notes: string;
    short_code: string | null;
    url: string;
    short_url: string | null;
  }>;
}

const OnboardingDashboard: React.FC = () => {
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedSupportGroup, setSelectedSupportGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Hierarchical view state
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [expandedLGAs, setExpandedLGAs] = useState<Set<string>>(new Set());
  const [expandedWards, setExpandedWards] = useState<Set<string>>(new Set());

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatNumber = (value: unknown) => toNumber(value).toLocaleString();

  // Token creation state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenDesignation, setTokenDesignation] = useState('Polling Unit Agent');
  const [tokenExpiry, setTokenExpiry] = useState('90d');
  const [tokenNotes, setTokenNotes] = useState('');
  const [createdToken, setCreatedToken] = useState<any>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedShortCode, setCopiedShortCode] = useState<string | null>(null);

  // Agent details modal state
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [agentDetails, setAgentDetails] = useState<any[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (selectedState) params.append('state', selectedState);
      if (selectedLGA) params.append('lga', selectedLGA);
      if (selectedSupportGroup) params.append('supportGroup', selectedSupportGroup);

      const response = await axios.get(
        `${API_URL}/auth/onboarding/stats?${params.toString()}`,
        {
          withCredentials: true
        }
      );

      setStats(response.data.data);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch onboarding statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedState, selectedLGA, selectedSupportGroup]);

  const fetchAgentDetails = async (location: any) => {
    setIsLoadingAgents(true);
    setShowAgentModal(true);
    setSelectedLocation(location);

    try {
      // Only include non-empty parameters
      const params = new URLSearchParams();
      if (location.votingState) params.append('votingState', location.votingState);
      if (location.votingLGA) params.append('votingLGA', location.votingLGA);
      if (location.votingWard) params.append('votingWard', location.votingWard);
      if (location.votingPU) params.append('votingPU', location.votingPU);

      console.log('Fetching agents for location:', location);
      console.log('Query params:', params.toString());

      const response = await axios.get(
        `${API_URL}/auth/onboarding/agents?${params.toString()}`,
        { withCredentials: true }
      );

      console.log('Agent response:', response.data);
      setAgentDetails(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching agent details:', err);
      console.error('Error response:', err.response?.data);
      setAgentDetails([]);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleExport = () => {
    if (!stats) return;

    const csvContent = [
      ['State', 'LGA', 'Ward', 'Polling Unit', 'Agents', 'Support Groups'].join(','),
      ...stats.coverage.map(item =>
        [
          item.votingState,
          item.votingLGA,
          item.votingWard,
          item.votingPU,
          item.agent_count,
          (item.support_groups ?? []).filter(Boolean).join('; ')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleCreateToken = async () => {
    setIsCreatingToken(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/onboarding/tokens/create`,
        {
          designation: tokenDesignation,
          expiresIn: tokenExpiry,
          notes: tokenNotes || undefined,
        },
        {
          withCredentials: true
        }
      );

      setCreatedToken(response.data.data);

      // Refresh stats to show new token
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create onboarding token');
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
    setCreatedToken(null);
    setTokenNotes('');
    setTokenDesignation('Polling Unit Agent');
    setTokenExpiry('90d');
  };

  const completedPUAgents = stats ? toNumber(stats.overview.completed_pu_agents) : 0;
  const totalPUAgents = stats ? toNumber(stats.overview.pu_agents) : 0;
  const pendingPUAgents = stats
    ? Math.max(toNumber(stats.overview.pending_pu_agents), totalPUAgents - completedPUAgents)
    : 0;
  const totalOnboarded = stats ? toNumber(stats.overview.total_onboarded) : 0;
  const uniqueSupportGroups = stats ? toNumber(stats.overview.unique_support_groups) : 0;
  const activeUsers = stats ? toNumber(stats.overview.active_users) : 0;

  const coverageRows = stats?.coverage ?? [];

  // Build hierarchical data structure (memoized for performance)
  const hierarchicalData = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    // Filter first
    const filtered = coverageRows.filter((item) => {
      if (!normalizedSearch) return true;
      const state = (item.votingState || '').toLowerCase();
      const lga = (item.votingLGA || '').toLowerCase();
      const ward = (item.votingWard || '').toLowerCase();
      const pu = (item.votingPU || '').toLowerCase();
      return state.includes(normalizedSearch) ||
        lga.includes(normalizedSearch) ||
        ward.includes(normalizedSearch) ||
        pu.includes(normalizedSearch);
    });

    // Group by State -> LGA -> Ward -> PU
    const stateMap = new Map<string, {
      name: string;
      totalAgents: number;
      totalGroups: number;
      lgas: Map<string, {
        name: string;
        totalAgents: number;
        totalGroups: number;
        wards: Map<string, {
          name: string;
          totalAgents: number;
          totalGroups: number;
          pollingUnits: Array<typeof filtered[0]>;
        }>;
      }>;
    }>();

    filtered.forEach(item => {
      const stateName = item.votingState || 'Unknown State';
      const lgaName = item.votingLGA || 'Unknown LGA';
      const wardName = item.votingWard || 'Unknown Ward';

      // Get or create state
      if (!stateMap.has(stateName)) {
        stateMap.set(stateName, {
          name: stateName,
          totalAgents: 0,
          totalGroups: 0,
          lgas: new Map()
        });
      }
      const state = stateMap.get(stateName)!;
      state.totalAgents += toNumber(item.agent_count);
      state.totalGroups += toNumber(item.support_group_count);

      // Get or create LGA
      if (!state.lgas.has(lgaName)) {
        state.lgas.set(lgaName, {
          name: lgaName,
          totalAgents: 0,
          totalGroups: 0,
          wards: new Map()
        });
      }
      const lga = state.lgas.get(lgaName)!;
      lga.totalAgents += toNumber(item.agent_count);
      lga.totalGroups += toNumber(item.support_group_count);

      // Get or create Ward
      if (!lga.wards.has(wardName)) {
        lga.wards.set(wardName, {
          name: wardName,
          totalAgents: 0,
          totalGroups: 0,
          pollingUnits: []
        });
      }
      const ward = lga.wards.get(wardName)!;
      ward.totalAgents += toNumber(item.agent_count);
      ward.totalGroups += toNumber(item.support_group_count);
      ward.pollingUnits.push(item);
    });

    return stateMap;
  }, [coverageRows, searchQuery]);

  const totalCoverageAgents = useMemo(() => {
    let total = 0;
    hierarchicalData.forEach(state => {
      total += state.totalAgents;
    });
    return total;
  }, [hierarchicalData]);

  const toggleState = (stateName: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateName)) {
      newExpanded.delete(stateName);
      // Also collapse all LGAs in this state
      const state = hierarchicalData.get(stateName);
      if (state) {
        state.lgas.forEach((_, lgaName) => {
          expandedLGAs.delete(`${stateName}::${lgaName}`);
          // Also collapse all wards
          const lga = state.lgas.get(lgaName);
          if (lga) {
            lga.wards.forEach((_, wardName) => {
              expandedWards.delete(`${stateName}::${lgaName}::${wardName}`);
            });
          }
        });
      }
    } else {
      newExpanded.add(stateName);
    }
    setExpandedStates(newExpanded);
  };

  const toggleLGA = (stateName: string, lgaName: string) => {
    const key = `${stateName}:${lgaName}`;
    const newExpanded = new Set(expandedLGAs);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
      // Also collapse all wards in this LGA
      const state = hierarchicalData.get(stateName);
      if (state) {
        const lga = state.lgas.get(lgaName);
        if (lga) {
          lga.wards.forEach((_, wardName) => {
            expandedWards.delete(`${stateName}:${lgaName}:${wardName}`);
          });
        }
      }
    } else {
      newExpanded.add(key);
    }
    setExpandedLGAs(newExpanded);
  };

  const toggleWard = (stateName: string, lgaName: string, wardName: string) => {
    const key = `${stateName}:${lgaName}:${wardName}`;
    const newExpanded = new Set(expandedWards);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedWards(newExpanded);
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track agent registration and coverage across states
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTokenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        Last updated: {lastRefresh.toLocaleString()}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Fully Onboarded PU Agents</h3>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(completedPUAgents)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatNumber(totalPUAgents)} total PU agents
              {pendingPUAgents > 0 && ` · ${formatNumber(pendingPUAgents)} pending setup`}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">All Onboarded Accounts</h3>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(totalOnboarded)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Includes coordinators and polling unit agents
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Support Groups</h3>
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(uniqueSupportGroups)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(activeUsers)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedLGA('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All States</option>
              <option value="ANAMBRA">ANAMBRA</option>
              {/* Add more states as needed */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
            <input
              type="text"
              value={selectedLGA}
              onChange={(e) => setSelectedLGA(e.target.value)}
              placeholder="Enter LGA name"
              disabled={!selectedState}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Group</label>
            <input
              type="text"
              value={selectedSupportGroup}
              onChange={(e) => setSelectedSupportGroup(e.target.value)}
              placeholder="Enter support group"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Coverage Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Polling Unit Coverage
            </h2>
            <span className="text-sm text-gray-500">
              • Agents: {formatNumber(totalCoverageAgents)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state, LGA, ward, or PU..."
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hierarchical View */}
        <div className="space-y-2">
          {hierarchicalData.size === 0 ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <MapPin className="w-12 h-12 text-gray-300" />
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No locations found matching your search' : 'No coverage data available'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          ) : (
            Array.from(hierarchicalData.entries()).map(([stateName, stateData]) => {
              const isStateExpanded = expandedStates.has(stateName);

              return (
                <div key={stateName} className="border rounded-lg overflow-hidden">
                  {/* State Level */}
                  <div
                    onClick={() => toggleState(stateName)}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isStateExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="font-semibold text-gray-900">{stateName}</span>
                      <span className="text-sm text-gray-500">
                        ({stateData.lgas.size} LGA{stateData.lgas.size !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Agents: </span>
                        <span className="font-semibold text-gray-900">{formatNumber(stateData.totalAgents)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Groups: </span>
                        <span className="font-semibold text-gray-900">{formatNumber(stateData.totalGroups)}</span>
                      </div>
                    </div>
                  </div>

                  {/* LGA Level */}
                  {isStateExpanded && (
                    <div className="bg-white">
                      {Array.from(stateData.lgas.entries()).map(([lgaName, lgaData]) => {
                        const lgaKey = `${stateName}:${lgaName}`;
                        const isLGAExpanded = expandedLGAs.has(lgaKey);

                        return (
                          <div key={lgaKey} className="border-t">
                            <div
                              onClick={() => toggleLGA(stateName, lgaName)}
                              className="flex items-center justify-between p-3 pl-12 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {isLGAExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="font-medium text-gray-900">{lgaName}</span>
                                <span className="text-xs text-gray-500">
                                  ({lgaData.wards.size} Ward{lgaData.wards.size !== 1 ? 's' : ''})
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-sm">
                                  <span className="text-gray-600">Agents: </span>
                                  <span className="font-medium text-gray-900">{formatNumber(lgaData.totalAgents)}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-600">Groups: </span>
                                  <span className="font-medium text-gray-900">{formatNumber(lgaData.totalGroups)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Ward Level */}
                            {isLGAExpanded && (
                              <div className="bg-gray-50">
                                {Array.from(lgaData.wards.entries()).map(([wardName, wardData]) => {
                                  const wardKey = `${stateName}:${lgaName}:${wardName}`;
                                  const isWardExpanded = expandedWards.has(wardKey);

                                  return (
                                    <div key={wardKey} className="border-t border-gray-200">
                                      <div
                                        onClick={() => toggleWard(stateName, lgaName, wardName)}
                                        className="flex items-center justify-between p-3 pl-20 hover:bg-gray-100 cursor-pointer transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          {isWardExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                          ) : (
                                            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                                          )}
                                          <span className="text-sm font-medium text-gray-900">{wardName}</span>
                                          <span className="text-xs text-gray-500">
                                            ({wardData.pollingUnits.length} PU{wardData.pollingUnits.length !== 1 ? 's' : ''})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="text-sm">
                                            <span className="text-gray-600">Agents: </span>
                                            <span className="font-medium text-gray-900">{formatNumber(wardData.totalAgents)}</span>
                                          </div>
                                          <div className="text-sm">
                                            <span className="text-gray-600">Groups: </span>
                                            <span className="font-medium text-gray-900">{formatNumber(wardData.totalGroups)}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Polling Unit Level */}
                                      {isWardExpanded && (
                                        <div className="bg-white">
                                          {wardData.pollingUnits.map((pu, index) => {
                                            const agentCount = toNumber(pu.agent_count);
                                            const badgeClass = agentCount >= 8
                                              ? 'bg-green-100 text-green-800'
                                              : agentCount >= 4
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800';
                                            const supportGroups = (pu.support_groups ?? []).filter(Boolean);

                                            return (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between p-3 pl-28 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                              >
                                                <div className="flex items-center gap-3 flex-1">
                                                  <MapPin className="w-4 h-4 text-gray-400" />
                                                  <span className="text-sm text-gray-900">{pu.votingPU}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                                                    {formatNumber(agentCount)} agent{agentCount !== 1 ? 's' : ''}
                                                  </div>
                                                  <div className="text-xs text-gray-500 w-32">
                                                    {supportGroups.length > 0 ? supportGroups.join(', ') : '—'}
                                                  </div>
                                                  <button
                                                    onClick={() => fetchAgentDetails(pu)}
                                                    disabled={agentCount === 0}
                                                    className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                  >
                                                    View
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Tokens */}
      {stats && stats.activeTokens.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Onboarding Links</h2>
          <div className="space-y-3">
            {stats.activeTokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{token.designation}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Used: {token.current_uses} {token.max_uses ? `/ ${token.max_uses}` : '(unlimited)'}
                  </p>
                  {token.notes && (
                    <p className="text-xs text-gray-500 mt-1">{token.notes}</p>
                  )}
                  {token.short_code && (
                    <div className="mt-2">
                      <p className="text-xs uppercase tracking-wide text-gray-400">Short Code</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-semibold text-lg text-gray-900">
                          {token.short_code}
                        </span>
                        <button
                          onClick={() => {
                            const shortLink = token.short_url || `${window.location.origin}/join/${token.short_code}`;
                            navigator.clipboard.writeText(shortLink);
                            setCopiedShortCode(token.short_code);
                            setTimeout(() => setCopiedShortCode(null), 2000);
                          }}
                          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedShortCode === token.short_code ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(token.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!createdToken ? (
              // Token Creation Form
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Onboarding Link</h2>
                <p className="text-gray-600 mb-6">
                  Generate a unique link for agents to complete their registration
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tokenDesignation}
                      onChange={(e) => setTokenDesignation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Polling Unit Agent">Polling Unit Agent</option>
                      <option value="Ward Coordinator">Ward Coordinator</option>
                      <option value="LGA Coordinator">LGA Coordinator</option>
                      <option value="State Coordinator">State Coordinator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Expiry
                    </label>
                    <select
                      value={tokenExpiry}
                      onChange={(e) => setTokenExpiry(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                      <option value="90d">90 days (Recommended)</option>
                      <option value="180d">180 days</option>
                      <option value="365d">1 year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={tokenNotes}
                      onChange={(e) => setTokenNotes(e.target.value)}
                      placeholder="E.g., Anambra recruitment - Phase 1"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={handleCloseTokenModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateToken}
                    disabled={isCreatingToken}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreatingToken ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Create Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Token Created Success
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Created! 🎉</h2>
                  <p className="text-gray-600">
                    Share this code with {createdToken.designation}s
                  </p>
                </div>

                {/* SHORT CODE - PROMINENT DISPLAY */}
                {createdToken.short_code && (
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 mb-6 text-center">
                    <p className="text-white text-sm font-medium mb-2">📞 EASY SHARING CODE</p>
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="text-4xl font-bold text-gray-900 tracking-wider font-mono">
                        {createdToken.short_code}
                      </p>
                    </div>
                    <p className="text-white text-sm mb-3">
                      Tell people to visit: <span className="font-semibold">{createdToken.shortUrl || `${window.location.origin}/join/${createdToken.short_code}`}</span>
                    </p>
                    <button
                      onClick={() => {
                        const shortLink = createdToken.shortUrl || `${window.location.origin}/join/${createdToken.short_code}`;
                        navigator.clipboard.writeText(shortLink);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-sm flex items-center gap-2 mx-auto"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedToken ? 'Copied!' : 'Copy Short Link'}
                    </button>
                  </div>
                )}

                {/* FULL URL - Secondary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Full Onboarding URL (Advanced):</label>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdToken.url);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedToken ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-600">Show full URL</summary>
                    <div className="bg-white border border-gray-200 rounded p-3 font-mono text-xs text-gray-800 break-all mt-2">
                      {createdToken.url}
                    </div>
                  </details>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Designation</p>
                    <p className="font-medium text-gray-900">{createdToken.designation}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Expires</p>
                    <p className="font-medium text-gray-900">
                      {new Date(createdToken.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Usage</p>
                    <p className="font-medium text-gray-900">
                      {createdToken.current_uses} / {createdToken.max_uses || '∞'}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>

                {createdToken.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                    <p className="text-sm text-blue-800">{createdToken.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseTokenModal}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  <a
                    href={`/join/${createdToken.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Test Link
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Details Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Agent Details
                </h2>
                {selectedLocation && (
                  <p className="text-purple-100 text-sm mt-1">
                    {[selectedLocation.votingState, selectedLocation.votingLGA, selectedLocation.votingWard, selectedLocation.votingPU]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAgentModal(false);
                  setSelectedLocation(null);
                  setAgentDetails([]);
                }}
                className="text-white hover:bg-purple-800 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {isLoadingAgents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading agent details...</p>
                  </div>
                </div>
              ) : agentDetails.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No agents found for this location</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agentDetails.map((agent: any) => (
                    <div
                      key={agent.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Agent Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {agent.profileImage ? (
                          <img
                            src={agent.profileImage}
                            alt={agent.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {agent.name || 'N/A'}
                          </h3>
                          {agent.designation && (
                            <p className="text-sm text-purple-600 font-medium">
                              {agent.designation}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Agent Details */}
                      <div className="space-y-3">
                        {agent.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a
                              href={`tel:${agent.phone}`}
                              className="text-gray-700 hover:text-purple-600 transition truncate"
                            >
                              {agent.phone}
                            </a>
                          </div>
                        )}

                        {agent.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a
                              href={`mailto:${agent.email}`}
                              className="text-gray-700 hover:text-purple-600 transition truncate"
                            >
                              {agent.email}
                            </a>
                          </div>
                        )}

                        {agent.support_group && (
                          <div className="flex items-start gap-3 text-sm">
                            <Users className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-1">Support Group</p>
                              <p className="font-medium text-gray-900">{agent.support_group}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agent Count Summary */}
              {!isLoadingAgents && agentDetails.length > 0 && (
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">{agentDetails.length}</span> agent{agentDetails.length !== 1 ? 's' : ''} found at this location
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingDashboard;
