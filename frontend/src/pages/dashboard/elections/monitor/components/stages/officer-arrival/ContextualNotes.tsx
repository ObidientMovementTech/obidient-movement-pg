// components/stages/officer-arrival/ContextualNotes.tsx
import { useState } from "react";

interface ContextualNotesProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function ContextualNotes({ onNext, formData }: ContextualNotesProps) {
  const [votingStarted, setVotingStarted] = useState(formData.officerArrival?.votingStarted || '');
  const [actualStartTime, setActualStartTime] = useState(formData.officerArrival?.actualStartTime || '');
  const [materialsPresent, setMaterialsPresent] = useState<string[]>(formData.officerArrival?.materialsPresent || []);
  const [securityPresent, setSecurityPresent] = useState(formData.officerArrival?.securityPresent || '');

  const toggleMaterial = (material: string) => {
    const updated = materialsPresent.includes(material)
      ? materialsPresent.filter((m) => m !== material)
      : [...materialsPresent, material];
    setMaterialsPresent(updated);
  };

  const handleNext = () => {
    onNext({
      officerArrival: {
        ...formData.officerArrival,
        votingStarted,
        actualStartTime,
        materialsPresent,
        securityPresent,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Contextual Notes</h2>

      <div>
        <label className="block font-medium mb-1">Did Voting Start On Time?</label>
        <select
          value={votingStarted}
          onChange={(e) => setVotingStarted(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Sure">Not Sure</option>
        </select>
      </div>

      {votingStarted === 'No' && (
        <div>
          <label className="block font-medium mb-1">Actual Voting Start Time</label>
          <input
            type="time"
            value={actualStartTime}
            onChange={(e) => setActualStartTime(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">Materials Present at Arrival</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {['Ballot Papers', 'BVAS Machine', 'Result Sheets', 'Others'].map((item) => (
            <label key={item} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={materialsPresent.includes(item)}
                onChange={() => toggleMaterial(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Security Personnel Present at Time of Arrival</label>
        <select
          value={securityPresent}
          onChange={(e) => setSecurityPresent(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Arrived Later">Arrived Later</option>
        </select>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
