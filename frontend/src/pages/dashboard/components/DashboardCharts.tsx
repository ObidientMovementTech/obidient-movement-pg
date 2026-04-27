import React from 'react';
import { Bar } from 'react-chartjs-2';
import { MobilizationStats } from '../types/dashboard.types';

interface DashboardChartsProps {
  nationalStats: MobilizationStats | null;
  currentView: string;
  currentData: any[];
  formatNumber: (num: number) => string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  currentView,
  currentData,
  formatNumber
}) => {
  // Obidients vs PVC comparison bar chart — the core chart
  const getComparisonChartData = () => {
    if (!currentData || currentData.length === 0) return null;

    const topItems = [...currentData]
      .sort((a, b) => b.obidientRegisteredVoters - a.obidientRegisteredVoters)
      .slice(0, 10);

    return {
      labels: topItems.map(item =>
        item.name.length > 14 ? item.name.slice(0, 12) + '…' : item.name
      ),
      datasets: [
        {
          label: 'Total Obidients',
          data: topItems.map(item => item.obidientRegisteredVoters || 0),
          backgroundColor: 'rgba(37, 99, 235, 0.75)',
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'With PVC',
          data: topItems.map(item => item.obidientVotersWithPVC || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const getChartTitle = () => {
    switch (currentView) {
      case 'national': return 'Top States — Obidients vs PVC';
      case 'state': return 'Top LGAs — Obidients vs PVC';
      case 'lga': return 'Top Wards — Obidients vs PVC';
      case 'ward': return 'Top Polling Units — Obidients vs PVC';
      default: return 'Obidients vs PVC Comparison';
    }
  };

  const chartData = getComparisonChartData();
  if (!chartData) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{getChartTitle()}</h3>
      <div className="h-64">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: { boxWidth: 10, font: { size: 11 }, padding: 16 },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 10 } },
              },
              y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: {
                  callback: (value) => formatNumber(value as number),
                  font: { size: 10 },
                },
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default DashboardCharts;