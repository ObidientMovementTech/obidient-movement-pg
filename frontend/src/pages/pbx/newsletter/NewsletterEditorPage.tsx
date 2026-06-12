import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
} from '@mui/material';
import { ArrowLeft, Save, Send, Mail, Upload, Users, Globe } from 'lucide-react';
import RichTextEditor from '../../../components/inputs/RichTextEditor';
import {
  createNewsletter,
  updateNewsletter,
  sendTestEmail,
  sendNewsletter as sendNewsletterApi,
  publishNewsletter as publishNewsletterApi,
  uploadNewsletterImage,
  getRecipientCount,
  streamNewsletterProgress,
  type Newsletter,
  type NewsletterProgress,
} from '../../../services/newsletterService';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function NewsletterEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { profile } = useUser();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string>('draft');
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(id || null);
  const [progress, setProgress] = useState<NewsletterProgress | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (id) {
      loadExistingNewsletter(id);
    }
    loadRecipientCount();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [id]);

  async function loadExistingNewsletter(newsletterId: string) {
    setLoadingNewsletter(true);
    try {
      const res = await axios.get(`${API_BASE}/api/newsletter/admin/all`, {
        params: { page: 1, limit: 100 },
        withCredentials: true,
      });
      const nl = (res.data.newsletters || []).find((n: Newsletter) => n.id === newsletterId);
      if (nl) {
        setTitle(nl.title);
        setSubject(nl.subject || '');
        setContent(nl.content || '');
        setPreviewText(nl.preview_text || '');
        setFeaturedImageUrl(nl.featured_image_url || '');
        setNewsletterStatus(nl.status || 'draft');
        setCurrentId(nl.id);
      }
    } catch (err) {
      console.error('Error loading newsletter:', err);
      setError('Failed to load newsletter.');
    } finally {
      setLoadingNewsletter(false);
    }
  }

  async function loadRecipientCount() {
    try {
      const data = await getRecipientCount();
      setRecipientCount(data.count);
    } catch (err) {
      console.error('Error loading recipient count:', err);
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = {
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        content,
        previewText: previewText.trim() || undefined,
        featuredImageUrl: featuredImageUrl || undefined,
      };

      if (isEditing && currentId) {
        await updateNewsletter(currentId, data);
        setSuccess('Newsletter saved successfully.');
      } else {
        const result = await createNewsletter(data);
        setSuccess('Newsletter created successfully.');
        setCurrentId(result.newsletter.id);
        navigate(`/pbx/newsletter/edit/${result.newsletter.id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save newsletter.');
    } finally {
      setSaving(false);
    }
  };

  const openTestEmailDialog = () => {
    if (!currentId) {
      setError('Please save the newsletter first before sending a test.');
      return;
    }
    setTestEmailAddress(profile?.email || '');
    setTestEmailDialogOpen(true);
  };

  const handleSendTest = async () => {
    if (!currentId) return;
    setTestEmailDialogOpen(false);
    setSendingTest(true);
    setError('');
    setSuccess('');
    try {
      // Save latest content first
      await updateNewsletter(currentId, {
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        content,
        previewText: previewText.trim() || undefined,
        featuredImageUrl: featuredImageUrl || undefined,
      });
      const result = await sendTestEmail(currentId, testEmailAddress.trim());
      setSuccess(result.message);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send test email.');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (!currentId) return;
    setSending(true);
    setError('');
    setSuccess('');
    setSendConfirmOpen(false);
    try {
      // Save latest content first
      await updateNewsletter(currentId, {
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        content,
        previewText: previewText.trim() || undefined,
        featuredImageUrl: featuredImageUrl || undefined,
      });
      const result = await sendNewsletterApi(currentId);
      setSuccess(`Newsletter is being sent to ${result.totalRecipients} recipients!`);
      setNewsletterStatus('sending');

      // Start SSE progress stream
      eventSourceRef.current?.close();
      eventSourceRef.current = streamNewsletterProgress(
        currentId,
        (data) => {
          setProgress(data);
          if (data.status === 'completed') {
            setNewsletterStatus('sent');
            setSuccess(`Newsletter sent successfully! ${data.sent || 0} delivered, ${data.failed || 0} failed.`);
          } else if (data.status === 'failed') {
            setError(`Newsletter send failed: ${data.phase || 'Unknown error'}`);
            setNewsletterStatus('draft');
          }
        },
        () => {
          // SSE error — non-critical
        }
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send newsletter.');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadNewsletterImage(file);
    return result.url;
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadNewsletterImage(file);
      setFeaturedImageUrl(result.url);
    } catch (err) {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const isLocked = newsletterStatus === 'sent' || newsletterStatus === 'sending';
  const isPublished = newsletterStatus === 'published';

  const handlePublish = async () => {
    if (!currentId) {
      setError('Please save the newsletter first before publishing.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Save latest content first
      await updateNewsletter(currentId, {
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        content,
        previewText: previewText.trim() || undefined,
        featuredImageUrl: featuredImageUrl || undefined,
      });
      await publishNewsletterApi(currentId);
      setNewsletterStatus('published');
      setSuccess('Newsletter published! It\'s now visible on the public newsletter page.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to publish newsletter.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingNewsletter) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/pbx/newsletter')}
          color="inherit"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          {isEditing ? 'Edit Newsletter' : 'New Newsletter'}
        </Typography>
        {!isLocked && (
          <>
            <Button
              variant="outlined"
              startIcon={<Save size={18} />}
              onClick={handleSave}
              disabled={saving || sendingTest || sending}
            >
              {saving ? 'Saving...' : isPublished ? 'Save' : 'Save Draft'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Mail size={18} />}
              onClick={openTestEmailDialog}
              disabled={saving || sendingTest || sending || !currentId}
            >
              {sendingTest ? 'Sending...' : 'Send Test'}
            </Button>
            {!isPublished && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<Globe size={18} />}
                onClick={handlePublish}
                disabled={saving || sendingTest || sending || !currentId || !content.trim()}
              >
                Publish
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              startIcon={<Send size={18} />}
              onClick={() => setSendConfirmOpen(true)}
              disabled={saving || sendingTest || sending || !currentId || !content.trim()}
            >
              Send to All
            </Button>
          </>
        )}
        {isLocked && (
          <Chip label={newsletterStatus === 'sending' ? 'Sending...' : 'Sent'} color="success" variant="outlined" />
        )}
        {isPublished && (
          <Chip label="Published" color="info" variant="outlined" />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Live send progress */}
      {progress && newsletterStatus === 'sending' && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{progress.phase || 'Sending...'}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.total ? ((parseInt(progress.sent || '0') + parseInt(progress.failed || '0')) / parseInt(progress.total)) * 100 : 0}
            sx={{ borderRadius: 1, height: 8 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {progress.sent || 0} sent, {progress.failed || 0} failed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {progress.total || 0} total
            </Typography>
          </Box>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Main content area */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Newsletter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                placeholder="Enter a compelling title..."
                disabled={isLocked}
              />
              <TextField
                label="Email Subject Line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                placeholder="Subject shown in inbox (defaults to title if empty)"
                disabled={isLocked}
                helperText="What recipients see in their inbox"
              />
              <TextField
                label="Preview Text (optional)"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Short preview text shown after the subject in email clients..."
                disabled={isLocked}
                slotProps={{ htmlInput: { maxLength: 300 } }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <RichTextEditor
                content={content}
                onChange={setContent}
                onImageUpload={handleImageUpload}
                placeholder="Write your newsletter content here..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Recipient info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Users size={18} />
                <Typography variant="subtitle2">Recipients</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {recipientCount !== null ? recipientCount.toLocaleString() : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                verified members with newsletters enabled
              </Typography>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Featured Image</Typography>
              {featuredImageUrl && (
                <Box
                  component="img"
                  src={featuredImageUrl}
                  alt="Featured"
                  sx={{ width: '100%', borderRadius: 2, mb: 1.5, maxHeight: 200, objectFit: 'cover' }}
                />
              )}
              {!isLocked && (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={uploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : featuredImageUrl ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                  />
                </Button>
              )}
              {featuredImageUrl && !isLocked && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => setFeaturedImageUrl('')}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Remove Image
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={() => setTestEmailDialogOpen(false)}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the email address to receive the test newsletter.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            size="small"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendTest}
            variant="contained"
            color="secondary"
            disabled={!testEmailAddress.trim()}
          >
            Send Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={sendConfirmOpen} onClose={() => setSendConfirmOpen(false)}>
        <DialogTitle>Send Newsletter</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            You are about to send <strong>"{title}"</strong> to <strong>{recipientCount?.toLocaleString() || '?'}</strong> members.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. Make sure you've sent a test email to yourself first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSend} color="success" variant="contained" disabled={sending}>
            {sending ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
