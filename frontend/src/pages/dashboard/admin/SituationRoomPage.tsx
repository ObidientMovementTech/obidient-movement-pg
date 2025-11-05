import { useState, useEffect } from 'react';
import {
  MapPin, Activity, AlertTriangle, Users, Clock,
  CheckCircle, RefreshCw, TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ActivePollingUnit {
  submission_id: string;
  user_id: string;
  polling_unit_code: string;
  pu_name: string;
  gps_coordinates: string;
  location_type: string;
  state: string;
  lga: string;
  ward: string;
  created_at: string;
  agent_name: string;
  agent_phone: string;
  designation: string;
}

interface Incident {
  submission_id: string;
  polling_unit_code: string;
  description: string;
  severity: string;
  resolved: string;
  state: string;
  lga: string;
  ward: string;
  created_at: string;
  reporter_name: string;
}

interface TimelineItem {
  submission_id: string;
  submission_type: string;
  polling_unit_code: string;
  state: string;
  lga: string;
  ward: string;
  created_at: string;
  agent_name: string;
}

interface SubmissionStat {
  submission_type: string;
  total: number;
  unique_agents: number;
  unique_units: number;
}

export default function SituationRoomPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeUnits, setActiveUnits] = useState<ActivePollingUnit[]>([]);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [activeAgentsCount, setActiveAgentsCount] = useState(0);
  const [summary, setSummary] = useState({ totalActiveUnits: 0, totalIncidents: 0, unresolvedIncidents: 0 });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadSituationRoomData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSituationRoomData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSituationRoomData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/situation-room/overview`, {
        withCredentials: true
      });

      const { data } = response.data;
      setActiveUnits(data.activePollingUnits || []);
      setSubmissionStats(data.submissionStats || []);
      setIncidents(data.recentIncidents || []);
      setTimeline(data.timeline || []);
      setActiveAgentsCount(data.activeAgentsCount || 0);
      setSummary(data.summary || { totalActiveUnits: 0, totalIncidents: 0, unresolvedIncidents: 0 });
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading situation room data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSubmissionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'polling_unit_info': 'PU Setup',
      'officer_arrival': 'Officer Arrival',
      'result_tracking': 'Results',
      'incident_report': 'Incidents'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'medium': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'low': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Situation Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-8 h-8 text-green-600" />
              Situation Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time election monitoring dashboard
            </p>
          </div>

          <button
            onClick={() => loadSituationRoomData()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Last updated */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 inline mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30 seconds
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Polling Units</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {summary.totalActiveUnits}
              </p>
            </div>
            <MapPin className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents (2h)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {activeAgentsCount}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Incidents</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {summary.totalIncidents}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unresolved Issues</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {summary.unresolvedIncidents}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Submission Stats */}
      {submissionStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Submission Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {submissionStats.map((stat) => (
              <div key={stat.submission_type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {getSubmissionTypeLabel(stat.submission_type)}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.unique_units} PUs • {stat.unique_agents} agents
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Polling Units */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Active Polling Units ({activeUnits.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeUnits.map((unit) => (
              <div key={unit.submission_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {unit.pu_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code: {unit.polling_unit_code}
                    </p>
                  </div>
                  {unit.gps_coordinates && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      GPS
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {unit.ward}, {unit.lga}, {unit.state}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Agent: {unit.agent_name}
                  </span>
                  <span className="text-gray-500">
                    {new Date(unit.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {activeUnits.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No active polling units yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Recent Incidents ({incidents.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {incidents.map((incident) => (
              <div key={incident.submission_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {incident.description || 'Incident reported'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      PU: {incident.polling_unit_code}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {incident.ward}, {incident.lga}, {incident.state}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Reporter: {incident.reporter_name}
                  </span>
                  <div className="flex items-center gap-2">
                    {incident.resolved === 'true' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-gray-500">
                      {new Date(incident.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {incidents.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No incidents reported
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Activity Timeline (Last 100)
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {timeline.map((item, index) => (
            <div key={`${item.submission_id}-${index}`} className="flex items-center gap-3 p-3 border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                {new Date(item.created_at).toLocaleTimeString()}
              </span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                <strong>{item.agent_name}</strong> submitted{' '}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {getSubmissionTypeLabel(item.submission_type)}
                </span>
                {' '}for <strong>{item.polling_unit_code}</strong>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.lga}, {item.state}
              </span>
            </div>
          ))}
          {timeline.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No activity yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
