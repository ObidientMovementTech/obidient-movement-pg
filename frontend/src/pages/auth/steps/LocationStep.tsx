import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const LocationStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const [selectedState, setSelectedState] = useState(data.votingState || '');
  const [selectedLGA, setSelectedLGA] = useState(data.votingLGA || '');
  const [selectedWard, setSelectedWard] = useState(data.votingWard || '');
  const [selectedPU, setSelectedPU] = useState(data.votingPU || '');
  const [locationData, setLocationData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const isPUAgent = data.designation === 'Polling Unit Agent';

  // Lazy load the massive location data file
  useEffect(() => {
    let isMounted = true;

    const loadLocationData = async () => {
      try {
        setIsLoadingData(true);
        const module = await import('../../../utils/StateLGAWardPollingUnits');
        if (isMounted) {
          setLocationData(module.StateLGAWardPollingUnits);
        }
      } catch (error) {
        console.error('Failed to load location data:', error);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    loadLocationData();

    return () => {
      isMounted = false;
    };
  }, []);

  const states = useMemo(() => {
    if (!locationData) return [];
    return Object.keys(locationData).sort();
  }, [locationData]);

  const lgas = useMemo(() => {
    if (!selectedState || !locationData || !locationData[selectedState]) return [];
    return Object.keys(locationData[selectedState].lgas).sort();
  }, [locationData, selectedState]);

  const wards = useMemo(() => {
    if (!selectedState || !selectedLGA || !locationData) return [];
    const state = locationData[selectedState];
    if (!state?.lgas[selectedLGA]) return [];
    return Object.keys(state.lgas[selectedLGA].wards).sort();
  }, [locationData, selectedState, selectedLGA]);

  const pollingUnits = useMemo(() => {
    if (!selectedState || !selectedLGA || !selectedWard || !locationData) return [];
    const state = locationData[selectedState];
    if (!state?.lgas[selectedLGA]?.wards[selectedWard]) return [];
    return state.lgas[selectedLGA].wards[selectedWard].pollingUnits;
  }, [locationData, selectedState, selectedLGA, selectedWard]);

  const selectedPUDetails = useMemo(() => {
    if (!isPUAgent || !selectedPU) return null;
    return pollingUnits.find((pu: any) => pu.name === selectedPU) || null;
  }, [isPUAgent, pollingUnits, selectedPU]);

  // Get abbreviations for display
  const getAbbreviation = (type: string, name: string) => {
    if (!locationData) return '';
    try {
      if (type === 'lga' && selectedState) {
        return locationData[selectedState]?.lgas[name]?.abbreviation || '';
      }
      if (type === 'ward' && selectedState && selectedLGA) {
        return locationData[selectedState]?.lgas[selectedLGA]?.wards[name]?.abbreviation || '';
      }
      if (type === 'pu') {
        return name; // PU abbreviation is in the polling unit object itself
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedLGA('');
    setSelectedWard('');
    setSelectedPU('');
  };

  const handleLGAChange = (lga: string) => {
    setSelectedLGA(lga);
    setSelectedWard('');
    setSelectedPU('');
  };

  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    setSelectedPU('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on designation
    if (!selectedState || !selectedLGA) {
      alert('Please select at least State and LGA');
      return;
    }

    if (data.designation === 'Polling Unit Agent' && (!selectedWard || !selectedPU)) {
      alert('Polling Unit Agents must select Ward and Polling Unit');
      return;
    }

    updateData({
      votingState: selectedState,
      votingLGA: selectedLGA,
      votingWard: selectedWard,
      votingPU: selectedPU,
      pollingUnitCode: isPUAgent
        ? selectedPUDetails?.delimitation || selectedPUDetails?.abbreviation || null
        : null,
    });

    nextStep();
  };

  // Pre-fill from voter data if available
  useEffect(() => {
    if (data.voterData && !selectedState) {
      setSelectedState(data.voterData.state || '');
      setSelectedLGA(data.voterData.lga || '');
      setSelectedWard(data.voterData.ward || '');
      setSelectedPU(data.voterData.polling_unit || '');
    }
  }, [data.voterData, selectedState]);

  // Show loading state while location data is being loaded
  if (isLoadingData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto text-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Location Data</h2>
        <p className="text-gray-600">
          Please wait while we load Nigeria's polling unit database...
        </p>
        <p className="text-sm text-gray-500 mt-4">
          This may take a few seconds on first load
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
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
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
              value={selectedLGA}
              onChange={(e) => handleLGAChange(e.target.value)}
              disabled={!selectedState}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="">Select LGA</option>
              {lgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga} ({getAbbreviation('lga', lga)})
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
                value={selectedWard}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={!selectedLGA}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                required={isPUAgent}
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward} ({getAbbreviation('ward', ward)})
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
                value={selectedPU}
                onChange={(e) => setSelectedPU(e.target.value)}
                disabled={!selectedWard}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed max-h-60"
                required={isPUAgent}
              >
                <option value="">Select Polling Unit</option>
                {pollingUnits.map((pu: any) => (
                  <option key={pu.id} value={pu.name}>
                    {pu.abbreviation} - {pu.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {selectedWard && pollingUnits.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {pollingUnits.length} polling units available in this ward
              </p>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {selectedState && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Location:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>State:</strong> {selectedState}</p>
              {selectedLGA && <p><strong>LGA:</strong> {selectedLGA}</p>}
              {selectedWard && <p><strong>Ward:</strong> {selectedWard}</p>}
              {selectedPU && <p><strong>Polling Unit:</strong> {selectedPU}</p>}
              {selectedPUDetails?.delimitation && (
                <p><strong>PU Code:</strong> {selectedPUDetails.delimitation}</p>
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
            ← Back
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
