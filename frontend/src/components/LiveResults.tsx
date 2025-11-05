/**
 * Live Results Display Component
 * Real-time election results with auto-refresh and ETag caching
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface PartyResult {
  partyCode: string;
  partyName: string;
  displayName: string | null;
  color: string | null;
  displayOrder: number | null;
  totalVotes: number;
  percentage: string;
  pollingUnitsReported: number;
}

interface LiveResultsSummary {
  election: {
    electionId: string;
    electionName: string;
    electionType: string;
    state: string | null;
    lga: string | null;
    electionDate: string;
    status: string;
  };
  summary: {
    pollingUnitsReported: number;
    totalRegisteredVoters: number;
    totalAccreditedVoters: number;
    totalValidVotes: number;
    totalRejectedVotes: number;
    totalVotesCast: number;
    voterTurnout: string;
  };
  parties: PartyResult[];
  lastUpdated: string;
  submissionsCount: number;
}

interface LiveResultsProps {
  electionId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export default function LiveResults({
  electionId,
  autoRefresh = true,
  refreshInterval = 60000 // 60 seconds
}: LiveResultsProps) {
  const [results, setResults] = useState<LiveResultsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const etagRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchResults();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchResults, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [electionId, autoRefresh, refreshInterval]);

  const fetchResults = async (manual = false) => {
    if (manual) {
      setIsRefreshing(true);
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };

      // Add ETag for conditional requests
      if (etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }

      const response = await axios.get(
        `${API_BASE}/api/live-results/elections/${electionId}/live-summary`,
        { headers }
      );

      // 304 Not Modified - data hasn't changed
      if (response.status === 304) {
        setLastFetchTime(new Date());
        return;
      }

      // Store new ETag
      const newEtag = response.headers['etag'];
      if (newEtag) {
        etagRef.current = newEtag;
      }

      if (response.data.success) {
        setResults(response.data.data);
        setError(null);
        setLastFetchTime(new Date());
      }
    } catch (err: any) {
      console.error('Error fetching live results:', err);
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
      if (manual) {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchResults(true);
  };

  if (loading && !results) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 animate-spin text-[#8cc63f]" />
        <span className="ml-3 text-gray-600">Loading results...</span>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold">Failed to load results</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#006837] to-[#8cc63f] rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{results.election.electionName}</h2>
            <p className="text-sm opacity-90">
              {results.election.electionType.toUpperCase()}
              {results.election.state && ` • ${results.election.state}`}
              {results.election.lga && ` • ${results.election.lga}`}
            </p>
            <p className="text-xs opacity-75 mt-1">
              Election Date: {format(new Date(results.election.electionDate), 'MMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh results"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
          <Clock className="w-4 h-4" />
          <span>
            Last updated: {format(new Date(results.lastUpdated), 'HH:mm:ss')}
            {lastFetchTime && ` (fetched ${format(lastFetchTime, 'HH:mm:ss')})`}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">PUs Reported</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {results.summary.pollingUnitsReported.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {results.submissionsCount} submissions
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Voter Turnout</span>
          </div>
          <p className="text-2xl font-bold text-[#006837]">
            {results.summary.voterTurnout}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {results.summary.totalVotesCast.toLocaleString()} votes cast
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Valid Votes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {results.summary.totalValidVotes.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {results.summary.totalRejectedVotes.toLocaleString()} rejected
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Registered</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {results.summary.totalRegisteredVoters.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {results.summary.totalAccreditedVoters.toLocaleString()} accredited
          </p>
        </div>
      </div>

      {/* Party Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#8cc63f]" />
          Party Results
        </h3>

        <div className="space-y-3">
          {results.parties.map((party, index) => (
            <div
              key={party.partyCode}
              className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{
                borderColor: party.color || '#e5e7eb',
                borderLeftWidth: party.color ? '6px' : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                      LEADING
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className="font-bold text-lg"
                        style={{ color: party.color || '#000' }}
                      >
                        {party.displayName || party.partyName}
                      </h4>
                      {party.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: party.color }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{party.partyCode}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {party.totalVotes.toLocaleString()}
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: party.color || '#6b7280' }}
                  >
                    {party.percentage}%
                  </p>
                </div>
              </div>

              {/* Vote Percentage Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${party.percentage}%`,
                      backgroundColor: party.color || '#8cc63f'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <strong>Note:</strong> Results are automatically updated every 60 seconds.
          This is preliminary data from polling unit monitors and should not be considered official until certified by INEC.
        </p>
      </div>
    </div>
  );
}
