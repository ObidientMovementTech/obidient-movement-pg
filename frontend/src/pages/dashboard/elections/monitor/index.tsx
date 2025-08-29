import { useState, useEffect } from 'react';
import { Shield, Key, Calendar } from 'lucide-react';
import MonitorKeyEntry from '../../../../components/MonitorKeyEntry';
import PUSetupGuard from '../../../../components/PUSetupGuard';
import MonitoringDashboard from '../../../../components/MonitoringDashboard';
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
                  Vote Protection Dashboard
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

      {/* PU Setup Guard wraps the main dashboard */}
      <PUSetupGuard>
        <MonitoringDashboard userInfo={userInfo} elections={elections} />
      </PUSetupGuard>
    </div>
  );
}
