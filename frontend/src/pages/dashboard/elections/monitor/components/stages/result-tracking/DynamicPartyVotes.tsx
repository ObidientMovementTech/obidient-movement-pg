/**
 * Dynamic Party Votes Input Component
 * Fetches party metadata from election_parties and renders dynamic inputs
 * with color coding and proper ordering
 */

import { useState, useEffect, memo } from 'react';
import { electionService } from '../../../../../../../services/electionService';
import { Loader2, AlertCircle } from 'lucide-react';

interface ElectionParty {
  id: string;
  partyCode: string;
  partyName: string;
  displayName: string | null;
  color: string | null;
  displayOrder: number | null;
  metadata: Record<string, any>;
  aliases?: string[]; // Optional since it might not be in the database
}

interface DynamicPartyVotesProps {
  electionId: string;
  votesPerParty: Array<{ party: string; votes: number }>;
  onChange: (votes: Array<{ party: string; votes: number }>) => void;
}

function DynamicPartyVotes({
  electionId,
  votesPerParty,
  onChange
}: DynamicPartyVotesProps) {
  const [parties, setParties] = useState<ElectionParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useCustomParty, setUseCustomParty] = useState(false);

  useEffect(() => {
    loadParties();
  }, [electionId]);

  const loadParties = async () => {
    if (!electionId) {
      setError('No election ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const electionIdStr = String(electionId);
      const response = await electionService.getElectionParties(electionIdStr);

      if (response.success && response.data?.parties) {
        const sortedParties = response.data.parties.sort((a: ElectionParty, b: ElectionParty) => {
          // Sort by display_order first (nulls last), then alphabetically
          if (a.displayOrder !== null && b.displayOrder !== null) {
            return a.displayOrder - b.displayOrder;
          }
          if (a.displayOrder !== null) return -1;
          if (b.displayOrder !== null) return 1;
          return a.partyName.localeCompare(b.partyName);
        });

        setParties(sortedParties);

        // Initialize votes if empty
        if (votesPerParty.length === 0 || !votesPerParty[0].party) {
          const initialVotes = sortedParties.map((party: ElectionParty) => ({
            party: party.partyCode,
            votes: 0
          }));
          onChange(initialVotes);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error loading parties:', err);
      setError(err.message || 'Failed to load parties');
      // Fallback to manual entry mode
      setUseCustomParty(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteChange = (partyCode: string, votes: number) => {
    const updated = votesPerParty.map(entry =>
      entry.party === partyCode ? { ...entry, votes } : entry
    );

    // If this party wasn't in the list, add it
    if (!votesPerParty.find(entry => entry.party === partyCode)) {
      updated.push({ party: partyCode, votes });
    }

    onChange(updated);
  };

  const getVotesForParty = (partyCode: string): number => {
    const entry = votesPerParty.find(v => v.party === partyCode);
    return entry?.votes || 0;
  };

  const addCustomParty = () => {
    onChange([
      ...votesPerParty,
      { party: '', votes: 0 }
    ]);
  };

  const handleCustomPartyNameChange = (index: number, name: string) => {
    const updated = [...votesPerParty];
    updated[index].party = name.toUpperCase();
    onChange(updated);
  };

  const removeCustomParty = (index: number) => {
    const updated = votesPerParty.filter((_, i) => i !== index);
    onChange(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8cc63f]" />
        <span className="ml-3 text-gray-600">Loading parties...</span>
      </div>
    );
  }

  if (error && !useCustomParty) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Failed to load party list</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => setUseCustomParty(true)}
              className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Enter Parties Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Vote Count Per Party</h3>
        {parties.length > 0 && (
          <button
            type="button"
            onClick={addCustomParty}
            className="text-sm text-[#8cc63f] hover:text-[#7ab52f] font-medium"
          >
            + Add Other Party
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Enter the number of votes each party received. Leave as 0 if party didn't contest or got no votes.
      </p>

      {/* Dynamic Party List */}
      {parties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parties.map((party) => (
            <div
              key={party.id}
              className="bg-white border-2 rounded-lg p-4 hover:border-[#8cc63f] transition-colors"
              style={{
                borderColor: party.color || undefined,
                borderLeftWidth: party.color ? '4px' : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg" style={{ color: '#000' }}>
                      {party.displayName || party.partyName}
                    </span>
                    {party.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: party.color }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {party.partyCode}
                    {party.aliases && party.aliases.length > 0 && ` • Also: ${party.aliases.slice(0, 2).join(', ')}`}
                  </span>
                </div>
              </div>

              <input
                type="number"
                value={getVotesForParty(party.partyCode) || ''}
                onChange={(e) => handleVoteChange(party.partyCode, parseInt(e.target.value) || 0)}
                placeholder="Number of votes"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base font-medium"
                min="0"
              />
            </div>
          ))}
        </div>
      )}

      {/* Custom/Manual Party Entries */}
      {(useCustomParty || votesPerParty.some(v => !parties.find(p => p.partyCode === v.party))) && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            {parties.length > 0 ? 'Other Parties' : 'Manual Entry'}
          </h4>
          <div className="space-y-3">
            {votesPerParty
              .map((entry, index) => ({ entry, index }))
              .filter(({ entry }) => !parties.find(p => p.partyCode === entry.party) || entry.party === '')
              .map(({ entry, index }) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base font-semibold uppercase"
                      placeholder="Party Code (e.g. LP, APC)"
                      value={entry.party}
                      onChange={(e) => handleCustomPartyNameChange(index, e.target.value)}
                      maxLength={10}
                    />
                    <input
                      type="number"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
                      placeholder="Number of votes"
                      value={entry.votes === 0 ? '' : entry.votes}
                      onChange={(e) => {
                        const updated = [...votesPerParty];
                        updated[index].votes = parseInt(e.target.value) || 0;
                        onChange(updated);
                      }}
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomParty(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Remove party"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}

            {(parties.length === 0 || useCustomParty) && (
              <button
                type="button"
                onClick={addCustomParty}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Party
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
export default memo(DynamicPartyVotes);
