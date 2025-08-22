import { useState } from 'react';

interface EscalationReportProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: (data: any) => void;
}

export default function EscalationReport({ formData, onNext }: EscalationReportProps) {
  const [reportedTo, setReportedTo] = useState(formData.reportedToAuthorities || '');
  const [additionalNotes, setAdditionalNotes] = useState(formData.additionalNotes || '');

  const handleSubmit = () => {
    onNext({
      reportedToAuthorities: reportedTo,
      additionalNotes,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#006837] mb-6">Escalation and Reporting</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Was the Incident Reported to Authorities On-Site?
        </label>
        <select
          value={reportedTo}
          onChange={(e) => setReportedTo(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select</option>
          <option value="INEC Presiding Officer">INEC Presiding Officer</option>
          <option value="Police Officer">Police Officer</option>
          <option value="Army Officer">Army Officer</option>
          <option value="Other">Other</option>
          <option value="Not Reported">Not Reported</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2"
          placeholder="Any follow-up actions or comments..."
        />
      </div>

      <div className="text-right">
        <button
          onClick={handleSubmit}
          className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-[#00562d]"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}
