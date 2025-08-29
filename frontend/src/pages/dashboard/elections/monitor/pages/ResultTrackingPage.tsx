import { useNavigate } from 'react-router';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ResultTrackingForm from '../components/ResultTrackingForm';
import { monitoringService } from '../../../../../services/monitoringService';
import Toast from '../../../../../components/Toast';

export default function ResultTrackingPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
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

  const handleBack = () => {
    navigate("/dashboard/elections/monitor");
  };

  const handleNext = async () => {
    try {
      // Transform formData to match API expectations
      const submissionData = {
        submissionId: 'temp-' + Date.now(), // This should come from PU submission
        pollingInfo: {
          date: formData.resultTracking.date,
          timeAnnounced: formData.resultTracking.timeAnnounced
        },
        registeredVoters: formData.resultTracking.stats.registered,
        accreditedVoters: formData.resultTracking.stats.accredited,
        totalVotesCast: formData.resultTracking.stats.total,
        validVotes: formData.resultTracking.stats.valid,
        rejectedVotes: formData.resultTracking.stats.rejected,
        resultDetails: formData.resultTracking.stats.votesPerParty,
        partyAgentInfo: formData.resultTracking.partyAgents,
        irregularitiesNoted: formData.resultTracking.discrepancies,
        evidencePhotos: [
          formData.resultTracking.evidence.ec8aPhoto,
          formData.resultTracking.evidence.wallPhoto,
          formData.resultTracking.evidence.reporterSelfie
        ].filter(Boolean),
        additionalNotes: formData.resultTracking.notes
      };

      await monitoringService.submitResultTracking(submissionData);

      setToast({ message: 'Result tracking report submitted successfully!', type: 'success' });

      setTimeout(() => {
        navigate('/dashboard/elections/monitor');
      }, 2000);

    } catch (error) {
      console.error('Error submitting result tracking:', error);
      setToast({ message: 'Failed to submit result tracking report. Please try again.', type: 'error' });
    }
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
        <ResultTrackingForm
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
        />
      </div>
    </section>
  );
}
