import React, { useState, useEffect } from 'react';
import { Phone, User, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import Toast from '../../components/Toast';
import { callCenterService, type Assignment, type Voter, type VoterUpdateData } from '../../services/callCenterService';

// Interface definitions now imported from service

const CallCenterVolunteer: React.FC = () => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'not_called' | 'called_recently' | 'confirmed' | 'needs_follow_up'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAssignment();
  }, []);

  useEffect(() => {
    if (assignment) {
      fetchVoters();
    }
  }, [assignment, currentPage, filter]);

  const fetchAssignment = async () => {
    try {
      const response = await callCenterService.getMyAssignment();

      if (response.success) {
        setAssignment(response.assignment);
      }
    } catch (error: any) {
      console.error('Failed to fetch assignment:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Failed to fetch assignment',
        type: 'error'
      });
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await callCenterService.getMyVoters({
        page: currentPage,
        limit: 50,
        filter: filter
      });

      if (response.success) {
        setVoters(response.voters);
        setTotalPages(response.totalPages);
      }
    } catch (error: any) {
      console.error('Failed to fetch voters:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Failed to fetch voters',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (voter: Voter) => {
    setSelectedVoter(voter);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setSelectedVoter(null);
    setShowUpdateModal(false);
  };

  const handleUpdateVoter = async (updateData: VoterUpdateData) => {
    if (!selectedVoter) return;

    setUpdating(true);
    try {
      const response = await callCenterService.updateVoterInfo(selectedVoter.id, updateData);

      if (response.success) {
        setToastInfo({
          message: 'Voter information updated successfully',
          type: 'success'
        });

        // Refresh voters list and assignment stats
        fetchVoters();
        fetchAssignment();
        closeUpdateModal();
      }
    } catch (error: any) {
      console.error('Failed to update voter:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Failed to update voter information',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +234XXXXXXXXX to 0XXXXXXXXX
    if (phone.startsWith('+234')) {
      return '0' + phone.substring(4);
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getFilterLabel = (filterValue: string) => {
    const labels = {
      all: 'All Voters',
      not_called: 'Not Called',
      called_recently: 'Called Recently',
      confirmed: 'Confirmed to Vote',
      needs_follow_up: 'Needs Follow-up'
    };
    return labels[filterValue as keyof typeof labels] || 'All Voters';
  };

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assignment Found</h2>
          <p className="text-gray-600">
            You haven't been assigned to a polling unit yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Assignment Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Center Dashboard</h1>
            <div className="text-gray-600">
              <p className="font-medium">{assignment.state} • {assignment.lga}</p>
              <p>{assignment.ward} • {assignment.polling_unit}</p>
              {assignment.polling_unit_code && (
                <p className="text-sm">Code: {assignment.polling_unit_code}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-900">{assignment.total_voters}</p>
              <p className="text-sm text-blue-600">Total Voters</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-yellow-900">{assignment.recently_called}</p>
              <p className="text-sm text-yellow-600">Called</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-900">{assignment.confirmed_voters}</p>
              <p className="text-sm text-green-600">Confirmed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
            >
              <option value="all">All Voters</option>
              <option value="not_called">Not Called</option>
              <option value="called_recently">Called Recently</option>
              <option value="confirmed">Confirmed to Vote</option>
              <option value="needs_follow_up">Needs Follow-up</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
            />
          </div>
        </div>
      </div>

      {/* Voters List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {getFilterLabel(filter)} ({voters.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#006837] mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading voters...</p>
          </div>
        ) : voters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No voters found for the current filter
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {voters.map((voter) => (
              <div key={voter.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPhoneNumber(voter.phone_number)}
                        </p>
                        {voter.confirmed_to_vote && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {voter.called_recently && (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>

                      {voter.full_name && (
                        <p className="text-sm text-gray-600">{voter.full_name}</p>
                      )}

                      <div className="flex items-center space-x-4 mt-1">
                        {voter.gender && (
                          <span className="text-xs text-gray-500">{voter.gender}</span>
                        )}
                        {voter.age_group && (
                          <span className="text-xs text-gray-500">{voter.age_group}</span>
                        )}
                        {voter.call_count > 0 && (
                          <span className="text-xs text-gray-500">
                            Called {voter.call_count} time{voter.call_count !== 1 ? 's' : ''}
                          </span>
                        )}
                        {voter.last_called_date && (
                          <span className="text-xs text-gray-500">
                            Last: {formatDate(voter.last_called_date)}
                          </span>
                        )}
                      </div>

                      {voter.notes && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{voter.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${formatPhoneNumber(voter.phone_number)}`}
                      className="inline-flex items-center px-3 py-1 bg-[#006837] text-white text-sm font-medium rounded-lg hover:bg-[#00592e] transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </a>

                    <button
                      onClick={() => openUpdateModal(voter)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Voter Modal */}
      {showUpdateModal && selectedVoter && (
        <VoterUpdateModal
          voter={selectedVoter}
          onUpdate={handleUpdateVoter}
          onClose={closeUpdateModal}
          loading={updating}
        />
      )}

      {/* Toast */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}
    </div>
  );
};

// Voter Update Modal Component
interface VoterUpdateModalProps {
  voter: Voter;
  onUpdate: (data: VoterUpdateData) => void;
  onClose: () => void;
  loading: boolean;
}

const VoterUpdateModal: React.FC<VoterUpdateModalProps> = ({ voter, onUpdate, onClose, loading }) => {
  const [formData, setFormData] = useState<VoterUpdateData>({
    fullName: voter.full_name || '',
    emailAddress: voter.email_address || '',
    gender: voter.gender || '',
    ageGroup: voter.age_group || '',
    confirmedToVote: voter.confirmed_to_vote,
    demands: voter.demands || '',
    notes: voter.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+234')) {
      return '0' + phone.substring(4);
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Update Voter Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatPhoneNumber(voter.phone_number)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                >
                  <option value="">Select</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                  <option value="56-65">56-65</option>
                  <option value="65+">65+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmed to Vote?
              </label>
              <select
                value={formData.confirmedToVote === null ? '' : formData.confirmedToVote ? 'yes' : 'no'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    confirmedToVote: value === '' ? null : value === 'yes'
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
              >
                <option value="">Not specified</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demands/Requests
              </label>
              <textarea
                value={formData.demands}
                onChange={(e) => setFormData({ ...formData, demands: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="What does the voter want for Anambra State?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="Additional notes about the call..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] disabled:opacity-50 flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                )}
                {loading ? 'Updating...' : 'Update Information'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CallCenterVolunteer;