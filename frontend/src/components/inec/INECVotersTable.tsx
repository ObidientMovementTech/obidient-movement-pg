/**
 * Professional INEC Voters Table - Built for Scale
 * Handles millions of records with efficient pagination and filtering
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Phone, Mail, CheckCircle, XCircle, Users, MapPin, PhoneCall,
  SortAsc, SortDesc
} from 'lucide-react';
import { useINECVoters, useINECVotersStats, type VoterFilters, type INECVoter } from '../../hooks/useINECVoters';

interface INECVotersTableProps {
  className?: string;
  onVoterSelect?: (voter: INECVoter) => void;
  selectable?: boolean;
  showStats?: boolean;
  lockedFilters?: Partial<VoterFilters>;
  title?: string;
  subtitle?: string;
  minimalView?: boolean;
}

const INECVotersTable: React.FC<INECVotersTableProps> = ({
  className = '',
  onVoterSelect,
  selectable = false,
  showStats = true,
  lockedFilters,
  title,
  subtitle,
  minimalView = false
}) => {
  // State for filters and pagination
  const [filters, setFilters] = useState<VoterFilters>(lockedFilters ? { ...lockedFilters } : {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState(minimalView ? 'full_name' : 'created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoters, setSelectedVoters] = useState<Set<string>>(new Set());

  // Ensure locked filters stay in sync with navigation changes
  useEffect(() => {
    if (lockedFilters) {
      setFilters(prev => ({ ...prev, ...lockedFilters }));
    }
  }, [lockedFilters]);

  const effectiveFilters = useMemo(() => ({
    ...filters,
    ...(lockedFilters || {})
  }), [filters, lockedFilters]);

  // Data hooks
  const { voters, pagination, loading, error, refetch, hasLoaded } = useINECVoters(
    { ...effectiveFilters, search: searchTerm },
    page,
    pageSize,
    sortBy,
    sortOrder
  );

  const { stats } = useINECVotersStats();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle sort change
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof VoterFilters, value: any) => {
    if (lockedFilters && Object.prototype.hasOwnProperty.call(lockedFilters, key)) {
      return; // Prevent overriding locked filters
    }
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedVoters(new Set()); // Clear selections on page change
  };

  // Handle voter selection
  const handleVoterToggle = (voterId: string) => {
    const newSelected = new Set(selectedVoters);
    if (newSelected.has(voterId)) {
      newSelected.delete(voterId);
    } else {
      newSelected.add(voterId);
    }
    setSelectedVoters(newSelected);
  };

  // Format functions
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';
    // Format Nigerian phone numbers
    if (phone.startsWith('234')) {
      return `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
    }
    return phone;
  };
  const getDialableNumber = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('234')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
    return cleaned.startsWith('234') ? `+${cleaned}` : cleaned;
  };
  const formatDisplayName = (voter: INECVoter) => {
    if (voter.full_name && voter.full_name.trim()) return voter.full_name;
    const parts = [voter.first_name, voter.last_name].filter(Boolean);
    if (parts.length) return parts.join(' ');
    if (voter.other_names) return voter.other_names;
    return 'Name not captured';
  };

  const columnCount = selectable
    ? (minimalView ? 4 : 8)
    : (minimalView ? 3 : 7);

  const handleCallLaunch = (phone?: string) => {
    if (!phone || typeof window === 'undefined') return;
    const dialable = getDialableNumber(phone);
    if (!dialable) return;
    window.open(`tel:${dialable}`);
  };

  // Render functions
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ?
      <SortAsc className="w-4 h-4 ml-1" /> :
      <SortDesc className="w-4 h-4 ml-1" />;
  };

  const renderStats = () => {
    if (minimalView || !showStats || !stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Voters</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatNumber(stats.overview.total_voters)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Phone className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">With Phone</p>
              <p className="text-2xl font-bold text-green-900">
                {formatNumber(stats.overview.voters_with_phone)}
              </p>
              <p className="text-xs text-green-700">{stats.overview.phone_coverage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Confirmed</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatNumber(stats.overview.confirmed_voters)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Locations</p>
              <p className="text-lg font-bold text-orange-900">
                {stats.geographic.total_lgas} LGAs
              </p>
              <p className="text-xs text-orange-700">
                {formatNumber(stats.geographic.total_polling_units)} Polling Units
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    if (minimalView || !showFilters) return null;

    const isLocked = (key: keyof VoterFilters) => lockedFilters && Object.prototype.hasOwnProperty.call(lockedFilters, key);

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
            <input
              type="text"
              placeholder="Filter by LGA"
              value={filters.lga || ''}
              onChange={(e) => handleFilterChange('lga', e.target.value)}
              disabled={isLocked('lga')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${isLocked('lga') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {isLocked('lga') && (
              <p className="mt-1 text-xs text-gray-500">Locked to navigation selection</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
            <input
              type="text"
              placeholder="Filter by Ward"
              value={filters.ward || ''}
              onChange={(e) => handleFilterChange('ward', e.target.value)}
              disabled={isLocked('ward')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${isLocked('ward') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {isLocked('ward') && (
              <p className="mt-1 text-xs text-gray-500">Locked to navigation selection</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Status</label>
            <select
              value={filters.has_phone?.toString() || ''}
              onChange={(e) => handleFilterChange('has_phone', e.target.value ? e.target.value === 'true' : undefined)}
              disabled={isLocked('has_phone')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${isLocked('has_phone') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">All</option>
              <option value="true">Has Phone</option>
              <option value="false">No Phone</option>
            </select>
            {isLocked('has_phone') && (
              <p className="mt-1 text-xs text-gray-500">Locked to navigation selection</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.confirmed?.toString() || ''}
              onChange={(e) => handleFilterChange('confirmed', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="true">Confirmed</option>
              <option value="false">Unconfirmed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setFilters(lockedFilters ? { ...lockedFilters } : {});
              setSearchTerm('');
              setPage(1);
            }}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tableTitle = title || 'INEC Voters Database';
  const recordSummary = pagination ? `${formatNumber(pagination.total_records)} total records` : 'Loading...';

  const renderLockedFilterChips = () => {
    if (!lockedFilters) return null;

    const entries = Object.entries(lockedFilters).filter(([, value]) => value !== undefined && value !== '');
    if (!entries.length) return null;

    const labelMap: Record<string, string> = {
      lga: 'LGA',
      ward: 'Ward',
      polling_unit: 'Polling Unit',
      has_phone: 'Has Phone',
      state: 'State'
    };

    const formatValue = (value: unknown) => {
      if (value === true) return 'Yes';
      if (value === false) return 'No';
      return String(value);
    };

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {entries.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
          >
            {labelMap[key] || key}: <span className="ml-1 font-semibold">{formatValue(value)}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Statistics */}
      {renderStats()}

      {/* Header with Search and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{tableTitle}</h2>
            <p className="text-sm text-gray-600">
              {subtitle || recordSummary}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{recordSummary}</p>
            )}
            {renderLockedFilterChips()}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search voters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
              />
            </div>

            {/* Filter Toggle */}
            {!minimalView && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md border ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600'} hover:bg-gray-50`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={200}>200 per page</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={minimalView ? "bg-white border-b border-gray-200" : "bg-gray-50"}>
            {minimalView ? (
              <tr>
                {selectable && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedVoters.size === voters.length && voters.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVoters(new Set(voters.map(v => v.id)));
                        } else {
                          setSelectedVoters(new Set());
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort('full_name')}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Voter Name</span>
                    {renderSortIcon('full_name')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>Contact</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            ) : (
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedVoters.size === voters.length && voters.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVoters(new Set(voters.map(v => v.id)));
                        } else {
                          setSelectedVoters(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('full_name')}
                >
                  <div className="flex items-center">
                    Name
                    {renderSortIcon('full_name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vin')}
                >
                  <div className="flex items-center">
                    VIN
                    {renderSortIcon('vin')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lga')}
                >
                  <div className="flex items-center">
                    Location
                    {renderSortIcon('lga')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demographics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Added
                    {renderSortIcon('created_at')}
                  </div>
                </th>
              </tr>
            )}
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columnCount} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-3" />
                    <span className="text-gray-500">Loading voters...</span>
                  </div>
                </td>
              </tr>
            ) : hasLoaded && voters.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No voters found</h3>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : minimalView ? (
              voters.map((voter, index) => (
                <tr
                  key={voter.id}
                  className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${selectedVoters.has(voter.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    } ${selectable ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (selectable) {
                      handleVoterToggle(voter.id);
                    }
                    if (onVoterSelect) {
                      onVoterSelect(voter);
                    }
                  }}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedVoters.has(voter.id)}
                        onChange={() => handleVoterToggle(voter.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {formatDisplayName(voter).charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDisplayName(voter)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className={`text-sm font-medium ${voter.phone_number ? 'text-gray-900' : 'text-gray-400'}`}>
                        {formatPhoneNumber(voter.phone_number)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {voter.phone_number && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallLaunch(voter.phone_number);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                        aria-label={`Call ${formatDisplayName(voter)}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                        Call
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              voters.map((voter) => (
                <tr
                  key={voter.id}
                  className={`hover:bg-gray-50 ${selectedVoters.has(voter.id) ? 'bg-blue-50' : ''} ${selectable ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (selectable) {
                      handleVoterToggle(voter.id);
                    }
                    if (onVoterSelect) {
                      onVoterSelect(voter);
                    }
                  }}
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVoters.has(voter.id)}
                        onChange={() => handleVoterToggle(voter.id)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {voter.first_name} {voter.last_name}
                      </div>
                      {voter.other_names && (
                        <div className="text-sm text-gray-500">{voter.other_names}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {voter.vin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={voter.phone_number ? 'text-gray-900' : 'text-gray-400'}>
                          {formatPhoneNumber(voter.phone_number)}
                        </span>
                      </div>
                      {voter.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{voter.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{voter.lga}</div>
                      <div className="text-gray-500">{voter.ward}</div>
                      <div className="text-xs text-gray-400">{voter.polling_unit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">{voter.gender}, {voter.age || 'N/A'}</div>
                      <div className="text-gray-500">{voter.occupation || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {voter.confirmed ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-yellow-500 mr-2" />
                      )}
                      <span className={`text-sm ${voter.confirmed ? 'text-green-700' : 'text-yellow-700'}`}>
                        {voter.confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    {voter.last_called && (
                      <div className="text-xs text-gray-500 mt-1">
                        Called: {formatDate(voter.last_called)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(voter.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className={`px-6 py-4 border-t ${minimalView ? 'border-gray-200 bg-gray-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{((pagination.current_page - 1) * pagination.page_size) + 1}</span> to{' '}
              <span className="font-semibold text-gray-900">{Math.min(pagination.current_page * pagination.page_size, pagination.total_records)}</span> of{' '}
              <span className="font-semibold text-gray-900">{formatNumber(pagination.total_records)}</span> voters
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_previous_page}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                Page <span className="font-bold text-gray-900">{pagination.current_page}</span> of <span className="font-bold text-gray-900">{pagination.total_pages}</span>
              </span>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next_page}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectable && selectedVoters.size > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              <span className="font-bold">{selectedVoters.size}</span> voter{selectedVoters.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedVoters(new Set())}
              className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default INECVotersTable;