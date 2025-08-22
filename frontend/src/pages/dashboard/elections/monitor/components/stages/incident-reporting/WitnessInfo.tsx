import { useState } from 'react';

interface WitnessInfoProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: (data: any) => void;
}
type Witness = {
  name: string;
  phone: string;
  consent: string;
};

export default function WitnessInfo({ formData, onNext }: WitnessInfoProps) {
  const [witnesses, setWitnesses] = useState(formData.incidentWitnesses || [{ name: '', phone: '', consent: '' }]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...witnesses];
    updated[index][field] = value;
    setWitnesses(updated);
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', phone: '', consent: '' }]);
  };

  const handleNext = () => {
    onNext({ incidentWitnesses: witnesses });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#006837] mb-6">Witnesses</h2>

      {witnesses.map((witness: Witness, index: number) => (
        <div key={index} className="bg-gray-50 p-4 mb-4 rounded-xl border">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={witness.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Witness Name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone / Contact</label>
            <input
              type="text"
              value={witness.phone}
              onChange={(e) => handleChange(index, 'phone', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Phone or other contact"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Digital Consent or Signature</label>
            <input
              type="text"
              value={witness.consent}
              onChange={(e) => handleChange(index, 'consent', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. I consent to be listed as witness"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addWitness}
        className="text-sm text-[#006837] hover:underline mb-6"
      >
        + Add another witness
      </button>

      <div className="text-right">
        <button
          onClick={handleNext}
          className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-[#00562d]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
