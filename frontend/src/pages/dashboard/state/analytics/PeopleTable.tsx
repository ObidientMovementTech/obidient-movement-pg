import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Copy, ChevronLeft, ChevronRight, ArrowUpDown, Check } from 'lucide-react';
import type { PersonRow, PeopleFilters, PaginationData } from './types';
import PersonProfileModal from './PersonProfileModal';

interface PeopleTableProps {
  people: PersonRow[];
  pagination: PaginationData;
  filters: PeopleFilters;
  loading: boolean;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: PeopleFilters) => void;
  onExport: () => void;
}

const GENDER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'unknown', label: 'Not set' },
];

const AGE_OPTIONS = [
  { value: '', label: 'All' },
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65', label: '65+' },
];

const PVC_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Yes', label: 'Has PVC' },
  { value: 'No', label: 'No PVC' },
];

const WILL_VOTE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Yes', label: 'Will vote' },
  { value: 'No', label: "Won't" },
  { value: 'unknown', label: 'Unknown' },
];

const PROFILE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'complete', label: '100%' },
  { value: 'high', label: '80%+' },
  { value: 'medium', label: '50%+' },
  { value: 'low', label: '<50%' },
];

const ACTIVITY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active (30d)' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'dormant', label: 'Dormant (90d+)' },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const PeopleTable: React.FC<PeopleTableProps> = ({
  people,
  pagination,
  filters,
  loading,
  onPageChange,
  onFiltersChange,
  onExport,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonRow | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, search: value || undefined });
    }, 300);
  };

  const updateFilter = (key: keyof PeopleFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const toggleSort = (column: string) => {
    const isSame = filters.sortBy === column;
    onFiltersChange({
      ...filters,
      sortBy: column,
      sortDir: isSame && filters.sortDir === 'asc' ? 'desc' : 'asc'
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === people.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(people.map(p => p.id)));
    }
  };

  const copyPhones = () => {
    const phones = people
      .filter(p => selectedIds.has(p.id) && p.phone)
      .map(p => p.phone)
      .join('\n');
    navigator.clipboard.writeText(phones);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SortIcon = ({ col }: { col: string }) => (
    <ArrowUpDown className={`w-3 h-3 inline ml-0.5 ${filters.sortBy === col ? 'text-green-600' : 'text-gray-300'}`} />
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Filter bar */}
      <div className="p-3 sm:p-4 border-b border-gray-100 space-y-3">
        {/* Search + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search name or phone…"
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            />
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={copyPhones}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : `Copy ${selectedIds.size} phones`}
            </button>
          )}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect label="Gender" value={filters.gender || ''} options={GENDER_OPTIONS} onChange={v => updateFilter('gender', v)} />
          <FilterSelect label="Age" value={filters.ageRange || ''} options={AGE_OPTIONS} onChange={v => updateFilter('ageRange', v)} />
          <FilterSelect label="PVC" value={filters.pvc || ''} options={PVC_OPTIONS} onChange={v => updateFilter('pvc', v)} />
          <FilterSelect label="Will Vote" value={filters.willVote || ''} options={WILL_VOTE_OPTIONS} onChange={v => updateFilter('willVote', v)} />
          <FilterSelect label="Profile" value={filters.profileHealth || ''} options={PROFILE_OPTIONS} onChange={v => updateFilter('profileHealth', v)} />
          <FilterSelect label="Activity" value={filters.activity || ''} options={ACTIVITY_OPTIONS} onChange={v => updateFilter('activity', v)} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-3 py-2.5 text-left w-10">
                <input
                  type="checkbox"
                  checked={people.length > 0 && selectedIds.size === people.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </th>
              <th className="px-3 py-2.5 text-left w-[28%] cursor-pointer hover:text-green-700" onClick={() => toggleSort('name')}>
                Name <SortIcon col="name" />
              </th>
              <th className="px-3 py-2.5 text-left w-[18%] hidden sm:table-cell">Phone</th>
              <th className="px-3 py-2.5 text-left cursor-pointer hover:text-green-700 hidden md:table-cell" onClick={() => toggleSort('gender')}>
                Gender <SortIcon col="gender" />
              </th>
              <th className="px-3 py-2.5 text-left cursor-pointer hover:text-green-700 hidden md:table-cell" onClick={() => toggleSort('ageRange')}>
                Age <SortIcon col="ageRange" />
              </th>
              <th className="px-3 py-2.5 text-center cursor-pointer hover:text-green-700" onClick={() => toggleSort('pvc')}>
                PVC <SortIcon col="pvc" />
              </th>
              <th className="px-3 py-2.5 text-center hidden sm:table-cell cursor-pointer hover:text-green-700" onClick={() => toggleSort('willVote')}>
                Vote <SortIcon col="willVote" />
              </th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">LGA</th>
              <th className="px-3 py-2.5 text-center hidden lg:table-cell cursor-pointer hover:text-green-700" onClick={() => toggleSort('profile')}>
                Profile <SortIcon col="profile" />
              </th>
              <th className="px-3 py-2.5 text-left hidden xl:table-cell cursor-pointer hover:text-green-700" onClick={() => toggleSort('lastActive')}>
                Active <SortIcon col="lastActive" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-3" colSpan={10}>
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : people.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-12 text-center text-gray-400 text-sm">
                  No members match the current filters
                </td>
              </tr>
            ) : (
              people.map(person => (
                <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(person.id)}
                      onChange={() => toggleSelect(person.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setSelectedPerson(person)}
                      className="font-medium text-gray-900 hover:text-green-700 hover:underline truncate block text-left w-full"
                      title={person.name}
                    >
                      {person.name}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell font-mono text-xs truncate">{person.phone || '—'}</td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    <GenderBadge gender={person.gender} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs hidden md:table-cell">{person.ageRange?.split(' ')[0] || '—'}</td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusBadge value={person.isVoter} yes="✓" no="✗" />
                  </td>
                  <td className="px-3 py-2.5 text-center hidden sm:table-cell">
                    <StatusBadge value={person.willVote} yes="✓" no="✗" />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 hidden lg:table-cell max-w-[100px] truncate">{person.votingLGA || '—'}</td>
                  <td className="px-3 py-2.5 hidden lg:table-cell">
                    <ProfileBar pct={person.profileCompletionPercentage} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 hidden xl:table-cell">{timeAgo(person.lastActive)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-gray-700 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Person Profile Modal */}
      <PersonProfileModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
};

// ─── Small UI components ───

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-green-200 transition-colors ${value ? 'border-green-300 bg-green-50 text-green-700 font-medium' : 'border-gray-200 bg-white text-gray-600'}`}
    >
      <option value="" disabled hidden>{label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function GenderBadge({ gender }: { gender: string | null }) {
  if (!gender || gender === '') return <span className="text-xs text-gray-300">—</span>;
  const isM = gender === 'Male';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isM ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
      {isM ? 'M' : 'F'}
    </span>
  );
}

function StatusBadge({ value, yes, no }: { value: string | null; yes: string; no: string }) {
  if (value === 'Yes') return <span className="text-green-600 font-bold text-xs">{yes}</span>;
  if (value === 'No') return <span className="text-red-500 font-bold text-xs">{no}</span>;
  return <span className="text-gray-300 text-xs">—</span>;
}

function ProfileBar({ pct }: { pct: number }) {
  const color = pct === 100 ? 'bg-green-500' : pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 font-medium">{pct}%</span>
    </div>
  );
}

export default PeopleTable;
