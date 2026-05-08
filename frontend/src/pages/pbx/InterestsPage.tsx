import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  HandHeart,
  Search,
  Users,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  Phone,
  XCircle,
  Eye,
  Mail,
  MapPin,
  Globe,
  MessageSquare,
  Briefcase,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '../../lib/apiClient';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

/* ─── Types ─── */
interface Interest {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: 'volunteer' | 'vote_protection_officer' | 'donor';
  state: string | null;
  lga: string | null;
  ward: string | null;
  is_diaspora: boolean;
  country: string | null;
  skills: string[] | null;
  experience_level: string | null;
  contribution_type: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'active' | 'declined';
  admin_notes: string | null;
  contacted_by_name: string | null;
  contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  thisWeek: number;
  thisMonth: number;
}

/* ─── Helpers ─── */
const ROLE_CONFIG: Record<string, { label: string; color: 'success' | 'primary' | 'warning'; icon: React.ReactNode }> = {
  volunteer: { label: 'Volunteer', color: 'success', icon: <Users size={14} /> },
  vote_protection_officer: { label: 'Vote Protection Officer', color: 'primary', icon: <Shield size={14} /> },
  donor: { label: 'Donor', color: 'warning', icon: <DollarSign size={14} /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'error' }> = {
  pending: { label: 'Pending', color: 'default' },
  contacted: { label: 'Contacted', color: 'info' },
  active: { label: 'Active', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
};

export default function InterestsPage() {
  /* ─── State ─── */
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [interests, setInterests] = useState<Interest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Detail dialog
  const [selected, setSelected] = useState<Interest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  /* ─── Fetchers ─── */
  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/api/involvement/stats');
      setStats(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/involvement/interests', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
          role: filterRole || undefined,
          status: filterStatus || undefined,
        },
      });
      setInterests(data.data);
      setTotal(data.meta.total);
    } catch {
      setToast({ message: 'Failed to fetch interests.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [page, rowsPerPage, search, filterRole, filterStatus]);

  /* ─── Status update ─── */
  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdatingStatus(true);
    try {
      const { data } = await apiClient.patch(`/api/involvement/interests/${id}/status`, {
        status,
        adminNotes: adminNotes || undefined,
      });
      setToast({ message: `Status updated to "${STATUS_CONFIG[status]?.label}"`, severity: 'success' });
      // Update local state
      setInterests((prev) => prev.map((i) => (i.id === id ? { ...i, ...data.data } : i)));
      if (selected?.id === id) setSelected({ ...selected, ...data.data });
      fetchStats();
    } catch {
      setToast({ message: 'Failed to update status.', severity: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDetail = (interest: Interest) => {
    setSelected(interest);
    setAdminNotes(interest.admin_notes || '');
    setDetailOpen(true);
  };

  /* ─── Stat cards ─── */
  const statCards = stats
    ? [
        { label: 'Total Interests', value: stats.total, icon: <HandHeart size={20} />, color: PRIMARY },
        { label: 'Volunteers', value: stats.byRole?.volunteer || 0, icon: <Users size={20} />, color: '#16a34a' },
        { label: 'Vote Protection', value: stats.byRole?.vote_protection_officer || 0, icon: <Shield size={20} />, color: '#0284c7' },
        { label: 'Donors', value: stats.byRole?.donor || 0, icon: <DollarSign size={20} />, color: '#ea580c' },
        { label: 'This Week', value: stats.thisWeek, icon: <TrendingUp size={20} />, color: '#7c3aed' },
        { label: 'Pending', value: stats.byStatus?.pending || 0, icon: <Clock size={20} />, color: '#d97706' },
      ]
    : [];

  return (
    <Box sx={{ fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HandHeart size={24} color={PRIMARY} />
          Involvement Interests
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          People who expressed interest in volunteering, vote protection, or donating.
        </Typography>
      </Box>

      {/* ──── Stats Row ──── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 3 }}>
        {loadingStats
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Skeleton width={70} height={14} />
                  <Skeleton width={50} height={28} sx={{ mt: 0.5 }} />
                </CardContent>
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.label} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontFamily: FONT, fontSize: '0.7rem' }}>
                      {s.label}
                    </Typography>
                    <Box sx={{ color: s.color, opacity: 0.5 }}>{s.icon}</Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: FONT, mt: 0.25, color: s.color }}>
                    {s.value.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
      </Box>

      {/* ──── Filters ──── */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search size={16} /></InputAdornment>
              ),
            }}
            sx={{ minWidth: 240, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select value={filterRole} label="Role" onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}>
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
              <MenuItem value="vote_protection_officer">Vote Protection Officer</MenuItem>
              <MenuItem value="donor">Donor</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* ──── Table ──── */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600, fontFamily: FONT }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={70} /></TableCell>
                    <TableCell><Skeleton width={90} /></TableCell>
                    <TableCell><Skeleton width={40} /></TableCell>
                  </TableRow>
                ))
              ) : interests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <HandHeart size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <Typography variant="body2">{search || filterRole || filterStatus ? 'No results match your filters.' : 'No involvement interests yet.'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                interests.map((interest) => {
                  const roleConf = ROLE_CONFIG[interest.role] || { label: interest.role, color: 'default' as const, icon: null };
                  const statusConf = STATUS_CONFIG[interest.status] || { label: interest.status, color: 'default' as const };

                  return (
                    <TableRow key={interest.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(interest)}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: FONT }}>{interest.full_name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{interest.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleConf.label}
                          color={roleConf.color}
                          size="small"
                          variant="outlined"
                          icon={<Box sx={{ display: 'flex', pl: 0.5 }}>{roleConf.icon}</Box>}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {interest.is_diaspora
                            ? `🌍 ${interest.country || 'Diaspora'}`
                            : [interest.state, interest.lga].filter(Boolean).join(', ') || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusConf.label} color={statusConf.color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDistanceToNow(new Date(interest.created_at), { addSuffix: true })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openDetail(interest); }}>
                          <Eye size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25, 50]}
        />
      </Card>

      {/* ──── Detail Dialog ──── */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        {selected && (() => {
          const roleConf = ROLE_CONFIG[selected.role] || { label: selected.role, color: 'default' as const, icon: null };
          const statusConf = STATUS_CONFIG[selected.status] || { label: selected.status, color: 'default' as const };

          return (
            <>
              <DialogTitle sx={{ fontFamily: FONT, fontWeight: 600, pb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {selected.full_name}
                  <Chip label={statusConf.label} color={statusConf.color} size="small" />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                  Submitted {format(new Date(selected.created_at), 'MMM d, yyyy · h:mm a')}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  {/* Role */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip label={roleConf.label} color={roleConf.color} size="small" icon={<Box sx={{ display: 'flex', pl: 0.5 }}>{roleConf.icon}</Box>} />
                  </Box>

                  {/* Contact */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={14} style={{ opacity: 0.5 }} />
                      <Typography variant="body2">{selected.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone size={14} style={{ opacity: 0.5 }} />
                      <Typography variant="body2">{selected.phone}</Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selected.is_diaspora ? <Globe size={14} style={{ opacity: 0.5 }} /> : <MapPin size={14} style={{ opacity: 0.5 }} />}
                    <Typography variant="body2">
                      {selected.is_diaspora
                        ? `Diaspora — ${selected.country || 'Not specified'}`
                        : [selected.state, selected.lga, selected.ward].filter(Boolean).join(' → ') || 'Not specified'}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Role-specific info */}
                  {selected.role === 'volunteer' && selected.skills?.length && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Sparkles size={13} /> Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.skills.map((s) => (
                          <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selected.role === 'vote_protection_officer' && selected.experience_level && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Briefcase size={13} /> Experience
                      </Typography>
                      <Typography variant="body2">{selected.experience_level}</Typography>
                    </Box>
                  )}

                  {selected.role === 'donor' && selected.contribution_type && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DollarSign size={13} /> Contribution Type
                      </Typography>
                      <Typography variant="body2">{selected.contribution_type}</Typography>
                    </Box>
                  )}

                  {/* Message */}
                  {selected.message && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MessageSquare size={13} /> Message
                      </Typography>
                      <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2, mt: 0.5 }}>
                        {selected.message}
                      </Typography>
                    </Box>
                  )}

                  {/* Contacted info */}
                  {selected.contacted_by_name && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Contacted by <strong>{selected.contacted_by_name}</strong>{' '}
                      {selected.contacted_at && `on ${format(new Date(selected.contacted_at), 'MMM d, yyyy')}`}
                    </Typography>
                  )}

                  <Divider />

                  {/* Admin notes */}
                  <TextField
                    label="Admin Notes"
                    multiline
                    rows={2}
                    size="small"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this person…"
                    fullWidth
                  />

                  {/* Status buttons */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                      Update Status
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(['pending', 'contacted', 'active', 'declined'] as const).map((s) => (
                        <Button
                          key={s}
                          size="small"
                          variant={selected.status === s ? 'contained' : 'outlined'}
                          disabled={updatingStatus || selected.status === s}
                          onClick={() => handleStatusUpdate(selected.id, s)}
                          startIcon={
                            s === 'pending' ? <Clock size={14} /> :
                            s === 'contacted' ? <Phone size={14} /> :
                            s === 'active' ? <CheckCircle size={14} /> :
                            <XCircle size={14} />
                          }
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            ...(selected.status === s && s === 'active' && { bgcolor: PRIMARY, '&:hover': { bgcolor: '#005530' } }),
                          }}
                        >
                          {STATUS_CONFIG[s].label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setDetailOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* Toast */}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
