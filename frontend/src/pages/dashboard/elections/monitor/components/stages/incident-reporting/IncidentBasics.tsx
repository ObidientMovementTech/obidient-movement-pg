import { useState } from "react";

interface IncidentBasicsProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function IncidentBasics({ onNext, formData }: IncidentBasicsProps) {
  const [localData, setLocalData] = useState({
    officerNameOrId: formData.incidentReport?.officerNameOrId || "",
    incidentDate: formData.incidentReport?.incidentDate || "",
    incidentStart: formData.incidentReport?.incidentStart || "",
    incidentEnd: formData.incidentReport?.incidentEnd || "",
    captureMethod: formData.incidentReport?.captureMethod || [],
    conditions: formData.incidentReport?.conditions || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setLocalData((prev) => ({
      ...prev,
      captureMethod: checked
        ? [...prev.captureMethod, value]
        : prev.captureMethod.filter((item: string) => item !== value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Push updated section into incidentReport
    onNext({
      officerNameOrId: localData.officerNameOrId,
      incidentDate: localData.incidentDate,
      incidentStart: localData.incidentStart,
      incidentEnd: localData.incidentEnd,
      captureMethod: localData.captureMethod,
      conditions: localData.conditions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 text-sm font-medium">INEC Officer Name/ID (if known)</label>
        <input
          type="text"
          name="officerNameOrId"
          value={localData.officerNameOrId}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Date of Incident</label>
          <input
            type="date"
            name="incidentDate"
            value={localData.incidentDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Time of Incident (Start)</label>
          <input
            type="time"
            name="incidentStart"
            value={localData.incidentStart}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Time of Incident (End)</label>
          <input
            type="time"
            name="incidentEnd"
            value={localData.incidentEnd}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Method of Capture</label>
        <div className="grid grid-cols-2 gap-2">
          {['Mobile Camera', 'Body Camera', 'Physical Observation Only', 'Other'].map(method => (
            <label key={method} className="inline-flex items-center">
              <input
                type="checkbox"
                value={method}
                checked={localData.captureMethod.includes(method)}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Weather/Lighting Condition (optional)</label>
        <input
          type="text"
          name="conditions"
          value={localData.conditions}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-[#004d2a]"
      >
        Next
      </button>
    </form>
  );
}