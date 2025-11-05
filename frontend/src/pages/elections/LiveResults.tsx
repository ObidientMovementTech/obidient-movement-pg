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
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white border-b-4 border-green-600 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Live Election Results</h1>
              <p className="text-gray-600">Real-time updates from polling units</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchLiveResults(false)}
                disabled={refreshing}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-refresh every 30 seconds</span>
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
              <div key={electionData.election.electionId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Election Header */}
                <div className="bg-gray-900 text-white p-5 border-b-2 border-green-600">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{electionData.election.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {electionData.election.state}
                          {electionData.election.lga && ` • ${electionData.election.lga}`}
                        </span>
                        <span>
                          {new Date(electionData.election.date).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold uppercase">
                          {electionData.election.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Total Submissions</p>
                      <p className="text-3xl font-bold">{electionData.results.totalSubmissions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {electionData.progress && (
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Polling Units Reporting</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {electionData.progress.submittedPollingUnits || 0} / {electionData.progress.totalPollingUnits || 0}
                        <span className="text-gray-500 ml-2">
                          ({(electionData.progress.completionPercentage || 0).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${electionData.progress.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Statistics Grid */}
                {electionData.results.statistics && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-white border-b border-gray-200">
                    <div className="text-center p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Registered</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatNumber(electionData.results.statistics.totalRegisteredVoters || 0)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Accredited</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatNumber(electionData.results.statistics.totalAccreditedVoters || 0)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Votes Cast</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatNumber(electionData.results.statistics.totalVotesCast || 0)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Valid</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatNumber(electionData.results.statistics.totalValidVotes || 0)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Turnout</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(electionData.results.statistics.voterTurnout || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Leading Party */}
                {electionData.results.leadingParty && (
                  <div className="bg-green-50 border-l-4 border-green-600 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <h3 className="text-base font-semibold text-gray-900">Currently Leading</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {electionData.results.leadingParty.party}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {electionData.results.leadingParty.pollingUnitsReported} polling units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          {formatNumber(electionData.results.leadingParty.totalVotes)}
                        </p>
                        <p className="text-xl font-semibold text-gray-700">
                          {electionData.results.leadingParty.percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Party Results */}
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Results
                  </h3>
                  {electionData.results.partyResults && electionData.results.partyResults.length > 0 ? (
                    <div className="space-y-3">
                      {electionData.results.partyResults.map((party, index) => (
                        <div
                          key={party.party}
                          className="border-2 rounded-lg p-4 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-bold text-base text-gray-900">{party.party}</p>
                                <p className="text-xs text-gray-600">
                                  {party.pollingUnitsReported} PUs
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">{formatNumber(party.totalVotes)}</p>
                              <p className="text-sm font-semibold text-gray-600">{party.percentage}%</p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-gray-700 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${party.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm">No results submitted yet. Awaiting polling unit submissions...</p>
                    </div>
                  )}
                </div>

                {/* Last Updated */}
                <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                    Last submission: {electionData.results.lastUpdated ? new Date(electionData.results.lastUpdated).toLocaleString() : 'No submissions yet'}
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
