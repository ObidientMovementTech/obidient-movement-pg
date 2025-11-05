import { useState } from 'react';
import DynamicPartyVotes from './DynamicPartyVotes';

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
      : []
  );

  // Get electionId from formData (should be set during polling unit selection)
  const electionId = formData.electionId || formData.resultTracking?.electionId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setStats(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleNext = () => {
    // Validate that all party names are filled if there are any entries
    const hasEmptyPartyNames = votesPerParty.some(entry => !entry.party.trim());
    if (hasEmptyPartyNames) {
      alert('Please enter party names for all entries or use the remove button.');
      return;
    }

    // Filter out any entries with empty party names
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

      {/* Dynamic Party Votes Component */}
      <div className="mt-6 bg-white border-2 border-gray-200 rounded-lg p-6">
        <DynamicPartyVotes
          electionId={electionId}
          votesPerParty={votesPerParty}
          onChange={setVotesPerParty}
        />
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
