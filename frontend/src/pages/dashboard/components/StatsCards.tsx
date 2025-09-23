import React from 'react';
import {
  Users,
  Shield,
  Award,
  BarChart3,
  Target
} from 'lucide-react';
import { StatsCardProps } from '../types/dashboard.types';

interface Props extends StatsCardProps {
  formatNumber: (num: number) => string;
}

const StatsCards: React.FC<Props> = ({ currentStats, currentView, currentScope, loading, formatNumber }) => {
  // Helper function to get appropriate labels based on current view
  const getViewLabels = () => {
    switch (currentView) {
      case 'national':
        return {
          scope: 'National',
          obidientLabel: 'Total Obidient Platform Users',
          inecLabel: 'Total INEC Registered Voters',
          conversionLabel: 'National Conversion Rate',
          pvcLabel: 'PVC Status Overview'
        };
      case 'state':
        return {
          scope: currentScope || 'State',
          obidientLabel: `Obidient Users in ${currentScope}`,
          inecLabel: `INEC Registered Voters in ${currentScope}`,
          conversionLabel: `${currentScope} Conversion Rate`,
          pvcLabel: `${currentScope} PVC Status`
        };
      case 'lga':
        return {
          scope: currentScope || 'LGA',
          obidientLabel: `Obidient Users in ${currentScope}`,
          inecLabel: `INEC Registered Voters in ${currentScope}`,
          conversionLabel: `${currentScope} Conversion Rate`,
          pvcLabel: `${currentScope} PVC Status`
        };
      case 'ward':
        return {
          scope: currentScope || 'Ward',
          obidientLabel: `Obidient Users in ${currentScope}`,
          inecLabel: `INEC Registered Voters in ${currentScope}`,
          conversionLabel: `${currentScope} Conversion Rate`,
          pvcLabel: `${currentScope} PVC Status`
        };
      case 'pu':
        return {
          scope: currentScope || 'Polling Unit',
          obidientLabel: `Obidient Users in ${currentScope}`,
          inecLabel: `INEC Registered Voters in ${currentScope}`,
          conversionLabel: `${currentScope} Conversion Rate`,
          pvcLabel: `${currentScope} PVC Status`
        };
      default:
        return {
          scope: 'Overview',
          obidientLabel: 'Obidient Platform Users',
          inecLabel: 'INEC Registered Voters',
          conversionLabel: 'Conversion Rate',
          pvcLabel: 'PVC Status'
        };
    }
  };

  const labels = getViewLabels();

  if (loading || !currentStats) {
    return (
      <div className="space-y-8 mb-8">
        {/* Main Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
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

        {/* Additional Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-500">{labels.obidientLabel}</p>
                {currentStats.realData?.isRealData && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    LIVE DATA
                  </span>
                )}
              </div>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{labels.inecLabel}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(currentStats.inecRegisteredVoters)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unconverted Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(currentStats.unconvertedVoters)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{labels.conversionLabel}</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.conversionRate.toFixed(2)}%
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
                {formatNumber(currentStats.obidientVotersWithPVC || currentStats.pvcWithStatus)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Without PVC</span>
              <span className="font-bold text-orange-600">
                {formatNumber(currentStats.obidientVotersWithoutPVC || currentStats.pvcWithoutStatus)}
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
              <span className="font-bold">
                {currentStats.realData?.pvcCompletionRate
                  ? `${currentStats.realData.pvcCompletionRate}%`
                  : `${((currentStats.pvcWithStatus / (currentStats.pvcWithStatus + currentStats.pvcWithoutStatus)) * 100).toFixed(1)}%`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;