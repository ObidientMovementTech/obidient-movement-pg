import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Tabs,
  Tab,
  TablePagination,
  InputAdornment,
  Stack,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Check,
  Send,
  Calendar,
  Users,
  RefreshCw,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RotateCcw,
  Eye,
  X,
  StopCircle,
  ImagePlus,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getAdminBroadcasts,
  sendAdminBroadcast,
  updateAdminBroadcast,
  deleteAdminBroadcast,
  getBroadcastEmailLogs,
  getBroadcastEmailStats,
  retryBroadcastEmails,
  cancelBroadcast,
  uploadBroadcastImage,
  AdminBroadcast,
  BroadcastEmailLog,
  BroadcastEmailStats,
} from '../../services/adminBroadcastService';

// ---- Progress Card Component (polling-based) ----
function BroadcastProgressCard({
  broadcastId,
  onComplete,
  onDismiss,
}: {
  broadcastId: string;
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const [stats, setStats] = useState<BroadcastEmailStats | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const data = await getBroadcastEmailStats(broadcastId);
        if (!mounted) return;
        setStats(data);

        if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            if (mounted) onComplete();
          }, 4000);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [broadcastId, onComplete]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBroadcast(broadcastId);
    } catch {
      // Will be picked up by next poll
    } finally {
      setCancelling(false);
    }
  };

  if (!stats) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 20, height: 20, border: '2px solid', borderColor: 'primary.main', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
          <Typography color="primary" fontWeight={500}>Loading broadcast progress...</Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={onDismiss}><X size={16} /></IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const total = stats.total;
  const sent = stats.sent;
  const failed = stats.failed;
  const pending = stats.pending;
  const processed = sent + failed;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isTerminal = stats.status === 'completed' || stats.status === 'failed' || stats.status === 'cancelled';
  const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
  const estimatedRemainMin = processed > 0 && !isTerminal
    ? Math.max(1, Math.round(((total - processed) / (processed / elapsedSec)) / 60))
    : null;

  const statusColor = stats.status === 'failed' ? 'error' : stats.status === 'cancelled' ? 'warning' : isTerminal ? 'success' : 'primary';

  return (
    <Card sx={{ mb: 3, borderLeft: 4, borderLeftColor: `${statusColor}.main` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isTerminal ? (
              stats.status === 'failed' ? <XCircle size={20} color="#d32f2f" /> :
              stats.status === 'cancelled' ? <StopCircle size={20} color="#ed6c02" /> :
              <CheckCircle size={20} color="#2e7d32" />
            ) : (
              <Box sx={{ width: 20, height: 20, border: '2px solid', borderColor: 'primary.main', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
            )}
            <Typography fontWeight={500} color={`${statusColor}.main`}>
              {isTerminal
                ? stats.status === 'completed'
                  ? `Completed — ${sent.toLocaleString()} sent, ${failed.toLocaleString()} failed`
                  : stats.status === 'cancelled'
                    ? `Cancelled — ${sent.toLocaleString()} sent`
                    : `Failed — ${sent.toLocaleString()} sent, ${failed.toLocaleString()} failed`
                : pending === total
                  ? 'Preparing recipients...'
                  : `Sending emails... ${processed.toLocaleString()}/${total.toLocaleString()}`
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isTerminal && (
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={cancelling ? undefined : <StopCircle size={14} />}
                disabled={cancelling}
                onClick={handleCancel}
                sx={{ minWidth: 'auto' }}
              >
                {cancelling ? 'Stopping...' : 'Stop'}
              </Button>
            )}
            {isTerminal && (
              <IconButton size="small" onClick={onDismiss}><X size={16} /></IconButton>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', ml: 1 }}>{pct}%</Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          color={statusColor as any}
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
        />

        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Mail size={14} />
            <Typography variant="body2" color="text.secondary">{total.toLocaleString()} total</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircle size={14} color="#2e7d32" />
            <Typography variant="body2" color="success.main">{sent.toLocaleString()} sent</Typography>
          </Box>
          {failed > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <XCircle size={14} color="#d32f2f" />
              <Typography variant="body2" color="error.main">{failed.toLocaleString()} failed</Typography>
            </Box>
          )}
          {estimatedRemainMin && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock size={14} />
              <Typography variant="body2" color="text.secondary">~{estimatedRemainMin}m remaining</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ---- Delivery Detail Modal Component ----
function DeliveryDetailModal({
  broadcastId,
  broadcastTitle,
  onClose,
  onRetrySuccess,
}: {
  broadcastId: string;
  broadcastTitle: string;
  onClose: () => void;
  onRetrySuccess: () => void;
}) {
  const [logs, setLogs] = useState<BroadcastEmailLog[]>([]);
  const [stats, setStats] = useState<BroadcastEmailStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const result = await getBroadcastEmailLogs(broadcastId, {
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setToast({ type: 'error', message: 'Failed to load email logs' });
    } finally {
      setLoadingLogs(false);
    }
  }, [broadcastId, page, rowsPerPage, statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getBroadcastEmailStats(broadcastId);
      setStats(data);
    } catch {
      // silent
    }
  }, [broadcastId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSearch = () => {
    setPage(0);
    setSearchQuery(searchInput);
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const result = await retryBroadcastEmails(broadcastId);
      setToast({ type: 'success', message: result.message });
      onRetrySuccess();
      setTimeout(() => { fetchStats(); fetchLogs(); }, 2000);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Retry failed'
          : 'Retry failed';
      setToast({ type: 'error', message });
    } finally {
      setRetrying(false);
    }
  };

  const statusChip = (status: string) => {
    if (status === 'sent') return <Chip size="small" label="Sent" color="success" variant="outlined" icon={<CheckCircle size={14} />} />;
    if (status === 'failed') return <Chip size="small" label="Failed" color="error" variant="outlined" icon={<XCircle size={14} />} />;
    return <Chip size="small" label="Pending" color="warning" variant="outlined" icon={<Clock size={14} />} />;
  };

  return createPortal(
    <Dialog open fullWidth maxWidth="lg" onClose={onClose} PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Mail size={20} color="#169043" />
          <Typography variant="h6" component="span">Email Delivery — {broadcastTitle}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {toast && (
          <Alert severity={toast.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        )}

        {/* Stats Summary */}
        {stats && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={600}>{stats.total.toLocaleString()}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'success.light' }}>
              <Typography variant="h5" fontWeight={600} color="success.main">{stats.sent.toLocaleString()}</Typography>
              <Typography variant="caption" color="success.main">Sent</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'error.light' }}>
              <Typography variant="h5" fontWeight={600} color="error.main">{stats.failed.toLocaleString()}</Typography>
              <Typography variant="caption" color="error.main">Failed</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'warning.light' }}>
              <Typography variant="h5" fontWeight={600} color="warning.main">{stats.pending.toLocaleString()}</Typography>
              <Typography variant="caption" color="warning.main">Pending</Typography>
            </Paper>
          </Box>
        )}

        {/* Filter + Search + Retry */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, v) => { setStatusFilter(v); setPage(0); }}
            variant="scrollable"
            scrollButtons={false}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0, textTransform: 'capitalize' } }}
          >
            <Tab value="all" label="All" />
            <Tab value="sent" label="Sent" />
            <Tab value="failed" label="Failed" />
            <Tab value="pending" label="Pending" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search email or name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <Button size="small" variant="outlined" onClick={handleSearch}>Search</Button>

          {stats && stats.failed > 0 && (
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={retrying ? undefined : <RotateCcw size={14} />}
              disabled={retrying}
              onClick={handleRetry}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {retrying ? 'Retrying...' : `Retry ${stats.failed} failed`}
            </Button>
          )}
        </Stack>

        {/* Logs Table */}
        <TableContainer component={Paper} variant="outlined">
          {loadingLogs ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading logs...</Typography>
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No email logs found{searchQuery ? ` for "${searchQuery}"` : ''}.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.userName}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {log.email}
                    </TableCell>
                    <TableCell>{statusChip(log.status)}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'error.main', fontSize: '0.75rem' }}>
                      {log.errorMessage || '—'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {log.sentAt ? format(new Date(log.sentAt), 'MMM d, h:mm a') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {totalPages > 1 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[50]}
            onRowsPerPageChange={() => {}}
          />
        )}
      </DialogContent>
    </Dialog>,
    document.body
  );
}

