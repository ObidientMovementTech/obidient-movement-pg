import React, { useEffect } from 'react';
import { useDemographics, usePeople } from './hooks';
import KpiStrip from './KpiStrip';
import AnalyticsCharts from './AnalyticsCharts';
import InsightsStrip from './InsightsStrip';
import PeopleTable from './PeopleTable';
import type { PeopleFilters } from './types';

interface AnalyticsPanelProps {
  level: string;
  locationId: string;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ level, locationId }) => {
  const { data: demographics, loading: demoLoading } = useDemographics(level, locationId);
  const { people, pagination, filters, loading: peopleLoading, fetchPeople, setPage, applyFilters, exportCsv } = usePeople(level, locationId);

  // Load first page of people on mount
  useEffect(() => {
    fetchPeople(1);
  }, [level, locationId]);

  const handleFilterFromChart = (filter: Record<string, string>) => {
    applyFilters({ ...filters, ...filter } as PeopleFilters);
  };

  if (demoLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-lg mb-2" />
              <div className="h-5 w-12 bg-gray-100 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 h-40 animate-pulse">
              <div className="h-3 w-20 bg-gray-100 rounded mb-4" />
              <div className="h-24 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!demographics) return null;

  return (
    <div>
      {/* KPI Strip */}
      <KpiStrip kpis={demographics.kpis} onKpiClick={handleFilterFromChart} />

      {/* Charts */}
      <AnalyticsCharts data={demographics} onSegmentClick={handleFilterFromChart} />

      {/* Insights */}
      <InsightsStrip insights={demographics.insights} onInsightClick={handleFilterFromChart} />

      {/* People Table */}
      <PeopleTable
        people={people}
        pagination={pagination}
        filters={filters}
        loading={peopleLoading}
        onPageChange={setPage}
        onFiltersChange={applyFilters}
        onExport={exportCsv}
      />
    </div>
  );
};

export default AnalyticsPanel;
