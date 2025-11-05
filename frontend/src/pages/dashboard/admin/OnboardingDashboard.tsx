import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, TrendingUp, MapPin, RefreshCw, Download,
  Calendar, Award, Building2, Loader2, Filter, Search,
  Plus, Link2, Copy, CheckCircle2, ExternalLink
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
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredCoverage = coverageRows.filter((item) => {
    if (!normalizedSearch) return true;
    const ward = (item.votingWard || '').toLowerCase();
    const pu = (item.votingPU || '').toLowerCase();
    const lgaValue = (item.votingLGA || '').toLowerCase();
    return pu.includes(normalizedSearch) || ward.includes(normalizedSearch) || lgaValue.includes(normalizedSearch);
  });
  const totalCoverageAgents = filteredCoverage.reduce((sum, item) => sum + toNumber(item.agent_count), 0);

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
      {filteredCoverage.length === 0 && (
        <tr>
          <td colSpan={7} className="py-6 text-center text-sm text-gray-500">
            No polling unit agents match the current filters.
          </td>
        </tr>
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
              Polling Unit Coverage ({filteredCoverage.length})
            </h2>
            {filteredCoverage.length > 0 && (
              <span className="text-sm text-gray-500">
                • Agents: {formatNumber(totalCoverageAgents)}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polling units..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">State</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">LGA</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ward</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Polling Unit</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Agents</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Groups</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Support Groups</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoverage.slice(0, 100).map((item, index) => {
                const agentCount = toNumber(item.agent_count);
                const badgeClass = agentCount >= 8
                  ? 'bg-green-100 text-green-800'
                  : agentCount >= 4
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800';
                const supportGroups = (item.support_groups ?? []).filter(Boolean);

                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{item.votingState}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.votingLGA}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.votingWard}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.votingPU}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                        {formatNumber(agentCount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {formatNumber(item.support_group_count)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {supportGroups.length > 0 ? supportGroups.join(', ') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCoverage.length > 100 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Showing first 100 of {filteredCoverage.length} polling units
            </p>
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
    </div>
  );
};

export default OnboardingDashboard;
