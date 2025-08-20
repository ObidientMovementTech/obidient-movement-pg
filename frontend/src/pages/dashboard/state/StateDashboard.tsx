import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  TrendingUp,
  Shield,
  Award,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Building,
  Home
} from 'lucide-react';
import stateDashboardService from '../../../services/stateDashboardService';
import {
  StateDashboardResponse,
  NationalDashboardData,
  StateDashboardData,
  LGADashboardData,
  WardDashboardData,
  SubordinateCoordinator
} from '../../../types/stateDashboard';

const StateDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StateDashboardResponse | null>(null);
  const [subordinates, setSubordinates] = useState<SubordinateCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [expandedLGAs, setExpandedLGAs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDashboardData();
    fetchSubordinates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await stateDashboardService.getDashboardData();
      setDashboardData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubordinates = async () => {
    try {
      const response = await stateDashboardService.getSubordinateCoordinators();
      setSubordinates(response.data);
    } catch (err: any) {
      console.error('Failed to fetch subordinates:', err);
    }
  };

  const toggleStateExpansion = (state: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(state)) {
      newExpanded.delete(state);
    } else {
      newExpanded.add(state);
    }
    setExpandedStates(newExpanded);
  };

  const toggleLGAExpansion = (lga: string) => {
    const newExpanded = new Set(expandedLGAs);
    if (newExpanded.has(lga)) {
      newExpanded.delete(lga);
    } else {
      newExpanded.add(lga);
    }
    setExpandedLGAs(newExpanded);
  };

  const getDesignationIcon = (designation: string) => {
    switch (designation) {
      case 'National Coordinator':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'State Coordinator':
        return <Building className="w-5 h-5 text-blue-600" />;
      case 'LGA Coordinator':
        return <Home className="w-5 h-5 text-green-600" />;
      case 'Ward Coordinator':
        return <MapPin className="w-5 h-5 text-orange-600" />;
      case 'Polling Unit Agents':
        return <UserCheck className="w-5 h-5 text-indigo-600" />;
      case 'Vote Defenders':
        return <Award className="w-5 h-5 text-red-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case 'National Coordinator':
        return 'bg-purple-100 text-purple-800';
      case 'State Coordinator':
        return 'bg-blue-100 text-blue-800';
      case 'LGA Coordinator':
        return 'bg-green-100 text-green-800';
      case 'Ward Coordinator':
        return 'bg-orange-100 text-orange-800';
      case 'Polling Unit Agents':
        return 'bg-indigo-100 text-indigo-800';
      case 'Vote Defenders':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNationalDashboard = (data: NationalDashboardData) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalMembers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active States</p>
              <p className="text-2xl font-bold text-gray-900">{data.states.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Coordinators</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.states.reduce((sum, state) =>
                  sum + Number(state.state_coordinators) + Number(state.lga_coordinators) + Number(state.ward_coordinators), 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">States Overview</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.states.map((state) => (
              <div key={state.state} className="border rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStateExpansion(state.state)}
                >
                  <div className="flex items-center space-x-3">
                    {expandedStates.has(state.state) ?
                      <ChevronDown className="w-5 h-5 text-gray-500" /> :
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    }
                    <Building className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{state.state}</span>
                  </div>
                  <span className="text-sm text-gray-500">{state.total_members} members</span>
                </div>

                {expandedStates.has(state.state) && (
                  <div className="mt-4 pl-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">State Coords</p>
                      <p className="font-semibold text-blue-600">{state.state_coordinators}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">LGA Coords</p>
                      <p className="font-semibold text-green-600">{state.lga_coordinators}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Ward Coords</p>
                      <p className="font-semibold text-orange-600">{state.ward_coordinators}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Polling Agents</p>
                      <p className="font-semibold text-indigo-600">{state.polling_agents}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Vote Defenders</p>
                      <p className="font-semibold text-red-600">{state.vote_defenders}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStateDashboard = (data: StateDashboardData) => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data.state} State</h2>
              <p className="text-sm text-gray-500">{data.totalMembers} total members across {data.lgas.length} LGAs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">LGAs Overview</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.lgas.map((lga) => (
              <div key={lga.lga} className="border rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleLGAExpansion(lga.lga)}
                >
                  <div className="flex items-center space-x-3">
                    {expandedLGAs.has(lga.lga) ?
                      <ChevronDown className="w-5 h-5 text-gray-500" /> :
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    }
                    <Home className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">{lga.lga}</span>
                  </div>
                  <span className="text-sm text-gray-500">{lga.total_members} members</span>
                </div>

                {expandedLGAs.has(lga.lga) && (
                  <div className="mt-4 pl-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">LGA Coords</p>
                      <p className="font-semibold text-green-600">{lga.lga_coordinators}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Ward Coords</p>
                      <p className="font-semibold text-orange-600">{lga.ward_coordinators}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Polling Agents</p>
                      <p className="font-semibold text-indigo-600">{lga.polling_agents}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Vote Defenders</p>
                      <p className="font-semibold text-red-600">{lga.vote_defenders}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLGADashboard = (data: LGADashboardData) => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3">
          <Home className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{data.lga} LGA</h2>
            <p className="text-sm text-gray-500">{data.state} State • {data.totalMembers} total members across {data.wards.length} wards</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Wards Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.wards.map((ward) => (
              <div key={ward.ward} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">{ward.ward}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Members:</span>
                    <span className="font-semibold">{ward.total_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ward Coords:</span>
                    <span className="font-semibold text-orange-600">{ward.ward_coordinators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Polling Agents:</span>
                    <span className="font-semibold text-indigo-600">{ward.polling_agents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Vote Defenders:</span>
                    <span className="font-semibold text-red-600">{ward.vote_defenders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWardDashboard = (data: WardDashboardData) => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{data.ward} Ward</h2>
            <p className="text-sm text-gray-500">{data.lga} LGA, {data.state} State • {data.totalMembers} total members</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ward Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDesignationIcon(member.designation)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDesignationColor(member.designation)}`}>
                        {member.designation}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.phoneNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <Shield className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Data Available</h3>
          <p className="mt-1 text-sm text-gray-500">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const { userDesignation, assignedLocation, dashboardData: data } = dashboardData.data;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            {getDesignationIcon(userDesignation)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">State Dashboard</h1>
              <p className="text-sm text-gray-500">
                {userDesignation} • {assignedLocation.state || 'National'}
                {assignedLocation.lga && ` • ${assignedLocation.lga}`}
                {assignedLocation.ward && ` • ${assignedLocation.ward}`}
              </p>
            </div>
          </div>
        </div>

        {userDesignation === 'National Coordinator' && renderNationalDashboard(data as NationalDashboardData)}
        {userDesignation === 'State Coordinator' && renderStateDashboard(data as StateDashboardData)}
        {userDesignation === 'LGA Coordinator' && renderLGADashboard(data as LGADashboardData)}
        {userDesignation === 'Ward Coordinator' && renderWardDashboard(data as WardDashboardData)}

        {subordinates.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Subordinate Coordinators</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subordinates.map((subordinate) => (
                  <div key={subordinate.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      {getDesignationIcon(subordinate.designation)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {subordinate.firstName} {subordinate.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{subordinate.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDesignationColor(subordinate.designation)}`}>
                        {subordinate.designation}
                      </span>
                      {subordinate.assignedState && (
                        <p className="text-sm text-gray-600">
                          {subordinate.assignedState}
                          {subordinate.assignedLGA && ` • ${subordinate.assignedLGA}`}
                          {subordinate.assignedWard && ` • ${subordinate.assignedWard}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateDashboard;
