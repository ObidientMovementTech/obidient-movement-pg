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
  // Chart data preparation for conversion overview (doughnut chart)
  const getConversionChartData = () => {
    if (!nationalStats) return null;

    return {
      labels: ['Obidient Voters', 'Other Voters'],
      datasets: [
        {
          data: [
            nationalStats.obidientRegisteredVoters,
            nationalStats.inecRegisteredVoters - nationalStats.obidientRegisteredVoters
          ],
          backgroundColor: ['#22c55e', '#e5e7eb'],
          borderColor: ['#16a34a', '#d1d5db'],
          borderWidth: 2,
        },
      ],
    };
  };

  // Chart data preparation for state/LGA/ward comparison (bar chart)
  const getComparisonChartData = () => {
    if (!currentData || currentData.length === 0) return null;

    // Sort by obidient registered voters (descending) and take top 5
    const topItems = [...currentData]
      .sort((a, b) => b.obidientRegisteredVoters - a.obidientRegisteredVoters)
      .slice(0, 5);

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
        {
          label: 'Total Registered',
          data: topItems.map(item => item.inecRegisteredVoters),
          backgroundColor: '#60a5fa',
          borderColor: '#3b82f6',
          borderWidth: 1,
        }
      ],
    };
  };

  // Get appropriate title for the comparison chart based on current view
  const getComparisonChartTitle = () => {
    switch (currentView) {
      case 'national':
        return 'Top States Comparison';
      case 'state':
        return 'Top LGAs Comparison';
      case 'lga':
        return 'Top Wards Comparison';
      case 'ward':
        return 'Top Polling Units Comparison';
      default:
        return 'Top Items Comparison';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Conversion Overview Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voter Conversion Overview</h3>
        <div className="h-80 flex items-center justify-center">
          {getConversionChartData() && (
            <Doughnut
              data={getConversionChartData()!}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
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
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{getComparisonChartTitle()}</h3>
        <div className="h-80">
          {getComparisonChartData() && (
            <Bar
              data={getComparisonChartData()!}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatNumber(value as number)
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;