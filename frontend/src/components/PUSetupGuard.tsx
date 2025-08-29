import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { monitoringService } from '../services/monitoringService';

interface PUSetupGuardProps {
  children: React.ReactNode;
}

export default function PUSetupGuard({ children }: PUSetupGuardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needsPUSetup, setNeedsPUSetup] = useState(false);

  useEffect(() => {
    checkPUSetupStatus();
  }, []);

  const checkPUSetupStatus = async () => {
    try {
      const status = await monitoringService.getMonitoringStatus();

      if (status.needsPUSetup) {
        setNeedsPUSetup(true);
      } else {
        setNeedsPUSetup(false);
      }
    } catch (error) {
      console.error('Error checking PU setup status:', error);
      // If there's an error, assume PU setup is needed
      setNeedsPUSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPUSetup = () => {
    navigate('/dashboard/elections/monitor/polling-unit');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking monitoring setup...</p>
        </div>
      </div>
    );
  }

  if (needsPUSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Polling Unit Setup Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Before you can access other monitoring forms, you need to set up your polling unit information first. This helps establish the context for all your monitoring activities.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    What you'll provide:
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Polling unit details and location</li>
                    <li>• GPS coordinates</li>
                    <li>• Ward and LGA information</li>
                    <li>• Your contact information</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartPUSetup}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Start Polling Unit Setup
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              This is a one-time setup. Once completed, you'll have full access to all monitoring forms.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
