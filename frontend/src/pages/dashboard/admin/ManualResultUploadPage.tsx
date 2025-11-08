import { useState, useEffect, lazy, Suspense } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Toast from '../../../components/Toast';
import { electionService } from '../../../services/electionService';
import { StateLGAWardPollingUnits } from '../../../utils/StateLGAWardPollingUnits';

// Lazy load the heavy form component
const CombinedResultForm = lazy(() => import('../elections/monitor/components/stages/result-tracking/CombinedResultForm'));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Election {
  election_id: string;
  election_name: string;
  election_type: string;
  election_date: string;
}

export default function ManualResultUploadPage() {
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false); // Only show form when PU info is filled

  // Location selection helpers
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedLGAName, setSelectedLGAName] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');
  const [selectedPUName, setSelectedPUName] = useState('');

  const [formData, setFormData] = useState({
    electionId: null as string | null,
    puCode: '',
    puName: '',
    ward: '',
    lga: '',
    state: '',
    resultTracking: {
      stats: {
        registered: 0,
        accredited: 0,
        valid: 0,
        rejected: 0,
        total: 0,
        votesPerParty: [],
      },
      ec8aPhoto: '',
      resultVideo: '',
      wallPhoto: '',
      selfieProof: ''
    }
  });

  useEffect(() => {
    loadElections();
  }, []);

  // Get available options based on selection
  const states = Object.keys(StateLGAWardPollingUnits);
  const lgas = selectedStateName ? Object.keys(StateLGAWardPollingUnits[selectedStateName]?.lgas || {}) : [];
  const wards = selectedStateName && selectedLGAName
    ? Object.keys(StateLGAWardPollingUnits[selectedStateName]?.lgas[selectedLGAName]?.wards || {})
    : [];
  const pollingUnits = selectedStateName && selectedLGAName && selectedWardName
    ? StateLGAWardPollingUnits[selectedStateName]?.lgas[selectedLGAName]?.wards[selectedWardName]?.pollingUnits || []
    : [];

  // Handle location changes
  const handleStateChange = (stateName: string) => {
    setSelectedStateName(stateName);
    setSelectedLGAName('');
    setSelectedWardName('');
    setSelectedPUName('');
    setFormData(prev => ({ ...prev, state: stateName, lga: '', ward: '', puCode: '', puName: '' }));
  };

  const handleLGAChange = (lgaName: string) => {
    setSelectedLGAName(lgaName);
    setSelectedWardName('');
    setSelectedPUName('');
    setFormData(prev => ({ ...prev, lga: lgaName, ward: '', puCode: '', puName: '' }));
  };

  const handleWardChange = (wardName: string) => {
    setSelectedWardName(wardName);
    setSelectedPUName('');
    setFormData(prev => ({ ...prev, ward: wardName, puCode: '', puName: '' }));
  };

  const handlePUChange = (puName: string) => {
    const selectedPU = pollingUnits.find(pu => pu.name === puName);
    setSelectedPUName(puName);
    if (selectedPU) {
      setFormData(prev => ({
        ...prev,
        puCode: selectedPU.id || selectedPU.abbreviation,
        puName: selectedPU.name
      }));
    }
  };

  const loadElections = async () => {
    try {
      const response = await electionService.getActiveElections();
      const activeElections = response.data?.elections || [];

      setElections(activeElections);

      // Auto-select if only one election
      if (activeElections.length === 1) {
        setFormData(prev => ({ ...prev, electionId: activeElections[0].election_id }));
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      setToast({ message: 'Failed to load elections', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (resultData?: any) => {
    try {
      // Validate required fields
      if (!formData.electionId) {
        setToast({ message: 'Please select an election', type: 'error' });
        return;
      }

      if (!formData.puCode || !formData.puName) {
        setToast({ message: 'Please enter polling unit code and name', type: 'error' });
        return;
      }

      // If resultData is passed from CombinedResultForm, use it; otherwise use formData
      const statsToSubmit = resultData?.stats || formData.resultTracking.stats;
      const ec8aPhoto = resultData?.ec8aPhoto || formData.resultTracking.ec8aPhoto;

      if (!ec8aPhoto) {
        setToast({ message: 'Please upload EC8A result form photo', type: 'error' });
        return;
      }

      // Validate votesPerParty exists and is not empty
      if (!statsToSubmit.votesPerParty || statsToSubmit.votesPerParty.length === 0) {
        setToast({ message: 'Please enter party votes', type: 'error' });
        return;
      }

      const payload = {
        electionId: formData.electionId,
        pollingUnitCode: formData.puCode,
        pollingUnitName: formData.puName,
        ward: formData.ward,
        lga: formData.lga,
        state: formData.state,
        stats: statsToSubmit,
        evidence: {
          ec8aPhoto: ec8aPhoto,
          announcementVideo: formData.resultTracking.resultVideo,
          wallPhoto: formData.resultTracking.wallPhoto
        }
      };

      console.log('Submitting payload:', payload);

      const response = await axios.post(
        `${API_BASE_URL}/admin/manual-result-upload`,
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setToast({ message: 'Result uploaded successfully!', type: 'success' });

        // Reset form after 2 seconds
        setTimeout(() => {
          setShowForm(false); // Hide the form
          setFormData({
            electionId: elections.length === 1 ? elections[0].election_id : null,
            puCode: '',
            puName: '',
            ward: '',
            lga: '',
            state: '',
            resultTracking: {
              stats: {
                registered: 0,
                accredited: 0,
                valid: 0,
                rejected: 0,
                total: 0,
                votesPerParty: [],
              },
              ec8aPhoto: '',
              resultVideo: '',
              wallPhoto: '',
              selfieProof: ''
            }
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error submitting manual result:', error);
      setToast({
        message: error.response?.data?.message || 'Failed to upload result',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.close()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-green-600" />
                  Manual Result Upload
                </h1>
                <p className="text-sm text-gray-600 mt-1">Admin-only manual result entry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Election Display/Selection at Top */}
        {elections.length === 1 && formData.electionId ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Election:</strong> {elections[0].election_name}
              <span className="ml-3 text-green-600">
                {elections[0].election_type} • {new Date(elections[0].election_date).toLocaleDateString()}
              </span>
            </p>
          </div>
        ) : elections.length > 1 && formData.electionId ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-xs font-medium text-green-700 mb-1">Selected Election</label>
                <select
                  value={formData.electionId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, electionId: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  {elections.map((election) => (
                    <option key={election.election_id} value={election.election_id}>
                      {election.election_name} - {election.election_type} ({new Date(election.election_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : null}

        {formData.electionId ? (
          <>
            {/* Polling Unit Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Polling Unit Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStateName}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* LGA Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LGA <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedLGAName}
                    onChange={(e) => handleLGAChange(e.target.value)}
                    disabled={!selectedStateName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>

                {/* Ward Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWardName}
                    onChange={(e) => handleWardChange(e.target.value)}
                    disabled={!selectedLGAName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Ward</option>
                    {wards.map((ward) => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                </div>

                {/* Polling Unit Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Polling Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPUName}
                    onChange={(e) => handlePUChange(e.target.value)}
                    disabled={!selectedWardName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Polling Unit</option>
                    {pollingUnits.map((pu) => (
                      <option key={pu.id} value={pu.name}>{pu.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Show selected PU details */}
              {formData.puCode && formData.puName && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {formData.puName}
                    <span className="ml-2 text-blue-600">
                      (Code: {formData.puCode})
                    </span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formData.ward}, {formData.lga}, {formData.state}
                  </p>
                </div>
              )}

              {/* Show form button */}
              {formData.puCode && formData.puName && !showForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Continue to Result Entry
                  </button>
                </div>
              )}
            </div>

            {/* Result Details Form - Only load when needed */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Result Details</h2>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin h-10 w-10 border-3 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading form...</p>
                    </div>
                  </div>
                }>
                  <CombinedResultForm
                    onNext={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    useAdminUpload={true}
                  />
                </Suspense>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Election</h2>
            <div className="grid gap-3">
              {elections.map((election) => (
                <button
                  key={election.election_id}
                  onClick={() => setFormData(prev => ({ ...prev, electionId: election.election_id }))}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{election.election_name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {election.election_type} • {new Date(election.election_date).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
