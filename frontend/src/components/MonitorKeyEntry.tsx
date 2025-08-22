import { useState } from 'react';
import { Key, Shield, Loader2, CheckCircle } from 'lucide-react';
import { monitorKeyService } from '../services/monitorKeyService.ts';

interface MonitorKeyEntryProps {
  onVerified: (userInfo: any, elections: any[]) => void;
}

const MonitorKeyEntry = ({ onVerified }: MonitorKeyEntryProps) => {
  const [uniqueKey, setUniqueKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uniqueKey.trim()) {
      setError('Please enter your unique key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await (monitorKeyService as any).verifyMonitorKey(uniqueKey.trim());
      onVerified(response.data.userInfo, response.data.elections);
    } catch (error: any) {
      setError(error.message || 'Invalid key or verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Election Monitor Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your unique monitoring key to access the election protection system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyKey} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monitor Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={uniqueKey}
                  onChange={(e) => setUniqueKey(e.target.value.toUpperCase())}
                  placeholder="VD-2025-ANA-XXXX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the key provided by your administrator
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !uniqueKey.trim()}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Access Monitor System
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Don't have a monitor key?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Contact your state coordinator or administrator to get assigned as a Vote Defender
              </p>
            </div>
          </div>
        </div>

        {/* Key Format Info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Key Format Examples:
          </h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VD-2025-ANA-1A2B</code> - Vote Defender, Anambra</div>
            <div>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">SC-2025-LAG-3C4D</code> - State Coordinator, Lagos</div>
            <div>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">LC-2025-KAN-5E6F</code> - LGA Coordinator, Kano</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorKeyEntry;
