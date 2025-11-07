import { memo } from 'react';
import { MapPin, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { LGAData, ElectionParty } from '../../../../services/resultsDashboardService';
import PartyResultsChart from '../../../../components/PartyResultsChart';

interface LGAResultsViewProps {
  lgaData: LGAData;
  parties: ElectionParty[];
  onWardSelect: (wardName: string) => void;
}

/**
 * LGA Level Results View
 * Shows aggregated results for all wards in an LGA
 */
function LGAResultsView({ lgaData, parties, onWardSelect }: LGAResultsViewProps) {
  // Prepare chart data
  const chartData = Object.entries(lgaData.partyTotals).map(([party, votes]) => {
    const partyInfo = parties.find(p => p.party_code === party);
    return {
      party,
      votes,
      color: partyInfo?.color
    };
  });

  const wards = Object.values(lgaData.wards);
  const totalWards = wards.length;
  const wardsWithResults = wards.filter(w => w.resultSubmissions > 0).length;
  const completionPercentage = totalWards > 0 ? ((wardsWithResults / totalWards) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Wards</p>
              <p className="text-2xl font-bold text-gray-900">{totalWards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Results Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{lgaData.resultSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Setup Completed</p>
              <p className="text-2xl font-bold text-gray-900">{lgaData.setupSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-gray-900">{completionPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Party Results Chart */}
      <PartyResultsChart
        data={chartData}
        title={`${lgaData.lga} - Party Results`}
        showPercentages={true}
        maxHeight="500px"
      />

      {/* Wards Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#8cc63f]" />
          Wards in {lgaData.lga}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wards.map(ward => {
            const wardChartData = Object.entries(ward.partyTotals)
              .map(([party, votes]) => ({ party, votes }))
              .sort((a, b) => b.votes - a.votes);

            const leadingParty = wardChartData[0];
            const totalVotes = wardChartData.reduce((sum, p) => sum + p.votes, 0);
            const pollingUnitsCount = Object.keys(ward.pollingUnits).length;
            const completedPUs = Object.values(ward.pollingUnits).filter(pu => pu.hasResults).length;

            return (
              <button
                key={ward.ward}
                onClick={() => onWardSelect(ward.ward)}
                className="text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-[#8cc63f] rounded-lg p-4 transition-all"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{ward.ward}</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Polling Units:</span>
                    <span className="font-medium text-gray-900">{completedPUs}/{pollingUnitsCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Votes:</span>
                    <span className="font-medium text-gray-900">{totalVotes.toLocaleString()}</span>
                  </div>

                  {leadingParty && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Leading:</span>
                      <span className="font-bold text-[#8cc63f]">{leadingParty.party}</span>
                    </div>
                  )}
                </div>

                {/* Mini progress indicator */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#8cc63f] h-2 rounded-full transition-all"
                    style={{ width: `${pollingUnitsCount > 0 ? (completedPUs / pollingUnitsCount) * 100 : 0}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(LGAResultsView);
