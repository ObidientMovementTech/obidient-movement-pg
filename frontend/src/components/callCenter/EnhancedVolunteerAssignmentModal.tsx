import React, { useState, useEffect } from 'react';
import { X, Search, User, MapPin, AlertCircle, CheckCircle, RefreshCw, Info } from 'lucide-react';
import { callCenterService, type Volunteer, type PollingUnit } from '../../services/callCenterService';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface CurrentAssignment {
  id: number;
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  polling_unit_code: string;
  total_voters: number;
  recently_called?: number;
  confirmed_voters?: number;
  assigned_at: string;
  assigned_by_name?: string;
}

interface VolunteerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: () => void;
  preselectedUser?: User | null;
}

const VolunteerAssignmentModal: React.FC<VolunteerAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssignmentComplete,
  preselectedUser
}) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [pollingUnits, setPollingUnits] = useState<PollingUnit[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [selectedPollingUnit, setSelectedPollingUnit] = useState<PollingUnit | null>(null);
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [pollingUnitSearch, setPollingUnitSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [currentAssignment, setCurrentAssignment] = useState<CurrentAssignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (preselectedUser) {
        // Create a volunteer object from the preselected user
        const preselectedVolunteer: Volunteer = {
          id: preselectedUser.id,
          name: preselectedUser.name,
          email: preselectedUser.email,
          phone: preselectedUser.phone || '',
          state: '',
          lga: '',
          ward: '',
          polling_unit: '',
          polling_unit_code: '',
          assigned_at: '',
          is_active: false,
          assigned_by_name: '',
          voter_count: 0,
          total_calls_made: 0
        };
        setSelectedVolunteer(preselectedVolunteer);
        setVolunteers([preselectedVolunteer]);
        // Fetch current assignment for this user
        fetchUserAssignment(preselectedUser.id);
      } else {
        fetchVolunteers();
      }
      fetchAvailablePollingUnits();
    }
  }, [isOpen, preselectedUser]);

  const fetchUserAssignment = async (userId: string) => {
    setLoadingAssignment(true);
    try {
      const response = await axios.get(`${API_BASE}/call-center/volunteers`, {
        withCredentials: true
      });

      if (response.data.success) {
        // Find the volunteer's current assignment
        const volunteer = response.data.volunteers.find((v: any) => v.id === userId);
        if (volunteer && volunteer.state) {
          // User has an active assignment
          setCurrentAssignment({
            id: volunteer.assignment_id || 0,
            state: volunteer.state,
            lga: volunteer.lga,
            ward: volunteer.ward,
            polling_unit: volunteer.polling_unit,
            polling_unit_code: volunteer.polling_unit_code,
            total_voters: volunteer.voter_count || 0,
            assigned_at: volunteer.assigned_at,
            assigned_by_name: volunteer.assigned_by_name
          });
        } else {
          setCurrentAssignment(null);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch user assignment:', error);
      setCurrentAssignment(null);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await callCenterService.getVolunteers();

      if (response.success) {
        // Filter out volunteers who already have assignments
        const availableVolunteers = response.volunteers.filter(
          (v: any) => !v.assignment_id
        );
        setVolunteers(availableVolunteers);
      }
    } catch (error: any) {
      console.error('Failed to fetch volunteers:', error);
      setError('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePollingUnits = async () => {
    try {
      const response = await callCenterService.getAvailablePollingUnits();

      if (response.success) {
        setPollingUnits(response.pollingUnits);
      }
    } catch (error: any) {
      console.error('Failed to fetch polling units:', error);
      setError('Failed to load polling units');
    }
  };

  const handleAssignVolunteer = async () => {
    if (!selectedVolunteer || !selectedPollingUnit) {
      setError('Please select both a volunteer and a polling unit');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      const response = await callCenterService.assignVolunteer({
        userId: selectedVolunteer.id, // Use userId instead of volunteerId for direct user assignment
        state: selectedPollingUnit.state,
        lga: selectedPollingUnit.lga,
        ward: selectedPollingUnit.ward,
        pollingUnit: selectedPollingUnit.polling_unit,
        pollingUnitCode: selectedPollingUnit.polling_unit_code
      });

      if (response.success) {
        onAssignmentComplete();
        handleClose();
      }
    } catch (error: any) {
      console.error('Assignment failed:', error);
      setError(error.response?.data?.message || 'Failed to assign volunteer');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedVolunteer(null);
    setSelectedPollingUnit(null);
    setVolunteerSearch('');
    setPollingUnitSearch('');
    setError('');
    setCurrentAssignment(null);
    setIsReassigning(false);
    onClose();
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(volunteerSearch.toLowerCase())
  );

  const filteredPollingUnits = pollingUnits.filter(unit =>
    unit.polling_unit.toLowerCase().includes(pollingUnitSearch.toLowerCase()) ||
    unit.ward.toLowerCase().includes(pollingUnitSearch.toLowerCase()) ||
    unit.lga.toLowerCase().includes(pollingUnitSearch.toLowerCase())
  );

  if (!isOpen) return null;

  // Determine if we should show the assignment form
  const showAssignmentForm = !currentAssignment || isReassigning;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#006837] to-[#00592e]">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {preselectedUser ? `Call Center Assignment - ${preselectedUser.name}` : 'Assign Volunteer to Polling Unit'}
              </h3>
              <p className="text-sm text-white text-opacity-80 mt-1">
                {currentAssignment && !isReassigning ? 'Current Assignment Details' : 'Assign volunteer to manage voter contacts'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
            {/* Loading State */}
            {loadingAssignment ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#006837] mb-4"></div>
                <p className="text-gray-600">Loading current assignment...</p>
              </div>
            ) : (
              <>
                {/* Current Assignment Display */}
                {currentAssignment && !isReassigning && (
                  <div className="mb-6">
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-green-900 mb-3">
                              Active Assignment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-green-800 mb-1">Location</p>
                                <p className="text-sm text-green-700">
                                  <span className="font-semibold">{currentAssignment.polling_unit}</span>
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  {currentAssignment.ward}, {currentAssignment.lga}
                                </p>
                                {currentAssignment.polling_unit_code && (
                                  <p className="text-xs text-green-600">
                                    Code: {currentAssignment.polling_unit_code}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-800 mb-1">Assignment Details</p>
                                <div className="space-y-1">
                                  <p className="text-sm text-green-700">
                                    <span className="font-medium">Voters:</span> {currentAssignment.total_voters}
                                  </p>
                                  {currentAssignment.recently_called !== undefined && (
                                    <p className="text-sm text-green-700">
                                      <span className="font-medium">Recently Called:</span> {currentAssignment.recently_called}
                                    </p>
                                  )}
                                  {currentAssignment.confirmed_voters !== undefined && (
                                    <p className="text-sm text-green-700">
                                      <span className="font-medium">Confirmed:</span> {currentAssignment.confirmed_voters}
                                    </p>
                                  )}
                                  <p className="text-xs text-green-600 mt-2">
                                    Assigned: {new Date(currentAssignment.assigned_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {currentAssignment.assigned_by_name && (
                                    <p className="text-xs text-green-600">
                                      By: {currentAssignment.assigned_by_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-green-200 flex items-center justify-between">
                        <div className="flex items-center text-sm text-green-700">
                          <Info className="w-4 h-4 mr-2" />
                          <span>This user is currently assigned to a polling unit</span>
                        </div>
                        <button
                          onClick={() => setIsReassigning(true)}
                          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Change Assignment
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment Form */}
                {showAssignmentForm && (
                  <>
                    {isReassigning && (
                      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Reassigning Volunteer</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              The current assignment will be deactivated and replaced with the new assignment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Volunteer Selection */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                            <User className="w-5 h-5 mr-2 text-[#006837]" />
                            {preselectedUser ? 'Selected User' : 'Select Volunteer'}
                          </h4>

                          {!preselectedUser && (
                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search volunteers..."
                                value={volunteerSearch}
                                onChange={(e) => setVolunteerSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                              />
                            </div>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                          {preselectedUser ? (
                            <div className="p-4 bg-gradient-to-r from-[#006837] to-[#00592e] text-white">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white bg-opacity-20">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate text-white">
                                    {preselectedUser.name}
                                  </p>
                                  <p className="text-xs truncate text-white text-opacity-90">
                                    {preselectedUser.email}
                                  </p>
                                  {preselectedUser.phone && (
                                    <p className="text-xs text-white text-opacity-80">
                                      {preselectedUser.phone}
                                    </p>
                                  )}
                                </div>
                                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                              </div>
                            </div>
                          ) : loading ? (
                            <div className="p-8 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#006837] mx-auto mb-3"></div>
                              <p className="text-sm text-gray-500">Loading volunteers...</p>
                            </div>
                          ) : filteredVolunteers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm">No available volunteers found</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {filteredVolunteers.map((volunteer) => (
                                <div
                                  key={volunteer.id}
                                  onClick={() => setSelectedVolunteer(volunteer)}
                                  className={`p-3 cursor-pointer transition-all ${selectedVolunteer?.id === volunteer.id
                                      ? 'bg-[#006837] text-white'
                                      : 'hover:bg-gray-50'
                                    }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedVolunteer?.id === volunteer.id
                                            ? 'bg-white bg-opacity-20'
                                            : 'bg-gray-200'
                                          }`}
                                      >
                                        <User
                                          className={`w-4 h-4 ${selectedVolunteer?.id === volunteer.id
                                              ? 'text-white'
                                              : 'text-gray-500'
                                            }`}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-medium truncate ${selectedVolunteer?.id === volunteer.id
                                            ? 'text-white'
                                            : 'text-gray-900'
                                          }`}
                                      >
                                        {volunteer.name}
                                      </p>
                                      <p
                                        className={`text-xs truncate ${selectedVolunteer?.id === volunteer.id
                                            ? 'text-white text-opacity-80'
                                            : 'text-gray-500'
                                          }`}
                                      >
                                        {volunteer.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Polling Unit Selection */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-[#006837]" />
                            Select Polling Unit
                          </h4>

                          <div className="relative mb-3">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search polling units..."
                              value={pollingUnitSearch}
                              onChange={(e) => setPollingUnitSearch(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                            />
                          </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                          {filteredPollingUnits.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm">No available polling units found</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {filteredPollingUnits.map((unit, index) => (
                                <div
                                  key={index}
                                  onClick={() => setSelectedPollingUnit(unit)}
                                  className={`p-3 cursor-pointer transition-all ${selectedPollingUnit === unit
                                      ? 'bg-[#006837] text-white'
                                      : 'hover:bg-gray-50'
                                    }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPollingUnit === unit
                                            ? 'bg-white bg-opacity-20'
                                            : 'bg-gray-200'
                                          }`}
                                      >
                                        <MapPin
                                          className={`w-4 h-4 ${selectedPollingUnit === unit ? 'text-white' : 'text-gray-500'
                                            }`}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-medium truncate ${selectedPollingUnit === unit ? 'text-white' : 'text-gray-900'
                                          }`}
                                      >
                                        {unit.polling_unit}
                                      </p>
                                      <p
                                        className={`text-xs truncate ${selectedPollingUnit === unit
                                            ? 'text-white text-opacity-80'
                                            : 'text-gray-500'
                                          }`}
                                      >
                                        {unit.ward}, {unit.lga}
                                      </p>
                                      <div className="flex items-center mt-1 space-x-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedPollingUnit === unit
                                              ? 'bg-white bg-opacity-20 text-white'
                                              : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                          {unit.voter_count} voters
                                        </span>
                                        {unit.polling_unit_code && (
                                          <span
                                            className={`text-xs ${selectedPollingUnit === unit
                                                ? 'text-white text-opacity-70'
                                                : 'text-gray-500'
                                              }`}
                                          >
                                            {unit.polling_unit_code}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assignment Summary */}
                    {selectedVolunteer && selectedPollingUnit && (
                      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                          {isReassigning ? 'New Assignment Summary' : 'Assignment Summary'}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-900">Volunteer:</span> {selectedVolunteer.name}</p>
                            <p><span className="font-medium text-gray-900">Email:</span> {selectedVolunteer.email}</p>
                          </div>
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-900">Polling Unit:</span> {selectedPollingUnit.polling_unit}</p>
                            <p><span className="font-medium text-gray-900">Location:</span> {selectedPollingUnit.ward}, {selectedPollingUnit.lga}</p>
                            <p><span className="font-medium text-gray-900">Voters:</span> <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{selectedPollingUnit.voter_count}</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {currentAssignment && !isReassigning ? (
                <span className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Assignment is active
                </span>
              ) : (
                <span className="text-gray-500">Select both volunteer and polling unit to proceed</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isReassigning && (
                <button
                  onClick={() => {
                    setIsReassigning(false);
                    setSelectedPollingUnit(null);
                    setError('');
                  }}
                  disabled={assigning}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Cancel Reassignment
                </button>
              )}

              {!currentAssignment || isReassigning ? (
                <>
                  <button
                    onClick={handleClose}
                    disabled={assigning}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAssignVolunteer}
                    disabled={!selectedVolunteer || !selectedPollingUnit || assigning}
                    className="px-5 py-2 bg-gradient-to-r from-[#006837] to-[#00592e] text-white rounded-lg hover:from-[#00592e] hover:to-[#004723] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all shadow-md hover:shadow-lg"
                  >
                    {assigning && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    )}
                    {assigning ? 'Assigning...' : isReassigning ? 'Reassign Volunteer' : 'Assign to Call Center'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleClose}
                  className="px-5 py-2 bg-gradient-to-r from-[#006837] to-[#00592e] text-white rounded-lg hover:from-[#00592e] hover:to-[#004723] transition-all shadow-md hover:shadow-lg"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAssignmentModal;