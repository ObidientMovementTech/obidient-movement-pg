import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { statesLGAWardList } from '../../utils/StateLGAWard';
import { getPollingUnitsForWard } from '../../utils/pollingUnitUtils';
import { formatStateName, formatLocationName } from '../../utils/textUtils';
import { NIGERIAN_BANKS } from '../../constants/nigerianBanks';
import FormSelect from '../select/FormSelect';
import { genderOptions, ageRangeOptions, OptionType } from '../../utils/lookups';
import { adminUserManagementService } from '../../services/adminUserManagementService';

// Designation constants
const DESIGNATIONS = {
  NATIONAL_COORDINATOR: 'National Coordinator',
  STATE_COORDINATOR: 'State Coordinator',
  LGA_COORDINATOR: 'LGA Coordinator',
  WARD_COORDINATOR: 'Ward Coordinator',
  POLLING_UNIT_AGENT: 'Polling Unit Agent',
  VOTE_DEFENDER: 'Vote Defender',
  COMMUNITY_MEMBER: 'Community Member'
} as const;

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  votingPU?: string;
  userName?: string;
  gender?: string;
  ageRange?: string;
  countryOfResidence?: string;
  stateOfOrigin?: string;
  citizenship?: string;
  role: 'user' | 'admin';
  kycStatus: 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  isVoter?: boolean;
  designation?: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

// Edit modal state interface
interface EditModalState {
  isOpen: boolean;
  loading: boolean;
  user: User | null;
  name: string;
  userName: string;
  email: string;
  phone: string;
  gender: string;
  ageRange: string;
  countryOfResidence: string;
  stateOfOrigin: string;
  votingState: string;
  votingLGA: string;
  votingWard: string;
  votingPU: string;
  citizenship: string;
  role: 'user' | 'admin';
  kycStatus: 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  isVoter: boolean;
  designation: string;
  assignedState: string;
  assignedLGA: string;
  assignedWard: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}



interface AdminEditUserModalProps {
  editModal: {
    isOpen: boolean;
    user: User | null;
  };
  onClose: () => void;
  onUserUpdated: () => void;
}

