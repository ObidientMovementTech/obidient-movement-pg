import { memo, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

interface PartyResult {
  party: string;
  votes: number;
  color?: string | null;
}

interface PartyResultsChartProps {
  data: PartyResult[];
  title?: string;
  showPercentages?: boolean;
  className?: string;
  maxHeight?: string;
}

/**
 * Optimized Party Results Bar Chart Component
 * Memoized to prevent unnecessary re-renders
 */
function PartyResultsChart({
  data,
  title = 'Party Results',
  showPercentages = true,
  className = '',
  maxHeight = '400px'
}: PartyResultsChartProps) {
  // Calculate totals and percentages
  const { totalVotes, chartData } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.votes, 0);

    const processed = data
      .filter(item => item.votes > 0) // Only show parties with votes
      .map(item => ({
        ...item,
        percentage: total > 0 ? ((item.votes / total) * 100).toFixed(2) : '0.00',
        barWidth: total > 0 ? (item.votes / total) * 100 : 0
      }))
      .sort((a, b) => b.votes - a.votes); // Sort by votes descending

    return {
      totalVotes: total,
      chartData: processed
    };
  }, [data]);

  // Get color for party (with fallback)
  const getPartyColor = (party: string, customColor?: string | null): string => {
    if (customColor) return customColor;

    // Default colors for common parties
    const defaultColors: Record<string, string> = {
      'LP': '#10b981',
      'APC': '#ef4444',
      'PDP': '#3b82f6',
      'NNPP': '#8b5cf6',
      'APGA': '#f59e0b',
      'ADC': '#06b6d4',
      'SDP': '#ec4899',
      'AA': '#84cc16',
      'AAC': '#14b8a6',
      'ADP': '#f97316'
    };

    return defaultColors[party.toUpperCase()] || '#6b7280';
  };

  if (chartData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          {title}
        </h3>
        <div className="text-center py-8 text-gray-500">
          No results available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#8cc63f]" />
        {title}
      </h3>

      {/* Total Votes Badge */}
      <div className="mb-4 inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
        <span className="text-sm text-gray-600">Total Votes:</span>
        <span className="text-sm font-bold text-gray-900">{totalVotes.toLocaleString()}</span>
      </div>

      {/* Chart Container with scrolling for many parties */}
      <div className="space-y-3" style={{ maxHeight, overflowY: 'auto' }}>
        {chartData.map((item, index) => {
          const color = getPartyColor(item.party, item.color);

          return (
            <div key={`${item.party}-${index}`} className="group">
              {/* Party Name and Votes */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Ranking Badge */}
                  {index < 3 && (
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'}
                    `}>
                      {index + 1}
                    </div>
                  )}

                  {/* Color Indicator */}
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />

                  {/* Party Name */}
                  <span className="font-semibold text-gray-900 text-sm">
                    {item.party}
                  </span>
                </div>

                {/* Votes and Percentage */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">
                    {item.votes.toLocaleString()}
                  </span>
                  {showPercentages && (
                    <span className="text-xs font-medium text-gray-600 min-w-[45px] text-right">
                      {item.percentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
                  style={{
                    width: `${item.barWidth}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      {chartData.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {chartData.length} parties with votes
          </p>
        </div>
      )}
    </div>
  );
}

// Export memoized component for performance
export default memo(PartyResultsChart);
