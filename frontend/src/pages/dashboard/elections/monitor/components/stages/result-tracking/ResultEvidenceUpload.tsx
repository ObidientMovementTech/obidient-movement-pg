import { useState } from 'react';

interface ResultEvidenceUploadProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function ResultEvidenceUpload({ onNext, formData, setFormData }: ResultEvidenceUploadProps) {
  const [discrepancy, setDiscrepancy] = useState(formData.resultTracking?.discrepancy || '');
  const [formSigned, setFormSigned] = useState(formData.resultTracking?.formSigned || '');
  const [agentsSigned, setAgentsSigned] = useState(formData.resultTracking?.agentsSigned || '');
  const [posted, setPosted] = useState(formData.resultTracking?.posted || '');
  const [bvasStatus, setBvasStatus] = useState(formData.resultTracking?.bvasStatus || '');
  const [notes, setNotes] = useState(formData.resultTracking?.notes || '');

  const handleFileChange = (name: string, file: File | null) => {
    setFormData((prev: any) => ({
      ...prev,
      resultTracking: {
        ...prev.resultTracking,
        [name]: file,
      },
    }));
  };

  const handleNext = () => {
    onNext({
      resultTracking: {
        ...formData.resultTracking,
        discrepancy,
        formSigned,
        agentsSigned,
        posted,
        bvasStatus,
        notes,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#006837]">Result Evidence Upload (PU Level)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Any Discrepancy Observed?</label>
          <select
            value={discrepancy}
            onChange={(e) => setDiscrepancy(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Was Result Form Signed by Agents?</label>
          <select
            value={formSigned}
            onChange={(e) => setFormSigned(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Number of Agents Who Signed</label>
          <input
            type="number"
            value={agentsSigned}
            onChange={(e) => setAgentsSigned(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Enter number"
          />
        </div>

        <div>
          <label className="block font-medium">Was Result Posted at PU?</label>
          <select
            value={posted}
            onChange={(e) => setPosted(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">BVAS Data Seen or Available?</label>
          <select
            value={bvasStatus}
            onChange={(e) => setBvasStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>
      </div>

      {/* File Uploads */}
      <div className="space-y-4 pt-4">
        <div>
          <label className="block font-medium">Photo of Form EC8A</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('formPhoto', e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Video of Result Announcement</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange('resultVideo', e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Photo of Wall with Result Posted (if any)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('wallPhoto', e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Observer Selfie / Extra Proof (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('selfieProof', e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium">Additional Notes or Observations</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          rows={4}
        />
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-green-800"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
