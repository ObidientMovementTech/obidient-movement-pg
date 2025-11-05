/**
 * Offline Indicator Component
 * Shows network status and provides manual sync functionality
 */

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getQueueStats, syncSubmissions, type QueuedSubmission } from '../utils/submissionQueue';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with auth
const createAuthAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  });
};

interface SyncProgress {
  current: number;
  total: number;
  submission?: QueuedSubmission;
}

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    pending: 0,
    syncing: 0,
    synced: 0,
    failed: 0,
    draft: 0
  });
  const { profile } = useUser();

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load queue stats
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getQueueStats();
      setQueueStats(stats);
    };

    loadStats();

    // Refresh stats every 10 seconds
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queueStats.pending > 0 && !isSyncing) {
      // Wait 2 seconds then auto-sync
      const timeout = setTimeout(() => {
        handleSync();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, queueStats.pending]);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('You are offline. Please connect to the internet to sync.');
      return;
    }

    if (queueStats.pending === 0) {
      toast.success('No pending submissions to sync');
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ current: 0, total: queueStats.pending });

    try {
      const results = await syncSubmissions(
        createAuthAxios(),
        (current, total, submission) => {
          setSyncProgress({ current, total, submission });
        }
      );

      // Refresh stats
      const newStats = await getQueueStats();
      setQueueStats(newStats);

      if (results.synced > 0 && results.failed === 0) {
        toast.success(`Successfully synced ${results.synced} submission(s)`);
      } else if (results.synced > 0 && results.failed > 0) {
        toast.success(`Synced ${results.synced}, failed ${results.failed}`);
      } else if (results.failed > 0) {
        toast.error(`Failed to sync ${results.failed} submission(s)`);
      }

      setSyncProgress(null);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Sync failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if user is not a monitor (check designation)
  const isMonitor = profile?.designation && ['monitor', 'ward_coordinator', 'lga_coordinator'].includes(profile.designation.toLowerCase());

  if (!profile || !isMonitor) {
    return null;
  }

  const hasQueuedItems = queueStats.total > 0 || queueStats.draft > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {/* Sync Progress */}
        {syncProgress && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-2 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Syncing submissions...
              </span>
              <span className="text-xs text-gray-500">
                {syncProgress.current} / {syncProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(syncProgress.current / syncProgress.total) * 100}%`
                }}
              />
            </div>
            {syncProgress.submission && (
              <p className="text-xs text-gray-600 truncate">
                {syncProgress.submission.type.replace('_', ' ')}
              </p>
            )}
          </div>
        )}

        {/* Main Indicator */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            {/* Network Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Offline</span>
                </>
              )}
            </div>

            {/* Queue Stats */}
            {hasQueuedItems && (
              <>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-3 text-xs">
                  {queueStats.draft > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-gray-600">{queueStats.draft} draft</span>
                    </div>
                  )}
                  {queueStats.pending > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span className="text-gray-600">{queueStats.pending} pending</span>
                    </div>
                  )}
                  {queueStats.synced > 0 && (
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-gray-600">{queueStats.synced} synced</span>
                    </div>
                  )}
                  {queueStats.failed > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span className="text-gray-600">{queueStats.failed} failed</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Sync Button */}
            {queueStats.pending > 0 && (
              <>
                <div className="h-4 w-px bg-gray-300" />
                <button
                  onClick={handleSync}
                  disabled={!isOnline || isSyncing}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                    transition-colors
                    ${!isOnline || isSyncing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }
                  `}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                  />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
