import React from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import useNigeriaLocations from '../../../hooks/useNigeriaLocations';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const LocationStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const isPUAgent = data.designation === 'Polling Unit Agent';

  const locations = useNigeriaLocations({
    levels: 4,
    initialState: data.votingState || data.voterData?.state || '',
    initialLGA: data.votingLGA || data.voterData?.lga || '',
    initialWard: data.votingWard || data.voterData?.ward || '',
    initialPU: data.votingPU || data.voterData?.polling_unit || '',
  });

  const handleStateChange = (name: string) => {
    const loc = locations.states.data.find((s) => s.name === name) || null;
    locations.setSelectedState(loc);
  };

  const handleLGAChange = (name: string) => {
    const loc = locations.lgas.data.find((l) => l.name === name) || null;
    locations.setSelectedLGA(loc);
  };

  const handleWardChange = (name: string) => {
    const loc = locations.wards.data.find((w) => w.name === name) || null;
    locations.setSelectedWard(loc);
  };

  const handlePUChange = (name: string) => {
    const loc = locations.pollingUnits.data.find((p) => p.name === name) || null;
    locations.setSelectedPU(loc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locations.selectedState || !locations.selectedLGA) {
      alert('Please select at least State and LGA');
      return;
    }

    if (isPUAgent && (!locations.selectedWard || !locations.selectedPU)) {
      alert('Polling Unit Agents must select Ward and Polling Unit');
      return;
    }

    updateData({
      votingState: locations.selectedState.name,
      votingLGA: locations.selectedLGA.name,
      votingWard: locations.selectedWard?.name || '',
      votingPU: locations.selectedPU?.name || '',
      pollingUnitCode: isPUAgent
        ? locations.selectedPU?.delimitation || locations.selectedPU?.abbreviation || null
        : null,
    });

    nextStep();
  };

  // Show loading state while states are being loaded
  if (locations.states.isLoading && locations.states.data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto text-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Location Data</h2>
        <p className="text-gray-600">
          Please wait while we load location data...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <MapPin className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Your Location</h2>
          <p className="text-gray-600 mt-1">
            {isPUAgent
              ? 'Select your assigned polling unit'
              : 'Select your coordination area'}
          </p>
        </div>
      </div>

      {data.voterData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 mb-1">Voter Data Found</p>
          <p className="text-sm text-blue-700">
            We've pre-filled your location from INEC voter records. Please verify.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={locations.selectedState?.name || ''}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              required
            >
              <option value="">Select State</option>
              {locations.states.data.map((state) => (
                <option key={state.id} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* LGA Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Local Government Area (LGA) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={locations.selectedLGA?.name || ''}
              onChange={(e) => handleLGAChange(e.target.value)}
              disabled={!locations.selectedState || locations.lgas.isLoading}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="">{locations.lgas.isLoading ? 'Loading LGAs\u2026' : 'Select LGA'}</option>
              {locations.lgas.data.map((lga) => (
                <option key={lga.id} value={lga.name}>
                  {lga.abbreviation ? `${lga.name} (${lga.abbreviation})` : lga.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Ward Selection - Required for PU Agents */}
        {isPUAgent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ward <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={locations.selectedWard?.name || ''}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={!locations.selectedLGA || locations.wards.isLoading}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                required={isPUAgent}
              >
                <option value="">{locations.wards.isLoading ? 'Loading wards\u2026' : 'Select Ward'}</option>
                {locations.wards.data.map((ward) => (
                  <option key={ward.id} value={ward.name}>
                    {ward.abbreviation ? `${ward.name} (${ward.abbreviation})` : ward.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Polling Unit Selection - Required for PU Agents */}
        {isPUAgent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Polling Unit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={locations.selectedPU?.name || ''}
                onChange={(e) => handlePUChange(e.target.value)}
                disabled={!locations.selectedWard || locations.pollingUnits.isLoading}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed max-h-60"
                required={isPUAgent}
              >
                <option value="">{locations.pollingUnits.isLoading ? 'Loading polling units\u2026' : 'Select Polling Unit'}</option>
                {locations.pollingUnits.data.map((pu) => (
                  <option key={pu.id} value={pu.name}>
                    {pu.abbreviation ? `${pu.abbreviation} - ${pu.name}` : pu.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {locations.selectedWard && locations.pollingUnits.data.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {locations.pollingUnits.data.length} polling units available in this ward
              </p>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {locations.selectedState && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Location:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>State:</strong> {locations.selectedState.name}</p>
              {locations.selectedLGA && <p><strong>LGA:</strong> {locations.selectedLGA.name}</p>}
              {locations.selectedWard && <p><strong>Ward:</strong> {locations.selectedWard.name}</p>}
              {locations.selectedPU && <p><strong>Polling Unit:</strong> {locations.selectedPU.name}</p>}
              {locations.selectedPU?.delimitation && (
                <p><strong>PU Code:</strong> {locations.selectedPU.delimitation}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => prevStep(data.skipGoogle ? 2 : 1)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            \u2190 Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationStep;
