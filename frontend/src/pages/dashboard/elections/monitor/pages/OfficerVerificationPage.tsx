import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import OfficerArrivalForm from "../components/OfficerArrivalForm";

export default function OfficerVerificationPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
    sessionStorage.setItem("dashboardPage", "Monitor");
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
        <h1 className="text-2xl font-bold mb-4">PU Officer Arrival & Identity Verification</h1>
        <p className="text-gray-600 mb-8">
          Track the arrival of officers and verify their identity to ensure transparency.
        </p>
        <OfficerArrivalForm formData={formData} setFormData={setFormData}
          onNext={() => {
            // You can define what happens on clicking "Continue"
            // For example, navigate to the next form section
            navigate("/monitor/result-tracking");
          }} />
      </div>
    </section>
  );
}
