import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Users, MapPin, Phone } from 'lucide-react';
import { callCenterService } from '../../services/callCenterService';
import type { VoterStatistics, LGAStats, WardStats, PollingUnitStats, VoterRecord } from '../../services/callCenterService';

interface HierarchicalVoterTableProps {
  className?: string;
}

const HierarchicalVoterTable: React.FC<HierarchicalVoterTableProps> = ({ className = '' }) => {
  const [statistics, setStatistics] = useState<VoterStatistics | null>(null);
  const [expandedLGAs, setExpandedLGAs] = useState<Set<string>>(new Set());
  const [expandedWards, setExpandedWards] = useState<Set<string>>(new Set());
  const [expandedPollingUnits, setExpandedPollingUnits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await callCenterService.getVoterStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to load voter statistics:', err);
      setError('Failed to load voter statistics');
    } finally {
      setLoading(false);
    }
  };

  const toggleLGA = (lgaName: string) => {
    const newExpanded = new Set(expandedLGAs);
    if (newExpanded.has(lgaName)) {
      newExpanded.delete(lgaName);
    } else {
      newExpanded.add(lgaName);
    }
    setExpandedLGAs(newExpanded);
  };

  const toggleWard = (wardKey: string) => {
    const newExpanded = new Set(expandedWards);
    if (newExpanded.has(wardKey)) {
      newExpanded.delete(wardKey);
    } else {
      newExpanded.add(wardKey);
    }
    setExpandedWards(newExpanded);
  };

  const togglePollingUnit = (pollingUnitKey: string) => {
    const newExpanded = new Set(expandedPollingUnits);
    if (newExpanded.has(pollingUnitKey)) {
      newExpanded.delete(pollingUnitKey);
    } else {
      newExpanded.add(pollingUnitKey);
    }
    setExpandedPollingUnits(newExpanded);
  };

  const renderVoterRow = (voter: VoterRecord) => (
    <tr key={voter.id} className="bg-gray-50 hover:bg-gray-100">
      <td className="px-8 py-3 text-sm text-gray-900">
        {voter.first_name} {voter.last_name} {voter.other_names}
      </td>
      <td className="px-6 py-3 text-sm text-gray-600">{voter.vin}</td>
      <td className="px-6 py-3 text-sm text-gray-600">
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-1" />
          {voter.phone_number || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-3 text-sm text-gray-600">{voter.email || 'N/A'}</td>
      <td className="px-6 py-3 text-sm">
        <span className={`px-2 py-1 rounded-full text-xs ${voter.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
          {voter.confirmed ? 'Confirmed' : 'Pending'}
        </span>
      </td>
      <td className="px-6 py-3 text-sm text-gray-600">
        {voter.last_called ? new Date(voter.last_called).toLocaleDateString() : 'Never'}
      </td>
    </tr>
  );

  const renderPollingUnitRow = (pollingUnit: PollingUnitStats, lgaName: string, wardName: string) => {
    const pollingUnitKey = `${lgaName}-${wardName}-${pollingUnit.polling_unit}`;
    const isExpanded = expandedPollingUnits.has(pollingUnitKey);

    return (
      <React.Fragment key={pollingUnitKey}>
        <tr className="bg-blue-50 hover:bg-blue-100">
          <td className="px-8 py-3">
            <button
              onClick={() => togglePollingUnit(pollingUnitKey)}
              className="flex items-center text-sm font-medium text-blue-900 hover:text-blue-700"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
              <MapPin className="w-4 h-4 mr-2" />
              {pollingUnit.polling_unit} ({pollingUnit.polling_unit_code})
            </button>
          </td>
          <td className="px-6 py-3 text-sm text-blue-700">{pollingUnit.voter_count}</td>
          <td className="px-6 py-3 text-sm text-gray-500">Polling Unit</td>
          <td className="px-6 py-3"></td>
          <td className="px-6 py-3"></td>
          <td className="px-6 py-3"></td>
        </tr>
        {isExpanded && pollingUnit.voters?.map(renderVoterRow)}
      </React.Fragment>
    );
  };

  const renderWardRow = (ward: WardStats, lgaName: string) => {
    const wardKey = `${lgaName}-${ward.ward}`;
    const isExpanded = expandedWards.has(wardKey);

    return (
      <React.Fragment key={wardKey}>
        <tr className="bg-green-50 hover:bg-green-100">
          <td className="px-6 py-3">
            <button
              onClick={() => toggleWard(wardKey)}
              className="flex items-center text-sm font-medium text-green-900 hover:text-green-700"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
              <MapPin className="w-4 h-4 mr-2" />
              {ward.ward}
            </button>
          </td>
          <td className="px-6 py-3 text-sm text-green-700">{ward.voter_count}</td>
          <td className="px-6 py-3 text-sm text-gray-500">
            {ward.polling_unit_count} Polling Units
          </td>
          <td className="px-6 py-3"></td>
          <td className="px-6 py-3"></td>
          <td className="px-6 py-3"></td>
        </tr>
        {isExpanded && ward.polling_units?.map(pollingUnit =>
          renderPollingUnitRow(pollingUnit, lgaName, ward.ward)
        )}
      </React.Fragment>
    );
  };

  const renderLGARow = (lga: LGAStats) => {
    const isExpanded = expandedLGAs.has(lga.lga);

    return (
      <React.Fragment key={lga.lga}>
        <tr className="bg-indigo-100 hover:bg-indigo-150">
          <td className="px-4 py-4">
            <button
              onClick={() => toggleLGA(lga.lga)}
              className="flex items-center text-base font-semibold text-indigo-900 hover:text-indigo-700"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
              <Users className="w-5 h-5 mr-2" />
              {lga.lga}
            </button>
          </td>
          <td className="px-6 py-4 text-base font-semibold text-indigo-700">
            {lga.voter_count}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            {lga.ward_count} Wards, {lga.polling_unit_count} Polling Units
          </td>
          <td className="px-6 py-4"></td>
          <td className="px-6 py-4"></td>
          <td className="px-6 py-4"></td>
        </tr>
        {isExpanded && lga.wards?.map(ward => renderWardRow(ward, lga.lga))}
      </React.Fragment>
    );
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
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
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
          Voter Statistics - Hierarchical View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Total: {statistics.total_voters.toLocaleString()} voters across {statistics.lga_count} LGAs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location / Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voter Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details / Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Called
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics.lgas.map(renderLGARow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HierarchicalVoterTable;