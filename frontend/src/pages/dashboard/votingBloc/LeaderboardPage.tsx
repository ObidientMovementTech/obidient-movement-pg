import { useEffect, useState } from "react";
import { Trophy, Users, TrendingUp, MapPin, Filter, Medal, Crown, Award } from "lucide-react";
import { getLeaderboard } from "../../../services/votingBlocService";
import { LeaderboardEntry } from "../../../types/votingBloc";
import { statesLGAWardList } from "../../../utils/StateLGAWard";
import Loading from "../../../components/Loader";
import Toast from "../../../components/Toast";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [level, setLevel] = useState<'national' | 'state' | 'lga' | 'ward'>('national');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [level, selectedState, selectedLga, selectedWard]);

  useEffect(() => {
    if (selectedState) {
      const stateData = statesLGAWardList.find(s => s.state === selectedState);
      setLgaOptions(stateData ? stateData.lgas.map(lga => lga.lga) : []);
      setSelectedLga('');
      setSelectedWard('');
    }
  }, [selectedState]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params: any = { level };

      if (level !== 'national' && selectedState) params.state = selectedState;
      if ((level === 'lga' || level === 'ward') && selectedLga) params.lga = selectedLga;
      if (level === 'ward' && selectedWard) params.ward = selectedWard;

      const data = await getLeaderboard(params);
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      setToast({ message: "Failed to load leaderboard", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="text-yellow-500" size={24} />;
      case 1:
        return <Medal className="text-gray-400" size={24} />;
      case 2:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>;
    }
  };

  const getRankClass = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 1:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 2:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="text-yellow-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Voting Bloc Leaderboard</h1>
        </div>
        <p className="text-gray-600">
          Track your impact and see how voting blocs compare across different levels
        </p>
      </div>

      {/* Level Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="text-gray-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Filter by Level</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {(['national', 'state', 'lga', 'ward'] as const).map((levelOption) => (
            <button
              key={levelOption}
              onClick={() => setLevel(levelOption)}
              className={`p-3 rounded-lg border text-center transition-colors ${level === levelOption
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="font-medium capitalize">{levelOption}</div>
              <div className="text-xs opacity-75 mt-1">
                {levelOption === 'national' && 'All Nigeria'}
                {levelOption === 'state' && 'State Level'}
                {levelOption === 'lga' && 'LGA Level'}
                {levelOption === 'ward' && 'Ward Level'}
              </div>
            </button>
          ))}
        </div>

        {/* Location Filters */}
        {level !== 'national' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All States</option>
                {statesLGAWardList.map(state => (
                  <option key={state.state} value={state.state}>{state.state}</option>
                ))}
              </select>
            </div>

            {(level === 'lga' || level === 'ward') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
                <select
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  disabled={!selectedState}
                >
                  <option value="">All LGAs</option>
                  {lgaOptions.map(lga => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
              </div>
            )}

            {level === 'ward' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                <input
                  type="text"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  placeholder="Enter ward name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Rankings</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp size={16} />
              <span>Ranked by total members</span>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No voting blocs found</h3>
            <p className="text-gray-500">No voting blocs match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div
                key={entry._id}
                className={`p-6 transition-colors hover:bg-gray-50 ${getRankClass(index)}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getRankIcon(index)}
                  </div>

                  {/* Voting Bloc Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {entry.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>Created by {entry.creator.name || 'Unknown User'}</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {entry.scope}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>
                            {entry.location.state}
                            {entry.location.lga && ` • ${entry.location.lga}`}
                            {entry.location.ward && ` • ${entry.location.ward}`}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {entry.metrics.totalMembers}
                            </div>
                            <div className="text-xs text-gray-500">Members</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {entry.metrics.engagementScore}
                            </div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Total Blocs</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{leaderboard.length}</div>
            <div className="text-sm text-gray-500 mt-1">Active voting blocs</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Total Members</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {leaderboard.reduce((sum, entry) => sum + entry.metrics.totalMembers, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Across all blocs</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Top Performer</h3>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {leaderboard[0]?.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {leaderboard[0]?.metrics.totalMembers} members
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
