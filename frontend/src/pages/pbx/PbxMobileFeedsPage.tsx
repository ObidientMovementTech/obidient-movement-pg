import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Smartphone,
  Plus,
  Trash2,
  Edit,
  Send,
  Calendar,
  RefreshCw,
  Image as ImageIcon,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg';
import compressImage from '../../utils/ImageCompression';
import axios from 'axios';
import {
  getMobileFeeds,
  createMobileFeed,
  updateMobileFeed,
  deleteMobileFeed,
  MobileFeed,
  CreateMobileFeedRequest,
  UpdateMobileFeedRequest,
} from '../../services/adminMobileFeedsService';

const FONT = '"Poppins", sans-serif';

const FEED_TYPE_CHIP: Record<string, { color: 'success' | 'error' | 'info'; label: string }> = {
  general: { color: 'success', label: 'General' },
  urgent: { color: 'error', label: 'Urgent' },
  announcement: { color: 'info', label: 'Announcement' },
};

const PRIORITY_CHIP: Record<string, { color: 'error' | 'warning' | 'default'; label: string }> = {
  high: { color: 'error', label: 'High' },
  normal: { color: 'warning', label: 'Normal' },
  low: { color: 'default', label: 'Low' },
};

export default function PbxMobileFeedsPage() {
  const [feeds, setFeeds] = useState<MobileFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [feedType, setFeedType] = useState<'general' | 'urgent' | 'announcement'>('general');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Expanded messages
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  // Image upload
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // ---------- Load feeds ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMobileFeeds(1, 50);
        if (!cancelled) setFeeds(data.feeds || []);
      } catch {
        if (!cancelled) setError('Failed to load mobile feeds.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // ---------- Form helpers ----------
  const resetForm = () => {
    setTitle('');
    setMessage('');
    setFeedType('general');
    setPriority('normal');
    setImageUrl('');
    setEditingId(null);
    setFormOpen(false);
    setFileSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (feed: MobileFeed) => {
    setTitle(feed.title);
    setMessage(feed.message);
    setFeedType(feed.feed_type);
    setPriority(feed.priority);
    setImageUrl(feed.image_url || '');
    setEditingId(feed.id);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setToast({ message: 'Title and message are required.', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateMobileFeedRequest | UpdateMobileFeedRequest = {
        title: title.trim(),
        message: message.trim(),
        feedType,
        priority,
        imageUrl: imageUrl.trim() || undefined,
      };
      if (editingId !== null) {
        await updateMobileFeed(editingId, payload);
        setToast({ message: 'Feed updated.', severity: 'success' });
      } else {
        await createMobileFeed(payload as CreateMobileFeedRequest);
        setToast({ message: 'Feed created.', severity: 'success' });
      }
      resetForm();
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to save feed.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setSubmitting(true);
    try {
      await deleteMobileFeed(deleteTarget);
      setToast({ message: 'Feed deleted.', severity: 'success' });
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to delete feed.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Image upload ----------
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { compressedFile, error: compErr } = await compressImage(file);
    if (compErr || !compressedFile) {
      setToast({ message: 'Image compression failed.', severity: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => setFileSrc(reader.result as string);
  };

  const onCropComplete = (_: any, areaPixels: any) => setCroppedArea(areaPixels);

  const uploadCroppedImage = async () => {
    if (!fileSrc || !croppedArea) return;
    setUploadingImage(true);
    try {
      const croppedBlob = await getCroppedImg(fileSrc, croppedArea);
      const file = new File([croppedBlob], 'mobile_feed_image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/mobile/feeds/upload-image`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setImageUrl(res.data.url);
      setFileSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Image upload failed.', severity: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <Box sx={{ fontFamily: FONT }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={320} height={20} sx={{ mb: 3 }} />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Smartphone size={24} />
            <Typography variant="h4" sx={{ fontFamily: FONT, fontWeight: 700 }}>Mobile Feeds</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: FONT }}>
            Create and manage feeds that appear in the mobile app.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCw size={16} />}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={openCreate}
          >
            Create Feed
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create / Edit Form */}
      <Collapse in={formOpen}>
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: FONT, fontWeight: 600 }}>
                {editingId !== null ? 'Edit Feed' : 'New Feed'}
              </Typography>
              <IconButton size="small" onClick={resetForm}><X size={18} /></IconButton>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label="Title"
                required
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Feed Type</InputLabel>
                <Select
                  value={feedType}
                  label="Feed Type"
                  onChange={(e) => setFeedType(e.target.value as any)}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              rows={4}
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Image section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: FONT, mb: 1, color: 'text.secondary' }}>
                Feed Image (optional)
              </Typography>

              {imageUrl && (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 2 }}>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Preview"
                    sx={{ width: 120, height: 68, borderRadius: 1.5, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
                  />
                  <Button size="small" color="error" onClick={() => setImageUrl('')}>Remove</Button>
                </Box>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<Upload size={16} />}
                onClick={() => inputRef.current?.click()}
              >
                Choose Image
              </Button>

              {/* Cropper */}
              {fileSrc && (
                <Card variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ position: 'relative', width: '100%', height: 240, borderRadius: 1, overflow: 'hidden', mb: 2 }}>
                    <Cropper
                      image={fileSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={16 / 9}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Zoom</Typography>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#0B6739' }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={uploadingImage ? <CircularProgress size={14} color="inherit" /> : <Upload size={16} />}
                      disabled={uploadingImage}
                      onClick={uploadCroppedImage}
                    >
                      {uploadingImage ? 'Uploading…' : 'Upload'}
                    </Button>
                    <Button size="small" onClick={() => { setFileSrc(null); setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedArea(null); }}>
                      Cancel
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Manual URL fallback */}
              <TextField
                label="Or enter image URL"
                fullWidth
                size="small"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={resetForm}>Cancel</Button>
              <Button
                variant="contained"
                size="small"
                startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <Send size={16} />}
                disabled={submitting || !title.trim() || !message.trim()}
                onClick={handleSubmit}
              >
                {editingId !== null ? 'Update Feed' : 'Create Feed'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Feed List */}
      {feeds.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2, py: 8, textAlign: 'center' }}>
          <Smartphone size={40} style={{ margin: '0 auto 12px', color: '#9ca3af' }} />
          <Typography variant="h6" sx={{ fontFamily: FONT, mb: 0.5 }}>No feeds yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first mobile app feed to get started.
          </Typography>
          <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={openCreate}>
            Create First Feed
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {feeds.map((feed) => {
            const isLong = feed.message.length > 140;
            const expanded = expandedMessages.has(feed.id);
            const typeChip = FEED_TYPE_CHIP[feed.feed_type] || FEED_TYPE_CHIP.general;
            const prioChip = PRIORITY_CHIP[feed.priority] || PRIORITY_CHIP.normal;

            return (
              <Card key={feed.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    {/* Left */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontFamily: FONT, fontWeight: 600, lineHeight: 1.3 }}>
                          {feed.title}
                        </Typography>
                        <Chip label={typeChip.label} color={typeChip.color} size="small" variant="outlined" />
                        <Chip label={prioChip.label} color={prioChip.color} size="small" variant="outlined" />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: expanded ? 'pre-wrap' : 'normal', mb: 0.5 }}
                      >
                        {expanded || !isLong ? feed.message : feed.message.slice(0, 140) + '…'}
                      </Typography>
                      {isLong && (
                        <Button
                          size="small"
                          sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: '0.75rem' }}
                          endIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          onClick={() => toggleExpand(feed.id)}
                        >
                          {expanded ? 'Show less' : 'Show more'}
                        </Button>
                      )}

                      {feed.image_url && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                          <ImageIcon size={14} />
                          <Typography variant="caption">Has image</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <Calendar size={14} />
                          <Typography variant="caption">
                            {format(new Date(feed.published_at), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => openEdit(feed)} title="Edit">
                        <Edit size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(feed.id)} title="Delete">
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 600 }}>Delete Feed</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this feed? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <Trash2 size={16} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
