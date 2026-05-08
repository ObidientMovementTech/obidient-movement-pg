import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Skeleton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  Smartphone,
  Upload,
  Download,
  Users,
  Calendar,
  TrendingUp,
  Search,
  FileDown,
  HardDrive,
  Clock,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '../../lib/apiClient';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

interface AppInfo {
  version: string;
  fileSize: string;
  releaseNotes: string;
  releasedAt: string;
}

interface DownloadStats {
  total_downloads: string;
  unique_users: string;
  today: string;
  this_week: string;
  this_month: string;
}

interface DownloadLog {
  id: number;
  version: string;
  ip_address: string;
  user_agent: string;
  downloaded_at: string;
  user_name: string;
  user_email: string;
}

export default function AppManagementPage() {
  // App info
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Stats
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Download logs
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(0);
  const [logsPerPage, setLogsPerPage] = useState(10);
  const [logsSearch, setLogsSearch] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Upload form
  const [uploadVersion, setUploadVersion] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  /* ─── Fetch data ─── */
  const fetchAppInfo = async () => {
    try {
      const { data } = await apiClient.get('/api/app-download/info');
      setAppInfo(data);
    } catch {
      /* no app uploaded yet — that's okay */
    } finally {
      setLoadingInfo(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/api/app-download/downloads/stats');
      setStats(data.stats);
    } catch {
      /* ignore */
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data } = await apiClient.get('/api/app-download/downloads', {
        params: { page: logsPage + 1, limit: logsPerPage, search: logsSearch || undefined },
      });
      setLogs(data.downloads);
      setLogsTotal(data.total);
    } catch {
      /* ignore */
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAppInfo();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [logsPage, logsPerPage, logsSearch]);

  /* ─── Upload handler ─── */
  const handleUpload = async () => {
    if (!selectedFile || !uploadVersion.trim()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('version', uploadVersion.trim());
      formData.append('releaseNotes', uploadNotes.trim());

      await apiClient.post('/api/app-download/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      setToast({ message: `APK v${uploadVersion.trim()} uploaded successfully!`, severity: 'success' });
      setUploadVersion('');
      setUploadNotes('');
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchAppInfo();
      fetchStats();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Upload failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.apk')) {
        setToast({ message: 'Please select an APK file.', severity: 'error' });
        return;
      }
      setSelectedFile(file);
    }
  };

  /* ─── Stat cards ─── */
  const statCards = stats
    ? [
        { label: 'Total Downloads', value: parseInt(stats.total_downloads).toLocaleString(), icon: <Download size={20} />, color: PRIMARY },
        { label: 'Unique Users', value: parseInt(stats.unique_users).toLocaleString(), icon: <Users size={20} />, color: '#7c3aed' },
        { label: 'Today', value: parseInt(stats.today).toLocaleString(), icon: <TrendingUp size={20} />, color: '#ea580c' },
        { label: 'This Week', value: parseInt(stats.this_week).toLocaleString(), icon: <Calendar size={20} />, color: '#0284c7' },
      ]
    : [];

  return (
    <Box sx={{ fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Smartphone size={24} color={PRIMARY} />
            Mobile App
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Upload APK builds, manage versions, and monitor downloads.
          </Typography>
        </Box>
      </Box>

      {/* ──── Current Version Card ──── */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: FONT, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HardDrive size={16} />
            Current Release
          </Typography>

          {loadingInfo ? (
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Skeleton width={120} height={32} />
              <Skeleton width={80} height={32} />
              <Skeleton width={200} height={32} />
            </Box>
          ) : appInfo?.version ? (
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Chip label={`v${appInfo.version}`} color="success" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              {appInfo.fileSize && (
                <Chip label={appInfo.fileSize} variant="outlined" size="small" icon={<FileDown size={14} />} />
              )}
              {appInfo.releasedAt && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={13} />
                  Released {formatDistanceToNow(new Date(appInfo.releasedAt), { addSuffix: true })}
                </Typography>
              )}
              {appInfo.releaseNotes && (
                <Typography variant="body2" sx={{ color: 'text.secondary', width: '100%', mt: 0.5 }}>
                  {appInfo.releaseNotes}
                </Typography>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No APK has been uploaded yet. Use the form below to upload the first build.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ──── Stats Row ──── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Skeleton width={80} height={16} />
                  <Skeleton width={60} height={32} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.label} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontFamily: FONT }}>
                      {s.label}
                    </Typography>
                    <Box sx={{ color: s.color, opacity: 0.6 }}>{s.icon}</Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: FONT, mt: 0.5, color: s.color }}>
                    {s.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
      </Box>

      {/* ──── Upload New APK ──── */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: FONT, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Upload size={16} />
            Upload New Build
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' }, gap: 2 }}>
              <TextField
                label="Version"
                placeholder="e.g. 1.2.0"
                size="small"
                value={uploadVersion}
                onChange={(e) => setUploadVersion(e.target.value)}
                fullWidth
                disabled={uploading}
              />
              <TextField
                label="Release Notes (optional)"
                placeholder="What's new in this version?"
                size="small"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                fullWidth
                disabled={uploading}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <input
                ref={fileRef}
                type="file"
                accept=".apk"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                startIcon={<FileDown size={16} />}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {selectedFile ? selectedFile.name : 'Select APK File'}
              </Button>

              {selectedFile && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadVersion.trim()}
                startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Upload size={16} />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: PRIMARY,
                  ml: 'auto',
                  '&:hover': { bgcolor: '#005530' },
                }}
              >
                {uploading ? `Uploading… ${uploadProgress}%` : 'Upload APK'}
              </Button>
            </Box>

            {uploading && (
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ borderRadius: 2, height: 6, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: PRIMARY } }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ──── Download Logs ──── */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Download size={16} />
              Download Logs
            </Typography>
            <TextField
              size="small"
              placeholder="Search by name or email…"
              value={logsSearch}
              onChange={(e) => {
                setLogsSearch(e.target.value);
                setLogsPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 260 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>Downloaded</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontFamily: FONT }}>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingLogs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton width={140} /></TableCell>
                      <TableCell><Skeleton width={60} /></TableCell>
                      <TableCell><Skeleton width={100} /></TableCell>
                      <TableCell><Skeleton width={100} /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      {logsSearch ? 'No downloads match your search.' : 'No downloads yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: FONT }}>
                            {log.user_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {log.user_email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`v${log.version}`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {format(new Date(log.downloaded_at), 'MMM d, yyyy · h:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                          {log.ip_address}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={logsTotal}
            page={logsPage}
            onPageChange={(_, newPage) => setLogsPage(newPage)}
            rowsPerPage={logsPerPage}
            onRowsPerPageChange={(e) => {
              setLogsPerPage(parseInt(e.target.value, 10));
              setLogsPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
