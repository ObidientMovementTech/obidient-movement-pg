import React, { useEffect, useState } from 'react';

export default function PUInfoForm({ onNext, formData, setFormData }: any) {
  const [locationType, setLocationType] = useState(formData.pollingUnitInfo?.locationType || '');
  const [gpsCoordinates, setGpsCoordinates] = useState('');

  useEffect(() => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      pollingUnitInfo: {
        ...prev.pollingUnitInfo,
        [name]: value,
      },
    }));
    if (name === 'locationType') setLocationType(value);
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* <h2 className="text-2xl font-semibold text-gray-800">Polling Unit Information</h2> */}
      
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
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <input
            name="ward"
            value={formData.pollingUnitInfo?.ward || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">LGA</label>
          <input
            name="lga"
            value={formData.pollingUnitInfo?.lga || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            name="state"
            value={formData.pollingUnitInfo?.state || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            required
          />
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
          className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
}