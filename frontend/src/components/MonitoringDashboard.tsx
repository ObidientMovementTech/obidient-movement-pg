import { useState, useEffect } from 'react';
import { FileText, MapPin, CheckCircle, AlertTriangle, Clock, Users, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { monitoringService, MonitoringStatus, RecentSubmission } from '../services/monitoringService';
import Toast from './Toast';

interface MonitoringDashboardProps {
  userInfo: any;
  elections: any[];
}

export default function MonitoringDashboard({ elections }: MonitoringDashboardProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statusData, submissionsData] = await Promise.all([
        monitoringService.getMonitoringStatus(),
        monitoringService.getRecentSubmissions(5)
      ]);

      setStatus(statusData);
      setRecentSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    setToast({ message: 'Dashboard refreshed', type: 'success' });
  };

  const sections = [
    {
      title: 'Polling Unit Details',
      description: 'Your polling unit setup and location information.',
      icon: <MapPin size={28} className="text-green-600" />,
      route: '/dashboard/elections/monitor/polling-unit',
      formKey: 'pollingUnit' as const,
      locked: false
    },
    {
      title: 'Officer Arrival & Verification',
      description: 'Track arrival times and verify INEC officer identities.',
      icon: <CheckCircle size={28} className="text-blue-600" />,
      route: '/dashboard/elections/monitor/officer-verification',
      formKey: 'officerArrival' as const,
      locked: false
    },
    {
      title: 'Result Tracking',
      description: 'Submit PU results, agent lists, and vote tallies.',
      icon: <FileText size={28} className="text-purple-600" />,
      route: '/dashboard/elections/monitor/result-tracking',
      formKey: 'resultTracking' as const,
      locked: false
    },
    {
      title: 'Incident Reporting',
      description: 'Report irregularities, violations, or security issues.',
      icon: <AlertTriangle size={28} className="text-red-600" />,
      route: '/dashboard/elections/monitor/incident-reporting',
      formKey: 'incidentReporting' as const,
      locked: false
    },
  ];

  const getStatusBadge = (formKey: keyof MonitoringStatus['formStatuses']) => {
    if (!status) return null;

    const formStatus = status.formStatuses[formKey];

    if (formStatus.completed) {
      return (
        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formStatus.count > 1 ? `${formStatus.count} submitted` : 'Completed'}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Pending</span>
      </div>
    );
  };

  const getFormTypeIcon = (formType: string) => {
    switch (formType) {
      case 'polling_unit': return <MapPin className="w-4 h-4" />;
      case 'officer_arrival': return <Users className="w-4 h-4" />;
      case 'result_tracking': return <FileText className="w-4 h-4" />;
      case 'incident_report': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFormTypeColor = (formType: string) => {
    switch (formType) {
      case 'polling_unit': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'officer_arrival': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'result_tracking': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'incident_report': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Polling Unit Info Card */}
      {status?.puInfo && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Assignment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="opacity-80">Polling Unit:</span>
                  <p className="font-medium">{status.puInfo.pu_name}</p>
                  <p className="text-xs opacity-70">Code: {status.puInfo.pu_code}</p>
                </div>
                <div>
                  <span className="opacity-80">Location:</span>
                  <p className="font-medium">{status.puInfo.ward}, {status.puInfo.lga}</p>
                  <p className="text-xs opacity-70">{status.puInfo.state}</p>
                </div>
                <div>
                  <span className="opacity-80">Setup Date:</span>
                  <p className="font-medium">
                    {new Date(status.puInfo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Elections Info */}
      {elections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Assigned Elections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elections.map((election: any) => (
              <div key={election.election_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white">{election.election_name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {election.state} • {election.election_type}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(election.election_date).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${election.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {election.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {sections.map((section, index) => (
          <div
            key={index}
            onClick={() => navigate(section.route)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {getStatusBadge(section.formKey)}
              <span className="text-green-600 dark:text-green-400 text-sm font-medium group-hover:underline">
                {status?.formStatuses[section.formKey].completed ? 'View/Edit →' : 'Start →'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {recentSubmissions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last {recentSubmissions.length} submissions
            </span>
          </div>

          <div className="space-y-3">
            {recentSubmissions.map((submission, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`p-2 rounded-lg ${getFormTypeColor(submission.form_type)}`}>
                  {getFormTypeIcon(submission.form_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {submission.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {submission.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
