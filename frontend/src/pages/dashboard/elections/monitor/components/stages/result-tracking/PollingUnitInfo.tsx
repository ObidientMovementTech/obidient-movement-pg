import { useState } from "react";

interface PollingUnitData {
  officerName: string;
  officerPhoto: File | null;
  officerPhotoPreview: string;
  partyAgents: string;
  reporterName: string;
  reporterPhone: string;
  electionDate: string;
  resultTime: string;
}

interface PollingUnitInfoProps {
  onNext: (data: { pollingInfo: PollingUnitData }) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function PollingUnitInfo({ onNext, formData }: PollingUnitInfoProps) {
  const [data, setData] = useState<PollingUnitData>(
    formData.resultTracking?.pollingInfo || {
      officerName: "",
      officerPhoto: null,
      officerPhotoPreview: "",
      partyAgents: "",
      reporterName: "",
      reporterPhone: "",
      electionDate: "",
      resultTime: "",
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: PollingUnitData) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (file: File | null) => {
    const preview = file ? URL.createObjectURL(file) : "";
    setData((prev: PollingUnitData) => ({
      ...prev,
      officerPhoto: file,
      officerPhotoPreview: preview,
    }));
  };

  const handleNext = () => {
    onNext({ pollingInfo: data });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Polling Unit Information</h2>

      <input
        name="officerName"
        placeholder="INEC Officer Name"
        value={data.officerName}
        onChange={handleInputChange}
        className="w-full border px-3 py-2 rounded"
      />

      <div>
        <label>Upload INEC Officer Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
          className="w-full border px-3 py-2 rounded"
        />
        {data.officerPhotoPreview && (
          <img
            src={data.officerPhotoPreview}
            className="mt-2 w-24 h-24 object-cover rounded border"
          />
        )}
      </div>

      <textarea
        name="partyAgents"
        placeholder="Party Agents Present (names & parties)"
        value={data.partyAgents}
        onChange={handleInputChange}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        name="reporterName"
        placeholder="Observer Name"
        value={data.reporterName}
        onChange={handleInputChange}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        name="reporterPhone"
        placeholder="Observer Phone Number"
        value={data.reporterPhone}
        onChange={handleInputChange}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        name="electionDate"
        type="date"
        value={data.electionDate}
        onChange={handleInputChange}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        name="resultTime"
        type="time"
        value={data.resultTime}
        onChange={handleInputChange}
        className="w-full border px-3 py-2 rounded"
      />

      <button
        onClick={handleNext}
        className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-[#004f2d]"
      >
        Continue
      </button>
    </div>
  );
}
