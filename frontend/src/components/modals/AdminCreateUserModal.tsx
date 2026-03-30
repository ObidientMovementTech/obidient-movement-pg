import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Drawer, Box, Typography, IconButton, Divider, Button,
  CircularProgress, TextField, Checkbox, FormControlLabel
} from '@mui/material';
import { UserPlus, X as XIcon } from 'lucide-react';
import FormSelect from '../select/FormSelect';
import { getStateNames, getFormattedLGAs, getFormattedWards, getFormattedPollingUnits } from '../../utils/StateLGAWardPollingUnits';
import { formatPhoneForStorage } from '../../utils/phoneUtils';
import { OptionType, genderOptions, ageRangeOptions } from '../../utils/lookups';
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
        votingState: 'ANAMBRA',
        citizenship: 'Nigerian Citizen',
        isVoter: 'Yes',
        willVote: 'Yes',
        email: prev.name ? generateEmailFromName(prev.name) : ''
      }));
    } else {
      // Disable quick onboarding mode - clear auto-filled values
      setFormData(prev => ({
        ...prev,
        password: '',
        votingState: '',
        citizenship: '',
        isVoter: '',
        willVote: '',
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
    const stateNames = getStateNames();
    const stateOptions = stateNames.map((stateName, i) => ({
      id: i,
      label: stateName,
      value: stateName,
    }));
    setStates(stateOptions);
  }, []);

  const getLgas = (stateName: string): OptionType[] => {
    if (!stateName) return [];
    const formattedLGAs = getFormattedLGAs(stateName);
    return formattedLGAs.map((lga, i) => ({
      id: i,
      label: lga.label,
      value: lga.value
    }));
  };

  const getWards = (stateName: string, lgaName: string): OptionType[] => {
    if (!stateName || !lgaName) return [];
    const formattedWards = getFormattedWards(stateName, lgaName);
    return formattedWards.map((ward, i) => ({
      id: i,
      label: ward.label,
      value: ward.value
    }));
  };

  const getPollingUnits = (stateName: string, lgaName: string, wardName: string): OptionType[] => {
    if (!stateName || !lgaName || !wardName) return [];
    const formattedPollingUnits = getFormattedPollingUnits(stateName, lgaName, wardName);
    return formattedPollingUnits.map((pu, i) => ({
      id: i,
      label: pu.label,
      value: pu.value
    }));
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
        votingState: formData.votingState || undefined, // Send raw UPPERCASE value
        votingLGA: formData.votingLGA || undefined, // Send raw UPPERCASE value
        votingWard: formData.votingWard || undefined, // Send raw UPPERCASE value
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

  const FONT = '"Poppins", sans-serif';
  const PRIMARY = '#006837';

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 560 }, fontFamily: FONT }
      }}
    >
      {/* Fixed Header */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: '#dcfce7', borderRadius: 2, display: 'flex' }}>
            <UserPlus size={22} style={{ color: PRIMARY }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
              Create New User
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#6b7280' }}>
              Mass onboarding &bull; Admin user creation
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <XIcon size={18} />
        </IconButton>
      </Box>

      {/* Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>

            {/* Quick Onboarding Toggle */}
            <Box sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={quickOnboardingMode}
                    onChange={(e) => handleQuickOnboardingToggle(e.target.checked)}
                    size="small"
                    sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                      Quick Onboarding Mode (Anambra Bulk Registration)
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6b7280', mt: 0.3 }}>
                      Auto-sets: Email (from name), Password (123456), Voting State (Anambra), Citizenship, Voter status.
                    </Typography>
                  </Box>
                }
              />
              {quickOnboardingMode && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: PRIMARY }}>
                  <AlertCircle size={12} />
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600 }}>
                    Quick mode active — Enter name to auto-generate email
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Basic Information */}
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#111827', mb: 2 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Full Name *"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  size="small"
                  fullWidth
                  required
                  sx={{ gridColumn: '1 / -1', '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
                />
                <TextField
                  label={quickOnboardingMode && formData.email.endsWith('@obidients.com') ? 'Email * (Auto-generated)' : 'Email *'}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  size="small"
                  fullWidth
                  required
                  sx={{
                    gridColumn: '1 / -1',
                    '& .MuiInputBase-root': { fontFamily: FONT, ...(quickOnboardingMode && formData.email.endsWith('@obidients.com') ? { bgcolor: '#f0fdf4' } : {}) },
                    '& .MuiInputLabel-root': { fontFamily: FONT }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 1, px: 1.5, bgcolor: '#f9fafb' }}>
                    <ListBoxComp
                      defaultSelected={formData.countryCode}
                      onChange={(country: any) => setFormData(prev => ({ ...prev, countryCode: country.code }))}
                    />
                  </Box>
                  <TextField
                    label="Phone *"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const cleanValue = e.target.value.replace(/[^\d\-+]/g, '');
                      setFormData(prev => ({ ...prev, phone: cleanValue }));
                    }}
                    size="small"
                    fullWidth
                    required
                    sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    size="small"
                    fullWidth
                    required
                    sx={{
                      '& .MuiInputBase-root': { fontFamily: FONT, ...(quickOnboardingMode && formData.password === '123456' ? { bgcolor: '#f0fdf4' } : {}) },
                      '& .MuiInputLabel-root': { fontFamily: FONT }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={generateStrongPassword}
                    sx={{ fontFamily: FONT, textTransform: 'none', whiteSpace: 'nowrap', fontSize: '0.75rem', borderColor: '#d1d5db', color: '#374151', minWidth: 'auto', px: 1.5 }}
                  >
                    Generate
                  </Button>
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontFamily: FONT, fontSize: '0.8rem' }}>Show password</Typography>}
                  sx={{ gridColumn: '1 / -1' }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Profile Information */}
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#111827', mb: 2 }}>
                Profile Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Username"
                  value={formData.userName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
                />
                <Box>
                  <FormSelect
                    label="Gender"
                    options={genderOptions}
                    defaultSelected={formData.gender}
                    onChange={(opt) => setFormData(prev => ({ ...prev, gender: opt?.value || '' }))}
                    placeholder="Select gender"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Age Range"
                    options={ageRangeOptions}
                    defaultSelected={formData.ageRange}
                    onChange={(opt) => setFormData(prev => ({ ...prev, ageRange: opt?.value || '' }))}
                    placeholder="Select age range"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Citizenship"
                    options={citizenshipOptions}
                    defaultSelected={formData.citizenship}
                    onChange={(opt) => setFormData(prev => ({ ...prev, citizenship: opt?.value || '' }))}
                    placeholder="Select citizenship"
                  />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Voting Location */}
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#1e40af', mb: 2 }}>
                Voting Location
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <FormSelect
                    label="State of Origin"
                    options={states}
                    defaultSelected={formData.stateOfOrigin}
                    onChange={(opt) => setFormData(prev => ({ ...prev, stateOfOrigin: opt?.value || '' }))}
                    placeholder="Select state of origin"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Voting State"
                    options={states}
                    defaultSelected={formData.votingState}
                    onChange={(opt) => setFormData(prev => ({ ...prev, votingState: opt?.value || '', votingLGA: '', votingWard: '', votingPU: '' }))}
                    placeholder="Select voting state"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Voting LGA"
                    options={getLgas(formData.votingState || '')}
                    defaultSelected={formData.votingLGA}
                    onChange={(opt) => setFormData(prev => ({ ...prev, votingLGA: opt?.value || '', votingWard: '', votingPU: '' }))}
                    disabled={!formData.votingState}
                    placeholder="Select voting LGA"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Voting Ward"
                    options={getWards(formData.votingState || '', formData.votingLGA || '')}
                    defaultSelected={formData.votingWard}
                    onChange={(opt) => setFormData(prev => ({ ...prev, votingWard: opt?.value || '', votingPU: '' }))}
                    disabled={!formData.votingLGA}
                    placeholder="Select voting ward"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Polling Unit"
                    options={getPollingUnits(formData.votingState || '', formData.votingLGA || '', formData.votingWard || '')}
                    defaultSelected={formData.votingPU}
                    onChange={(opt) => setFormData(prev => ({ ...prev, votingPU: opt?.value || '' }))}
                    disabled={!formData.votingWard}
                    placeholder="Select polling unit"
                  />
                </Box>
                <Box>
                  <FormSelect
                    label="Registered Voter?"
                    options={yesNoOptions}
                    defaultSelected={formData.isVoter}
                    onChange={(opt) => setFormData(prev => ({ ...prev, isVoter: opt?.value || '' }))}
                    placeholder="Select voter status"
                  />
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <FormSelect
                    label="Will vote in next election?"
                    options={yesNoOptions}
                    defaultSelected={formData.willVote}
                    onChange={(opt) => setFormData(prev => ({ ...prev, willVote: opt?.value || '' }))}
                    placeholder="Select voting intention"
                  />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Bank Account Details */}
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#7c3aed', mb: 0.5 }}>
                Bank Account Details (Optional)
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6b7280', mb: 2 }}>
                Bank details for future payments and reimbursements
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <FormSelect
                    label="Bank Name"
                    options={NIGERIAN_BANKS.map((bank, index) => ({ id: index, label: bank, value: bank }))}
                    defaultSelected={formData.bankName}
                    onChange={(opt) => setFormData(prev => ({ ...prev, bankName: opt?.value || '' }))}
                    placeholder="Select bank"
                  />
                </Box>
                <TextField
                  label="Account Number"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) setFormData(prev => ({ ...prev, bankAccountNumber: value }));
                  }}
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                  helperText={formData.bankAccountNumber && formData.bankAccountNumber.length !== 10 ? 'Must be 10 digits' : ''}
                  sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
                />
                <TextField
                  label="Account Name"
                  value={formData.bankAccountName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                  size="small"
                  fullWidth
                  sx={{ gridColumn: '1 / -1', '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Admin Options */}
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#111827', mb: 1.5 }}>
                Admin Options
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.emailVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                      size="small"
                      sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                    />
                  }
                  label={<Typography sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>Mark email as verified</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.autoGenerateVotingBloc}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoGenerateVotingBloc: e.target.checked }))}
                      size="small"
                      sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                    />
                  }
                  label={<Typography sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>Auto-generate voting bloc for user</Typography>}
                />
              </Box>
            </Box>
          </Box>

          {/* Fixed Footer (inside form for submit) */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ fontFamily: FONT, textTransform: 'none', borderColor: '#d1d5db', color: '#374151', '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#005530' } }}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Box>
        </form>
      </Box>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Drawer>
  );
};

export default AdminCreateUserModal;