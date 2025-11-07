import { memo, useState, useMemo } from 'react';
import { MapPin, Download, Image as ImageIcon, Eye } from 'lucide-react';
import { WardData, ElectionParty } from '../../../../services/resultsDashboardService';
import PartyResultsChart from '../../../../components/PartyResultsChart';

interface WardResultsViewProps {
  wardData: WardData;
  parties: ElectionParty[];
  onPollingUnitSelect: (puCode: string) => void;
  onImagePreview: (imageUrl: string, puName: string) => void;
}

type SortKey = 'puName' | 'votes' | 'status';
type SortDirection = 'asc' | 'desc';

/**
 * Ward Level Results View
 * Shows all polling units in a ward with sortable table
 */
function WardResultsView({ wardData, parties, onPollingUnitSelect, onImagePreview }: WardResultsViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('puName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Prepare chart data
  const chartData = Object.entries(wardData.partyTotals).map(([party, votes]) => {
    const partyInfo = parties.find(p => p.party_code === party);
    return {
      party,
      votes,
      color: partyInfo?.color
    };
  });

  const pollingUnits = Object.values(wardData.pollingUnits);

  // Sorted polling units
  const sortedPollingUnits = useMemo(() => {
    return [...pollingUnits].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case 'puName':
          aValue = a.puName.toLowerCase();
          bValue = b.puName.toLowerCase();
          break;
        case 'votes':
          aValue = (a.partyVotes || []).reduce((sum, pv) => sum + pv.votes, 0);
          bValue = (b.partyVotes || []).reduce((sum, pv) => sum + pv.votes, 0);
          break;
        case 'status':
          aValue = a.hasResults ? 1 : 0;
          bValue = b.hasResults ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pollingUnits, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="text-gray-400">⇅</span>;
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Party Results Chart */}
      <PartyResultsChart
        data={chartData}
        title={`${wardData.ward} - Party Results`}
        showPercentages={true}
        maxHeight="400px"
      />

      {/* Polling Units Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#8cc63f]" />
            Polling Units ({pollingUnits.length})
          </h3>
          <button
            onClick={() => {/* TODO: Implement export */ }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('puName')}
                >
                  <div className="flex items-center gap-2">
                    Polling Unit
                    <SortIcon column="puName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leading Party
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('votes')}
                >
                  <div className="flex items-center gap-2">
                    Total Votes
                    <SortIcon column="votes" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon column="status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EC8A Form
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPollingUnits.map(pu => {
                const totalVotes = (pu.partyVotes || []).reduce((sum, pv) => sum + pv.votes, 0);
                const leadingParty = [...(pu.partyVotes || [])].sort((a, b) => b.votes - a.votes)[0];

                return (
                  <tr key={pu.puCode} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{pu.puName}</p>
                        <p className="text-xs text-gray-500">{pu.puCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {leadingParty ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#8cc63f] bg-opacity-10 text-[#8cc63f]">
                          {leadingParty.party}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">
                        {totalVotes > 0 ? totalVotes.toLocaleString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {pu.hasResults ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Results Submitted
                        </span>
                      ) : pu.hasSetup ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Setup Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pu.ec8aPhoto ? (
                        <button
                          onClick={() => onImagePreview(pu.ec8aPhoto!, pu.puName)}
                          className="inline-flex items-center gap-1 text-sm text-[#8cc63f] hover:text-[#7ab52f] transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onPollingUnitSelect(pu.puCode)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#8cc63f] hover:bg-[#7ab52f] text-white rounded-lg text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default memo(WardResultsView);
