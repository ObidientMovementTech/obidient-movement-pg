import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, CheckCircle, Clock, MapPin, Award } from 'lucide-react';
import Toast from '../../components/Toast';

interface PartyResult {
  party: string;
  totalVotes: number;
  percentage: string;
  pollingUnitsReported: number;
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  const getPartyColor = (index: number) => {
    const colors = [
      'bg-green-100 text-green-800 border-green-300',
      'bg-blue-100 text-blue-800 border-blue-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-orange-100 text-orange-800 border-orange-300',
      'bg-red-100 text-red-800 border-red-300',
      'bg-gray-100 text-gray-800 border-gray-300'
    ];
    return colors[index % colors.length];
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-8 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Live Election Results</h1>
              <p className="text-lg opacity-90">Real-time updates from polling units across Nigeria</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="text-xs opacity-75">Last Updated</p>
                    <p className="font-semibold">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchLiveResults(false)}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <div className="mt-4 flex items-center gap-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-white/50"
              />
              <span className="ml-2 text-sm">Auto-refresh every 30 seconds</span>
            </label>
          </div>
        </div>
      </div>

      {/* Elections Grid */}
      <div className="max-w-7xl mx-auto space-y-8">
        {liveResults.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Elections</h3>
            <p className="text-gray-600">There are currently no active elections with results to display.</p>
          </div>
        ) : (
          liveResults.map((electionData) => {
            // Safety check for data structure
            if (!electionData?.election || !electionData?.results) {
              return null;
            }

            return (
              <div key={electionData.election.electionId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Election Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{electionData.election.name}</h2>
                      <div className="flex items-center gap-4 text-sm opacity-90">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {electionData.election.state}
                          {electionData.election.lga && ` • ${electionData.election.lga}`}
                        </span>
                        <span>
                          {new Date(electionData.election.date).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-green-500 rounded-full text-xs font-semibold">
                          {electionData.election.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-75">Total Submissions</p>
                      <p className="text-3xl font-bold">{electionData.results.totalSubmissions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {electionData.progress && (
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Polling Units Reporting</span>
                      <span className="text-sm font-bold text-gray-900">
                        {electionData.progress.submittedPollingUnits || 0} / {electionData.progress.totalPollingUnits || 0}
                        <span className="text-gray-500 ml-2">
                          ({(electionData.progress.completionPercentage || 0).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${electionData.progress.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Statistics Grid */}
                {electionData.results.statistics && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 border-b">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Registered Voters</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(electionData.results.statistics.totalRegisteredVoters || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Accredited</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(electionData.results.statistics.totalAccreditedVoters || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Votes Cast</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(electionData.results.statistics.totalVotesCast || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Valid Votes</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatNumber(electionData.results.statistics.totalValidVotes || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Turnout</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(electionData.results.statistics.voterTurnout || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Leading Party */}
                {electionData.results.leadingParty && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Currently Leading</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {electionData.results.leadingParty.party}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {electionData.results.leadingParty.pollingUnitsReported} polling units reported
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-green-600">
                          {formatNumber(electionData.results.leadingParty.totalVotes)}
                        </p>
                        <p className="text-2xl font-semibold text-gray-700">
                          {electionData.results.leadingParty.percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Party Results */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Party/Candidate Results
                  </h3>
                  {electionData.results.partyResults && electionData.results.partyResults.length > 0 ? (
                    <div className="space-y-3">
                      {electionData.results.partyResults.map((party, index) => (
                        <div
                          key={party.party}
                          className={`relative border-2 rounded-lg p-4 ${getPartyColor(index)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-gray-700">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold text-lg">{party.party}</p>
                                <p className="text-xs opacity-75">
                                  {party.pollingUnitsReported} PUs reported
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{formatNumber(party.totalVotes)}</p>
                              <p className="text-sm font-semibold">{party.percentage}%</p>
                            </div>
                          </div>
                          {/* Progress bar for this party */}
                          <div className="w-full bg-white/50 rounded-full h-2">
                            <div
                              className="bg-current h-2 rounded-full transition-all duration-500"
                              style={{ width: `${party.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No results submitted yet. Waiting for polling unit submissions...</p>
                    </div>
                  )}
                </div>

                {/* Last Updated */}
                <div className="bg-gray-50 px-6 py-3 text-center border-t">
                  <p className="text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Last result submission: {electionData.results.lastUpdated ? new Date(electionData.results.lastUpdated).toLocaleString() : 'No submissions yet'}
                  </p>
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
