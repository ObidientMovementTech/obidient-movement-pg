import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Shield, AlertCircle, Loader2 } from 'lucide-react';
import FormSelect from '../select/FormSelect';
import { statesLGAWardList } from '../../utils/StateLGAWard';
import { formatStateName, formatLocationName } from '../../utils/textUtils';
import { formatPhoneForStorage } from '../../utils/phoneUtils';
import { OptionType, genderOptions, ageRangeOptions } from '../../utils/lookups';
import { getPollingUnitsForWard } from '../../utils/pollingUnitUtils';
import { NIGERIAN_BANKS } from '../../constants/nigerianBanks';
import ListBoxComp from '../select/ListBox';
import Toast from '../Toast';

interface CreateUserData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;

  // Profile Information
  userName?: string;
  gender?: string;
  ageRange?: string;
  citizenship?: string;
  stateOfOrigin?: string;

  // Voting Location
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  votingPU?: string;

  // Voter Status
  isVoter?: string;
  willVote?: string;

  // Bank Account Details
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;

  // Admin Assignment (removed designation for now)
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;

  // Admin flags
  emailVerified: boolean;
  adminCreated: boolean;
  autoGenerateVotingBloc: boolean;
}

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    countryCode: '+234',
    password: '',
    emailVerified: true, // Default to verified since admin is creating
    adminCreated: true,
    autoGenerateVotingBloc: true
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [states, setStates] = useState<OptionType[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [quickOnboardingMode, setQuickOnboardingMode] = useState(false);

  // Helper function to generate email from name
  const generateEmailFromName = (name: string): string => {
    if (!name.trim()) return '';

    // Remove special characters and extra spaces, convert to lowercase
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
      .trim()
      .replace(/\s+/g, ''); // Remove all spaces

    return `${cleanName}@obidients.com`;
  };

  // Watch for name changes in quick onboarding mode
  const handleNameChange = (newName: string) => {
    setFormData(prev => {
      const updates: any = { name: newName };

      // Auto-generate email if in quick onboarding mode and email field is empty or is an @obidients.com email
      if (quickOnboardingMode) {
        const isObidientsEmail = prev.email.endsWith('@obidients.com') || prev.email === '';
        if (isObidientsEmail) {
          updates.email = generateEmailFromName(newName);
        }
      }

      return { ...prev, ...updates };
    });
  };

  // Toggle quick onboarding mode
  const handleQuickOnboardingToggle = (enabled: boolean) => {
    setQuickOnboardingMode(enabled);

    if (enabled) {
      // Enable quick onboarding mode
      setFormData(prev => ({
        ...prev,
        password: '123456',
        votingState: 'anambra',
        email: prev.name ? generateEmailFromName(prev.name) : ''
      }));
    } else {
      // Disable quick onboarding mode - clear auto-filled values
      setFormData(prev => ({
        ...prev,
        password: '',
        votingState: '',
        email: prev.email.endsWith('@obidients.com') ? '' : prev.email // Only clear if it's an auto-generated email
      }));
    }
  };



  const citizenshipOptions = [
    { id: 1, label: "Nigerian Citizen", value: "Nigerian Citizen" },
    { id: 2, label: "Diasporan", value: "Diasporan" },
    { id: 3, label: "Foreigner", value: "Foreigner" },
  ];

  const yesNoOptions = [
    { id: 1, label: "Yes", value: "Yes" },
    { id: 2, label: "No", value: "No" },
  ];

  // Initialize states list
  useEffect(() => {
    const stateOptions = statesLGAWardList.map((s: any, i: number) => ({
      id: i,
      label: formatStateName(s.state),
      value: s.state,
    }));
    setStates(stateOptions);
  }, []);

  const getLgas = (stateName: string): OptionType[] => {
    const found = statesLGAWardList.find((s: any) => s.state === stateName);
    return found ? found.lgas.map((l: any, i: number) => ({
      id: i,
      label: formatLocationName(l.lga),
      value: l.lga
    })) : [];
  };

  const getWards = (lga: string, state: string): OptionType[] => {
    const stateData = statesLGAWardList.find((s: any) => s.state === state);
    const lgaData = stateData?.lgas.find((l: any) => l.lga === lga);
    return lgaData ? lgaData.wards.map((w: any, i: number) => ({
      id: i,
      label: formatLocationName(w),
      value: w
    })) : [];
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9\-]{8,20}$/;
    return phoneRegex.test(phone) && !phone.includes('@') && !phone.includes(' ');
  };

  const generateStrongPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setToast({ message: 'Invalid email format', type: 'error' });
      return;
    }

    if (!validatePhone(formData.phone)) {
      setToast({ message: 'Invalid phone number format', type: 'error' });
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Format phone number for storage
      const formattedPhone = formatPhoneForStorage(formData.phone, formData.countryCode);

      // Prepare user data
      const userData = {
        ...formData,
        phone: formattedPhone,
        votingState: formData.votingState ? formatStateName(formData.votingState) : undefined,
        votingLGA: formData.votingLGA ? formatLocationName(formData.votingLGA) : undefined,
        votingWard: formData.votingWard ? formatLocationName(formData.votingWard) : undefined,
      };

      // Use the admin user management service
      const { adminUserManagementService } = await import('../../services/adminUserManagementService');
      await adminUserManagementService.createUser(userData);

      setToast({ message: 'User created successfully!', type: 'success' });
      onUserCreated();

      // Reset form after successful creation
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error: any) {
      console.error('Error creating user:', error);
      setToast({
        message: error.message || 'Failed to create user. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      countryCode: '+234',
      password: '',
      emailVerified: true,
      adminCreated: true,
      autoGenerateVotingBloc: true
    });
    setToast(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
              <p className="text-sm text-gray-600">Mass onboarding - Admin user creation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Onboarding Mode Toggle */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="quickOnboardingMode"
                  checked={quickOnboardingMode}
                  onChange={(e) => handleQuickOnboardingToggle(e.target.checked)}
                  className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="quickOnboardingMode" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Quick Onboarding Mode (Anambra Bulk Registration)
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Automatically sets: Email (from name), Password (123456), and Voting State (Anambra).
                    <span className="font-medium"> All fields remain editable.</span>
                  </p>
                  {quickOnboardingMode && (
                    <div className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      Quick mode active - Enter name to auto-generate email
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User size={18} />
                  Basic Information
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                    {quickOnboardingMode && formData.email.endsWith('@obidients.com') && (
                      <span className="text-xs text-green-600 font-normal">(Auto-generated)</span>
                    )}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${quickOnboardingMode && formData.email.endsWith('@obidients.com')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                    required
                  />
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Email will be marked as verified automatically
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 px-3 py-2">
                      <ListBoxComp
                        defaultSelected={formData.countryCode}
                        onChange={(country: any) => setFormData(prev => ({ ...prev, countryCode: country.code }))}
                      />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^\d\-+]/g, '');
                        setFormData(prev => ({ ...prev, phone: cleanValue }));
                      }}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Password *
                    {quickOnboardingMode && formData.password === '123456' && (
                      <span className="text-xs text-green-600 font-normal">(Default: 123456)</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${quickOnboardingMode && formData.password === '123456'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                        }`}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="showPassword" className="text-sm text-gray-600">
                      Show password
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Shield size={18} />
                  Profile Information
                </h3>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.userName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter username"
                  />
                </div>



                {/* Gender */}
                <div>
                  <FormSelect
                    label="Gender"
                    options={genderOptions}
                    defaultSelected={formData.gender}
                    onChange={(opt) => setFormData(prev => ({ ...prev, gender: opt?.value || '' }))}
                    placeholder="Select gender"
                  />
                </div>

                {/* Age Range */}
                <div>
                  <FormSelect
                    label="Age Range"
                    options={ageRangeOptions}
                    defaultSelected={formData.ageRange}
                    onChange={(opt) => setFormData(prev => ({ ...prev, ageRange: opt?.value || '' }))}
                    placeholder="Select age range"
                  />
                </div>

                {/* Citizenship */}
                <div>
                  <FormSelect
                    label="Citizenship"
                    options={citizenshipOptions}
                    defaultSelected={formData.citizenship}
                    onChange={(opt) => setFormData(prev => ({ ...prev, citizenship: opt?.value || '' }))}
                    placeholder="Select citizenship"
                  />
                </div>
              </div>
            </div>

            {/* Voting Location */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Voting Location
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* State of Origin */}
                <div>
                  <FormSelect
                    label="State of Origin"
                    options={states}
                    defaultSelected={formData.stateOfOrigin}
                    onChange={(opt) => setFormData(prev => ({ ...prev, stateOfOrigin: opt?.value || '' }))}
                    placeholder="Select state of origin"
                  />
                </div>

                {/* Voting State */}
                <div>
                  <FormSelect
                    label="Voting State"
                    options={states}
                    defaultSelected={formData.votingState}
                    onChange={(opt) => {
                      setFormData(prev => ({
                        ...prev,
                        votingState: opt?.value || '',
                        votingLGA: '',
                        votingWard: '',
                        votingPU: ''
                      }));
                    }}
                    placeholder="Select voting state"
                  />
                </div>

                {/* Voting LGA */}
                <div>
                  <FormSelect
                    label="Voting LGA"
                    options={getLgas(formData.votingState || '')}
                    defaultSelected={formData.votingLGA}
                    onChange={(opt) => {
                      setFormData(prev => ({
                        ...prev,
                        votingLGA: opt?.value || '',
                        votingWard: '',
                        votingPU: ''
                      }));
                    }}
                    disabled={!formData.votingState}
                    placeholder="Select voting LGA"
                  />
                </div>

                {/* Voting Ward */}
                <div>
                  <FormSelect
                    label="Voting Ward"
                    options={getWards(formData.votingLGA || '', formData.votingState || '')}
                    defaultSelected={formData.votingWard}
                    onChange={(opt) => setFormData(prev => ({ ...prev, votingWard: opt?.value || '', votingPU: '' }))}
                    disabled={!formData.votingLGA}
                    placeholder="Select voting ward"
                  />
                </div>

                {/* Voting Polling Unit */}
                <div>
                  <FormSelect
                    label="Voting Polling Unit"
                    options={getPollingUnits()}
                    defaultSelected={formData.votingPU}
                    onChange={(opt) => setFormData(prev => ({ ...prev, votingPU: opt?.value || '' }))}
                    disabled={!formData.votingWard}
                    placeholder="Select polling unit"
                  />
                </div>

                {/* Voter Registration Status */}
                <div>
                  <FormSelect
                    label="Registered Voter?"
                    options={yesNoOptions}
                    defaultSelected={formData.isVoter}
                    onChange={(opt) => setFormData(prev => ({ ...prev, isVoter: opt?.value || '' }))}
                    placeholder="Select voter status"
                  />
                </div>

                {/* Will Vote */}
                <div>
                  <FormSelect
                    label="Will vote in next election?"
                    options={yesNoOptions}
                    defaultSelected={formData.willVote}
                    onChange={(opt) => setFormData(prev => ({ ...prev, willVote: opt?.value || '' }))}
                    placeholder="Select voting intention"
                  />
                </div>
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={18} />
                Bank Account Details (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bank details for future payments and reimbursements
              </p>
              <div className="grid md:grid-cols-2 gap-4">
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
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
                      if (value.length <= 10) {
                        setFormData(prev => ({ ...prev, bankAccountNumber: value }));
                      }
                    }}
                    placeholder="10-digit account number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    maxLength={10}
                  />
                  {formData.bankAccountNumber && formData.bankAccountNumber.length !== 10 && (
                    <p className="text-xs text-amber-600 mt-1">Account number must be 10 digits</p>
                  )}
                </div>

                {/* Bank Account Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                    placeholder="Enter account holder name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Admin Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.emailVerified}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Mark email as verified</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.autoGenerateVotingBloc}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoGenerateVotingBloc: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Auto-generate voting bloc for user</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminCreateUserModal;