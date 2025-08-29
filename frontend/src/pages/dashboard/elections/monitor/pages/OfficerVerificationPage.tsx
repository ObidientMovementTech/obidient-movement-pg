import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import OfficerArrivalForm from "../components/OfficerArrivalForm";
import { monitoringService } from "../../../../../services/monitoringService";
import Toast from "../../../../../components/Toast";

export default function OfficerVerificationPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleBack = () => {
    navigate("/dashboard/elections/monitor");
  };

  const handleSubmit = async () => {
    try {
      // Transform formData to match API expectations
      const submissionData = {
        submissionId: 'temp-' + Date.now(), // This should come from PU submission
        firstArrivalTime: formData.officerArrival.firstArrivalTime,
        lastArrivalTime: formData.officerArrival.lastArrivalTime,
        onTimeStatus: formData.officerArrival.onTimeStatus,
        proofTypes: formData.officerArrival.proofTypes,
        arrivalNotes: formData.officerArrival.arrivalNotes,
        officerNames: formData.officerArrival.officerNames,
        votingStarted: formData.officerArrival.votingStarted,
        actualStartTime: formData.officerArrival.actualStartTime,
        materialsVerification: formData.officerArrival.materialsPresent,
        securityPresence: formData.officerArrival.securityPresent,
        arrivalPhotos: formData.officerArrival.arrivalProofMedia,
        officerPhotos: formData.officerArrival.officerNames
      };

      await monitoringService.submitOfficerArrival(submissionData);

      setToast({ message: 'Officer arrival report submitted successfully!', type: 'success' });

      setTimeout(() => {
        navigate('/dashboard/elections/monitor');
      }, 2000);

    } catch (error) {
      console.error('Error submitting officer arrival:', error);
      setToast({ message: 'Failed to submit officer arrival report. Please try again.', type: 'error' });
    }
  };

  const [formData, setFormData] = useState({
    officerArrival: {
      firstArrivalTime: '',
      lastArrivalTime: '',
      onTimeStatus: '',
      proofTypes: [],
      arrivalProofMedia: [],
      arrivalNotes: '',
      officerNames: {
        po: { name: '', photo: '' },
        apo1: { name: '', photo: '' },
        apo2: { name: '', photo: '' },
        apo3: { name: '', photo: '' },
      },
      uniformsProper: '',
      impersonators: [],
      votingStarted: '',
      actualStartTime: '',
      materialsPresent: [],
      securityPresent: '',
    },
  });

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
        <span className="text-sm text-gray-400">Officer Verification</span>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Officer Arrival & Identity Verification</h1>
        <p className="text-gray-600 mb-8">
          Track the arrival of officers and verify their identity to ensure transparency.
        </p>
        <OfficerArrivalForm
          formData={formData}
          setFormData={setFormData}
          onNext={handleSubmit}
        />
      </div>
    </section>
  );
}
