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
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Tooltip,
  Stack,
  LinearProgress,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Eye,
  Edit2,
  Shield,
  ShieldOff,
  Key,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Send,
  Plus,
  Download,
  MoreVertical,
  AlertTriangle,
  Phone,
  Wrench,
} from 'lucide-react';
import { adminUserManagementService } from '../../services/adminUserManagementService';
import { adminMaintenanceService } from '../../services/adminMaintenanceService';
import AdminCreateUserModal from '../../components/modals/AdminCreateUserModal';
import AdminEditUserModal from '../../components/modals/AdminEditUserModal';
import AdminViewUserModal from '../../components/modals/AdminViewUserModal';
import MonitorKeyAssignmentModal from '../../components/MonitorKeyAssignmentModal';
import EnhancedVolunteerAssignmentModal from '../../components/callCenter/EnhancedVolunteerAssignmentModal';

/* ── Types ─────────────────────────────────────────────── */

interface User {
  id: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  kycStatus: 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected';
  profileImage?: string;
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  votingPU?: string;
  gender?: string;
  ageRange?: string;
  citizenship?: string;
  isVoter?: boolean;
  stateOfOrigin?: string;
  countryOfResidence?: string;
  designation?: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;
  createdAt: string;
  updatedAt: string;
  totalMembersInOwnedBlocs: number;
  ownedVotingBlocsCount: number;
  lastVotingBlocActivity?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  newUsersMonth: number;
}

interface UnverifiedStats {
  count: number;
  recentSignups: number;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  severity: 'error' | 'warning';
  loading: boolean;
  onConfirm: () => Promise<void>;
}

/* ── Component ─────────────────────────────────────────── */

