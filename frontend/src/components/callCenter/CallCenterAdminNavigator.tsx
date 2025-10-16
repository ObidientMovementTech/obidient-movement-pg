
import React, { useState } from 'react';
import { ChevronRight, MapPin, Users, Phone, ArrowLeft, Search, TrendingUp, CheckCircle, Database } from 'lucide-react';
import INECVotersTable from '../inec/INECVotersTable';
import { useLocationHierarchy, useINECVotersStats } from '../../hooks/useINECVoters';

type NavigationLevel = 'overview' | 'state' | 'lga' | 'ward' | 'polling_unit' | 'voters';

interface NavigationPath {
  level: NavigationLevel;
  state?: string;
  lga?: string;
  ward?: string;
  polling_unit?: string;
}

const CallCenterAdminNavigator: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<NavigationPath>({ level: 'overview' });
  const [searchTerm, setSearchTerm] = useState('');

  // Use hooks based on current level
  const { stats, loading: statsLoading } = useINECVotersStats();

  // Load LGAs
  const {
    locations: lgas,
    loading: lgasLoading
  } = useLocationHierarchy('lga');

  // Load Wards (only when LGA is selected)
  const {
    locations: wards,
    loading: wardsLoading
  } = useLocationHierarchy('ward', currentPath.lga);

  // Load Polling Units (only when Ward is selected)
  const {
    locations: pollingUnits,
    loading: pollingUnitsLoading
  } = useLocationHierarchy('polling_unit', currentPath.lga, currentPath.ward);

  const isLoading = lgasLoading || wardsLoading || pollingUnitsLoading || statsLoading;

  // Navigation functions
  const navigateToState = () => {
    setCurrentPath({ level: 'state' });
  };

  const navigateToLGA = (lga: string) => {
    setCurrentPath({
      level: 'lga',
      state: 'Anambra',
      lga
    });
  };

  const navigateToWard = (ward: string) => {
    setCurrentPath({
      ...currentPath,
      level: 'ward',
      ward
    });
  };

  const navigateToPollingUnit = (pollingUnit: string) => {
    setCurrentPath({
      ...currentPath,
      level: 'polling_unit',
      polling_unit: pollingUnit
    });
  };

  const navigateToVoters = () => {
    setCurrentPath({
      ...currentPath,
      level: 'voters'
    });
  };

  const navigateBack = () => {
    switch (currentPath.level) {
      case 'state':
        setCurrentPath({ level: 'overview' });
        break;
      case 'lga':
        setCurrentPath({ level: 'state' });
        break;
      case 'ward':
        setCurrentPath({
          level: 'lga',
          state: currentPath.state,
          lga: currentPath.lga
        });
        break;
      case 'polling_unit':
        setCurrentPath({
          level: 'ward',
          state: currentPath.state,
          lga: currentPath.lga,
          ward: currentPath.ward
        });
        break;
      case 'voters':
        setCurrentPath({
          level: 'polling_unit',
          state: currentPath.state,
          lga: currentPath.lga,
          ward: currentPath.ward,
          polling_unit: currentPath.polling_unit
        });
        break;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getBreadcrumb = () => {
    const breadcrumb: string[] = [];

    if (currentPath.level === 'overview') return ['Overview'];

    breadcrumb.push('Anambra State');
    if (currentPath.lga) breadcrumb.push(currentPath.lga);
    if (currentPath.ward) breadcrumb.push(currentPath.ward);
    if (currentPath.polling_unit) breadcrumb.push(currentPath.polling_unit);
    if (currentPath.level === 'voters') breadcrumb.push('Voters');

    return breadcrumb;
  };

  const filterLocations = (locations: any[]) => {
    if (!searchTerm) return locations;

    return locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Overview Level - Dashboard
  const renderOverview = () => {
    if (!stats) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">INEC Voter Database</h2>
          <p className="text-blue-100">Comprehensive voter management and call center navigation</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Voters</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.overview.total_voters)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Phone</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {formatNumber(stats.overview.voters_with_phone)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats.overview.phone_coverage}% coverage</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {formatNumber(stats.overview.confirmed_voters)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Verified voters</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contact Rate</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {stats.overview.contact_rate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatNumber(stats.overview.contacted_voters)} contacted</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{stats.geographic.total_lgas}</p>
              <p className="text-sm text-gray-600 mt-1">LGAs</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatNumber(stats.geographic.average_voters_per_lga)} voters/LGA
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{stats.geographic.total_wards}</p>
              <p className="text-sm text-gray-600 mt-1">Wards</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatNumber(stats.geographic.average_voters_per_ward)} voters/ward
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{formatNumber(stats.geographic.total_polling_units)}</p>
              <p className="text-sm text-gray-600 mt-1">Polling Units</p>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-700">{stats.demographics.average_age}</p>
              <p className="text-sm text-gray-600 mt-1">Average Age</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{formatNumber(stats.demographics.male_voters)}</p>
              <p className="text-sm text-gray-600 mt-1">Male ({stats.demographics.gender_distribution.male_percentage}%)</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-pink-600">{formatNumber(stats.demographics.female_voters)}</p>
              <p className="text-sm text-gray-600 mt-1">Female ({stats.demographics.gender_distribution.female_percentage}%)</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <button
            onClick={navigateToState}
            className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h4 className="font-semibold text-blue-900 text-lg">Browse by Location</h4>
                <p className="text-sm text-blue-700 mt-1">Navigate through LGAs, Wards, and Polling Units</p>
              </div>
            </div>
          </button>

          {/* <button
            onClick={() => setCurrentPath({ level: 'voters' })}
            className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h4 className="font-semibold text-green-900 text-lg">View All Voters</h4>
                <p className="text-sm text-green-700 mt-1">Access complete voter database with filters</p>
              </div>
            </div>
          </button> */}
        </div>
      </div>
    );
  };

  // State Level
  const renderStateLevel = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Anambra State</h2>
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">Total Voters</p>
              <p className="text-3xl font-bold text-blue-900">{formatNumber(stats.overview.total_voters)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Local Government Areas</p>
              <p className="text-3xl font-bold text-blue-900">{stats.geographic.total_lgas}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Local Government Areas</h3>
          <p className="text-sm text-gray-600 mt-1">{lgas.length} LGAs available</p>
        </div>
        <div className="divide-y divide-gray-200">
          {filterLocations(lgas).map((lga) => (
            <div
              key={lga.name}
              onClick={() => navigateToLGA(lga.name)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">{lga.name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatNumber(lga.child_count)} wards
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-3">
                  <p className="text-lg font-semibold text-green-600">{formatNumber(lga.voter_count)}</p>
                  <p className="text-xs text-gray-500">voters</p>
                  <p className="text-xs text-blue-600">{formatNumber(lga.voters_with_phone)} with phone</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // LGA Level
  const renderLGALevel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Wards in {currentPath.lga}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{wards.length} wards available</p>
        </div>
        <div className="divide-y divide-gray-200">
          {filterLocations(wards).map((ward) => (
            <div
              key={ward.name}
              onClick={() => navigateToWard(ward.name)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">{ward.name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatNumber(ward.child_count)} polling units
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-3">
                  <p className="text-lg font-semibold text-green-600">{formatNumber(ward.voter_count)}</p>
                  <p className="text-xs text-gray-500">voters</p>
                  <p className="text-xs text-blue-600">{formatNumber(ward.voters_with_phone)} with phone</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Ward Level
  const renderWardLevel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Polling Units in {currentPath.ward}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{pollingUnits.length} polling units available</p>
        </div>
        <div className="divide-y divide-gray-200">
          {filterLocations(pollingUnits).map((unit) => (
            <div
              key={unit.code || unit.name}
              onClick={() => navigateToPollingUnit(unit.name)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">{unit.name}</h4>
                  {unit.code && <p className="text-sm text-gray-600">Code: {unit.code}</p>}
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-3">
                  <p className="text-lg font-semibold text-green-600">{formatNumber(unit.voter_count)}</p>
                  <p className="text-xs text-gray-500">voters</p>
                  <p className="text-xs text-blue-600">{formatNumber(unit.voters_with_phone)} with phone</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Polling Unit Level
  const renderPollingUnitLevel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentPath.polling_unit} - Voter Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={navigateToVoters}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900">View All Voters</h4>
                <p className="text-sm text-blue-700">See complete voter list with contact details</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <div className="flex items-center">
              <Phone className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <h4 className="font-medium text-green-900">Start Calling Campaign</h4>
                <p className="text-sm text-green-700">Assign volunteers and start calling voters</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Voters Level - Use INECVotersTable
  const renderVotersLevel = () => {
    return (
      <div className="space-y-6">
        <INECVotersTable showStats={false} />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentPath.level === 'overview' ? 'INEC Voter Database' : 'Call Center Navigation'}
            </h1>
            <p className="text-gray-600">
              {currentPath.level === 'overview'
                ? 'Comprehensive voter management system'
                : 'Browse voters by location hierarchy'}
            </p>
          </div>

          {/* Search */}
          {currentPath.level !== 'overview' && currentPath.level !== 'voters' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        {currentPath.level !== 'overview' && (
          <nav className="flex mt-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {getBreadcrumb().map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                  <span className={`text-sm ${index === getBreadcrumb().length - 1
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                    }`}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back Button */}
        {currentPath.level !== 'overview' && (
          <button
            onClick={navigateBack}
            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && currentPath.level !== 'voters' && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Content based on current level */}
      {!isLoading && (
        <>
          {currentPath.level === 'overview' && renderOverview()}
          {currentPath.level === 'state' && renderStateLevel()}
          {currentPath.level === 'lga' && renderLGALevel()}
          {currentPath.level === 'ward' && renderWardLevel()}
          {currentPath.level === 'polling_unit' && renderPollingUnitLevel()}
          {currentPath.level === 'voters' && renderVotersLevel()}
        </>
      )}
    </div>
  );
};

export default CallCenterAdminNavigator;
