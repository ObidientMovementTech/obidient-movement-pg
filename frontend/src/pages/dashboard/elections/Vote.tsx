import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Clock, ExternalLink, AlertCircle, MapPin } from 'lucide-react';
import { electionService, Election } from '../../../services/electionService';

const Vote = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveElections();
  }, []);

  const fetchActiveElections = async () => {
    try {
      setLoading(true);
      const response = await electionService.getElections();
      // Filter for only active and upcoming elections
      const relevantElections = response.data.elections.filter(
        (election: Election) => ['active', 'upcoming'].includes(election.status)
      );
      setElections(relevantElections);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 space-y-10 font-poppins">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold mb-2">Elections</h1>
        <p className="text-gray-600">
          Stay informed about upcoming elections and get involved in the democratic process.
        </p>
      </div>

      {/* Upcoming Elections */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6 relative">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="text-green-600" />
          <div>
            <h2 className="text-lg font-semibold">Current & Upcoming Elections</h2>
            <p className="text-sm text-gray-500">Stay informed about active and upcoming elections</p>
          </div>
        </div>

        {elections.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Elections</h3>
            <p className="text-gray-600">
              There are currently no ongoing or upcoming elections. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => (
              <div key={election.id} className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div>
                  <h3 className="text-md font-medium text-gray-800">{election.election_name}</h3>
                  <p className="text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {election.state}{election.lga && `, ${election.lga}`}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(election.election_date).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${election.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {election.status === 'active' ? 'Ongoing' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voter Registration */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-700" />
            <h3 className="text-md font-semibold text-gray-800">Voter Registration</h3>
          </div>
          <p className="text-sm text-gray-600">
            Check your voter registration status or register to vote in upcoming elections through the INEC portal.
          </p>
          <div className="space-y-2">
            <a
              href="https://cvr.inecnigeria.org/vvs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
            >
              <span>Register to Vote</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Polling Unit Information */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-green-700" />
            <h3 className="text-md font-semibold text-gray-800">Find Your Polling Unit</h3>
          </div>
          <p className="text-sm text-gray-600">
            Locate your assigned polling unit and get directions through the INEC portal.
          </p>
          <div className="space-y-2">
            <a
              href="https://cvr.inecnigeria.org/pu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm border border-green-700 text-green-800 rounded hover:bg-green-50 transition-colors"
            >
              <span>Check Polling Unit Location</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
