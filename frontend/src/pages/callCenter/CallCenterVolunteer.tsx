import React, { useState, useEffect } from 'react';
import { Phone, User, Clock, CheckCircle, Search, Filter, Home, Loader2 } from 'lucide-react';
import Toast from '../../components/Toast';
import { callCenterService, type Assignment, type Voter, type VoterUpdateData } from '../../services/callCenterService';

// Interface definitions now imported from service

const CallCenterVolunteer: React.FC = () => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);
  const [filter, setFilter] = useState<'all' | 'not_called' | 'called_recently' | 'confirmed' | 'needs_follow_up'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters first
    const cleaned = phone.replace(/\D/g, '');

    // Format +234XXXXXXXXX to 0XXXXXXXXX
    if (phone.startsWith('+234')) {
      return '0' + phone.substring(4);
    }

    // If it starts with 234, add 0
    if (cleaned.startsWith('234') && cleaned.length === 13) {
      return '0' + cleaned.substring(3);
    }

    // If it already starts with 0, return as is
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return cleaned;
    }

    return phone;
  };

  // Helper function to check if voter was recently updated (within last 5 minutes)
  const isRecentlyUpdated = (voter: Voter) => {
    if (!voter.last_called_date) return false;
    const lastCalled = new Date(voter.last_called_date).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - lastCalled) < fiveMinutes;
  };

  // Filter voters based on search term
  const filteredVoters = voters.filter(voter => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    const phone = formatPhoneNumber(voter.phone_number).toLowerCase();
    const name = (voter.full_name || '').toLowerCase();
    const email = (voter.email_address || '').toLowerCase();

    return phone.includes(search) || name.includes(search) || email.includes(search);
  });

  const fetchAssignment = async () => {
    try {
      setInitialLoading(true);
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
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await callCenterService.getMyVoters({
        page: currentPage,
        limit: 20, // Reduced for better mobile performance
        filter: filter
      });

      if (response.success) {
        setVoters(response.voters);
        setTotalPages(response.totalPages);
        setTotalVoters(response.total || 0);
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

  const handleCallClick = (voter: Voter) => {
    // Format the phone number for tel: link
    const phoneNumber = formatPhoneNumber(voter.phone_number);

    // Open the phone dialer
    window.location.href = `tel:${phoneNumber}`;

    // Optionally auto-open the update modal after a short delay
    // This allows the user to quickly update info after making the call
    setTimeout(() => {
      openUpdateModal(voter);
    }, 1000);
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

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 text-[#006837] mx-auto animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Assignment...</h2>
          <p className="text-gray-600">
            Please wait while we fetch your polling unit assignment
          </p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Phone className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">No Assignment Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't been assigned to a polling unit yet. Please contact your administrator to get assigned.
          </p>
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized container */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        {/* Header with Assignment Info - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Back to Dashboard Button */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </a>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Call Center Dashboard</h1>
                <div className="text-sm sm:text-base text-gray-600 space-y-1">
                  <p className="font-medium">{assignment.state} • {assignment.lga}</p>
                  <p>{assignment.ward} • {assignment.polling_unit}</p>
                  {assignment.polling_unit_code && (
                    <p className="text-xs sm:text-sm text-gray-500">Code: {assignment.polling_unit_code}</p>
                  )}
                </div>
              </div>

              {/* Statistics - Mobile Responsive Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full lg:w-auto">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{assignment.total_voters}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Total</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-900">{assignment.recently_called}</p>
                  <p className="text-xs sm:text-sm text-yellow-600">Called</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-900">{assignment.confirmed_voters}</p>
                  <p className="text-xs sm:text-sm text-green-600">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
              >
                <option value="all">All Voters</option>
                <option value="not_called">Not Called</option>
                <option value="called_recently">Called Recently</option>
                <option value="confirmed">Confirmed to Vote</option>
                <option value="needs_follow_up">Needs Follow-up</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by phone or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
              />
            </div>
          </div>
        </div>

        {/* Voters List - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {getFilterLabel(filter)} ({filteredVoters.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#006837] mx-auto animate-spin mb-3" />
              <p className="text-sm sm:text-base text-gray-500">Loading voters...</p>
            </div>
          ) : filteredVoters.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500">
              <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">
                {searchTerm ? 'No voters found matching your search' : 'No voters found for the current filter'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {filteredVoters.map((voter) => (
                  <div key={voter.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    {/* Mobile-first layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Voter Info */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${voter.confirmed_to_vote
                                ? 'bg-green-100'
                                : voter.called_recently
                                  ? 'bg-yellow-100'
                                  : 'bg-gray-200'
                              }`}
                          >
                            <User
                              className={`w-5 h-5 sm:w-6 sm:h-6 ${voter.confirmed_to_vote
                                  ? 'text-green-600'
                                  : voter.called_recently
                                    ? 'text-yellow-600'
                                    : 'text-gray-500'
                                }`}
                            />
                          </div>
                        </div>

                        {/* Voter Details */}
                        <div className="flex-1 min-w-0">
                          {/* Name Section - Prominent Display */}
                          <div className="mb-2">
                            {voter.full_name ? (
                              <div>
                                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5">
                                  {voter.full_name}
                                </p>
                                <p className="text-sm sm:text-base text-gray-600">
                                  {formatPhoneNumber(voter.phone_number)}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5">
                                  {formatPhoneNumber(voter.phone_number)}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 italic">
                                  No name on record
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status Badges */}
                          <div className="flex items-center flex-wrap gap-1.5 mb-2">
                            {isRecentlyUpdated(voter) && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                                Just Updated
                              </span>
                            )}
                            {voter.confirmed_to_vote && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-0.5" />
                                Confirmed
                              </span>
                            )}
                            {voter.called_recently && !voter.confirmed_to_vote && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-0.5" />
                                Called
                              </span>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center flex-wrap gap-1.5">
                            {voter.gender && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                {voter.gender}
                              </span>
                            )}
                            {voter.age_group && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                {voter.age_group}
                              </span>
                            )}
                            {voter.call_count > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                {voter.call_count} call{voter.call_count !== 1 ? 's' : ''}
                              </span>
                            )}
                            {voter.last_called_date && (
                              <span className="text-xs text-gray-500">
                                {formatDate(voter.last_called_date)}
                              </span>
                            )}
                          </div>

                          {voter.demands && (
                            <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">
                              <span className="font-medium">Demands:</span> {voter.demands}
                            </p>
                          )}

                          {voter.notes && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              <span className="font-medium">Notes:</span> {voter.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col gap-2 sm:gap-2 sm:ml-auto">
                        <button
                          onClick={() => handleCallClick(voter)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-[#006837] text-white text-sm font-medium rounded-lg hover:bg-[#00592e] transition-colors shadow-sm active:shadow-inner"
                          title="Call this voter"
                        >
                          <Phone className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Call</span>
                        </button>

                        <button
                          onClick={() => openUpdateModal(voter)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                          title="Update voter information"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Mobile Responsive */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                      Page {currentPage} of {totalPages}
                      {totalVoters > 0 && (
                        <span className="text-gray-500"> • {totalVoters} total voters</span>
                      )}
                    </p>

                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Prev
                      </button>

                      <span className="px-3 py-1.5 text-xs sm:text-sm bg-[#006837] text-white rounded-lg font-medium">
                        {currentPage}
                      </span>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#006837] to-[#00592e]">
            <h3 className="text-lg font-semibold text-white">
              Update Voter Information
            </h3>
            {voter.full_name ? (
              <div className="mt-2">
                <p className="text-base font-medium text-white">
                  {voter.full_name}
                </p>
                <p className="text-sm text-white text-opacity-80 mt-0.5">
                  {formatPhoneNumber(voter.phone_number)}
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-base font-medium text-white">
                  {formatPhoneNumber(voter.phone_number)}
                </p>
                <p className="text-xs text-white text-opacity-70 italic">
                  No name on record
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Call Information Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Updating this form will mark this voter as "Called Recently" and log this interaction.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="Enter voter's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="voter@email.com"
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
                Confirmed to Vote? <span className="text-red-500">*</span>
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
                <option value="">Not asked/Unknown</option>
                <option value="yes">✓ Yes - Confirmed to vote</option>
                <option value="no">✗ No - Not voting/Declined</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Ask the voter: "Will you vote in the next election?"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voter's Demands/Requests
              </label>
              <textarea
                value={formData.demands}
                onChange={(e) => setFormData({ ...formData, demands: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="What does the voter want for Anambra State? (e.g., better roads, security, healthcare)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ask: "What are the key issues you'd like to see addressed in Anambra?"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837]"
                placeholder="Additional notes about the conversation (e.g., call outcome, follow-up needed, voter concerns)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Record any important details from the call for future reference
              </p>
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