import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { monitoringService, Election } from '../../../../../services/monitoringService';

export default function PUInfoForm({ onNext, formData, setFormData, loading }: any) {
  const [locationType, setLocationType] = useState(formData.pollingUnitInfo?.locationType || 'Polling Unit');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [elections, setElections] = useState<Election[]>([]);
  const [loadingElections, setLoadingElections] = useState(true);

  useEffect(() => {
    // Set default location type to "Polling Unit" if not already set
    if (!formData.pollingUnitInfo?.locationType) {
      setFormData((prev: any) => ({
        ...prev,
        pollingUnitInfo: { ...prev.pollingUnitInfo, locationType: 'Polling Unit' },
      }));
    }

    // Load elections
    loadElections();

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
  }, []); const loadElections = async () => {
    try {
      // Only get active elections for monitoring
      const activeElections = await monitoringService.getActiveElections();

      // Sort by date (most recent first)
      const sortedElections = activeElections
        .sort((a, b) => new Date(b.election_date).getTime() - new Date(a.election_date).getTime());

      setElections(sortedElections);

      // Auto-select if only one active election
      if (sortedElections.length === 1 && !formData.pollingUnitInfo?.electionId) {
        setFormData((prev: any) => ({
          ...prev,
          pollingUnitInfo: { ...prev.pollingUnitInfo, electionId: sortedElections[0].election_id },
        }));
      }
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
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
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
        ) : elections.length === 1 && formData.pollingUnitInfo?.electionId ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Selected Election:</strong> {elections[0].election_name} ({elections[0].election_type})
            </p>
            <p className="text-xs text-green-600 mt-1">
              Auto-selected (only active election)
            </p>
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

      {/* Pre-filled Location Information (Read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            name="state"
            value={formData.pollingUnitInfo?.state || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            From your assignment
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">LGA</label>
          <input
            name="lga"
            value={formData.pollingUnitInfo?.lga || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            From your assignment
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <input
            name="ward"
            value={formData.pollingUnitInfo?.ward || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            From your assignment
          </p>
        </div>
      </div>

      {/* GPS Coordinates */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
        <input
          name="gpsCoordinates"
          value={gpsCoordinates}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Auto-detected from your device
        </p>
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
    </div>
  );
}