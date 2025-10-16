/**
 * Professional INEC Voters Table - Built for Scale
 * Handles millions of records with efficient pagination and filtering
 */

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Phone, Mail, CheckCircle, XCircle, Users, MapPin,
  SortAsc, SortDesc
} from 'lucide-react';
import { useINECVoters, useINECVotersStats, type VoterFilters, type INECVoter } from '../../hooks/useINECVoters';

interface INECVotersTableProps {
  className?: string;
  onVoterSelect?: (voter: INECVoter) => void;
  selectable?: boolean;
  showStats?: boolean;
}

const INECVotersTable: React.FC<INECVotersTableProps> = ({
  className = '',
  onVoterSelect,
  selectable = false,
  showStats = true
}) => {
  // State for filters and pagination
  const [filters, setFilters] = useState<VoterFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoters, setSelectedVoters] = useState<Set<string>>(new Set());

  // Data hooks
  const { voters, pagination, loading, error, refetch } = useINECVoters(
    { ...filters, search: searchTerm },
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

  // Render functions
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ?
      <SortAsc className="w-4 h-4 ml-1" /> :
      <SortDesc className="w-4 h-4 ml-1" />;
  };

  const renderStats = () => {
    if (!showStats || !stats) return null;

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
    if (!showFilters) return null;

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
            <input
              type="text"
              placeholder="Filter by Ward"
              value={filters.ward || ''}
              onChange={(e) => handleFilterChange('ward', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Status</label>
            <select
              value={filters.has_phone?.toString() || ''}
              onChange={(e) => handleFilterChange('has_phone', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="true">Has Phone</option>
              <option value="false">No Phone</option>
            </select>
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
              setFilters({});
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

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Statistics */}
      {renderStats()}

      {/* Header with Search and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">INEC Voters Database</h2>
            <p className="text-sm text-gray-600">
              {pagination ? `${formatNumber(pagination.total_records)} total records` : 'Loading...'}
            </p>
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md border ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600'} hover:bg-gray-50`}
            >
              <Filter className="w-4 h-4" />
            </button>

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
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
                onClick={() => handleSort('first_name')}
              >
                <div className="flex items-center">
                  Name
                  {renderSortIcon('first_name')}
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
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={selectable ? 8 : 7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-3" />
                    <span className="text-gray-500">Loading voters...</span>
                  </div>
                </td>
              </tr>
            ) : voters.length === 0 ? (
              <tr>
                <td colSpan={selectable ? 8 : 7} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No voters found</h3>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
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
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.page_size, pagination.total_records)} of{' '}
              {formatNumber(pagination.total_records)} results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_previous_page}
                className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-700">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next_page}
                className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectable && selectedVoters.size > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedVoters.size} voter{selectedVoters.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedVoters(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800"
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