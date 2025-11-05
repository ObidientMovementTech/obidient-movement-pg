import { useMemo, useState, useEffect, useCallback } from 'react';
import { X, Key, Loader2, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { monitorKeyService } from '../services/monitorKeyService.ts';
// import { electionService } from '../services/electionService.ts';

interface Election {
  election_id: string;
  election_name: string;
  election_type: string;
  state: string;
  election_date: string;
  status: string;
}

interface MonitorKeyAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    designation?: string;
    assignedState?: string;
    assignedLGA?: string;
    assignedWard?: string;
    votingState?: string;
    votingLGA?: string;
    votingWard?: string;
    votingPU?: string;
  };
  onSuccess: () => void;
}

const MonitorKeyAssignmentModal = ({ isOpen, onClose, user, onSuccess }: MonitorKeyAssignmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElections, setSelectedElections] = useState<string[]>([]);

  const monitoringLocation = useMemo(() => {
    return {
      state: user.votingState || user.assignedState || '',
      lga: user.votingLGA || user.assignedLGA || '',
      ward: user.votingWard || user.assignedWard || '',
      pollingUnit: user.votingPU || ''
    };
  }, [user]);

  const locationIssues = useMemo(() => {
    const issues: string[] = [];
    const designation = user.designation || '';

    if (!monitoringLocation.state && designation !== 'National Coordinator') {
      issues.push('No voting state on file');
    }

    if (['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent', 'Vote Defender'].includes(designation) && !monitoringLocation.lga) {
      issues.push('No voting LGA on file');
    }

    if (['Ward Coordinator', 'Polling Unit Agent', 'Vote Defender'].includes(designation) && !monitoringLocation.ward) {
      issues.push('No voting ward on file');
    }

    if (['Polling Unit Agent', 'Vote Defender'].includes(designation) && !monitoringLocation.pollingUnit) {
      issues.push('No polling unit on file');
    }

    return issues;
  }, [monitoringLocation, user.designation]);

  const fetchElections = useCallback(async () => {
    try {
      const response = await monitorKeyService.getActiveElections();
      setElections(response.data || []);
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchElections();
      setSelectedElections([]);
    }
  }, [fetchElections, isOpen, user.id]);

  const canAssignKey = () => {
    const eligibleDesignations = [
      'National Coordinator',
      'State Coordinator',
      'LGA Coordinator',
      'Ward Coordinator',
      'Polling Unit Agent',
      'Vote Defender'
    ];
    return eligibleDesignations.includes(user.designation || '');
  };

  const handleAssignKey = async () => {
    // Validate user ID
    if (!user.id) {
      alert('Invalid user ID');
      console.error('Monitor key assignment failed: Invalid user ID');
      return;
    }

    // Validate election selection
    if (!selectedElections || selectedElections.length === 0) {
      alert('Please select at least one election');
      console.error('Monitor key assignment failed: No elections selected');
      return;
    }

    if (locationIssues.length > 0) {
      alert(`Cannot assign monitoring access yet. Missing information: ${locationIssues.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        electionIds: selectedElections,
        key_status: 'active' as const,
        election_access_level: user.designation || undefined
      };

      console.log('Assigning monitor key with data:', payload);

      const response = await monitorKeyService.assignMonitorKey(user.id, payload);
      console.log('Monitor key assignment response:', response);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error assigning monitor key:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign monitor key';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Key className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assign Monitor Key
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grant {user.name} access to election monitoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{user.name}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Designation:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {user.designation || 'Not assigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility Check */}
          {!canAssignKey() && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                This user's designation "{user.designation}" is not eligible for monitoring access.
                Only Coordinators, Polling Unit Agents, and Vote Defenders can be assigned monitor keys.
              </p>
            </div>
          )}

          {canAssignKey() && (
            <>
              {/* Monitoring Location */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Monitoring Location (from profile)
                </h3>

                {locationIssues.length > 0 && (
                  <div className="mb-4 flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Missing location details</p>
                      <ul className="list-disc list-inside">
                        {locationIssues.map(issue => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-xs">Update the volunteer's voting information before assigning monitoring access.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">State</p>
                    <p className="font-medium text-gray-900 dark:text-white">{monitoringLocation.state || 'Not set'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">LGA</p>
                    <p className="font-medium text-gray-900 dark:text-white">{monitoringLocation.lga || 'Not set'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Ward</p>
                    <p className="font-medium text-gray-900 dark:text-white">{monitoringLocation.ward || 'Not set'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Polling Unit</p>
                    <p className="font-medium text-gray-900 dark:text-white">{monitoringLocation.pollingUnit || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Election Selection */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Election Access
                </h3>
                {elections.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No active elections available</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {elections.map((election) => (
                      <label key={election.election_id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedElections.includes(election.election_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedElections(prev => [...prev, election.election_id]);
                            } else {
                              setSelectedElections(prev => prev.filter(id => id !== election.election_id));
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {election.election_name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {election.state} • {election.election_type} • {new Date(election.election_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                            {election.status}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {canAssignKey() && (
            <button
              onClick={handleAssignKey}
              disabled={loading || selectedElections.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Assigning...' : 'Assign Monitor Key'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorKeyAssignmentModal;
