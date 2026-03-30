import React from 'react';
import {
  Users,
  Shield,
} from 'lucide-react';
import { StatsCardProps } from '../types/dashboard.types';

interface Props extends StatsCardProps {
  formatNumber: (num: number) => string;
}

const StatsCards: React.FC<Props> = ({ currentStats, currentView, currentScope, loading, formatNumber }) => {
  const getViewLabels = () => {
    const scope = (() => {
      switch (currentView) {
        case 'national': return 'National';
        case 'state': return currentScope || 'State';
        case 'lga': return currentScope || 'LGA';
        case 'ward': return currentScope || 'Ward';
        case 'pu': return currentScope || 'Polling Unit';
        default: return 'Overview';
      }
    })();

    return {
      scope,
      obidientLabel: currentView === 'national'
        ? 'Total Obidient Platform Users'
        : `Obidient Users in ${scope}`,
      pvcLabel: currentView === 'national'
        ? 'PVC Status Overview'
        : `${scope} PVC Status`,
    };
  };

  const labels = getViewLabels();

  if (loading || !currentStats) {
    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="w-6 h-6 bg-gray-300 rounded" />
                </div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pvcTotal = (currentStats.pvcWithStatus || 0) + (currentStats.pvcWithoutStatus || 0);
  const pvcCompletion = pvcTotal > 0
    ? ((currentStats.pvcWithStatus / pvcTotal) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8 mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Obidient Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{labels.obidientLabel}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(currentStats.obidientRegisteredVoters)}
              </p>
              {(currentStats.obidientVotersWithPVC !== undefined && currentStats.obidientVotersWithoutPVC !== undefined) && (
                <p className="text-xs text-gray-500 mt-1">
                  PVC: {formatNumber(currentStats.obidientVotersWithPVC)} |
                  No-PVC: {formatNumber(currentStats.obidientVotersWithoutPVC)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* With PVC */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">With PVC</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(currentStats.pvcWithStatus)}
              </p>
            </div>
          </div>
        </div>

        {/* Without PVC */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Without PVC</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatNumber(currentStats.pvcWithoutStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PVC Status Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} />
            <h3 className="text-lg font-semibold">{labels.pvcLabel}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">With PVC</span>
              <span className="font-bold text-green-600">
                {formatNumber(currentStats.pvcWithStatus)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Without PVC</span>
              <span className="font-bold text-orange-600">
                {formatNumber(currentStats.pvcWithoutStatus)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Registered</span>
              <span className="font-bold text-blue-600">
                {formatNumber(currentStats.obidientRegisteredVoters)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">PVC Completion</span>
              <span className="font-bold">{pvcCompletion}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
