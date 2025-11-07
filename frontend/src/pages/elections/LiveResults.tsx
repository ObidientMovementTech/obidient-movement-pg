import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, CheckCircle, Clock, MapPin, Award, BarChart3, Eye, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Toast from '../../components/Toast';

interface PartyResult {
  party: string;
  totalVotes: number;
  percentage: string;
  pollingUnitsReported: number;
  color?: string; // Add color field
}

interface ElectionStatistics {
  totalRegisteredVoters: number;
  totalAccreditedVoters: number;
  totalValidVotes: number;
  totalRejectedVotes: number;
  totalVotesCast: number;
  voterTurnout: number;
}

interface SubmissionProgress {
  totalPollingUnits: number;
  submittedPollingUnits: number;
  pendingPollingUnits: number;
  completionPercentage: number;
}

interface Election {
  id: number;
  electionId: string;
  name: string;
  type: string;
  state: string;
  lga: string | null;
  date: string;
  status: string;
}

interface LiveElectionResult {
  election: Election;
  results: {
    electionId: string;
    totalSubmissions: number;
    statistics: ElectionStatistics;
    partyResults: PartyResult[];
    leadingParty: PartyResult | null;
    lastUpdated: string;
  };
  progress: SubmissionProgress;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function LiveResultsPage() {
  const [liveResults, setLiveResults] = useState<LiveElectionResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LiveElectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedElections, setExpandedElections] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [newDataAvailable, setNewDataAvailable] = useState(false);

  const fetchLiveResults = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setRefreshing(true);
      }

      const response = await fetch(`${API_BASE}/election-results/live`);
      const data = await response.json();

      if (data.success) {
        setLiveResults(data.data);
        setLastUpdated(new Date());

        if (isAutoRefresh && data.data.length !== liveResults.length) {
          setNewDataAvailable(true);
          setTimeout(() => setNewDataAvailable(false), 3000);
        }

        if (!isAutoRefresh) {
          setToast({ message: 'Results updated successfully', type: 'success' });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch live results');
      }
    } catch (error: any) {
      console.error('Error fetching live results:', error);
      setToast({
        message: error.message || 'Failed to load live results',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveResults();
  }, []);

  // Filter results when filters change
  useEffect(() => {
    let filtered = [...liveResults];

    if (filterState !== 'all') {
      filtered = filtered.filter(result => result.election.state === filterState);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(result => result.election.type === filterType);
    }

    setFilteredResults(filtered);
  }, [liveResults, filterState, filterType]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLiveResults(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const toggleElection = (electionId: string) => {
    const newExpanded = new Set(expandedElections);
    if (newExpanded.has(electionId)) {
      newExpanded.delete(electionId);
    } else {
      newExpanded.add(electionId);
    }
    setExpandedElections(newExpanded);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  const getUniqueStates = () => {
    const states = new Set(liveResults.map(r => r.election.state));
    return Array.from(states).sort();
  };

  const getUniqueTypes = () => {
    const types = new Set(liveResults.map(r => r.election.type));
    return Array.from(types).sort();
  };

  const clearFilters = () => {
    setFilterState('all');
    setFilterType('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading live results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-2 sm:py-6 sm:px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <div className="bg-white border-b-4 border-green-600 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Live Election Results</h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Real-time updates from polling units across Nigeria</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {newDataAvailable && (
                <div className="hidden sm:flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg animate-pulse">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-medium">New data</span>
                </div>
              )}
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchLiveResults(false)}
                disabled={refreshing}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline font-medium">Refresh</span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-xs sm:text-sm text-gray-700">Auto-refresh every 30 seconds</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors flex-1 sm:flex-initial"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(filterState !== 'all' || filterType !== 'all') && (
                  <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[filterState !== 'all' ? 1 : 0, filterType !== 'all' ? 1 : 0].reduce((a, b) => a + b)}
                  </span>
                )}
              </button>
              {(filterState !== 'all' || filterType !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All States</option>
                    {getUniqueStates().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Election Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Types</option>
                    {getUniqueTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Elections Grid */}
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              {liveResults.length === 0 ? 'No Active Elections' : 'No Results Match Filters'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {liveResults.length === 0
                ? 'There are currently no active elections with results to display.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {liveResults.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredResults.map((electionData) => {
            // Safety check for data structure
            if (!electionData?.election || !electionData?.results) {
              return null;
            }

            const isExpanded = expandedElections.has(electionData.election.electionId);
            const chartData = electionData.results.partyResults?.map(party => ({
              name: party.party,
              votes: party.totalVotes,
              percentage: parseFloat(party.percentage),
              color: party.color || '#6B7280'
            })) || [];

            return (
              <div key={electionData.election.electionId} className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Election Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-6 border-b-4 border-green-600">
                  <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words">{electionData.election.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{electionData.election.state}</span>
                          {electionData.election.lga && <span className="hidden sm:inline">• {electionData.election.lga}</span>}
                        </span>
                        <span className="hidden sm:inline">
                          {new Date(electionData.election.date).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold uppercase shadow-md">
                          {electionData.election.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-xs text-gray-400">Submissions</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-400">{electionData.results.totalSubmissions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Leading Party with Medal */}
                {electionData.results.leadingParty && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 p-4 sm:p-5 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-green-600 animate-pulse" />
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Currently Leading</h3>
                      <span className="text-2xl ml-auto">🥇</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {electionData.results.leadingParty.party}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {electionData.results.leadingParty.pollingUnitsReported} polling units
                        </p>
                      </div>
                      <div className="text-right bg-white rounded-lg p-3 shadow-md">
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">
                          {formatNumber(electionData.results.leadingParty.totalVotes)}
                        </p>
                        <p className="text-lg sm:text-xl font-semibold text-gray-700">
                          {electionData.results.leadingParty.percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Animated Bar Chart */}
                {chartData.length > 0 && (
                  <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Vote Distribution
                    </h3>
                    <div className="w-full h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '2px solid #10b981',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value: any) => [formatNumber(value), 'Votes']}
                            labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                          />
                          <Bar
                            dataKey="votes"
                            radius={[8, 8, 0, 0]}
                            animationDuration={1000}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Expandable Detailed Results */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleElection(electionData.election.electionId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {isExpanded ? 'Hide' : 'Show'} Detailed Results
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-gray-50">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        All Party Results
                      </h3>
                      {electionData.results.partyResults && electionData.results.partyResults.length > 0 ? (
                        <div className="space-y-3">
                          {electionData.results.partyResults.map((party, index) => (
                            <div
                              key={party.party}
                              className="border-2 rounded-lg p-3 sm:p-4 bg-white hover:shadow-md transition-all"
                              style={{ borderColor: party.color || '#d1d5db' }}
                            >
                              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="flex items-center gap-2">
                                    {getMedalIcon(index) && (
                                      <span className="text-xl sm:text-2xl">{getMedalIcon(index)}</span>
                                    )}
                                    <div
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-md"
                                      style={{ backgroundColor: party.color || '#6B7280' }}
                                    >
                                      #{index + 1}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm sm:text-base text-gray-900">{party.party}</p>
                                    <p className="text-xs text-gray-600">
                                      {party.pollingUnitsReported} polling units
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(party.totalVotes)}</p>
                                  <p className="text-sm font-semibold" style={{ color: party.color || '#6B7280' }}>
                                    {party.percentage}%
                                  </p>
                                </div>
                              </div>
                              {/* Color-coded Progress bar */}
                              <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${party.percentage}%`,
                                    backgroundColor: party.color || '#6B7280'
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-sm">No results submitted yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* View Details Button & Footer */}
                <div className="p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Last update: {electionData.results.lastUpdated ? new Date(electionData.results.lastUpdated).toLocaleString() : 'No submissions yet'}
                  </p>
                  <button
                    onClick={() => window.open('/admin/results-dashboard', '_blank')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Full Dashboard</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
