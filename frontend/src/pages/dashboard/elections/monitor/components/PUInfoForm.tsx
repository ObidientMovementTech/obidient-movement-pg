import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { monitoringService, Election } from '../../../../../services/monitoringService';
import { useUser } from '../../../../../context/UserContext';
import { statesLGAWardList } from '../../../../../utils/StateLGAWard';

export default function PUInfoForm({ onNext, formData, setFormData, loading }: any) {
  const { profile } = useUser();
  const [locationType, setLocationType] = useState(formData.pollingUnitInfo?.locationType || '');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [elections, setElections] = useState<Election[]>([]);
  const [loadingElections, setLoadingElections] = useState(true);

  // Location data based on user's assigned state
  const [availableLGAs, setAvailableLGAs] = useState<Array<{ lga: string, wards: string[] }>>([]);
  const [availableWards, setAvailableWards] = useState<string[]>([]);
  const [selectedLGA, setSelectedLGA] = useState(formData.pollingUnitInfo?.lga || '');

  useEffect(() => {
    // Load elections
    loadElections();

    // Load location data based on user's assigned state
    loadLocationData();

    // Get GPS coordinates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        setGpsCoordinates(coords);
        setFormData((prev: any) => ({
          ...prev,
          pollingUnitInfo: { ...prev.pollingUnitInfo, gpsCoordinates: coords },
        }));
      });
    }
  }, []);

  const loadLocationData = () => {
    if (!profile?.assignedState) {
      console.error('User has no assigned state for monitoring');
      return;
    }

    // Find the user's assigned state in the data
    const stateData = statesLGAWardList.find(
      state => state.state.toLowerCase() === profile.assignedState!.toLowerCase()
    );

    if (stateData) {
      setAvailableLGAs(stateData.lgas);

      // Set the state in form data automatically
      setFormData((prev: any) => ({
        ...prev,
        pollingUnitInfo: {
          ...prev.pollingUnitInfo,
          state: stateData.state,
          stateCode: stateData.state.substring(0, 3).toUpperCase()
        }
      }));
    }
  };

  // Update wards when LGA changes
  useEffect(() => {
    if (selectedLGA) {
      const lgaData = availableLGAs.find(lga => lga.lga === selectedLGA);
      if (lgaData) {
        setAvailableWards(lgaData.wards);
      }
    } else {
      setAvailableWards([]);
    }
  }, [selectedLGA, availableLGAs]); const loadElections = async () => {
    try {
      // Only get active elections for monitoring
      const activeElections = await monitoringService.getActiveElections();

      // Sort by date (most recent first)
      const sortedElections = activeElections
        .sort((a, b) => new Date(b.election_date).getTime() - new Date(a.election_date).getTime());

      setElections(sortedElections);
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoadingElections(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      pollingUnitInfo: {
        ...prev.pollingUnitInfo,
        [name]: value,
      },
    }));

    if (name === 'locationType') {
      setLocationType(value);
    } else if (name === 'lga') {
      setSelectedLGA(value);
      // Clear ward when LGA changes
      setFormData((prev: any) => ({
        ...prev,
        pollingUnitInfo: {
          ...prev.pollingUnitInfo,
          lga: value,
          lgaCode: value,
          ward: '', // Clear ward selection
          wardCode: ''
        },
      }));
    } else if (name === 'ward') {
      setFormData((prev: any) => ({
        ...prev,
        pollingUnitInfo: {
          ...prev.pollingUnitInfo,
          ward: value,
          wardCode: value
        },
      }));
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* <h2 className="text-2xl font-semibold text-gray-800">Polling Unit Information</h2> */}

      {/* Check if user has assigned state */}
      {!profile?.assignedState ? (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                No Assigned State
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  You need to have a state assigned to your account before you can set up polling unit monitoring.
                  Please contact your administrator to assign you to a state.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* State Assignment Info */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Monitoring Assignment:</span> {profile.assignedState} State
                  {profile.assignedLGA && ` → ${profile.assignedLGA} LGA`}
                  {profile.assignedWard && ` → ${profile.assignedWard} Ward`}
                </p>
              </div>
            </div>
          </div>

          {/* Election Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Active Election <span className="text-red-500">*</span>
            </label>
            {loadingElections ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading active elections...</span>
              </div>
            ) : (
              <select
                name="electionId"
                value={formData.pollingUnitInfo?.electionId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              >
                <option value="">Select an active election...</option>
                {elections.map((election) => (
                  <option key={election.election_id} value={election.election_id}>
                    {election.election_name} ({election.election_type}) - {new Date(election.election_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
            {elections.length === 0 && !loadingElections && (
              <p className="text-sm text-orange-600 mt-1">
                No active elections found. Please contact your administrator to activate an election for monitoring.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Polling Unit Code</label>
            <input
              name="code"
              value={formData.pollingUnitInfo?.code || ''}
              onChange={handleChange}
              placeholder="PU 24-13-07-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Polling Unit Name/Description</label>
            <input
              name="name"
              value={formData.pollingUnitInfo?.name || ''}
              onChange={handleChange}
              placeholder="St. John’s Primary School, Akure"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                LGA <span className="text-red-500">*</span>
              </label>
              <select
                name="lga"
                value={formData.pollingUnitInfo?.lga || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              >
                <option value="">Select LGA...</option>
                {availableLGAs.map((lga) => (
                  <option key={lga.lga} value={lga.lga}>
                    {lga.lga.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              {availableLGAs.length === 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  No LGAs available for your assigned state ({profile?.assignedState || 'Unknown'})
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Ward <span className="text-red-500">*</span>
              </label>
              <select
                name="ward"
                value={formData.pollingUnitInfo?.ward || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
                disabled={!selectedLGA}
              >
                <option value="">
                  {selectedLGA ? 'Select Ward...' : 'Select LGA first'}
                </option>
                {availableWards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              {selectedLGA && availableWards.length === 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  No wards available for selected LGA
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                State (Assigned)
              </label>
              <input
                name="state"
                value={profile?.assignedState || 'Not Assigned'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can only monitor elections in your assigned state
              </p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
              <input
                name="gpsCoordinates"
                value={gpsCoordinates}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Location Type</label>
            <select
              name="locationType"
              value={locationType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              required
            >
              <option value="">Select</option>
              <option value="Polling Unit">Polling Unit</option>
              <option value="Ward Collation Centre">Ward Collation Centre</option>
              <option value="LGA Collation Centre">LGA Collation Centre</option>
              <option value="Other">Other (Specify)</option>
            </select>
          </div>

          {locationType === 'Other' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Specify Other Location</label>
              <input
                name="locationOther"
                value={formData.pollingUnitInfo?.locationOther || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                required
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}