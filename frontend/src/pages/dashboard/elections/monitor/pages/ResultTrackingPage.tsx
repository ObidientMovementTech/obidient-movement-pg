import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ResultTrackingForm from '../components/ResultTrackingForm';
import { monitoringService } from '../../../../../services/monitoringService';
import { electionService } from '../../../../../services/electionService';
import Toast from '../../../../../components/Toast';

export default function ResultTrackingPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<any[]>([]);
  const [monitoringScope, setMonitoringScope] = useState<any>(null);

  const [formData, setFormData] = useState({
    electionId: null as string | null,
    puCode: '',
    puName: '',
    ward: '',
    lga: '',
    state: '',
    resultTracking: {
      officerName: '',
      resultAnnouncerPhoto: '',
      partyAgents: [],
      reporterName: '',
      reporterPhone: '',
      date: '',
      timeAnnounced: '',

      stats: {
        registered: 0,
        accredited: 0,
        valid: 0,
        rejected: 0,
        total: 0,
        votesPerParty: [],
      },
      discrepancies: '',
      signedByAgents: false,
      agentsSignedCount: 0,
      resultPosted: false,
      bvasSeen: '',
      evidence: {
        ec8aPhoto: '',
        announcementVideo: '',
        wallPhoto: '',
        reporterSelfie: '',
      },
      notes: '',
    },
  });

  // Fetch active elections and monitoring scope on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active elections
        const response = await electionService.getActiveElections();
        const activeElections = response.data?.elections || [];
        setElections(activeElections);

        // Auto-select if only one active election
        if (activeElections.length === 1) {
          const selectedElectionId = activeElections[0].election_id; // Use election_id (string) not id (number)
          setFormData(prev => ({
            ...prev,
            electionId: selectedElectionId
          }));
        } else if (activeElections.length === 0) {
          setToast({
            message: 'No active elections found. Please contact admin.',
            type: 'error'
          });
        }

        // Fetch monitoring scope to get polling unit info
        const statusData = await monitoringService.getMonitoringStatus();
        if (statusData.monitoringScope) {
          setMonitoringScope(statusData.monitoringScope);
          setFormData(prev => ({
            ...prev,
            puCode: statusData.monitoringScope?.pollingUnit || '',
            puName: statusData.monitoringScope?.pollingUnitLabel || '',
            ward: statusData.monitoringScope?.wardLabel || statusData.monitoringScope?.ward || '',
            lga: statusData.monitoringScope?.lgaLabel || statusData.monitoringScope?.lga || '',
            state: statusData.monitoringScope?.stateLabel || statusData.monitoringScope?.state || '',
          }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setToast({
          message: 'Failed to load data. Please refresh the page.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); const handleBack = () => {
    navigate("/dashboard/elections/monitor");
  };

  const handleNext = async () => {
    // Submission is handled by ResultTrackingForm
    // Just show success and navigate
    setToast({ message: 'Result tracking report submitted successfully!', type: 'success' });

    setTimeout(() => {
      navigate('/dashboard/elections/monitor');
    }, 2000);
  };

  return (
    <section>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white p-5 border-b flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-600 hover:text-[#006837] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        <span className="text-sm text-gray-400">Result Tracking</span>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Election Result Tracking</h1>
        <p className="text-gray-600 mb-8">
          Capture and report polling unit result details to uphold electoral integrity.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#006837]"></div>
            <p className="mt-4 text-gray-600">Loading elections...</p>
          </div>
        ) : elections.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">No active elections available</p>
            <p className="text-red-600 text-sm mt-2">Please contact the administrator to set up an election.</p>
          </div>
        ) : elections.length > 1 && !formData.electionId ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#006837] mb-4">Select Election</h2>
            <p className="text-sm text-gray-600 mb-4">
              Multiple elections are active. Please select which election you're reporting for:
            </p>
            <div className="space-y-3">
              {elections.map((election) => (
                <button
                  key={election.id}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      electionId: election.election_id // Use election_id (string) not id (number)
                    }));
                  }}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-[#8cc63f] hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{election.election_name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {election.election_type} • {new Date(election.election_date).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {monitoringScope && formData.puName && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Your Assigned Polling Unit:</strong> {formData.puName}
                  {formData.ward && formData.lga && (
                    <span className="text-blue-600"> • {formData.ward}, {formData.lga}</span>
                  )}
                </p>
              </div>
            )}
            {elections.length > 1 && formData.electionId && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Selected Election:</strong> {elections.find(e => e.election_id === formData.electionId)?.election_name}
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, electionId: null }))}
                    className="ml-3 text-green-600 hover:text-green-800 underline text-xs"
                  >
                    Change
                  </button>
                </p>
              </div>
            )}
            <ResultTrackingForm
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </section>
  );
}
