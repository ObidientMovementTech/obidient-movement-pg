import { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useUserContext } from '../../../context/UserContext';
import Toast from '../../../components/Toast';
import Loading from '../../../components/Loader';
import { templateSyncService, type SyncStatus, type OutdatedBloc } from '../../../services/templateSyncService';

export default function AdminTemplateSyncPage() {
  const { profile } = useUserContext();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [outdatedBlocs, setOutdatedBlocs] = useState<OutdatedBloc[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showOutdatedDetails, setShowOutdatedDetails] = useState(false);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchSyncStatus();
      fetchOutdatedBlocs();
    }
  }, [profile]);

  const fetchSyncStatus = async () => {
    try {
      const data = await templateSyncService.getSyncStatus();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to fetch sync status',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOutdatedBlocs = async () => {
    try {
      const data = await templateSyncService.getOutdatedBlocs();
      setOutdatedBlocs(data);
    } catch (error) {
      console.error('Error fetching outdated blocs:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to fetch outdated blocs',
        type: 'error'
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);

      // Sync all fields - no field selection needed
      const result = await templateSyncService.syncAllOutdatedBlocs();

      setToast({
        message: `Successfully synced ${result.syncedCount} voting blocs with all template fields`,
        type: 'success'
      });

      // Refresh data
      await fetchSyncStatus();
      await fetchOutdatedBlocs();
    } catch (error) {
      console.error('Error syncing voting blocs:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to sync voting blocs',
        type: 'error'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSingle = async (votingBlocId: string) => {
    try {
      // Sync all fields - no field selection needed
      await templateSyncService.syncVotingBloc(votingBlocId);

      setToast({ message: 'Voting bloc synced successfully with all template fields', type: 'success' });

      // Refresh data
      await fetchSyncStatus();
      await fetchOutdatedBlocs();
    } catch (error) {
      console.error('Error syncing voting bloc:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to sync voting bloc',
        type: 'error'
      });
    }
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Template Synchronization</h1>
        <button
          onClick={() => {
            fetchSyncStatus();
            fetchOutdatedBlocs();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Sync Status Overview */}
      {syncStatus && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sync Status Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Template Version</h3>
              <p className="text-2xl font-bold text-blue-600">v{syncStatus.currentTemplateVersion}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Up to Date</h3>
              <p className="text-2xl font-bold text-green-600">{syncStatus.statistics.up_to_date}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900">Outdated</h3>
              <p className="text-2xl font-bold text-yellow-600">{syncStatus.statistics.outdated}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Total Auto-Generated</h3>
              <p className="text-2xl font-bold text-purple-600">{syncStatus.statistics.total_auto_generated}</p>
            </div>
          </div>

          {syncStatus.statistics.last_sync && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              Last sync: {new Date(syncStatus.statistics.last_sync).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Template Sync Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">How Template Sync Works</h2>

        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Complete Template Synchronization</p>
            <p className="mb-3">
              When you sync voting blocs, <strong>all template fields</strong> are automatically updated to match the current admin template settings. This ensures complete consistency across all auto-generated voting blocs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="font-medium">Always Updated:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Toolkits & Resources</li>
                  <li>Location Settings</li>
                  <li>Voting Bloc Scope</li>
                  <li>Banner Image</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Also Included:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Target Candidate</li>
                  <li>Goals & Objectives</li>
                  <li>Description Template</li>
                  <li>Rich HTML Description</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outdated Blocs */}
      {outdatedBlocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Outdated Voting Blocs</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOutdatedDetails(!showOutdatedDetails)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showOutdatedDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showOutdatedDetails ? 'Hide Details' : 'Show Details'}
              </button>

              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : `Sync All (${outdatedBlocs.length})`}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {outdatedBlocs.length} voting bloc{outdatedBlocs.length !== 1 ? 's' : ''} need{outdatedBlocs.length === 1 ? 's' : ''} to be synced with the latest template.
            </span>
          </div>

          {showOutdatedDetails && (
            <div className="space-y-2">
              {outdatedBlocs.map((bloc) => (
                <div key={bloc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{bloc.name}</h3>
                    <p className="text-sm text-gray-600">
                      Template v{bloc.templateVersion || 1} → v{syncStatus?.currentTemplateVersion}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSyncSingle(bloc.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    <RefreshCw size={14} />
                    Sync
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Up to Date */}
      {outdatedBlocs.length === 0 && syncStatus && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle size={24} />
            <div>
              <h2 className="text-xl font-semibold">All Voting Blocs Are Up to Date</h2>
              <p className="text-sm text-gray-600">All auto-generated voting blocs are synchronized with the latest template.</p>
            </div>
          </div>
        </div>
      )}

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
