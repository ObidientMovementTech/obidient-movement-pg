import { useState, useEffect } from 'react';
import { Shield, Key, Calendar, Phone, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import MonitorKeyEntry from '../../../../components/MonitorKeyEntry';
import MonitoringDashboard from '../../../../components/MonitoringDashboard';
import { monitorKeyService } from '../../../../services/monitorKeyService.ts';
import { useUserContext } from '../../../../context/UserContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
  const { profile, refreshProfile } = useUserContext();
  const [isVerified, setIsVerified] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Login form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    checkExistingAccess();
  }, [profile]);

  const checkExistingAccess = async () => {
    try {
      // Check for monitor access
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
      } else if (!profile) {
        // No access and not authenticated, show login
        setShowLogin(true);
      }
    } catch (error) {
      console.log('No existing access found');
      if (!profile) {
        setShowLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: phoneNumber, // API expects 'email' field for both email and phone
          password
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Refresh user profile
        await refreshProfile();

        // Check for monitor access
        const accessResponse = await (monitorKeyService as any).getMonitoringAccess();
        if (accessResponse.data.hasAccess) {
          setIsVerified(true);
          setShowLogin(false);
          setUserInfo({
            name: accessResponse.data.designation,
            designation: accessResponse.data.designation,
            assignedDate: accessResponse.data.assignedDate,
            monitoringLocation: accessResponse.data.monitoringLocation
          });
          setElections(accessResponse.data.elections || []);
        } else {
          setLoginError('Your account does not have monitoring access. Please contact your coordinator.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(
        error.response?.data?.message ||
        'Login failed. Please check your phone number and password.'
      );
    } finally {
      setLoginLoading(false);
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

  // Show login form for unauthenticated users
  if (showLogin && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 bg-white/20 rounded-full">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Election Monitor Login
            </h1>
            <p className="text-green-100 text-center text-sm mt-2">
              Enter your credentials to access the monitoring dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{loginError}</p>
              </div>
            )}

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08012345678"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                  disabled={loginLoading}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your registered phone number
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contact your coordinator if you have issues accessing your account
              </p>
            </div>
          </form>
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

      {/* Main Dashboard */}
      <MonitoringDashboard userInfo={userInfo} elections={elections} />
    </div>
  );
}
