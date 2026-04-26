import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Pagination,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  Divider,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, Eye, X, ShieldCheck, Clock, ShieldX, FileText, CheckCircle, XCircle } from 'lucide-react';
import { adminUserManagementService } from '../../services/adminUserManagementService';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

const KYC_STATUSES = ['all', 'approved', 'pending', 'rejected', 'draft'];

interface KYCSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  kycStatus: string;
  kycRejectionReason?: string;
  votingState?: string;
  votingLGA?: string;
  createdAt: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    phoneNumber?: string;
    gender?: string;
    lga?: string;
    ward?: string;
    ageRange?: string;
    stateOfOrigin?: string;
    citizenship?: string;
    isVoter?: string;
  };
  validID?: {
    idType?: string;
    idNumber?: string;
    idImageUrl?: string;
  };
  selfieImageUrl?: string;
}

interface KYCStats {
  approved: string;
  pending: string;
  rejected: string;
  draft: string;
}

export default function MembershipPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');

  // Drawer state
  const [drawerUser, setDrawerUser] = useState<KYCSubmission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      if (kycFilter !== 'all') params.status = kycFilter;

      const result = await adminUserManagementService.getKYCSubmissions(params);
      setSubmissions(result.data?.submissions || []);
      setTotalPages(result.data?.pagination?.totalPages || 1);
      if (result.data?.stats) setStats(result.data.stats);
    } catch (err) {
      console.error('Error loading KYC submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, kycFilter]);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  // Debounced search reset
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openDrawer = (user: KYCSubmission) => {
    setDrawerUser(user);
    setDrawerOpen(true);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerUser(null);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!drawerUser) return;
    setActionLoading(true);
    try {
      await adminUserManagementService.approveKYC(drawerUser._id);
      setToast({ message: 'KYC approved successfully', severity: 'success' });
      // Update local state
      setDrawerUser({ ...drawerUser, kycStatus: 'approved', kycRejectionReason: '' });
      setSubmissions(prev => prev.map(s => s._id === drawerUser._id ? { ...s, kycStatus: 'approved', kycRejectionReason: '' } : s));
      loadSubmissions();
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || 'Failed to approve KYC', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!drawerUser || !rejectionReason.trim()) {
      setToast({ message: 'Please provide a rejection reason', severity: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      await adminUserManagementService.rejectKYC(drawerUser._id, rejectionReason.trim());
      setToast({ message: 'KYC rejected', severity: 'success' });
      setDrawerUser({ ...drawerUser, kycStatus: 'rejected', kycRejectionReason: rejectionReason.trim() });
      setSubmissions(prev => prev.map(s => s._id === drawerUser._id ? { ...s, kycStatus: 'rejected' } : s));
      setShowRejectForm(false);
      setRejectionReason('');
      loadSubmissions();
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || 'Failed to reject KYC', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = [
    { label: 'Verified', count: stats?.approved || '0', icon: <ShieldCheck size={20} />, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Pending', count: stats?.pending || '0', icon: <Clock size={20} />, color: '#d97706', bg: '#fffbeb' },
    { label: 'Rejected', count: stats?.rejected || '0', icon: <ShieldX size={20} />, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Draft', count: stats?.draft || '0', icon: <FileText size={20} />, color: '#6b7280', bg: '#f9fafb' },
  ];

  return (
    <Box sx={{ fontFamily: FONT }}>
      <Typography variant="h4" sx={{ mb: 0.5, fontFamily: FONT, fontWeight: 700 }}>Membership</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: FONT }}>
        Review KYC verification submissions and manage member verification status.
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {statCards.map((s) => (
          <Card key={s.label} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: FONT, lineHeight: 1.2 }}>{s.count}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>{s.label}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <TextField
            placeholder="Search by name, email, or phone..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240, fontFamily: FONT }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start"><Search size={18} /></InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ fontFamily: FONT }}>KYC Status</InputLabel>
            <Select
              value={kycFilter}
              label="KYC Status"
              onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
              sx={{ fontFamily: FONT }}
            >
              {KYC_STATUSES.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontFamily: FONT }}>
                  {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Table */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT, display: { xs: 'none', md: 'table-cell' } }}>ID Type</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT, display: { xs: 'none', md: 'table-cell' } }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : submissions.map((user) => (
                    <TableRow key={user._id} hover sx={{ cursor: 'pointer' }} onClick={() => openDrawer(user)}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={user.profileImage} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: PRIMARY }}>
                            {user.name?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: FONT }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>{user.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ fontFamily: FONT }}>{user.validID?.idType || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: FONT }}>{user.votingState || '—'}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ fontFamily: FONT }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <KycChip status={user.kycStatus} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openDrawer(user); }}>
                          <Eye size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <ShieldCheck size={40} style={{ color: '#9ca3af', marginBottom: 8 }} />
                    <Typography color="text.secondary" sx={{ fontFamily: FONT }}>No KYC submissions found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>

      {/* KYC Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, fontFamily: FONT } }}
      >
        {drawerUser && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontFamily: FONT, fontWeight: 600 }}>KYC Review</Typography>
              <IconButton onClick={closeDrawer} size="small"><X size={20} /></IconButton>
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
              {/* Status Banner */}
              <StatusBanner status={drawerUser.kycStatus} reason={drawerUser.kycRejectionReason} />

              {/* User Profile */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2.5 }}>
                <Avatar src={drawerUser.profileImage} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 56, height: 56, bgcolor: PRIMARY, fontSize: '1.25rem' }}>
                  {drawerUser.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: FONT }}>{drawerUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: FONT }}>{drawerUser.email}</Typography>
                  {drawerUser.phone && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>{drawerUser.phone}</Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Personal Info */}
              {drawerUser.personalInfo && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: FONT, fontWeight: 600, mb: 1.5, color: '#374151' }}>Personal Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <InfoItem label="First Name" value={drawerUser.personalInfo.firstName} />
                    <InfoItem label="Last Name" value={drawerUser.personalInfo.lastName} />
                    <InfoItem label="Username" value={drawerUser.personalInfo.userName} />
                    <InfoItem label="Gender" value={drawerUser.personalInfo.gender} />
                    <InfoItem label="Age Range" value={drawerUser.personalInfo.ageRange} />
                    <InfoItem label="State of Origin" value={drawerUser.personalInfo.stateOfOrigin} />
                    <InfoItem label="Citizenship" value={drawerUser.personalInfo.citizenship} />
                    <InfoItem label="Registered Voter" value={drawerUser.personalInfo.isVoter} />
                  </Box>
                </Box>
              )}

              {/* Location */}
              {(drawerUser.votingState || drawerUser.votingLGA) && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: FONT, fontWeight: 600, mb: 1.5, color: '#374151' }}>Voting Location</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <InfoItem label="State" value={drawerUser.votingState} />
                    <InfoItem label="LGA" value={drawerUser.votingLGA} />
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* ID Document */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: FONT, fontWeight: 600, mb: 1.5, color: '#374151' }}>ID Document</Typography>
                {drawerUser.validID?.idType ? (
                  <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                      <InfoItem label="ID Type" value={drawerUser.validID.idType} />
                      <InfoItem label="ID Number" value={drawerUser.validID.idNumber} />
                    </Box>
                    {drawerUser.validID.idImageUrl && (
                      <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden', mb: 1 }}>
                        <img
                          src={drawerUser.validID.idImageUrl}
                          alt="ID Document"
                          style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block', background: '#f9fafb' }}
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: FONT }}>No ID document uploaded.</Typography>
                )}
              </Box>

              {/* Selfie */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: FONT, fontWeight: 600, mb: 1.5, color: '#374151' }}>Selfie Verification</Typography>
                {drawerUser.selfieImageUrl ? (
                  <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                    <img
                      src={drawerUser.selfieImageUrl}
                      alt="User Selfie"
                      style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block', background: '#f9fafb' }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: FONT }}>No selfie uploaded.</Typography>
                )}
              </Box>
            </Box>

            {/* Footer Actions */}
            <Box sx={{ borderTop: '1px solid #e5e7eb', px: 3, py: 2 }}>
              {showRejectForm ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    sx={{ mb: 1.5, fontFamily: FONT }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                      disabled={actionLoading}
                      sx={{ flex: 1, fontFamily: FONT, textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <XCircle size={16} />}
                      sx={{ flex: 1, fontFamily: FONT, textTransform: 'none' }}
                    >
                      Confirm Reject
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {drawerUser.kycStatus !== 'approved' && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleApprove}
                      disabled={actionLoading}
                      startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
                      sx={{
                        fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                        bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }
                      }}
                    >
                      Approve KYC
                    </Button>
                  )}
                  {drawerUser.kycStatus !== 'rejected' && (
                    <Button
                      variant="outlined"
                      fullWidth
                      color="error"
                      onClick={() => setShowRejectForm(true)}
                      disabled={actionLoading}
                      startIcon={<XCircle size={16} />}
                      sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600 }}
                    >
                      Reject KYC
                    </Button>
                  )}
                  {drawerUser.kycStatus === 'approved' && (
                    <Button
                      variant="outlined"
                      fullWidth
                      color="error"
                      onClick={() => setShowRejectForm(true)}
                      disabled={actionLoading}
                      startIcon={<XCircle size={16} />}
                      sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600 }}
                    >
                      Revoke Approval
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity} variant="filled" sx={{ fontFamily: FONT }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ── Helper Components ──────────────────────────────── */

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: '"Poppins", sans-serif' }}>{value || '—'}</Typography>
    </Box>
  );
}

