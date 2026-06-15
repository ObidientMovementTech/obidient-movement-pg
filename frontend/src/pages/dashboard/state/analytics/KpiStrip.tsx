import React from 'react';
import { Users, CreditCard, Vote, Activity, CheckCircle } from 'lucide-react';
import type { DemographicsData } from './types';

interface KpiStripProps {
  kpis: DemographicsData['kpis'];
  onKpiClick: (filter: Record<string, string>) => void;
}

const KPI_CARDS = [
  { key: 'total', label: 'Total Members', icon: Users, color: 'bg-blue-50 text-blue-600', filter: {} },
  { key: 'hasPvc', label: 'Has PVC', icon: CreditCard, color: 'bg-green-50 text-green-600', filter: { pvc: 'Yes' } },
  { key: 'noPvc', label: 'No PVC', icon: CreditCard, color: 'bg-red-50 text-red-600', filter: { pvc: 'No' } },
  { key: 'willVote', label: 'Will Vote', icon: Vote, color: 'bg-purple-50 text-purple-600', filter: { willVote: 'Yes' } },
  { key: 'profileComplete', label: 'Profile Complete', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', filter: { profileHealth: 'complete' } },
  { key: 'active30d', label: 'Active (30d)', icon: Activity, color: 'bg-amber-50 text-amber-600', filter: { activity: 'active' } },
] as const;

const KpiStrip: React.FC<KpiStripProps> = ({ kpis, onKpiClick }) => {
  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-5">
      {KPI_CARDS.map(card => {
        const Icon = card.icon;
        const value = kpis[card.key as keyof typeof kpis];
        return (
          <button
            key={card.key}
            onClick={() => onKpiClick(card.filter)}
            className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 text-left hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-none mb-0.5">
              {formatNum(value)}
            </p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              {card.label}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default KpiStrip;
