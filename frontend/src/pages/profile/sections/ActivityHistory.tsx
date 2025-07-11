import { UserProfile } from "../../../context/UserContext";

interface ActivityHistoryProps {
  profile: UserProfile;
}

export default function ActivityHistory({ profile }: ActivityHistoryProps) {
  // Mock data for activity history
  // In a real implementation, this would be fetched from an API
  const activities = [
    {
      id: "act1",
      type: "login",
      description: "Logged in from new device",
      date: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      ip: "192.168.1.1",
      location: "Lagos, Nigeria"
    },
    {
      id: "act3",
      type: "comment",
      description: "Commented on: Education Reform Proposal",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      postId: "p456"
    },
    {
      id: "act4",
      type: "kyc",
      description: "Submitted KYC information",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      status: profile.kycStatus
    },
    {
      id: "act5",
      type: "survey",
      description: "Completed civic engagement survey",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      surveyId: "s789"
    },
    {
      id: "act6",
      type: "login",
      description: "Logged in to account",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
      ip: "192.168.1.100",
      location: "Abuja, Nigeria"
    },
  ];

  // Format date in a human-readable way
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm5 10v-2a1 1 0 012 0v2a1 1 0 11-2 0zm6-1a1 1 0 10-2 0v-5a1 1 0 00-2 0v1a1 1 0 110 2v2a1 1 0 102 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'kyc':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'survey':
        return (
          <div className="bg-red-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Activity Overview */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-2">Your Activity History</h2>
        <p className="opacity-90">Track your interactions and participation on Obidient Movement.</p>
      </div>

      {/* Security Activity Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start">
              <div className="mr-4">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{activity.description}</p>
                    {activity.type === 'login' && (
                      <p className="text-xs text-gray-500 mt-1">IP: {activity.ip} • Location: {activity.location}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(activity.date)}</span>
                </div>

                {activity.type === 'kyc' && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {activity.status === 'approved' && 'Approved'}
                      {activity.status === 'pending' && 'Under Review'}
                      {activity.status === 'rejected' && 'Rejected'}
                      {(activity.status === 'unsubmitted' || !activity.status) && 'Submitted'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No recent activities found.</p>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
          <button className="text-sm text-gray-600 font-medium hover:text-gray-900">
            View More Activity
          </button>
        </div>
      </div>

      {/* Platform Engagement Stats */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Platform Engagement</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{activities.filter(a => a.type === 'comment').length}</div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{activities.length}</div>
              <div className="text-sm text-gray-500">Total Activities</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Track your engagement over time to see your civic impact grow.</p>
            <button className="text-sm bg-[#006837] text-white px-4 py-2 rounded hover:bg-[#005229] transition">
              View Detailed Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
