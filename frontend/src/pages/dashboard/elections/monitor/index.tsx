import { useState, useEffect } from 'react';
import { FileText, MapPin, CheckCircle, AlertTriangle, Shield, Key, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import MonitorKeyEntry from '../../../../components/MonitorKeyEntry';
import { monitorKeyService } from '../../../../services/monitorKeyService.ts';

interface UserInfo {
  name: string;
  designation: string;
  assignedDate: string;
  monitoringLocation: any;
}

interface Election {
  election_id: string;
  election_name: string;
  election_type: string;
  state: string;
  election_date: string;
  status: string;
}

export default function MonitorHomePage() {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingAccess();
  }, []);

  const checkExistingAccess = async () => {
    try {
      const response = await (monitorKeyService as any).getMonitoringAccess();
      if (response.data.hasAccess) {
        setIsVerified(true);
        setUserInfo({
          name: response.data.designation,
          designation: response.data.designation,
          assignedDate: response.data.assignedDate,
          monitoringLocation: response.data.monitoringLocation
        });
        setElections(response.data.elections || []);
      }
    } catch (error) {
      console.log('No existing access found');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyVerified = (verifiedUserInfo: UserInfo, verifiedElections: Election[]) => {
    setIsVerified(true);
    setUserInfo(verifiedUserInfo);
    setElections(verifiedElections);
  };

  const sections = [
    {
      title: 'Polling Unit Details',
      description: 'Enter location and polling unit info including GPS and LGA.',
      icon: <MapPin size={28} className="text-green-600" />,
      route: '/dashboard/elections/monitor/pages/polling-unit',
    },
    {
      title: 'Officer Arrival & Verification',
      description: 'Track arrival times and verify INEC officer identities.',
      icon: <CheckCircle size={28} className="text-green-600" />,
      route: '/dashboard/elections/monitor/pages/officer-verification',
    },
    {
      title: 'Result Tracking',
      description: 'Submit PU result, agent list, and vote tally by party.',
      icon: <FileText size={28} className="text-green-600" />,
      route: '/dashboard/elections/monitor/pages/result-tracking',
    },
    {
      title: 'Incident Report',
      description: 'Report irregularities like vote buying or violence.',
      icon: <AlertTriangle size={28} className="text-red-600" />,
      route: '/dashboard/elections/monitor/pages/incident-reporting',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return <MonitorKeyEntry onVerified={handleKeyVerified} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Election Monitoring Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome, {userInfo?.name} • {userInfo?.designation}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Key className="h-4 w-4" />
                <span>Verified Access</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{elections.length} Election{elections.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Monitor Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="opacity-80">Designation:</span>
                  <p className="font-medium">{userInfo?.designation}</p>
                </div>
                <div>
                  <span className="opacity-80">Location:</span>
                  <p className="font-medium">
                    {userInfo?.monitoringLocation?.state || 'Not specified'}
                    {userInfo?.monitoringLocation?.lga && `, ${userInfo.monitoringLocation.lga}`}
                  </p>
                </div>
                <div>
                  <span className="opacity-80">Access Granted:</span>
                  <p className="font-medium">
                    {userInfo?.assignedDate ? new Date(userInfo.assignedDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <User className="h-16 w-16 opacity-80" />
          </div>
        </div>

        {/* Elections Info */}
        {elections.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assigned Elections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elections.map((election) => (
                <div key={election.election_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{election.election_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {election.state} • {election.election_type}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(election.election_date).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${election.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                      {election.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <div
              key={index}
              onClick={() => navigate(section.route)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {section.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium group-hover:underline">
                      Access Form →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/dashboard/elections/monitor/pages/polling-unit')}
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center"
            >
              <MapPin className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Start Monitoring</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/elections/monitor/pages/incident-reporting')}
              className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-center"
            >
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Report Incident</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/elections/monitor/pages/result-tracking')}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
            >
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Submit Results</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/elections/monitor/pages/officer-verification')}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
            >
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Verify Officers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  //     icon: <AlertTriangle size={28} className="text-red-600" />,
  //     route: '/monitor/incident-reporting',
  //   },
  // ];
}
