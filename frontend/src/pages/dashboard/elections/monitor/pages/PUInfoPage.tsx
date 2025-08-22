import { useNavigate } from 'react-router';
import { useState } from 'react';
import PUInfoForm from "../components/PUInfoForm";
import { ArrowLeft } from "lucide-react";


export default function PUInfoPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pollingUnitInfo: {
      code: '',
      name: '',
      ward: '',
      lga: '',
      state: '',
      gpsCoordinates: '',
      locationType: '',
      locationOther: '',
    },
  });

  const handleBack = () => {
    navigate("/dashboard");
    sessionStorage.setItem("dashboardPage", "Monitor");
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
        <h1 className="text-2xl font-bold mb-4">Polling Unit & Observer Details</h1>
        <p className="text-gray-600 mb-8">
          Fill in the polling unit information and observer details to start tracking election credibility.
        </p>
        <PUInfoForm
          formData={formData}
          setFormData={setFormData}
          onNext={() => {
            // You can define what happens on clicking "Continue"
            // For example, navigate to the next form section
            navigate("/monitor/officer-arrival");
          }}
        />
      </div>
    </section>

  );
}