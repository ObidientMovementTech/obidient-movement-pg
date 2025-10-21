import { useState } from 'react';

interface PUResultDetailsProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  formData: any;
}

export default function PUResultDetails({ onNext, onBack, formData }: PUResultDetailsProps) {
  const [stats, setStats] = useState({
    registered: formData.resultTracking?.stats?.registered || 0,
    accredited: formData.resultTracking?.stats?.accredited || 0,
    valid: formData.resultTracking?.stats?.valid || 0,
    rejected: formData.resultTracking?.stats?.rejected || 0,
    total: formData.resultTracking?.stats?.total || 0,
  });

  const [votesPerParty, setVotesPerParty] = useState<{ party: string; votes: number }[]>(
    formData.resultTracking?.stats?.votesPerParty && formData.resultTracking.stats.votesPerParty.length > 0
      ? formData.resultTracking.stats.votesPerParty
      : [{ party: '', votes: 0 }]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setStats(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleVotesChange = (index: number, value: number) => {
    const updated = [...votesPerParty];
    updated[index].votes = value;
    setVotesPerParty(updated);
  };

  const handlePartyNameChange = (index: number, value: string) => {
    const updated = [...votesPerParty];
    updated[index].party = value.toUpperCase();
    setVotesPerParty(updated);
  };

  const addPartyRow = () => {
    setVotesPerParty([...votesPerParty, { party: '', votes: 0 }]);
  };

  const removePartyRow = (index: number) => {
    if (votesPerParty.length > 1) {
      const updated = votesPerParty.filter((_, i) => i !== index);
      setVotesPerParty(updated);
    }
  };

  const handleNext = () => {
    // Validate that all party names are filled
    const hasEmptyPartyNames = votesPerParty.some(entry => !entry.party.trim());
    if (hasEmptyPartyNames) {
      alert('Please enter party names for all entries or remove empty rows.');
      return;
    }

    // Filter out any entries with 0 votes if party name is empty
    const validEntries = votesPerParty.filter(entry => entry.party.trim() !== '');

    // Combine stats and party votes
    onNext({
      stats: {
        ...stats,
        votesPerParty: validEntries,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#006837]">PU Result Details (Form EC8A)</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 text-sm">
          <strong>Enter vote statistics as shown on Form EC8A.</strong> All fields are required for accurate result reporting.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registered Voters</label>
          <input
            type="number"
            name="registered"
            placeholder="e.g. 1500"
            onChange={handleInputChange}
            value={stats.registered === 0 ? '' : stats.registered}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Accredited Voters</label>
          <input
            type="number"
            name="accredited"
            placeholder="e.g. 1200"
            onChange={handleInputChange}
            value={stats.accredited === 0 ? '' : stats.accredited}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valid Votes</label>
          <input
            type="number"
            name="valid"
            placeholder="e.g. 1180"
            onChange={handleInputChange}
            value={stats.valid === 0 ? '' : stats.valid}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rejected Votes</label>
          <input
            type="number"
            name="rejected"
            placeholder="e.g. 20"
            onChange={handleInputChange}
            value={stats.rejected === 0 ? '' : stats.rejected}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Votes Cast</label>
          <input
            type="number"
            name="total"
            placeholder="e.g. 1200"
            onChange={handleInputChange}
            value={stats.total === 0 ? '' : stats.total}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
            min="0"
            required
          />
        </div>
      </div>

      <div className="mt-6 bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#006837] text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </span>
            Vote Count Per Party
          </h3>
          <button
            type="button"
            onClick={addPartyRow}
            className="bg-[#8cc63f] hover:bg-[#7ab52f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Party
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Enter the party name/initials and the number of votes they received.
        </p>
        
        <div className="space-y-3">
          {votesPerParty.map((entry: { party: string; votes: number }, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base font-semibold uppercase"
                    placeholder="Party (e.g. LP, APC)"
                    value={entry.party}
                    onChange={(e) => handlePartyNameChange(i, e.target.value)}
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
                    placeholder="Number of votes"
                    value={entry.votes === 0 ? '' : entry.votes}
                    onChange={(e) => handleVotesChange(i, parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>
              </div>
              {votesPerParty.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePartyRow(i)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Remove party"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 flex justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="bg-[#006837] hover:bg-[#00552e] text-white px-6 py-2 rounded-lg font-medium transition-colors ml-auto"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
