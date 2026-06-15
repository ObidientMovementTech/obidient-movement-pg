import React from 'react';
import type { DemographicsData } from './types';

interface AnalyticsChartsProps {
  data: DemographicsData;
  onSegmentClick: (filter: Record<string, string>) => void;
}

/** Simple donut chart using SVG */
function Donut({ segments, size = 120, onSegmentClick }: {
  segments: { label: string; value: number; color: string; filter: Record<string, string> }[];
  size?: number;
  onSegmentClick: (filter: Record<string, string>) => void;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-full text-xs text-gray-400">No data</div>;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100" className="flex-shrink-0">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const dashOffset = -offset;
          offset += dashLen;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSegmentClick(seg.filter)}
            />
          );
        })}
        <text x="50" y="50" textAnchor="middle" dy="4" className="text-[11px] font-bold fill-gray-700">
          {total.toLocaleString()}
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {segments.map((seg, i) => (
          <button
            key={i}
            onClick={() => onSegmentClick(seg.filter)}
            className="flex items-center gap-2 text-left hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-600 truncate">{seg.label}</span>
            <span className="text-xs font-semibold text-gray-900 ml-auto">{seg.value.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Horizontal bar chart */
function HBar({ bars, onBarClick }: {
  bars: { label: string; value: number; color: string; filter: Record<string, string> }[];
  onBarClick: (filter: Record<string, string>) => void;
}) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="flex flex-col gap-1.5">
      {bars.map((bar, i) => (
        <button
          key={i}
          onClick={() => onBarClick(bar.filter)}
          className="flex items-center gap-2 group hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
        >
          <span className="text-[11px] text-gray-500 w-14 text-right flex-shrink-0">{bar.label}</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all group-hover:opacity-80"
              style={{ width: `${(bar.value / max) * 100}%`, backgroundColor: bar.color }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-700 w-10 text-right">{bar.value.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

/** Sparkline for signup trend */
function Sparkline({ data }: { data: { week: string; count: number }[] }) {
  if (data.length === 0) return <div className="text-xs text-gray-400">No trend data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 200;
  const height = 50;
  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * width,
    y: height - (d.count / max) * (height - 4)
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
        <path d={pathD} fill="none" stroke="#169043" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#169043" />
        )}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>12 weeks ago</span>
        <span>This week</span>
      </div>
    </div>
  );
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, onSegmentClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5">
      {/* Gender */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Gender</h3>
        <Donut
          segments={[
            { label: 'Male', value: data.gender.male, color: '#3b82f6', filter: { gender: 'Male' } },
            { label: 'Female', value: data.gender.female, color: '#ec4899', filter: { gender: 'Female' } },
            { label: 'Not set', value: data.gender.unknown, color: '#d1d5db', filter: { gender: 'unknown' } },
          ]}
          onSegmentClick={onSegmentClick}
        />
      </div>

      {/* Age */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Age Distribution</h3>
        <HBar
          bars={data.ageRanges.filter(a => a.label !== 'Unknown').map(a => ({
            label: a.label,
            value: a.count,
            color: '#169043',
            filter: { ageRange: a.label }
          }))}
          onBarClick={onSegmentClick}
        />
      </div>

      {/* PVC */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">PVC Status</h3>
        <Donut
          segments={[
            { label: 'Has PVC', value: data.pvcStatus.yes, color: '#169043', filter: { pvc: 'Yes' } },
            { label: 'No PVC', value: data.pvcStatus.no, color: '#ef4444', filter: { pvc: 'No' } },
          ]}
          onSegmentClick={onSegmentClick}
        />
      </div>

      {/* Voting Intent */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Voting Intent</h3>
        <Donut
          segments={[
            { label: 'Will vote', value: data.votingIntent.yes, color: '#8b5cf6', filter: { willVote: 'Yes' } },
            { label: "Won't vote", value: data.votingIntent.no, color: '#ef4444', filter: { willVote: 'No' } },
            { label: 'Unknown', value: data.votingIntent.unknown, color: '#d1d5db', filter: { willVote: 'unknown' } },
          ]}
          onSegmentClick={onSegmentClick}
        />
      </div>

      {/* Profile Health */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Profile Health</h3>
        <HBar
          bars={[
            { label: '100%', value: data.profileHealth.complete, color: '#169043', filter: { profileHealth: 'complete' } },
            { label: '80-99%', value: data.profileHealth.high, color: '#22c55e', filter: { profileHealth: 'high' } },
            { label: '50-79%', value: data.profileHealth.medium, color: '#f59e0b', filter: { profileHealth: 'medium' } },
            { label: '<50%', value: data.profileHealth.low, color: '#ef4444', filter: { profileHealth: 'low' } },
          ]}
          onBarClick={onSegmentClick}
        />
      </div>

      {/* Signup Trend */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Signup Trend (12 wks)</h3>
        <Sparkline data={data.signupTrend} />
      </div>
    </div>
  );
};

export default AnalyticsCharts;
