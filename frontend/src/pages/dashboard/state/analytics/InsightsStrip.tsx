import React from 'react';
import { AlertTriangle, Ghost, Trophy, MapPinOff, Users, Baby, MapPin } from 'lucide-react';
import type { DemographicsData } from './types';

interface InsightsStripProps {
  insights: DemographicsData['insights'];
  onInsightClick: (filter: Record<string, string>) => void;
}

const InsightsStrip: React.FC<InsightsStripProps> = ({ insights, onInsightClick }) => {
  const items = ([
    {
      show: insights.needsAttention > 0,
      icon: AlertTriangle,
      label: `${insights.needsAttention} need outreach`,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      filter: { pvc: 'No', profileHealth: 'low' } as Record<string, string>,
    },
    {
      show: insights.ghosts > 0,
      icon: Ghost,
      label: `${insights.ghosts} dormant`,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      filter: { activity: 'dormant' } as Record<string, string>,
    },
    {
      show: insights.champions > 0,
      icon: Trophy,
      label: `${insights.champions} champions`,
      color: 'text-green-600 bg-green-50 border-green-100',
      filter: { pvc: 'Yes', willVote: 'Yes', profileHealth: 'complete' } as Record<string, string>,
    },
    {
      show: insights.noLocation > 0,
      icon: MapPinOff,
      label: `${insights.noLocation} missing LGA`,
      color: 'text-red-600 bg-red-50 border-red-100',
      filter: { profileHealth: 'low' } as Record<string, string>,
    },
    {
      show: (insights.noStateCount || 0) > 0,
      icon: MapPin,
      label: `${insights.noStateCount} no state set`,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
      filter: { _scope: 'noState' } as Record<string, string>,
    },
    {
      show: insights.genderGapAlert,
      icon: Users,
      label: 'Low female rep (<15%)',
      color: 'text-pink-600 bg-pink-50 border-pink-100',
      filter: { gender: 'Female' } as Record<string, string>,
    },
    {
      show: insights.youthGapAlert,
      icon: Baby,
      label: 'Low youth (<8%)',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      filter: { ageRange: '18-24' } as Record<string, string>,
    },
  ]).filter(i => i.show);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => onInsightClick(item.filter)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${item.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default InsightsStrip;
