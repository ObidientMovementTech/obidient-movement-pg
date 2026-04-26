import React from 'react';
import { Mail, Phone, X, Shield, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import {
  Drawer, Box, Typography, IconButton, Divider, Button,
  Avatar, Chip
} from '@mui/material';

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
  createdAt: string;
  updatedAt: string;
  totalMembersInOwnedBlocs?: number;
  ownedVotingBlocsCount?: number;
  lastVotingBlocActivity?: string;
}

// View modal state interface
interface ViewModalState {
  isOpen: boolean;
  user: User | null;
}

interface AdminViewUserModalProps {
  viewModal: ViewModalState;
  onClose: () => void;
}

const AdminViewUserModal: React.FC<AdminViewUserModalProps> = ({
  viewModal,
  onClose
}) => {
  if (!viewModal.isOpen || !viewModal.user) return null;

  const { user } = viewModal;

  const FONT = '"Poppins", sans-serif';

  const getKycChipColor = (status: string) => {
    switch (status) {
      case 'approved': return { bgcolor: '#dcfce7', color: '#166534' };
      case 'pending': return { bgcolor: '#fef9c3', color: '#854d0e' };
      case 'rejected': return { bgcolor: '#fee2e2', color: '#991b1b' };
      case 'draft': return { bgcolor: '#dbeafe', color: '#1e40af' };
      default: return { bgcolor: '#f3f4f6', color: '#374151' };
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
      <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#6b7280' }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
        {value || 'Not set'}
      </Typography>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={viewModal.isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 }, fontFamily: FONT }
      }}
    >
      {/* Fixed Header */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
          User Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </Box>

      {/* Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* User Header Card */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
            <Avatar
              src={user.profileImage}
              imgProps={{ referrerPolicy: 'no-referrer' }}
              sx={{ width: 56, height: 56, bgcolor: '#d1d5db', fontSize: '1.2rem', fontFamily: FONT }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
                {user.name}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#6b7280' }}>
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={user.role === 'admin' ? <Shield size={14} /> : undefined}
                  label={user.role === 'admin' ? 'Admin' : 'User'}
                  size="small"
                  sx={{
                    fontFamily: FONT, fontSize: '0.7rem', height: 24,
                    bgcolor: user.role === 'admin' ? '#f3e8ff' : '#f3f4f6',
                    color: user.role === 'admin' ? '#7c3aed' : '#374151'
                  }}
                />
                <Chip
                  icon={user.emailVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  label={user.emailVerified ? 'Verified' : 'Unverified'}
                  size="small"
                  sx={{
                    fontFamily: FONT, fontSize: '0.7rem', height: 24,
                    bgcolor: user.emailVerified ? '#dcfce7' : '#fee2e2',
                    color: user.emailVerified ? '#166534' : '#991b1b'
                  }}
                />
                <Chip
                  icon={<Clock size={14} />}
                  label={`KYC: ${user.kycStatus}`}
                  size="small"
                  sx={{ fontFamily: FONT, fontSize: '0.7rem', height: 24, ...getKycChipColor(user.kycStatus) }}
                />
              </Box>
            </Box>
          </Box>

          {/* Personal Information */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#111827', mb: 1.5 }}>
              Personal Information
            </Typography>
            <Box sx={{ bgcolor: '#f9fafb', borderRadius: 2, p: 2 }}>
              <InfoRow label="Username" value={user.userName} />
              <InfoRow label="Gender" value={user.gender} />
              <InfoRow label="Age Range" value={user.ageRange} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="Citizenship" value={user.citizenship} />
              <InfoRow label="Country of Residence" value={user.countryOfResidence} />
              <InfoRow label="State of Origin" value={user.stateOfOrigin} />
              <InfoRow label="Registered Voter" value={user.isVoter ? 'Yes' : 'No'} />
            </Box>
          </Box>

          <Divider />

          {/* Voting Location */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MapPin size={18} style={{ color: '#1e40af' }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#1e40af' }}>
                Voting Location
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#eff6ff', borderRadius: 2, p: 2 }}>
              <InfoRow label="Voting State" value={user.votingState} />
              <InfoRow label="Voting LGA" value={user.votingLGA} />
              <InfoRow label="Voting Ward" value={user.votingWard} />
              <InfoRow label="Polling Unit" value={user.votingPU} />
            </Box>
          </Box>

          <Divider />

          {/* Administrative Information */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Shield size={18} style={{ color: '#006837' }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#006837' }}>
                Administrative Information
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#f0fdf4', borderRadius: 2, p: 2 }}>
              <InfoRow label="User ID" value={user.id} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="KYC Status" value={user.kycStatus} />
              <InfoRow label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
              <InfoRow label="Designation" value={user.designation} />
              <InfoRow label="Created" value={new Date(user.createdAt).toLocaleDateString()} />
            </Box>

            {/* Assignment Details */}
            {(user.assignedState || user.assignedLGA || user.assignedWard) && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.8rem', color: '#166534', mb: 1 }}>
                  Assignment Details
                </Typography>
                <InfoRow label="Assigned State" value={user.assignedState} />
                <InfoRow label="Assigned LGA" value={user.assignedLGA} />
                <InfoRow label="Assigned Ward" value={user.assignedWard} />
              </Box>
            )}
          </Box>

          {/* Voting Bloc Activity */}
          {(user.ownedVotingBlocsCount !== undefined && user.ownedVotingBlocsCount > 0) && (
            <>
              <Divider />
              <Box>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#7c3aed', mb: 1.5 }}>
                  Voting Bloc Activity
                </Typography>
                <Box sx={{ bgcolor: '#faf5ff', borderRadius: 2, p: 2 }}>
                  <InfoRow label="Owned Voting Blocs" value={String(user.ownedVotingBlocsCount)} />
                  <InfoRow label="Total Members" value={String(user.totalMembersInOwnedBlocs || 0)} />
                  <InfoRow label="Last Activity" value={user.lastVotingBlocActivity ? new Date(user.lastVotingBlocActivity).toLocaleDateString() : 'No activity'} />
                </Box>
              </Box>
            </>
          )}

          <Divider />

          {/* Contact Information */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: '#b45309', mb: 1.5 }}>
              Contact Information
            </Typography>
            <Box sx={{ bgcolor: '#fefce8', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Mail size={16} style={{ color: '#6b7280' }} />
                <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#6b7280', width: 50 }}>Email:</Typography>
                <Typography
                  component="a"
                  href={`mailto:${user.email}`}
                  sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {user.email}
                </Typography>
              </Box>
              {user.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone size={16} style={{ color: '#6b7280' }} />
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#6b7280', width: 50 }}>Phone:</Typography>
                  <Typography
                    component="a"
                    href={`tel:${user.phone}`}
                    sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {user.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Fixed Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ fontFamily: FONT, textTransform: 'none', borderColor: '#d1d5db', color: '#374151', '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' } }}
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
};

export default AdminViewUserModal;