const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  editModal,
  onClose,
  onUserUpdated
}) => {
  // Internal state management
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditModalState>({
    isOpen: false,
    loading: false,
    user: null,
    name: '',
    userName: '',
    email: '',
    phone: '',
    gender: '',
    ageRange: '',
    countryOfResidence: '',
    stateOfOrigin: '',
    votingState: '',
    votingLGA: '',
    votingWard: '',
    votingPU: '',
    citizenship: '',
    role: 'user',
    kycStatus: 'unsubmitted',
    emailVerified: false,
    isVoter: false,
    designation: '',
    assignedState: '',
    assignedLGA: '',
    assignedWard: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: ''
  });

  // For cascading dropdowns
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [assignedSelectedState, setAssignedSelectedState] = useState('');
  const [assignedSelectedLGA, setAssignedSelectedLGA] = useState('');

  // Dropdown options state
  const [states, setStates] = useState<OptionType[]>([]);

  // Initialize states dropdown
  useEffect(() => {
    const stateOptions = statesLGAWardList.map((s, i) => ({
      id: i,
      label: formatStateName(s.state), // Display formatted name
      value: s.state, // Keep original value for backend
    }));
    setStates(stateOptions);
  }, []);

  // Helper functions for cascading dropdowns
  const getLgas = (stateName: string): OptionType[] => {
    const found = statesLGAWardList.find(s => s.state === stateName);
    return found ? found.lgas.map((l, i) => ({
      id: i,
      label: formatLocationName(l.lga), // Display formatted name
      value: l.lga // Keep original value for backend
    })) : [];
  };

  const getWards = (lga: string, state: string): OptionType[] => {
    const stateData = statesLGAWardList.find(s => s.state === state);
    const lgaData = stateData?.lgas.find(l => l.lga === lga);

    const wards = lgaData ? lgaData.wards.map((w, i) => ({
      id: i,
      label: formatLocationName(w), // Display formatted name
      value: w // Keep original value for backend
    })) : [];

    return wards;
  };

  // Get polling units for the selected location
  const getPollingUnits = (): OptionType[] => {
    if (!formData.votingState || !formData.votingLGA || !formData.votingWard) {
      return [];
    }

    try {
      // Convert to the uppercase format expected by the new data structure
      const stateUpper = formData.votingState.toUpperCase().replace(/-/g, ' ');
      const lgaUpper = formData.votingLGA.toUpperCase().replace(/-/g, ' ');
      const wardUpper = formData.votingWard.toUpperCase().replace(/-/g, ' ');

      const pollingUnits = getPollingUnitsForWard(stateUpper, lgaUpper, wardUpper);

      return pollingUnits.map((pu, i) => ({
        id: i,
        label: pu.label,
        value: pu.value
      }));
    } catch (error) {
      console.error('Error getting polling units:', error);
      return [];
    }
  };

  // Helper function to convert formatted data back to original format for dropdowns
  const convertToOriginalFormat = (formattedValue: string, type: 'state' | 'location'): string => {
    if (!formattedValue) return '';

    if (type === 'state') {
      // Convert "Abia" back to "abia"
      return formattedValue.toLowerCase();
    } else {
      // Convert "Aba North" back to "aba-north"
      return formattedValue.toLowerCase().replace(/\s+/g, '-');
    }
  };

  // Dropdown options
  const citizenshipOptions = [
    { id: 1, label: "Nigerian Citizen", value: "Nigerian Citizen" },
    { id: 2, label: "Diasporan", value: "Diasporan" },
    { id: 3, label: "Foreigner", value: "Foreigner" },
  ];



  // Initialize form data when modal opens with a user
  useEffect(() => {
    if (editModal.isOpen && editModal.user) {
      const user = editModal.user;
      setFormData({
        isOpen: true,
        loading: false,
        user,
        name: user.name || '',
        userName: user.userName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        ageRange: user.ageRange || '',
        countryOfResidence: user.countryOfResidence || '',
        stateOfOrigin: user.stateOfOrigin || '',
        votingState: user.votingState || '',
        votingLGA: user.votingLGA || '',
        votingWard: user.votingWard || '',
        votingPU: user.votingPU || '',
        citizenship: user.citizenship || '',
        role: user.role || 'user',
        kycStatus: user.kycStatus || 'unsubmitted',
        emailVerified: user.emailVerified || false,
        isVoter: user.isVoter || false,
        designation: user.designation || '',
        assignedState: user.assignedState || '',
        assignedLGA: user.assignedLGA || '',
        assignedWard: user.assignedWard || '',
        bankName: user.bankName || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankAccountName: user.bankAccountName || ''
      });

      // Update cascading dropdown states for voting location
      const newVotingState = user.votingState || '';
      const newVotingLGA = user.votingLGA || '';
      const originalLGA = convertToOriginalFormat(newVotingLGA, 'location');

      setSelectedState(newVotingState);
      setSelectedLGA(originalLGA);

      // Update cascading dropdown states for assignment location
      const newAssignedState = user.assignedState || '';
      const newAssignedLGA = user.assignedLGA || '';
      const originalAssignedLGA = convertToOriginalFormat(newAssignedLGA, 'location');

      setAssignedSelectedState(newAssignedState);
      setAssignedSelectedLGA(originalAssignedLGA);
    }
  }, [editModal.isOpen, editModal.user]);

  // Save handler
  const handleSave = async () => {
    if (!formData.user) return;

    setLoading(true);
    try {
      // Update user profile information
      await adminUserManagementService.updateUserProfile(formData.user.id, {
        name: formData.name,
        userName: formData.userName,
        email: formData.email,
        phone: formData.phone,
        countryOfResidence: formData.countryOfResidence,
        // Format location data as Title Case before sending to backend
        votingState: formData.votingState ? formatStateName(formData.votingState) : formData.votingState,
        votingLGA: formData.votingLGA ? formatLocationName(formData.votingLGA) : formData.votingLGA,
        votingWard: formData.votingWard ? formatLocationName(formData.votingWard) : formData.votingWard,
        votingPU: formData.votingPU || '',
        gender: formData.gender,
        ageRange: formData.ageRange,
        citizenship: formData.citizenship,
        isVoter: formData.isVoter,
        stateOfOrigin: formData.stateOfOrigin ? formatStateName(formData.stateOfOrigin) : formData.stateOfOrigin,
        role: formData.role,
        emailVerified: formData.emailVerified,
        kycStatus: formData.kycStatus,
        // Bank account details
        bankName: formData.bankName || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        bankAccountName: formData.bankAccountName || undefined
      });

      // Update user designation and assignments
      await adminUserManagementService.updateUserDesignation(formData.user.id, {
        designation: formData.designation,
        assignedState: formData.assignedState ? formatStateName(formData.assignedState) : null,
        assignedLGA: formData.assignedLGA ? formatLocationName(formData.assignedLGA) : null,
        assignedWard: formData.assignedWard ? formatLocationName(formData.assignedWard) : null
      });

      onUserUpdated();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      // You might want to add error handling here
    } finally {
      setLoading(false);
    }
  };

  if (!editModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        {/* Modal content */}
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit User: {editModal.user?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* User Info Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {editModal.user?.profileImage ? (
                  <img
                    src={editModal.user.profileImage}
                    alt={editModal.user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <Users size={24} className="text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{editModal.user?.name}</p>
                  <p className="text-sm text-gray-500">{editModal.user?.email}</p>
                  <p className="text-sm text-gray-500">
                    Voting Location: {editModal.user?.votingState || 'N/A'} • {editModal.user?.votingLGA || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* User Details Form */}
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Personal Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">Personal Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Gender"
                      options={genderOptions}
                      defaultSelected={formData.gender}
                      onChange={(opt) => {
                        if (opt) setFormData(prev => ({ ...prev, gender: opt.value }));
                      }}
                      key={`gender-${formData.gender}`}
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Age Range"
                      options={ageRangeOptions}
                      defaultSelected={formData.ageRange}
                      onChange={(opt) => {
                        if (opt) setFormData(prev => ({ ...prev, ageRange: opt.value }));
                      }}
                      key={`ageRange-${formData.ageRange}`}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Location Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Residence
                    </label>
                    <input
                      type="text"
                      value={formData.countryOfResidence}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryOfResidence: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country of residence"
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="State of Origin"
                      options={states}
                      defaultSelected={formData.stateOfOrigin}
                      onChange={(opt) => {
                        if (opt) {
                          setFormData(prev => ({ ...prev, stateOfOrigin: opt.value }));
                        }
                      }}
                      key={`stateOfOrigin-${formData.stateOfOrigin}`}
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Voting State"
                      options={states}
                      defaultSelected={selectedState}
                      onChange={(opt) => {
                        const newState = opt?.value || '';
                        setSelectedState(newState);
                        setFormData(prev => ({
                          ...prev,
                          votingState: newState,
                          votingLGA: '', // Reset LGA when state changes
                          votingWard: '', // Reset ward when state changes
                          votingPU: '' // Reset PU when state changes
                        }));
                        // Reset dependent fields
                        setSelectedLGA('');
                      }}
                      key={`votingState-${selectedState}`}
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Voting LGA"
                      options={getLgas(selectedState)}
                      defaultSelected={selectedLGA}
                      onChange={(opt) => {
                        const newLGA = opt?.value || '';
                        setSelectedLGA(newLGA);
                        setFormData(prev => ({
                          ...prev,
                          votingLGA: newLGA,
                          votingWard: '', // Reset ward when LGA changes
                          votingPU: '' // Reset PU when LGA changes
                        }));
                      }}
                      disabled={!selectedState}
                      key={`votingLGA-${selectedLGA}`}
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Voting Ward"
                      options={getWards(selectedLGA, selectedState)}
                      defaultSelected={convertToOriginalFormat(formData.votingWard, 'location')}
                      onChange={(opt) => {
                        if (opt) {
                          setFormData(prev => ({
                            ...prev,
                            votingWard: opt.value,
                            votingPU: '' // Reset PU when ward changes
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            votingWard: '',
                            votingPU: ''
                          }));
                        }
                      }}
                      disabled={!selectedLGA}
                      key={`votingWard-${formData.votingWard}-${selectedLGA}`}
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Voting Polling Unit"
                      options={getPollingUnits()}
                      defaultSelected={formData.votingPU}
                      onChange={(opt) => {
                        if (opt) {
                          setFormData(prev => ({ ...prev, votingPU: opt.value }));
                        }
                      }}
                      disabled={!formData.votingWard}
                      key={`votingPU-${formData.votingWard}-${formData.votingPU}`}
                      placeholder="Select your polling unit"
                    />
                  </div>
                </div>
              </div>

              {/* System Information Section */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900">System Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KYC Status
                    </label>
                    <select
                      value={formData.kycStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, kycStatus: e.target.value as 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="unsubmitted">Unsubmitted</option>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <FormSelect
                      label="Citizenship"
                      options={citizenshipOptions}
                      defaultSelected={formData.citizenship}
                      onChange={(opt) => {
                        if (opt) setFormData(prev => ({ ...prev, citizenship: opt.value }));
                      }}
                      key={`citizenship-${formData.citizenship}`}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailVerified"
                        checked={formData.emailVerified}
                        onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emailVerified" className="ml-2 text-sm text-gray-700">
                        Email Verified
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isVoter"
                        checked={formData.isVoter}
                        onChange={(e) => setFormData(prev => ({ ...prev, isVoter: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isVoter" className="ml-2 text-sm text-gray-700">
                        Is Voter
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details Section */}
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900">Bank Account Details</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Optional payment information for reimbursements
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Bank Name */}
                  <div>
                    <FormSelect
                      label="Bank Name"
                      options={NIGERIAN_BANKS.map((bank, index) => ({
                        id: index,
                        label: bank,
                        value: bank
                      }))}
                      defaultSelected={formData.bankName}
                      onChange={(opt) => setFormData(prev => ({ ...prev, bankName: opt?.value || '' }))}
                      placeholder="Select bank"
                    />
                  </div>

                  {/* Bank Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setFormData(prev => ({ ...prev, bankAccountNumber: value }));
                        }
                      }}
                      placeholder="10-digit number"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={10}
                    />
                    {formData.bankAccountNumber && formData.bankAccountNumber.length !== 10 && (
                      <p className="text-xs text-amber-600 mt-1">Must be 10 digits</p>
                    )}
                  </div>

                  {/* Bank Account Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                      placeholder="Account holder name"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Section */}
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900">Administrative</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => {
                      const newDesignation = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        designation: newDesignation,
                        // Clear assignment fields when changing designation
                        assignedState: '',
                        assignedLGA: '',
                        assignedWard: ''
                      }));
                      // Clear cascading dropdown states for assignments
                      setAssignedSelectedState('');
                      setAssignedSelectedLGA('');
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.values(DESIGNATIONS).map(designation => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment Fields - Show based on designation */}
                {(formData.designation === DESIGNATIONS.STATE_COORDINATOR ||
                  formData.designation === DESIGNATIONS.LGA_COORDINATOR ||
                  formData.designation === DESIGNATIONS.WARD_COORDINATOR) && (
                    <div className="space-y-4 p-4 bg-white rounded-lg border border-yellow-200">
                      <h5 className="text-sm font-medium text-yellow-800">Assignment Location</h5>

                      {/* State Selection */}
                      <div>
                        <FormSelect
                          label="Assigned State"
                          options={states}
                          defaultSelected={assignedSelectedState}
                          onChange={(opt) => {
                            const newState = opt?.value || '';
                            setAssignedSelectedState(newState);
                            setFormData(prev => ({
                              ...prev,
                              assignedState: newState,
                              assignedLGA: '', // Reset LGA when state changes
                              assignedWard: '' // Reset ward when state changes
                            }));
                            // Reset dependent fields
                            setAssignedSelectedLGA('');
                          }}
                          key={`assignedState-${assignedSelectedState}`}
                        />
                      </div>

                      {/* LGA Selection - Show for LGA and Ward coordinators */}
                      {(formData.designation === DESIGNATIONS.LGA_COORDINATOR ||
                        formData.designation === DESIGNATIONS.WARD_COORDINATOR) && (
                          <div>
                            <FormSelect
                              label="Assigned LGA"
                              options={getLgas(assignedSelectedState)}
                              defaultSelected={assignedSelectedLGA}
                              onChange={(opt) => {
                                const newLGA = opt?.value || '';
                                setAssignedSelectedLGA(newLGA);
                                setFormData(prev => ({
                                  ...prev,
                                  assignedLGA: newLGA,
                                  assignedWard: '' // Reset ward when LGA changes
                                }));
                              }}
                              disabled={!assignedSelectedState}
                              key={`assignedLGA-${assignedSelectedLGA}`}
                            />
                          </div>
                        )}

                      {/* Ward Selection - Show only for Ward coordinators */}
                      {formData.designation === DESIGNATIONS.WARD_COORDINATOR && (
                        <div>
                          <FormSelect
                            label="Assigned Ward"
                            options={getWards(assignedSelectedLGA, assignedSelectedState)}
                            defaultSelected={convertToOriginalFormat(formData.assignedWard, 'location')}
                            onChange={(opt) => {
                              if (opt) {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedWard: opt.value
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedWard: ''
                                }));
                              }
                            }}
                            disabled={!assignedSelectedLGA}
                            key={`assignedWard-${formData.assignedWard}-${assignedSelectedLGA}`}
                          />
                        </div>
                      )}

                      <div className="text-sm text-yellow-600">
                        {formData.designation === DESIGNATIONS.STATE_COORDINATOR &&
                          "This coordinator will have access to all LGAs and wards in the assigned state."}
                        {formData.designation === DESIGNATIONS.LGA_COORDINATOR &&
                          "This coordinator will have access to all wards in the assigned LGA."}
                        {formData.designation === DESIGNATIONS.WARD_COORDINATOR &&
                          "This coordinator will have access only to the assigned ward."}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditUserModal;