import { useState, useEffect } from 'react';
import { X, Key, Loader2, MapPin, Calendar } from 'lucide-react';
import { monitorKeyService } from '../services/monitorKeyService.ts';
import { statesLGAWardList } from '../utils/StateLGAWard.ts';
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
  };
  onSuccess: () => void;
}

const MonitorKeyAssignmentModal = ({ isOpen, onClose, user, onSuccess }: MonitorKeyAssignmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElections, setSelectedElections] = useState<string[]>([]);
  const [monitoringLocation, setMonitoringLocation] = useState({
    state: user.assignedState || '',
    lga: user.assignedLGA || '',
    ward: user.assignedWard || ''
  });
  const [availableLGAs, setAvailableLGAs] = useState<Array<{ value: string, label: string }>>([]);
  const [availableWards, setAvailableWards] = useState<Array<{ value: string, label: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      fetchElections();
      setMonitoringLocation({
        state: user.assignedState || '',
        lga: user.assignedLGA || '',
        ward: user.assignedWard || ''
      });

      // Initialize LGAs and wards if user has assigned location
      if (user.assignedState) {
        updateAvailableLGAs(user.assignedState);
        if (user.assignedLGA) {
          updateAvailableWards(user.assignedState, user.assignedLGA);
        }
      }
    }
  }, [isOpen, user]);

  // Get Nigerian states for dropdown
  const getNigerianStates = () => {
    return statesLGAWardList.map(stateData => stateData.state).sort();
  };

  // Get LGAs for a specific state
  const getLGAsByState = (state: string) => {
    const stateData = statesLGAWardList.find(s => s.state === state);
    return stateData ? stateData.lgas.map(lga => ({
      value: lga.lga,
      label: lga.lga.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    })).sort((a, b) => a.label.localeCompare(b.label)) : [];
  };

  // Get wards for a specific LGA
  const getWardsByLGA = (state: string, lga: string) => {
    const stateData = statesLGAWardList.find(s => s.state === state);
    if (!stateData) return [];

    const lgaData = stateData.lgas.find(l => l.lga === lga);
    return lgaData ? lgaData.wards.map(ward => ({
      value: ward,
      label: ward.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    })).sort((a, b) => a.label.localeCompare(b.label)) : [];
  };

  // Update available LGAs when state changes
  const updateAvailableLGAs = (state: string) => {
    if (state) {
      const lgas = getLGAsByState(state);
      setAvailableLGAs(lgas);
    } else {
      setAvailableLGAs([]);
    }
  };

  // Update available wards when LGA changes
  const updateAvailableWards = (state: string, lga: string) => {
    if (state && lga) {
      const wards = getWardsByLGA(state, lga);
      setAvailableWards(wards);
    } else {
      setAvailableWards([]);
    }
  };

  // Handle state change
  const handleStateChange = (newState: string) => {
    setMonitoringLocation(prev => ({
      ...prev,
      state: newState,
      lga: '', // Reset LGA when state changes
      ward: '' // Reset ward when state changes
    }));
    updateAvailableLGAs(newState);
    setAvailableWards([]); // Clear wards when state changes
  };

  // Handle LGA change
  const handleLGAChange = (newLGA: string) => {
    setMonitoringLocation(prev => ({
      ...prev,
      lga: newLGA,
      ward: '' // Reset ward when LGA changes
    }));
    updateAvailableWards(monitoringLocation.state, newLGA);
  };

  // Handle ward change
  const handleWardChange = (newWard: string) => {
    setMonitoringLocation(prev => ({
      ...prev,
      ward: newWard
    }));
  };

  const fetchElections = async () => {
    try {
      const response = await monitorKeyService.getActiveElections();
      setElections(response.data || []);
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  };

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

    // Validate monitoring location based on user's designation
    if (!monitoringLocation.state) {
      alert('Please select a state for monitoring');
      return;
    }

    // For LGA and Ward coordinators, ensure their respective locations are selected
    if (user.designation === 'LGA Coordinator' && !monitoringLocation.lga) {
      alert('LGA Coordinator must have an LGA selected');
      return;
    }
    if (user.designation === 'Ward Coordinator' && !monitoringLocation.ward) {
      alert('Ward Coordinator must have a ward selected');
      return;
    }

    setLoading(true);
    try {
      // Define the assignment data with proper types
      const assignmentData: {
        userId: string;
        electionIds: string[];
        monitoring_location: {
          state: string;
          lga: string | null;
          ward: string | null;
        };
        assignedState: string;
        assignedLGA: string | null;
        assignedWard: string | null;
        key_status: 'active' | 'inactive';
        election_access_level: string;
      } = {
        userId: user.id,
        electionIds: selectedElections,
        monitoring_location: {
          state: monitoringLocation.state,
          lga: monitoringLocation.lga || null,
          ward: monitoringLocation.ward || null
        },
        assignedState: monitoringLocation.state,
        assignedLGA: monitoringLocation.lga || null,
        assignedWard: monitoringLocation.ward || null,
        key_status: 'active' as const,
        election_access_level: user.designation || 'undefined_role' // Provide a default value
      };

      console.log('Assigning monitor key with data:', assignmentData);

      const response = await monitorKeyService.assignMonitorKey(user.id, assignmentData);
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
                  Monitoring Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State
                    </label>
                    <select
                      value={monitoringLocation.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select State</option>
                      {getNigerianStates().map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LGA
                    </label>
                    <select
                      value={monitoringLocation.lga}
                      onChange={(e) => handleLGAChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      disabled={!monitoringLocation.state}
                    >
                      <option value="">Select LGA</option>
                      {availableLGAs.map(lga => (
                        <option key={lga.value} value={lga.value}>{lga.label}</option>
                      ))}
                    </select>
                    {!monitoringLocation.state && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select a state first
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ward
                    </label>
                    <select
                      value={monitoringLocation.ward}
                      onChange={(e) => handleWardChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      disabled={!monitoringLocation.lga}
                    >
                      <option value="">Select Ward</option>
                      {availableWards.map(ward => (
                        <option key={ward.value} value={ward.value}>{ward.label}</option>
                      ))}
                    </select>
                    {!monitoringLocation.lga && monitoringLocation.state && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select an LGA first
                      </p>
                    )}
                    {!monitoringLocation.state && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select state and LGA first
                      </p>
                    )}
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