function KycChip({ status }: { status?: string }) {
  const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
  };
  return (
    <Chip
      label={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft'}
      size="small"
      color={colorMap[status || ''] || 'default'}
      variant="outlined"
      sx={{ fontFamily: '"Poppins", sans-serif' }}
    />
  );
}

function StatusBanner({ status, reason }: { status: string; reason?: string }) {
  const config: Record<string, { bg: string; border: string; color: string; icon: React.ReactNode; label: string }> = {
    approved: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', icon: <ShieldCheck size={18} />, label: 'KYC Verified' },
    pending: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: <Clock size={18} />, label: 'Pending Review' },
    rejected: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: <ShieldX size={18} />, label: 'KYC Rejected' },
    draft: { bg: '#f9fafb', border: '#e5e7eb', color: '#374151', icon: <FileText size={18} />, label: 'Draft — Incomplete' },
  };
  const c = config[status] || config.draft;
  return (
    <Box sx={{ bgcolor: c.bg, border: `1px solid ${c.border}`, borderRadius: 2, px: 2, py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: c.color }}>
        {c.icon}
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>{c.label}</Typography>
      </Box>
      {status === 'rejected' && reason && (
        <Typography variant="caption" sx={{ color: c.color, mt: 0.5, display: 'block', fontFamily: '"Poppins", sans-serif' }}>
          Reason: {reason}
        </Typography>
      )}
    </Box>
  );
}
