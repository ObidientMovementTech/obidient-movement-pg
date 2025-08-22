import { useState, useEffect } from 'react';

interface PUResultDetailsProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function PUResultDetails({ onNext, formData, setFormData }: PUResultDetailsProps) {
  const [votesPerParty, setVotesPerParty] = useState(
    formData.resultTracking?.stats?.votesPerParty || [
      { party: 'LP', votes: 0 },
      { party: 'APC', votes: 0 },
      { party: 'PDP', votes: 0 },
      { party: 'NNPP', votes: 0 },
    ]
  );

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      resultTracking: {
        ...prev.resultTracking,
        stats: {
          ...prev.resultTracking?.stats,
          votesPerParty,
        },
      },
    }));
  }, [votesPerParty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      resultTracking: {
        ...prev.resultTracking,
        [name]: value,
      },
    }));
  };

  const handleVotesChange = (index: number, value: number) => {
    const updated = [...votesPerParty];
    updated[index].votes = value;
    setVotesPerParty(updated);
  };

  const handleNext = () => {
    onNext({
      resultTracking: {
        ...formData.resultTracking,
        stats: {
          ...formData.resultTracking?.stats,
          votesPerParty,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#006837]">PU Result Details (Form EC8A)</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          name="registered"
          placeholder="Registered Voters"
          onChange={handleInputChange}
          value={formData.resultTracking?.registered || ''}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="accredited"
          placeholder="Accredited Voters"
          onChange={handleInputChange}
          value={formData.resultTracking?.accredited || ''}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="valid"
          placeholder="Valid Votes"
          onChange={handleInputChange}
          value={formData.resultTracking?.valid || ''}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="rejected"
          placeholder="Rejected Votes"
          onChange={handleInputChange}
          value={formData.resultTracking?.rejected || ''}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="total"
          placeholder="Total Votes Cast"
          onChange={handleInputChange}
          value={formData.resultTracking?.total || ''}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Vote Count Per Party</h3>
        {votesPerParty.map((entry: { party: string; votes: number }, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="w-16">{entry.party}</span>
            <input
              type="number"
              className="flex-1 border px-3 py-2 rounded"
              value={entry.votes}
              onChange={(e) => handleVotesChange(i, parseInt(e.target.value) || 0)}
            />
          </div>
        ))}

      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="bg-[#006837] text-white px-6 py-2 rounded hover:bg-green-800"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