export default function UsersPage() {
  // Table data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [limit, setLimit] = useState(25);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [sortKey, setSortKey] = useState('createdAt-DESC');

  // Stats
  const [stats, setStats] = useState<UserStats | null>(null);
  const [unverifiedStats, setUnverifiedStats] = useState<UnverifiedStats | null>(null);

  // Selection & bulk
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Menus
  const [rowMenu, setRowMenu] = useState<{ el: HTMLElement; user: User } | null>(null);
  const [headerMenu, setHeaderMenu] = useState<HTMLElement | null>(null);

  // Per-action loading
  const [, setActionLoading] = useState<Record<string, boolean>>({});

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; user: any | null }>({ isOpen: false, user: null });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; user: any | null }>({ isOpen: false, user: null });
  const [loadingUserId, setLoadingUserId] = useState<{ id: string; type: 'view' | 'edit' } | null>(null);
  const [monitorKeyModal, setMonitorKeyModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [volunteerModal, setVolunteerModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });

  // Confirm dialog
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, title: '', message: '', confirmLabel: '', severity: 'warning', loading: false,
    onConfirm: async () => {},
  });

  // Notifications
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Bulk email
  const [bulkEmailActive, setBulkEmailActive] = useState(false);
  const [bulkEmailProgress, setBulkEmailProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [exportLoading, setExportLoading] = useState(false);

  /* ── Helpers ──────────────────────────────────────────── */

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setNotification({ message, severity });

  const uid = (user: User | any) => user._id || user.id;

  const showConfirm = (config: Omit<ConfirmState, 'open' | 'loading'>) =>
    setConfirm({ ...config, open: true, loading: false });

  const closeConfirm = () => setConfirm(prev => ({ ...prev, open: false }));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const kycChipColor = (s: string): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (s) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  /* ── Data Loading ────────────────────────────────────── */

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sortKey.split('-');
      const params: Record<string, any> = {
        page, limit, sortBy, sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
        ...(kycFilter && { kycStatus: kycFilter }),
        ...(emailFilter && { emailVerified: emailFilter }),
      };
      const res = await adminUserManagementService.getAllUsers(params);
      setUsers(res.data?.users || []);
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        if (res.data.pagination.total !== undefined) setTotal(res.data.pagination.total);
      }
    } catch {
      notify('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, roleFilter, kycFilter, emailFilter, sortKey]);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminUserManagementService.getUserStatistics();
      setStats(res.data?.statistics || res.data);
    } catch { /* silent */ }
  }, []);

  const loadUnverifiedStats = useCallback(async () => {
    try {
      const res = await adminUserManagementService.getUnverifiedUsersStats();
      const s = res.data?.stats;
      if (s) {
        setUnverifiedStats({
          count: parseInt(s.total_unverified) || 0,
          recentSignups: parseInt(s.unverified_last_7d) || 0,
        });
      }
    } catch { /* silent */ }
  }, []);

  /* ── Effects ─────────────────────────────────────────── */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => { loadStats(); loadUnverifiedStats(); }, [loadStats, loadUnverifiedStats]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, roleFilter, kycFilter, emailFilter, sortKey]);

  /* ── Action Handlers ─────────────────────────────────── */

  const handleRoleToggle = (user: User) => {
    const promoting = user.role !== 'admin';
    showConfirm({
      title: promoting ? 'Promote to Admin' : 'Remove Admin Rights',
      message: promoting
        ? `Promote "${user.name}" to admin? They'll get full administrative access.`
        : `Remove admin rights from "${user.name}"? They'll lose all admin privileges.`,
      confirmLabel: promoting ? 'Promote' : 'Remove',
      severity: 'warning',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, loading: true }));
        try {
          await adminUserManagementService.updateUserRole(uid(user), promoting ? 'admin' : 'user');
          notify(`${user.name} ${promoting ? 'promoted to admin' : 'set to regular user'}`);
          loadUsers(); loadStats();
        } catch (e: any) {
          notify(e?.response?.data?.message || 'Failed to update role', 'error');
        }
        closeConfirm();
      },
    });
  };

  const handleEmailVerifyToggle = (user: User) => {
    if (!user.emailVerified) {
      (async () => {
        setActionLoading(p => ({ ...p, [`verify-${uid(user)}`]: true }));
        try {
          await adminUserManagementService.updateUserStatus(uid(user), { emailVerified: true });
          notify(`${user.name}'s email verified`);
          loadUsers();
        } catch (e: any) {
          notify(e?.response?.data?.message || 'Failed to verify', 'error');
        } finally {
          setActionLoading(p => ({ ...p, [`verify-${uid(user)}`]: false }));
        }
      })();
    } else {
      showConfirm({
        title: 'Unverify Email',
        message: `Unverify "${user.name}"'s email? They'll need to verify again.`,
        confirmLabel: 'Unverify',
        severity: 'warning',
        onConfirm: async () => {
          setConfirm(p => ({ ...p, loading: true }));
          try {
            await adminUserManagementService.updateUserStatus(uid(user), { emailVerified: false });
            notify(`${user.name}'s email unverified`);
            loadUsers();
          } catch (e: any) {
            notify(e?.response?.data?.message || 'Failed to unverify', 'error');
          }
          closeConfirm();
        },
      });
    }
  };

  const handleResendEmail = async (user: User) => {
    setActionLoading(p => ({ ...p, [`email-${uid(user)}`]: true }));
    try {
      await adminUserManagementService.resendVerificationEmail(uid(user));
      notify(`Verification email sent to ${user.email}`);
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Failed to send email', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [`email-${uid(user)}`]: false }));
    }
  };

  const handlePasswordReset = async (user: User) => {
    setActionLoading(p => ({ ...p, [`pwd-${uid(user)}`]: true }));
    try {
      await adminUserManagementService.forcePasswordReset(uid(user));
      notify(`Password reset email sent to ${user.email}`);
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [`pwd-${uid(user)}`]: false }));
    }
  };

  const handleDeleteUser = (user: User) => {
    showConfirm({
      title: 'Delete User',
      message: `Permanently delete "${user.name}"? This removes all their data and cannot be undone.`,
      confirmLabel: 'Delete',
      severity: 'error',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, loading: true }));
        try {
          await adminUserManagementService.deleteUser(uid(user));
          notify(`${user.name} deleted`);
          loadUsers(); loadStats();
        } catch (e: any) {
          notify(e?.response?.data?.message || 'Failed to delete user', 'error');
        }
        closeConfirm();
      },
    });
  };

  /* ── Bulk Actions ────────────────────────────────────── */

  const handleBulkAction = async () => {
    if (!selected.length || !bulkAction) return;

    const actionMap: Record<string, { action: string; data: any; label: string }> = {
      makeAdmin: { action: 'updateRole', data: { role: 'admin' }, label: 'promoted to admin' },
      makeUser: { action: 'updateRole', data: { role: 'user' }, label: 'set to regular user' },
      verifyEmail: { action: 'updateEmailVerified', data: { emailVerified: true }, label: 'email verified' },
      unverifyEmail: { action: 'updateEmailVerified', data: { emailVerified: false }, label: 'email unverified' },
    };

    if (bulkAction === 'resendEmails') {
      setBulkLoading(true);
      const unverified = users.filter(u => selected.includes(uid(u)) && !u.emailVerified);
      if (!unverified.length) { notify('No unverified users in selection', 'error'); setBulkLoading(false); return; }
      let sent = 0, failed = 0;
      for (const u of unverified) {
        try { await adminUserManagementService.resendVerificationEmail(uid(u)); sent++; }
        catch { failed++; }
      }
      notify(failed ? `Sent ${sent}, ${failed} failed` : `Sent ${sent} verification emails`);
      setSelected([]); setBulkAction(''); setBulkLoading(false);
      return;
    }

    if (actionMap[bulkAction]) {
      const { action, data, label } = actionMap[bulkAction];
      showConfirm({
        title: 'Bulk Action',
        message: `Apply "${label}" to ${selected.length} user(s)?`,
        confirmLabel: 'Apply',
        severity: 'warning',
        onConfirm: async () => {
          setConfirm(p => ({ ...p, loading: true }));
          try {
            await adminUserManagementService.bulkUpdateUsers(selected, action, data);
            notify(`${selected.length} users ${label}`);
            setSelected([]); setBulkAction(''); loadUsers(); loadStats();
          } catch (e: any) {
            notify(e?.response?.data?.message || 'Bulk operation failed', 'error');
          }
          closeConfirm();
        },
      });
    }
  };

  /* ── Header Menu Actions ─────────────────────────────── */

  const handleExportCSV = async () => {
    setExportLoading(true);
    setHeaderMenu(null);
    try {
      const res = await adminUserManagementService.exportVerifiedUsersCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verified-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      notify('Users exported successfully');
    } catch {
      notify('Failed to export', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleBulkEmailAll = () => {
    setHeaderMenu(null);
    if (!unverifiedStats || unverifiedStats.count === 0) {
      notify('No unverified users found', 'error');
      return;
    }
    showConfirm({
      title: 'Resend All Verification Emails',
      message: `Send verification emails to all ${unverifiedStats.count} unverified users? This may take several minutes.`,
      confirmLabel: `Send ${unverifiedStats.count} Emails`,
      severity: 'warning',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, loading: true }));
        setBulkEmailActive(true);
        setBulkEmailProgress({ sent: 0, failed: 0, total: unverifiedStats.count });
        try {
          const res = await adminUserManagementService.resendAllVerificationEmails();
          const { successful = 0, failed = 0 } = res.data?.results || {};
          setBulkEmailProgress({ sent: successful, failed, total: unverifiedStats.count });
          notify(failed ? `Sent ${successful}, ${failed} failed` : `Sent ${successful} verification emails`);
          loadUnverifiedStats(); loadUsers();
        } catch (e: any) {
          notify(e?.response?.data?.message || 'Bulk email failed', 'error');
        }
        closeConfirm();
        setTimeout(() => setBulkEmailActive(false), 5000);
      },
    });
  };

  const handleCleanupDuplicates = () => {
    setHeaderMenu(null);
    showConfirm({
      title: 'Cleanup Duplicate Auto Blocs',
      message: 'Find and remove duplicate auto-generated voting blocs? This keeps the oldest bloc for each user.',
      confirmLabel: 'Clean Up',
      severity: 'warning',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, loading: true }));
        try {
          const data = await adminMaintenanceService.cleanupDuplicateAutoBlocs();
          if (data.success) {
            const { blocsDeleted, usersCleaned } = data.stats;
            notify(blocsDeleted === 0
              ? 'No duplicates found — data is clean'
              : `Cleaned ${usersCleaned} users, deleted ${blocsDeleted} duplicates`);
          }
        } catch (e: any) {
          notify(e?.response?.data?.message || 'Cleanup failed', 'error');
        }
        closeConfirm();
      },
    });
  };

  /* ── Modal Openers ───────────────────────────────────── */

  const openViewModal = async (user: User) => {
    setLoadingUserId({ id: uid(user), type: 'view' });
    try {
      const res = await adminUserManagementService.getUserDetails(uid(user));
      setViewModal({ isOpen: true, user: res.data?.user || res.data });
    } catch {
      notify('Failed to load user details', 'error');
    } finally {
      setLoadingUserId(null);
    }
  };

  const openEditModal = async (user: User) => {
    setLoadingUserId({ id: uid(user), type: 'edit' });
    try {
      const res = await adminUserManagementService.getUserDetails(uid(user));
      setEditModal({ isOpen: true, user: res.data?.user || res.data });
    } catch {
      notify('Failed to load user details', 'error');
    } finally {
      setLoadingUserId(null);
    }
  };

  /* ── Selection ───────────────────────────────────────── */

  const allSelected = users.length > 0 && selected.length === users.length;
  const someSelected = selected.length > 0 && selected.length < users.length;
  const toggleAll = () => setSelected(allSelected ? [] : users.map(u => uid(u)));
  const toggleOne = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  /* ── Stat cards config ───────────────────────────────── */

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: '#3b82f6' },
    { label: 'Admins', value: stats.totalAdmins, color: '#8b5cf6' },
    { label: 'Verified', value: stats.verifiedUsers, color: '#0B6739' },
    { label: 'Unverified', value: stats.unverifiedUsers, color: '#f59e0b',
      sub: unverifiedStats?.recentSignups ? `+${unverifiedStats.recentSignups} this week` : undefined },
    { label: 'New This Month', value: stats.newUsersMonth, color: '#06b6d4' },
  ] : [];

  /* ── Render ──────────────────────────────────────────── */

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>User Management</Typography>
          <Typography variant="body2">Manage platform users, roles, and permissions</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>
            Create User
          </Button>
          <IconButton
            onClick={(e) => setHeaderMenu(e.currentTarget)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
          >
            <MoreVertical size={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* Header overflow menu */}
      <Menu
        anchorEl={headerMenu}
        open={!!headerMenu}
        onClose={() => setHeaderMenu(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleExportCSV} disabled={exportLoading}>
          <ListItemIcon><Download size={16} /></ListItemIcon>
          <ListItemText>{exportLoading ? 'Exporting...' : 'Export Verified Users CSV'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleBulkEmailAll}>
          <ListItemIcon><Send size={16} /></ListItemIcon>
          <ListItemText>
            Resend All Verification Emails{unverifiedStats ? ` (${unverifiedStats.count})` : ''}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCleanupDuplicates}>
          <ListItemIcon><Wrench size={16} /></ListItemIcon>
          <ListItemText>Cleanup Duplicate Auto Blocs</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Stats ── */}
      {statCards.length > 0 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2, mb: 3,
        }}>
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {s.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: s.color, mt: 0.5 }}>
                  {s.value?.toLocaleString()}
                </Typography>
                {s.sub && (
                  <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 500 }}>
                    {s.sub}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ── Bulk Email Progress ── */}
      {bulkEmailActive && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={18} />}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Sending verification emails... {bulkEmailProgress.sent + bulkEmailProgress.failed}/{bulkEmailProgress.total}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={bulkEmailProgress.total ? ((bulkEmailProgress.sent + bulkEmailProgress.failed) / bulkEmailProgress.total) * 100 : 0}
              sx={{ borderRadius: 1 }}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              <Typography variant="caption">Sent: {bulkEmailProgress.sent}</Typography>
              <Typography variant="caption">Failed: {bulkEmailProgress.failed}</Typography>
            </Stack>
          </Box>
        </Alert>
      )}

      {/* ── Filters ── */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', py: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search by name, email, or phone..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>KYC Status</InputLabel>
            <Select value={kycFilter} label="KYC Status" onChange={(e) => setKycFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="unsubmitted">Unsubmitted</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Email</InputLabel>
            <Select value={emailFilter} label="Email" onChange={(e) => setEmailFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Verified</MenuItem>
              <MenuItem value="false">Unverified</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort</InputLabel>
            <Select value={sortKey} label="Sort" onChange={(e) => setSortKey(e.target.value)}>
              <MenuItem value="createdAt-DESC">Newest First</MenuItem>
              <MenuItem value="createdAt-ASC">Oldest First</MenuItem>
              <MenuItem value="name-ASC">Name A–Z</MenuItem>
              <MenuItem value="name-DESC">Name Z–A</MenuItem>
              <MenuItem value="email-ASC">Email A–Z</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* ── Bulk Actions Bar ── */}
      {selected.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
              {selected.length} selected
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} displayEmpty>
                <MenuItem value="" disabled>Choose action...</MenuItem>
                <MenuItem value="makeAdmin">Make Admin</MenuItem>
                <MenuItem value="makeUser">Make User</MenuItem>
                <MenuItem value="verifyEmail">Verify Email</MenuItem>
                <MenuItem value="unverifyEmail">Unverify Email</MenuItem>
                <MenuItem value="resendEmails">Resend Verification</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              disabled={!bulkAction || bulkLoading}
              onClick={handleBulkAction}
            >
              {bulkLoading ? 'Processing...' : 'Apply'}
            </Button>
            <Button size="small" onClick={() => { setSelected([]); setBulkAction(''); }}>
              Clear
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Table ── */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={someSelected} checked={allSelected} onChange={toggleAll} size="small" />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>KYC</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Blocs</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant="text" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={uid(user)} hover>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.includes(uid(user))} onChange={() => toggleOne(uid(user))} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={user.profileImage} sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                        {(user.name || user.firstName || '?')[0]}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </Typography>
                        {user.phone && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {user.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2">{user.votingState || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'secondary' : 'default'}
                      variant={user.role === 'admin' ? 'filled' : 'outlined'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip label={user.kycStatus} size="small" color={kycChipColor(user.kycStatus)} variant="outlined" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip
                      label={user.emailVerified ? 'Verified' : 'Unverified'}
                      size="small"
                      color={user.emailVerified ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.totalMembersInOwnedBlocs || 0}</Typography>
                    {(user.ownedVotingBlocsCount || 0) > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {user.ownedVotingBlocsCount} bloc{user.ownedVotingBlocsCount !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="caption">{user.createdAt ? formatDate(user.createdAt) : '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => openViewModal(user)}
                          disabled={loadingUserId?.id === uid(user)}
                        >
                          {loadingUserId?.id === uid(user) && loadingUserId?.type === 'view'
                            ? <CircularProgress size={16} />
                            : <Eye size={16} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditModal(user)}
                          disabled={loadingUserId?.id === uid(user)}
                        >
                          {loadingUserId?.id === uid(user) && loadingUserId?.type === 'edit'
                            ? <CircularProgress size={16} />
                            : <Edit2 size={16} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More actions">
                        <IconButton size="small" onClick={(e) => setRowMenu({ el: e.currentTarget, user })}>
                          <MoreVertical size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">Show</Typography>
            <Select
              size="small"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              sx={{ height: 32, '& .MuiSelect-select': { py: 0.5, fontSize: '0.75rem' } }}
            >
              {[10, 25, 50, 100].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
            {total !== null && (
              <Typography variant="caption" color="text.secondary">
                of {total.toLocaleString()} users
              </Typography>
            )}
          </Stack>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      </Card>

      {/* ── Row Action Menu ── */}
      <Menu
        anchorEl={rowMenu?.el}
        open={!!rowMenu}
        onClose={() => setRowMenu(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {rowMenu?.user && (
          <>
            <MenuItem onClick={() => { handleRoleToggle(rowMenu.user); setRowMenu(null); }}>
              <ListItemIcon>{rowMenu.user.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}</ListItemIcon>
              <ListItemText>{rowMenu.user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleEmailVerifyToggle(rowMenu.user); setRowMenu(null); }}>
              <ListItemIcon>{rowMenu.user.emailVerified ? <UserX size={16} /> : <UserCheck size={16} />}</ListItemIcon>
              <ListItemText>{rowMenu.user.emailVerified ? 'Unverify Email' : 'Verify Email'}</ListItemText>
            </MenuItem>
            {!rowMenu.user.emailVerified && (
              <MenuItem onClick={() => { handleResendEmail(rowMenu.user); setRowMenu(null); }}>
                <ListItemIcon><Mail size={16} /></ListItemIcon>
                <ListItemText>Resend Verification Email</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={() => { handlePasswordReset(rowMenu.user); setRowMenu(null); }}>
              <ListItemIcon><Key size={16} /></ListItemIcon>
              <ListItemText>Reset Password</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setMonitorKeyModal({ isOpen: true, user: rowMenu.user }); setRowMenu(null); }}>
              <ListItemIcon><Key size={16} /></ListItemIcon>
              <ListItemText>Assign Monitor Key</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setVolunteerModal({ isOpen: true, user: rowMenu.user }); setRowMenu(null); }}>
              <ListItemIcon><Phone size={16} /></ListItemIcon>
              <ListItemText>Assign to Call Center</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleDeleteUser(rowMenu.user); setRowMenu(null); }} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}><Trash2 size={16} /></ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* ── Modals ── */}

      <AdminCreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={() => { setShowCreateModal(false); loadUsers(); loadStats(); }}
      />

      <AdminEditUserModal
        editModal={editModal}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        onUserUpdated={() => { setEditModal({ isOpen: false, user: null }); loadUsers(); notify('User updated successfully'); }}
      />

      <AdminViewUserModal
        viewModal={viewModal}
        onClose={() => setViewModal({ isOpen: false, user: null })}
      />

      {monitorKeyModal.isOpen && monitorKeyModal.user && (
        <MonitorKeyAssignmentModal
          isOpen={monitorKeyModal.isOpen}
          onClose={() => setMonitorKeyModal({ isOpen: false, user: null })}
          user={monitorKeyModal.user}
          onSuccess={() => { notify('Monitor key assigned'); setMonitorKeyModal({ isOpen: false, user: null }); loadUsers(); }}
        />
      )}

      <EnhancedVolunteerAssignmentModal
        isOpen={volunteerModal.isOpen}
        onClose={() => { setVolunteerModal({ isOpen: false, user: null }); }}
        onAssignmentComplete={() => { setVolunteerModal({ isOpen: false, user: null }); loadUsers(); }}
        preselectedUser={volunteerModal.user}
      />

      {/* ── Confirmation Dialog ── */}
      <Dialog open={confirm.open} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={20} color={confirm.severity === 'error' ? '#ef4444' : '#f59e0b'} />
          {confirm.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {confirm.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeConfirm} disabled={confirm.loading}>Cancel</Button>
          <Button
            variant="contained"
            color={confirm.severity === 'error' ? 'error' : 'warning'}
            disabled={confirm.loading}
            onClick={confirm.onConfirm}
          >
            {confirm.loading ? 'Processing...' : confirm.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity || 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
