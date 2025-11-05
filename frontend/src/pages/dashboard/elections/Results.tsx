import { useState, useEffect } from "react";
import { BarChart2, Search, RefreshCw } from "lucide-react";
import { electionResultsService, ElectionSummary, ResultsFilters } from "../../../services/electionResultsService";
import ElectionCard from "../../../components/ElectionCard";
import Toast from "../../../components/Toast";

const Results = () => {
  const [elections, setElections] = useState<ElectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filters] = useState<ResultsFilters>({
    status: undefined,
    state: '',
    search: '',
    limit: 12
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  // Load elections data
  const loadElections = async () => {
    try {
      setLoading(true);

      // Prepare filters
      const queryFilters: ResultsFilters = {
        ...filters,
        search: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
        state: selectedState !== 'all' ? selectedState : undefined
      };

      const response = await electionResultsService.getElectionResults(queryFilters);
      setElections(response.data || []);
    } catch (error: any) {
      console.error('Failed to load elections:', error);
      setToast({
        message: error.message || 'Failed to load election results',
        type: 'error'
      });

      // Set mock data for development
      setElections(mockElections);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, [selectedStatus, selectedState]);

  const handleSearch = () => {
    loadElections();
  };

  const handleRefresh = () => {
    loadElections();
  };

  const handleElectionClick = (election: ElectionSummary) => {
    // TODO: Navigate to detailed election results page
    console.log('Selected election:', election);
    setToast({
      message: `Opening detailed results for ${election.election_name}`,
      type: 'success'
    });
  };

  const stats = {
    total: elections.length,
    ongoing: elections.filter(e => e.status === 'ongoing').length,
    completed: elections.filter(e => e.status === 'completed').length,
    upcoming: elections.filter(e => e.status === 'upcoming').length
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-poppins">
      {/* Hero Section */}
      <div className="relative w-full rounded-xl overflow-hidden mb-6 md:mb-10 bg-gradient-to-r from-green-700 to-green-500">
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('/curved_line.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <div className="relative z-0 flex flex-col md:flex-row items-center justify-between p-6 md:p-10">
          <div className="text-white max-w-xl mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 shadow-sm">
                Live Results
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Election Results</h1>
            <p className="text-lg md:text-xl opacity-90 mb-4">
              View real-time and historical election results. Stay informed with certified outcomes and live updates.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl font-bold">{stats.ongoing}</div>
              <div className="text-xs opacity-80">Ongoing</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl font-bold">{stats.completed}</div>
              <div className="text-xs opacity-80">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search elections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All States</option>
              <option value="Lagos">Lagos</option>
              <option value="Anambra">Anambra</option>
              <option value="Rivers">Rivers</option>
              <option value="Kano">Kano</option>
              <option value="FCT">FCT</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : elections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {elections.map((election) => (
            <ElectionCard
              key={election.election_id}
              election={election}
              onClick={() => handleElectionClick(election)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Elections Found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedState('all');
              loadElections();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Clear Filters
          </button>
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
};

// Mock data for development/testing
const mockElections: ElectionSummary[] = [
  {
    election_id: "lagos-gov-2023",
    election_name: "Lagos State Gubernatorial Election 2023",
    election_type: "Gubernatorial",
    state: "LAGOS",
    status: "completed",
    election_date: "2023-03-18",
    total_votes: 1347152,
    leading_candidate: {
      name: "Babajide Sanwo-Olu",
      party: "APC",
      votes: 762134,
      percentage: 56.6
    },
    voter_turnout: 27.3,
    is_certified: true
  },
  {
    election_id: "anambra-gov-2024",
    election_name: "Anambra State Gubernatorial Election 2024",
    election_type: "Gubernatorial",
    state: "ANAMBRA",
    status: "ongoing",
    election_date: "2024-11-16",
    total_votes: 234567,
    leading_candidate: {
      name: "Peter Obi",
      party: "LP",
      votes: 145234,
      percentage: 61.9
    },
    is_certified: false
  },
  {
    election_id: "rivers-house-2024",
    election_name: "Rivers State House of Assembly Election 2024",
    election_type: "State Assembly",
    state: "RIVERS",
    status: "upcoming",
    election_date: "2024-12-14",
    total_votes: 0,
    is_certified: false
  }
];

export default Results;