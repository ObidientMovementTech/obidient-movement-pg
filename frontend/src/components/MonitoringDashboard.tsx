import { useState, useEffect } from 'react';
import {
  FileText, MapPin, CheckCircle,
  // AlertTriangle,
  // Users
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { monitoringService, MonitoringStatus } from '../services/monitoringService';
import Toast from './Toast';

interface MonitoringDashboardProps {
  userInfo: any;
  elections: any[];
}

export default function MonitoringDashboard({ }: MonitoringDashboardProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const statusData = await monitoringService.getMonitoringStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setToast({ message: 'Failed to load dashboard', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Setup Polling Unit',
      icon: <MapPin className="w-8 h-8" />,
      route: '/dashboard/elections/monitor/polling-unit',
      formKey: 'pollingUnit' as const,
      color: 'from-green-500 to-emerald-600'
    },
    // {
    //   title: 'Verify Officers',
    //   icon: <Users className="w-8 h-8" />,
    //   route: '/dashboard/elections/monitor/officer-verification',
    //   formKey: 'officerArrival' as const,
    //   color: 'from-blue-500 to-cyan-600'
    // },
    {
      title: 'Submit Result',
      icon: <FileText className="w-8 h-8" />,
      route: '/dashboard/elections/monitor/result-tracking',
      formKey: 'resultTracking' as const,
      color: 'from-purple-500 to-pink-600'
    },
    // {
    //   title: 'Report Issue',
    //   icon: <AlertTriangle className="w-8 h-8" />,
    //   route: '/dashboard/elections/monitor/incident-reporting',
    //   formKey: 'incidentReporting' as const,
    //   color: 'from-red-500 to-orange-600'
    // },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header - Just show PU name */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {status?.monitoringScope?.pollingUnitLabel || status?.puInfo?.pu_name || 'Your Polling Unit'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {status?.monitoringScope?.wardLabel && status?.monitoringScope?.lgaLabel
            ? `${status.monitoringScope.wardLabel}, ${status.monitoringScope.lgaLabel}`
            : status?.puInfo?.ward && status?.puInfo?.lga
              ? `${status.puInfo.ward}, ${status.puInfo.lga}`
              : 'Select a form below to continue'}
        </p>
      </div>

      {/* Simple Grid of 4 Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {sections.map((section) => {
          const isCompleted = status?.formStatuses[section.formKey]?.completed;

          return (
            <button
              key={section.formKey}
              onClick={() => navigate(section.route)}
              className={`relative bg-gradient-to-br ${section.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95`}
            >
              {/* Completion Badge */}
              {isCompleted && (
                <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-3">
                {section.icon}
              </div>

              {/* Title */}
              <h3 className="text-center font-semibold text-base leading-tight">
                {section.title}
              </h3>

              {/* Status Text */}
              <p className="text-center text-xs opacity-90 mt-2">
                {isCompleted ? 'View / Edit' : 'Tap to start'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Minimal Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          All submissions are for your assigned polling unit only. Tap any card above to submit or update information.
        </p>
      </div>
    </div>
  );
}
