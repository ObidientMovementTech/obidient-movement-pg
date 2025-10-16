import React, { useState, useEffect } from 'react';
import { X, Search, User, MapPin } from 'lucide-react';
import { callCenterService, type Volunteer, type PollingUnit } from '../../services/callCenterService';

interface VolunteerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: () => void;
}

// Interface definitions now imported from service

const VolunteerAssignmentModal: React.FC<VolunteerAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssignmentComplete
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

  useEffect(() => {
    if (isOpen) {
      fetchVolunteers();
      fetchAvailablePollingUnits();
    }
  }, [isOpen]);

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
        volunteerId: selectedVolunteer.id,
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Volunteer to Polling Unit
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volunteer Selection */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Select Volunteer
                  </h4>

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
                </div>

                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-[#006837] mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading volunteers...</p>
                    </div>
                  ) : filteredVolunteers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No available volunteers found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredVolunteers.map((volunteer) => (
                        <div
                          key={volunteer.id}
                          onClick={() => setSelectedVolunteer(volunteer)}
                          className={`p-3 cursor-pointer transition-colors ${selectedVolunteer?.id === volunteer.id
                            ? 'bg-[#006837] text-white'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedVolunteer?.id === volunteer.id
                                ? 'bg-white bg-opacity-20'
                                : 'bg-gray-200'
                                }`}>
                                <User className={`w-4 h-4 ${selectedVolunteer?.id === volunteer.id
                                  ? 'text-white'
                                  : 'text-gray-500'
                                  }`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${selectedVolunteer?.id === volunteer.id
                                ? 'text-white'
                                : 'text-gray-900'
                                }`}>
                                {volunteer.name}
                              </p>
                              <p className={`text-xs truncate ${selectedVolunteer?.id === volunteer.id
                                ? 'text-white text-opacity-80'
                                : 'text-gray-500'
                                }`}>
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
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
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

                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredPollingUnits.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No available polling units found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredPollingUnits.map((unit, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedPollingUnit(unit)}
                          className={`p-3 cursor-pointer transition-colors ${selectedPollingUnit === unit
                            ? 'bg-[#006837] text-white'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPollingUnit === unit
                                ? 'bg-white bg-opacity-20'
                                : 'bg-gray-200'
                                }`}>
                                <MapPin className={`w-4 h-4 ${selectedPollingUnit === unit
                                  ? 'text-white'
                                  : 'text-gray-500'
                                  }`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${selectedPollingUnit === unit
                                ? 'text-white'
                                : 'text-gray-900'
                                }`}>
                                {unit.polling_unit}
                              </p>
                              <p className={`text-xs truncate ${selectedPollingUnit === unit
                                ? 'text-white text-opacity-80'
                                : 'text-gray-500'
                                }`}>
                                {unit.ward}, {unit.lga}
                              </p>
                              <p className={`text-xs ${selectedPollingUnit === unit
                                ? 'text-white text-opacity-80'
                                : 'text-gray-500'
                                }`}>
                                {unit.voter_count} voters
                              </p>
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
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Assignment Summary</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Volunteer:</span> {selectedVolunteer.name}</p>
                  <p><span className="font-medium">Polling Unit:</span> {selectedPollingUnit.polling_unit}</p>
                  <p><span className="font-medium">Location:</span> {selectedPollingUnit.ward}, {selectedPollingUnit.lga}, {selectedPollingUnit.state}</p>
                  <p><span className="font-medium">Voters to Contact:</span> {selectedPollingUnit.voter_count}</p>
                  {selectedPollingUnit.polling_unit_code && (
                    <p><span className="font-medium">Polling Unit Code:</span> {selectedPollingUnit.polling_unit_code}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              disabled={assigning}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleAssignVolunteer}
              disabled={!selectedVolunteer || !selectedPollingUnit || assigning}
              className="px-4 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {assigning && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              )}
              {assigning ? 'Assigning...' : 'Assign Volunteer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAssignmentModal;