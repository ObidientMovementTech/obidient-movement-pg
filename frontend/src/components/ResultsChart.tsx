import React from 'react';
import { Candidate } from '../services/electionResultsService';

interface ResultsChartProps {
  candidates: Candidate[];
  total_votes: number;
  className?: string;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ candidates, total_votes, className = '' }) => {
  // Sort candidates by votes (descending)
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  // Get party colors (simple color mapping)
  const getPartyColor = (party: string) => {
    const partyColors: { [key: string]: string } = {
      'LP': '#10b981',  // Green for Labour Party
      'APC': '#dc2626', // Red for APC
      'PDP': '#2563eb', // Blue for PDP
      'NNPP': '#7c3aed', // Purple for NNPP
      'APGA': '#f59e0b', // Amber for APGA
      'ADC': '#06b6d4', // Cyan for ADC
    };

    return partyColors[party] || '#6b7280'; // Default gray
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Results Breakdown</h3>

      <div className="space-y-4">
        {sortedCandidates.map((candidate) => (
          <div key={candidate.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getPartyColor(candidate.party_acronym) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {candidate.party_acronym} • {candidate.party}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {candidate.votes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {candidate.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual bar chart */}
      <div className="mt-6 space-y-3">
        {sortedCandidates.slice(0, 5).map((candidate) => (
          <div key={`bar-${candidate.id}`} className="flex items-center space-x-3">
            <div className="w-20 text-xs text-gray-600 truncate">
              {candidate.party_acronym}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${candidate.percentage}%`,
                  backgroundColor: getPartyColor(candidate.party_acronym)
                }}
              />
            </div>
            <div className="w-12 text-xs text-gray-600 text-right">
              {candidate.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Votes</span>
          <span className="font-semibold">{total_votes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;
