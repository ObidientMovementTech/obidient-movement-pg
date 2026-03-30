import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MobilizationStats } from '../types/dashboard.types';

interface DashboardChartsProps {
  nationalStats: MobilizationStats | null;
  currentView: string;
  currentData: any[];
  formatNumber: (num: number) => string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  nationalStats,
  currentView,
  currentData,
  formatNumber
}) => {
  // PVC Status doughnut chart
  const getPvcChartData = () => {
    if (!nationalStats) return null;

    const withPvc = nationalStats.pvcWithStatus || 0;
    const withoutPvc = nationalStats.pvcWithoutStatus || 0;
    if (withPvc === 0 && withoutPvc === 0) return null;

    return {
      labels: ['With PVC', 'Without PVC'],
      datasets: [
        {
          data: [withPvc, withoutPvc],
          backgroundColor: ['#22c55e', '#f97316'],
          borderColor: ['#16a34a', '#ea580c'],
          borderWidth: 2,
        },
      ],
    };
  };

  // Comparison bar chart — obidient voters only
  const getComparisonChartData = () => {
    if (!currentData || currentData.length === 0) return null;

    const topItems = [...currentData]
      .sort((a, b) => b.obidientRegisteredVoters - a.obidientRegisteredVoters)
      .slice(0, 8);

    return {
      labels: topItems.map(item => item.name),
      datasets: [
        {
          label: 'Obidient Voters',
          data: topItems.map(item => item.obidientRegisteredVoters),
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 1,
        },
      ],
    };
  };

  const getComparisonChartTitle = () => {
    switch (currentView) {
      case 'national': return 'Top States by Obidient Voters';
      case 'state': return 'Top LGAs by Obidient Voters';
      case 'lga': return 'Top Wards by Obidient Voters';
      case 'ward': return 'Top Polling Units by Obidient Voters';
      default: return 'Top Items Comparison';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* PVC Status Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PVC Status Overview</h3>
        <div className="h-80 flex items-center justify-center">
          {getPvcChartData() ? (
            <Doughnut
              data={getPvcChartData()!}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${formatNumber(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{getComparisonChartTitle()}</h3>
        <div className="h-80">
          {getComparisonChartData() ? (
            <Bar
              data={getComparisonChartData()!}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => formatNumber(value as number) }
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-400 flex items-center justify-center h-full">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;