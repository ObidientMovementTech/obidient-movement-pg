import React, { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import {
  Drawer, Box, Typography, IconButton, Divider, Button,
  CircularProgress, Avatar, TextField, Select, MenuItem,
  FormControlLabel, Checkbox, InputLabel, FormControl, Snackbar, Alert
} from '@mui/material';
import { getStateNames, getFormattedLGAs, getFormattedWards, getFormattedPollingUnits } from '../../utils/StateLGAWardPollingUnits';
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
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
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
    designation: 'Community Member',
    assignedState: '',
    assignedLGA: '',
    assignedWard: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: ''
  });

  // Dropdown options state
  const [states, setStates] = useState<OptionType[]>([]);

  // Initialize states dropdown
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

  // Helper functions for cascading dropdowns
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

  // Get polling units for the selected location
  const getPollingUnits = (): OptionType[] => {
    if (!formData.votingState || !formData.votingLGA || !formData.votingWard) {
      return [];
    }

    const formattedPollingUnits = getFormattedPollingUnits(formData.votingState, formData.votingLGA, formData.votingWard);
    return formattedPollingUnits.map((pu, i) => ({
      id: i,
      label: pu.label,
      value: pu.value
    }));
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
        designation: user.designation || 'Community Member',
        assignedState: user.assignedState || '',
        assignedLGA: user.assignedLGA || '',
        assignedWard: user.assignedWard || '',
        bankName: user.bankName || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankAccountName: user.bankAccountName || ''
      });
    }
  }, [editModal.isOpen, editModal.user]);

  // Save handler
  const handleSave = async () => {
    const userId = formData.user?.id || (formData.user as any)?._id;
    if (!formData.user || !userId) return;

    setLoading(true);
    const errors: string[] = [];

    try {
      // Update user profile information
      await adminUserManagementService.updateUserProfile(userId, {
        name: formData.name,
        userName: formData.userName,
        email: formData.email,
        phone: formData.phone,
        countryOfResidence: formData.countryOfResidence,
        votingState: formData.votingState || undefined,
        votingLGA: formData.votingLGA || undefined,
        votingWard: formData.votingWard || undefined,
        votingPU: formData.votingPU || '',
        gender: formData.gender || undefined,
        ageRange: formData.ageRange || undefined,
        citizenship: formData.citizenship || undefined,
        isVoter: formData.isVoter,
        stateOfOrigin: formData.stateOfOrigin || undefined,
        role: formData.role,
        emailVerified: formData.emailVerified,
        kycStatus: formData.kycStatus,
        bankName: formData.bankName || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        bankAccountName: formData.bankAccountName || undefined
      });
    } catch (error: any) {
      console.error('Profile update failed:', error);
      errors.push(error?.response?.data?.message || 'Profile update failed');
    }

    // Only update designation if one is selected
    if (formData.designation) {
      try {
        await adminUserManagementService.updateUserDesignation(userId, {
          designation: formData.designation,
          assignedState: formData.assignedState || null,
          assignedLGA: formData.assignedLGA || null,
          assignedWard: formData.assignedWard || null
        });
      } catch (error: any) {
        console.error('Designation update failed:', error);
        errors.push(error?.response?.data?.message || 'Designation update failed');
      }
    }

    setLoading(false);

    if (errors.length > 0) {
      setToast({ message: errors.join('. '), severity: 'error' });
    } else {
      onUserUpdated();
    }
  };

  const FONT = '"Poppins", sans-serif';
  const PRIMARY = '#006837';

  return (
    <Drawer
      anchor="right"
      open={editModal.isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 520 }, fontFamily: FONT }
      }}
    >
      {/* Fixed Header */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {editModal.user?.profileImage ? (
            <Avatar src={editModal.user.profileImage} sx={{ width: 40, height: 40 }} />
          ) : (
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#e5e7eb', color: '#6b7280' }}>
              <Users size={20} />
            </Avatar>
          )}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
              Edit User
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#6b7280' }}>
              {editModal.user?.name} &bull; {editModal.user?.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </Box>

      {/* Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>

          {/* Personal Information Section */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#111827', mb: 2 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
              />
              <TextField
                label="Username"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
              />
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
              />
              <Box>
                <FormSelect
                  label="Gender"
                  options={genderOptions}
                  defaultSelected={formData.gender}
                  onChange={(opt) => { if (opt) setFormData(prev => ({ ...prev, gender: opt.value })); }}
                  key={`gender-${formData.gender}`}
                />
              </Box>
              <Box>
                <FormSelect
                  label="Age Range"
                  options={ageRangeOptions}
                  defaultSelected={formData.ageRange}
                  onChange={(opt) => { if (opt) setFormData(prev => ({ ...prev, ageRange: opt.value })); }}
                  key={`ageRange-${formData.ageRange}`}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Location Information Section */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#1e40af', mb: 2 }}>
              Location Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Country of Residence"
                value={formData.countryOfResidence}
                onChange={(e) => setFormData(prev => ({ ...prev, countryOfResidence: e.target.value }))}
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
              />
              <Box>
                <FormSelect
                  label="State of Origin"
                  options={states}
                  defaultSelected={formData.stateOfOrigin}
                  onChange={(opt) => { if (opt) setFormData(prev => ({ ...prev, stateOfOrigin: opt.value })); }}
                  key={`stateOfOrigin-${formData.stateOfOrigin}`}
                />
              </Box>
              <Box>
                <FormSelect
                  label="Voting State"
                  options={states}
                  defaultSelected={formData.votingState}
                  onChange={(opt) => {
                    const newState = opt?.value || '';
                    setFormData(prev => ({ ...prev, votingState: newState, votingLGA: '', votingWard: '', votingPU: '' }));
                  }}
                  key={`votingState-${formData.votingState}`}
                />
              </Box>
              <Box>
                <FormSelect
                  label="Voting LGA"
                  options={getLgas(formData.votingState)}
                  defaultSelected={formData.votingLGA}
                  onChange={(opt) => {
                    const newLGA = opt?.value || '';
                    setFormData(prev => ({ ...prev, votingLGA: newLGA, votingWard: '', votingPU: '' }));
                  }}
                  disabled={!formData.votingState}
                  key={`votingLGA-${formData.votingLGA}`}
                />
              </Box>
              <Box>
                <FormSelect
                  label="Voting Ward"
                  options={getWards(formData.votingState, formData.votingLGA)}
                  defaultSelected={formData.votingWard}
                  onChange={(opt) => setFormData(prev => ({ ...prev, votingWard: opt?.value || '', votingPU: '' }))}
                  disabled={!formData.votingLGA}
                  key={`votingWard-${formData.votingWard}`}
                />
              </Box>
              <Box>
                <FormSelect
                  label="Polling Unit"
                  options={getPollingUnits()}
                  defaultSelected={formData.votingPU}
                  onChange={(opt) => setFormData(prev => ({ ...prev, votingPU: opt?.value || '' }))}
                  disabled={!formData.votingWard}
                  key={`votingPU-${formData.votingPU}`}
                  placeholder="Select polling unit"
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* System Information Section */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: PRIMARY, mb: 2 }}>
              System Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: FONT }}>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                  sx={{ fontFamily: FONT }}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: FONT }}>KYC Status</InputLabel>
                <Select
                  value={formData.kycStatus}
                  label="KYC Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, kycStatus: e.target.value as any }))}
                  sx={{ fontFamily: FONT }}
                >
                  <MenuItem value="unsubmitted">Unsubmitted</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <FormSelect
                  label="Citizenship"
                  options={citizenshipOptions}
                  defaultSelected={formData.citizenship}
                  onChange={(opt) => { if (opt) setFormData(prev => ({ ...prev, citizenship: opt.value })); }}
                  key={`citizenship-${formData.citizenship}`}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.emailVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                      size="small"
                      sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                    />
                  }
                  label={<Typography sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>Email Verified</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isVoter}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVoter: e.target.checked }))}
                      size="small"
                      sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                    />
                  }
                  label={<Typography sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>Is Voter</Typography>}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Bank Account Details Section */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#7c3aed', mb: 0.5 }}>
              Bank Account Details
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#6b7280', mb: 2 }}>
              Optional payment information for reimbursements
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
                value={formData.bankAccountNumber}
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
                value={formData.bankAccountName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                size="small"
                fullWidth
                sx={{ gridColumn: '1 / -1', '& .MuiInputBase-root': { fontFamily: FONT }, '& .MuiInputLabel-root': { fontFamily: FONT } }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Administrative Section */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#b45309', mb: 2 }}>
              Administrative
            </Typography>
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontFamily: FONT }}>Designation</InputLabel>
              <Select
                value={formData.designation}
                label="Designation"
                onChange={(e) => {
                  const newDesignation = e.target.value;
                  setFormData(prev => ({ ...prev, designation: newDesignation, assignedState: '', assignedLGA: '', assignedWard: '' }));
                }}
                sx={{ fontFamily: FONT }}
              >
                {Object.values(DESIGNATIONS).map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Assignment Fields */}
            {(formData.designation === DESIGNATIONS.STATE_COORDINATOR ||
              formData.designation === DESIGNATIONS.LGA_COORDINATOR ||
              formData.designation === DESIGNATIONS.WARD_COORDINATOR) && (
              <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.8rem', color: '#92400e' }}>
                  Assignment Location
                </Typography>
                <FormSelect
                  label="Assigned State"
                  options={states}
                  defaultSelected={formData.assignedState}
                  onChange={(opt) => {
                    const newState = opt?.value || '';
                    setFormData(prev => ({ ...prev, assignedState: newState, assignedLGA: '', assignedWard: '' }));
                  }}
                  key={`assignedState-${formData.assignedState}`}
                />
                {(formData.designation === DESIGNATIONS.LGA_COORDINATOR || formData.designation === DESIGNATIONS.WARD_COORDINATOR) && (
                  <FormSelect
                    label="Assigned LGA"
                    options={getLgas(formData.assignedState)}
                    defaultSelected={formData.assignedLGA}
                    onChange={(opt) => {
                      const newLGA = opt?.value || '';
                      setFormData(prev => ({ ...prev, assignedLGA: newLGA, assignedWard: '' }));
                    }}
                    disabled={!formData.assignedState}
                    key={`assignedLGA-${formData.assignedLGA}`}
                  />
                )}
                {formData.designation === DESIGNATIONS.WARD_COORDINATOR && (
                  <FormSelect
                    label="Assigned Ward"
                    options={getWards(formData.assignedState, formData.assignedLGA)}
                    defaultSelected={formData.assignedWard}
                    onChange={(opt) => setFormData(prev => ({ ...prev, assignedWard: opt?.value || '' }))}
                    disabled={!formData.assignedLGA}
                    key={`assignedWard-${formData.assignedWard}`}
                  />
                )}
                <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#b45309' }}>
                  {formData.designation === DESIGNATIONS.STATE_COORDINATOR && "This coordinator will have access to all LGAs and wards in the assigned state."}
                  {formData.designation === DESIGNATIONS.LGA_COORDINATOR && "This coordinator will have access to all wards in the assigned LGA."}
                  {formData.designation === DESIGNATIONS.WARD_COORDINATOR && "This coordinator will have access only to the assigned ward."}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Fixed Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ fontFamily: FONT, textTransform: 'none', borderColor: '#d1d5db', color: '#374151', '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' } }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#005530' } }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity || 'error'} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default AdminEditUserModal;