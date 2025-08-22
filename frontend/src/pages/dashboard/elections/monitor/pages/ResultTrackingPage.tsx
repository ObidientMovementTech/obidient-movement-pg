import { useNavigate } from 'react-router';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ResultTrackingForm from '../components/ResultTrackingForm';

export default function ResultTrackingPage() {
  const navigate = useNavigate();

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
    navigate("/dashboard");
    sessionStorage.setItem("dashboardPage", "Monitor");
  };

  const handleNext = () => {
    // Here you can navigate to the next step or submit the data
    console.log("Submitted Result Tracking Data:", formData);
    // Example:
    // navigate("/monitor/incident-report");
  };

  return (
    <section>
      <div className="bg-white p-5 border-b flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-600 hover:text-[#006837] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Monitor
        </button>
        <span className="text-sm text-gray-400">Citizens United</span>
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
