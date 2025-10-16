import React, { useState, useEffect } from 'react';
import { Users, MapPin, Phone, RefreshCw } from 'lucide-react';
import { callCenterService } from '../../services/callCenterService';
import type { VoterStatistics } from '../../services/callCenterService';

interface VoterStatisticsTableProps {
  className?: string;
}

const VoterStatisticsTable: React.FC<VoterStatisticsTableProps> = ({ className = '' }) => {
  const [statistics, setStatistics] = useState<VoterStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading voter statistics...');
      const data = await callCenterService.getVoterStatistics();
      console.log('Statistics data:', data);
      setStatistics(data);
    } catch (err) {
      console.error('Failed to load voter statistics:', err);
      setError('Failed to load voter statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading voter statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadStatistics}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-12 text-gray-500">
          No voter data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Voters with Phone Numbers by LGA
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Total: {formatNumber(statistics.total_voters)} voters across {statistics.lga_count} LGAs in Anambra State
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LGA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voters with Phone Numbers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wards
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Polling Units
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics.lgas.map((lga, index) => (
              <tr key={lga.lga} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{lga.lga}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-lg font-semibold text-green-600">
                      {formatNumber(lga.voter_count)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatNumber(lga.ward_count)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatNumber(lga.polling_unit_count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statistics.lgas.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h4>
          <p className="text-sm text-gray-500">
            No voters with phone numbers found in the database.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoterStatisticsTable;