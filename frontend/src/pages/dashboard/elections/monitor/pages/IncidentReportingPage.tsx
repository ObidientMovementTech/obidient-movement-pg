import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import IncidentReportingForm from "../components/IncidentReportingForm";
import { useState } from "react";
import { monitoringService } from "../../../../../services/monitoringService";
import Toast from "../../../../../components/Toast";

export default function IncidentReportingPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    incidentReport: {
      officerNameOrId: '',
      incidentDate: '',
      incidentStart: '',
      incidentEnd: '',
      captureMethod: [],
      conditions: '',
      irregularities: [],
      narrative: '',
      perpetrators: '',
      victims: '',
      officialsPresent: '',
      evidence: {
        photoCount: 0,
        videoCount: 0,
        hasPhoneFootage: false,
        mediaFilenames: [],
        hasMetadata: false,
      },
      witnesses: [{ name: '', phone: '', consent: false }],
      escalation: {
        reportedTo: [],
        details: '',
        interventionMade: false,
        outcome: '',
        loggedByINEC: ''
      }
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
        incidentType: formData.incidentReport.irregularities.join(', ') || 'General Incident',
        severity: 'medium' as const, // Should be calculated or selected based on incident type
        description: formData.incidentReport.narrative || 'No description provided',
        timeReported: formData.incidentReport.incidentStart || new Date().toISOString(),
        actionTaken: formData.incidentReport.escalation.details || 'No action taken yet',
        resolved: formData.incidentReport.escalation.interventionMade || false,
        evidenceUrls: formData.incidentReport.evidence.mediaFilenames || []
      };

      await monitoringService.submitIncidentReport(submissionData);

      setToast({ message: 'Incident report submitted successfully!', type: 'success' });

      setTimeout(() => {
        navigate('/dashboard/elections/monitor');
      }, 2000);

    } catch (error) {
      console.error('Error submitting incident report:', error);
      setToast({ message: 'Failed to submit incident report. Please try again.', type: 'error' });
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
        <span className="text-sm text-gray-400">Incident Reporting</span>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Election Incident Reporting</h1>
        <p className="text-gray-600 mb-8">
          Report irregularities and incidents that may affect the credibility of the election.
        </p>
        <IncidentReportingForm
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
        />
      </div>
    </section>
  );
}