// ---- Status badge helper ----
function BroadcastStatusChip({ status }: { status?: string }) {
  if (!status || status === 'pending') return <Chip size="small" label="Pending" color="warning" variant="outlined" />;
  if (status === 'processing') return <Chip size="small" label="Sending..." color="primary" variant="outlined" sx={{ animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }} />;
  if (status === 'completed') return <Chip size="small" label="Completed" color="success" variant="outlined" />;
  if (status === 'failed') return <Chip size="small" label="Failed" color="error" variant="outlined" />;
  if (status === 'cancelled') return <Chip size="small" label="Cancelled" color="default" variant="outlined" />;
  return <Chip size="small" label="Broadcast" color="primary" variant="outlined" />;
}

// ---- Main Page Component ----
export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [activeBroadcastId, setActiveBroadcastId] = useState<string | null>(null);
  const [detailBroadcast, setDetailBroadcast] = useState<AdminBroadcast | null>(null);

  const truncateMessage = (msg: string, maxLength: number = 120) => {
    if (msg.length <= maxLength) return msg;
    return msg.substring(0, maxLength) + '...';
  };

  const toggleMessageExpansion = (broadcastId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(broadcastId)) {
      newExpanded.delete(broadcastId);
    } else {
      newExpanded.add(broadcastId);
    }
    setExpandedMessages(newExpanded);
  };

  useEffect(() => {
    const fetchBroadcasts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminBroadcasts();
        setBroadcasts(data);

        if (!activeBroadcastId) {
          const processing = data.find(
            (b) => b.status === 'processing' || b.status === 'pending'
          );
          if (processing && processing.status === 'processing') {
            setActiveBroadcastId(processing._id);
          }
        }
      } catch {
        setError('Failed to load broadcast messages. You might not have admin privileges.');
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, [refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const newBroadcast = await sendAdminBroadcast(title, message, imageUrl);
      setIsCreating(false);
      setTitle('');
      setMessage('');
      setImageUrl(null);
      setActiveBroadcastId(newBroadcast._id);
      handleRefresh();
    } catch {
      setError('Failed to send broadcast message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (broadcast: AdminBroadcast) => {
    setEditingId(broadcast._id);
    setTitle(broadcast.title);
    setMessage(broadcast.message);
    setImageUrl(broadcast.imageUrl || null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setImageUrl(null);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('Image must be under 1MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadBroadcastImage(file);
      setImageUrl(url);
    } catch {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleUpdate = async (id: string) => {
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const updatedBroadcast = await updateAdminBroadcast(id, title, message, imageUrl);
      setBroadcasts(broadcasts.map((b) => (b._id === id ? { ...b, ...updatedBroadcast } : b)));
      setEditingId(null);
      setTitle('');
      setMessage('');
      setImageUrl(null);
      handleRefresh();
    } catch {
      setError('Failed to update broadcast message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminBroadcast(id);
      setBroadcasts(broadcasts.filter((b) => b._id !== id));
      setShowDeleteConfirm(null);
      if (activeBroadcastId === id) setActiveBroadcastId(null);
    } catch {
      setError('Failed to delete broadcast message');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const handleProgressComplete = useCallback(() => {
    setActiveBroadcastId(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleDismissProgress = useCallback(() => {
    setActiveBroadcastId(null);
  }, []);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', mb: 3, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Megaphone size={24} color="#169043" />
            Broadcast Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Send email announcements to all users on the platform
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {!isCreating && !editingId && (
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setIsCreating(true)}
            >
              New Broadcast
            </Button>
          )}
          <IconButton onClick={handleRefresh} color="default" title="Refresh">
            <RefreshCw size={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Live progress card */}
      {activeBroadcastId && (
        <BroadcastProgressCard
          broadcastId={activeBroadcastId}
          onComplete={handleProgressComplete}
          onDismiss={handleDismissProgress}
        />
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {isCreating ? 'Create New Broadcast' : 'Edit Broadcast'}
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                placeholder="Announcement title"
              />
              <TextField
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                multiline
                rows={5}
                placeholder="Write your broadcast message here..."
              />

              {/* Image Upload */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Image (optional — max 1MB, JPEG/PNG/WebP)</Typography>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                {imageUrl ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="Broadcast image"
                      sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setImageUrl(null)}
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <X size={14} />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={uploadingImage ? undefined : <ImagePlus size={18} />}
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                    sx={{ borderStyle: 'dashed' }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Add Image'}
                  </Button>
                )}
              </Box>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={isCreating ? () => setIsCreating(false) : handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={isCreating ? <Send size={18} /> : <Check size={18} />}
                  onClick={isCreating ? handleCreate : () => editingId && handleUpdate(editingId)}
                  disabled={submitting || !title.trim() || !message.trim()}
                >
                  {submitting ? 'Processing...' : isCreating ? 'Send Broadcast' : 'Update'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Broadcasts List */}
      <Card>
        {loading ? (
          <CardContent>
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Box key={i}>
                  <Skeleton variant="text" width="40%" height={28} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="30%" height={20} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        ) : broadcasts.length === 0 ? (
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <Megaphone size={24} color="#9e9e9e" />
            </Box>
            <Typography variant="h6" gutterBottom>No broadcasts yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
              Create your first broadcast message to announce important information to all users.
            </Typography>
            {!isCreating && (
              <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setIsCreating(true)}>
                New Broadcast
              </Button>
            )}
          </CardContent>
        ) : (
          <Box>
            {broadcasts.map((broadcast, idx) => (
              <Box key={broadcast._id} sx={{ p: 2.5, borderBottom: idx < broadcasts.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                {showDeleteConfirm === broadcast._id ? (
                  <Alert
                    severity="error"
                    action={
                      <Stack direction="row" spacing={1}>
                        <Button size="small" color="inherit" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
                        <Button size="small" variant="contained" color="error" onClick={() => handleDelete(broadcast._id)}>Delete</Button>
                      </Stack>
                    }
                  >
                    Are you sure you want to delete this broadcast?
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={500}>{broadcast.title}</Typography>
                        <BroadcastStatusChip status={broadcast.status} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1.5 }}>
                        {expandedMessages.has(broadcast._id)
                          ? broadcast.message
                          : truncateMessage(broadcast.message)
                        }
                        {broadcast.message.length > 120 && (
                          <Button
                            size="small"
                            sx={{ ml: 1, textTransform: 'none', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
                            onClick={() => toggleMessageExpansion(broadcast._id)}
                          >
                            {expandedMessages.has(broadcast._id) ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                      </Typography>
                      {broadcast.imageUrl && (
                        <Box
                          component="img"
                          src={broadcast.imageUrl}
                          alt={broadcast.title}
                          sx={{ maxWidth: 160, maxHeight: 90, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', mb: 1.5, objectFit: 'cover' }}
                        />
                      )}
                      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ '& > *': { display: 'flex', alignItems: 'center', gap: 0.5 } }}>
                        <Typography variant="caption" color="text.secondary">
                          <Calendar size={13} /> {formatDate(broadcast.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Users size={13} /> {broadcast.sentBy?.firstName || broadcast.sentBy?.username || 'Admin'}
                        </Typography>
                        {(broadcast.emailsSent !== undefined && broadcast.emailsSent > 0) && (
                          <Typography variant="caption" color="success.main">
                            <CheckCircle size={13} /> {broadcast.emailsSent.toLocaleString()} sent
                          </Typography>
                        )}
                        {(broadcast.emailsFailed !== undefined && broadcast.emailsFailed > 0) && (
                          <Typography variant="caption" color="error.main">
                            <XCircle size={13} /> {broadcast.emailsFailed.toLocaleString()} failed
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View delivery details">
                        <IconButton size="small" color="primary" onClick={() => setDetailBroadcast(broadcast)}>
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleStartEdit(broadcast)}>
                          <Edit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setShowDeleteConfirm(broadcast._id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Delivery Detail Modal */}
      {detailBroadcast && (
        <DeliveryDetailModal
          broadcastId={detailBroadcast._id}
          broadcastTitle={detailBroadcast.title}
          onClose={() => setDetailBroadcast(null)}
          onRetrySuccess={() => {
            setActiveBroadcastId(detailBroadcast._id);
          }}
        />
      )}
    </Box>
  );
}
