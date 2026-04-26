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
import { Search, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { getAdcSubmissions, approveAdcUser, rejectAdcUser } from '../../services/adcService';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

const ADC_STATUSES = ['all', 'pending', 'verified', 'rejected'];

interface AdcSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  adcStatus: string;
  adcCardImage?: string;
  adcRejectionReason?: string;
  adcSubmittedAt?: string;
  adcReviewedAt?: string;
  votingState?: string;
  votingLGA?: string;
  designation?: string;
}

const AdcChip = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
    verified: { label: 'Verified', color: '#059669', bg: '#D1FAE5' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
  };
  const c = config[status] || { label: status, color: '#666', bg: '#f0f0f0' };
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.7rem', bgcolor: c.bg, color: c.color }}
    />
  );
};

export default function AdcPage() {
  const [submissions, setSubmissions] = useState<AdcSubmission[]>([]);
  const [stats, setStats] = useState<{ pending: string; verified: string; rejected: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [drawerUser, setDrawerUser] = useState<AdcSubmission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdcSubmissions({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      setSubmissions(data.submissions || []);
      setStats(data.stats || null);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load ADC submissions', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const openDrawer = (user: AdcSubmission) => {
    setDrawerUser(user);
    setDrawerOpen(true);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!drawerUser) return;
    setActionLoading(true);
    try {
      await approveAdcUser(drawerUser.id);
      setToast({ message: `${drawerUser.name} approved!`, severity: 'success' });
      setDrawerOpen(false);
      load();
    } catch (err) {
      setToast({ message: 'Failed to approve', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!drawerUser) return;
    setActionLoading(true);
    try {
      await rejectAdcUser(drawerUser.id, rejectionReason || 'Card image could not be verified');
      setToast({ message: `${drawerUser.name} rejected`, severity: 'success' });
      setDrawerOpen(false);
      load();
    } catch (err) {
      setToast({ message: 'Failed to reject', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.5rem', mb: 3 }}>
        ADC Membership Verification
      </Typography>

      {/* Stats */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Pending', value: stats.pending, color: '#D97706', bg: '#FEF3C7' },
            { label: 'Verified', value: stats.verified, color: '#059669', bg: '#D1FAE5' },
            { label: 'Rejected', value: stats.rejected, color: '#DC2626', bg: '#FEE2E2' },
          ].map((s) => (
            <Card key={s.label} elevation={0} sx={{ flex: 1, minWidth: 120, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>
                  {s.label}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '1.5rem', fontWeight: 700, color: s.color }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={16} color="#999" /></InputAdornment>,
            sx: { fontFamily: FONT, fontSize: '0.85rem', borderRadius: 2 },
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ fontFamily: FONT }}>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            sx={{ fontFamily: FONT, borderRadius: 2 }}
          >
            {ADC_STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontFamily: FONT, textTransform: 'capitalize' }}>
                {s === 'all' ? 'All' : s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem' }}>Member</TableCell>
              <TableCell sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem' }}>Location</TableCell>
              <TableCell sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
              <TableCell sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem' }}>Submitted</TableCell>
              <TableCell sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem' }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton height={20} /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontFamily: FONT, color: '#999' }}>No submissions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={user.profileImage || undefined} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 36, height: 36, bgcolor: PRIMARY }}>
                        {user.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem' }}>
                          {user.name}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#999' }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#555' }}>
                      {[user.votingState, user.votingLGA].filter(Boolean).join(', ') || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell><AdcChip status={user.adcStatus} /></TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#999' }}>
                      {user.adcSubmittedAt ? new Date(user.adcSubmittedAt).toLocaleDateString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openDrawer(user)}>
                      <Eye size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      {/* ─── Review Drawer ─── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}
      >
        {drawerUser && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem' }}>
                Review ADC Card
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}><X size={18} /></IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar src={drawerUser.profileImage || undefined} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 48, height: 48, bgcolor: PRIMARY }}>
                  {drawerUser.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.95rem' }}>{drawerUser.name}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#999' }}>{drawerUser.email}</Typography>
                  {drawerUser.designation && (
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: PRIMARY, fontWeight: 600 }}>{drawerUser.designation}</Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.8rem', color: '#999', mb: 1, textTransform: 'uppercase' }}>
                Membership Card
              </Typography>

              {drawerUser.adcCardImage ? (
                <Box
                  component="img"
                  src={drawerUser.adcCardImage}
                  alt="ADC Card"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2,
                  }}
                />
              ) : (
                <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#999', mb: 2 }}>
                  No card image uploaded
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <AdcChip status={drawerUser.adcStatus} />
                {drawerUser.votingState && (
                  <Chip label={drawerUser.votingState} size="small" sx={{ fontFamily: FONT, fontSize: '0.7rem' }} />
                )}
              </Box>

              {drawerUser.adcRejectionReason && (
                <Alert severity="warning" sx={{ fontFamily: FONT, fontSize: '0.8rem', mb: 2 }}>
                  <strong>Rejection reason:</strong> {drawerUser.adcRejectionReason}
                </Alert>
              )}

              {/* Reject form */}
              {showRejectForm && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { fontFamily: FONT, fontSize: '0.85rem', borderRadius: 2 } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleReject}
                      disabled={actionLoading}
                      sx={{ fontFamily: FONT, textTransform: 'none', borderRadius: 2 }}
                    >
                      {actionLoading ? <CircularProgress size={16} /> : 'Confirm Reject'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setShowRejectForm(false)}
                      sx={{ fontFamily: FONT, textTransform: 'none', color: '#666' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Actions */}
            {drawerUser.adcStatus === 'pending' && !showRejectForm && (
              <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleApprove}
                  disabled={actionLoading}
                  startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
                  sx={{
                    fontFamily: FONT,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: PRIMARY,
                    '&:hover': { bgcolor: '#005530' },
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  onClick={() => setShowRejectForm(true)}
                  startIcon={<XCircle size={16} />}
                  sx={{ fontFamily: FONT, fontWeight: 600, textTransform: 'none', borderRadius: 2 }}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Toast */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ fontFamily: FONT }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
