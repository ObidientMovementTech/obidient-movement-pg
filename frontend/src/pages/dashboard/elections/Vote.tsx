import { CalendarDays, CheckCircle, Info, Clock } from 'lucide-react';

const Vote = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 font-poppins">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white rounded-xl p-4 flex items-center gap-3 mb-6 shadow-md">
        <Clock className="w-6 h-6" />
        <span className="font-semibold text-lg">All voting features are coming soon!</span>
      </div>

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
            <h2 className="text-lg font-semibold">Upcoming Elections</h2>
            <p className="text-sm text-gray-500">Mark your calendar for these important dates</p>
          </div>
          <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">Coming Soon</span>
        </div>

        <div className="space-y-4 opacity-60 pointer-events-none select-none">
          {[
            { title: 'Local Government Elections', date: 'December 15, 2024' },
            { title: 'Gubernatorial Elections', date: 'February 20, 2025' },
            { title: 'Presidential Election', date: 'February 25, 2027' },
          ].map((election, idx) => (
            <div key={idx} className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <h3 className="text-md font-medium text-gray-800">{election.title}</h3>
                <p className="text-sm text-gray-500">{election.date}</p>
              </div>
              <button className="px-4 py-2 text-sm bg-green-700 text-white rounded opacity-70 cursor-not-allowed" disabled>
                Set Reminder
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Registration & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voter Registration */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 relative">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-700" />
            <h3 className="text-md font-semibold text-gray-800">Voter Registration</h3>
            <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-600">
            Check your voter registration status or register to vote in upcoming elections.
          </p>
          <div className="space-y-2 opacity-60 pointer-events-none select-none">
            <button className="w-full py-2 text-sm bg-green-700 text-white rounded opacity-70 cursor-not-allowed" disabled>
              Check Registration Status
            </button>
            <button className="w-full py-2 text-sm border border-green-700 text-green-800 rounded opacity-70 cursor-not-allowed" disabled>
              Register to Vote
            </button>
          </div>
        </div>

        {/* Election Information */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 relative">
          <div className="flex items-center gap-3 mb-2">
            <Info className="text-green-700" />
            <h3 className="text-md font-semibold text-gray-800">Election Information</h3>
            <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-600">
            Learn about the election process, candidates, and polling locations.
          </p>
          <div className="space-y-2 opacity-60 pointer-events-none select-none">
            <button className="w-full py-2 text-sm bg-green-700 text-white rounded opacity-70 cursor-not-allowed" disabled>
              Find Polling Location
            </button>
            <button className="w-full py-2 text-sm border border-green-700 text-green-800 rounded opacity-70 cursor-not-allowed" disabled>
              View Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
