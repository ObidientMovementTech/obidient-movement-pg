// import React from 'react';
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import IncidentReportingForm from "../components/IncidentReportingForm";
import { useState } from "react";

export default function IncidentReportingPage() {
  const navigate = useNavigate();

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
    navigate("/dashboard");
    sessionStorage.setItem("dashboardPage", "Monitor");

  };
  const handleNext = () => {
    // Here you can navigate to the next step or submit the data
    console.log("Submitted Incident Data:", formData);
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