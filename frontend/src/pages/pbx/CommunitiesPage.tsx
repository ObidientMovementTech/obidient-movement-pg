import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Skeleton,
} from '@mui/material';
import { Send, Users } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { sendAdminBroadcast, getAdminBroadcasts } from '../../services/adminBroadcastService';
import RBACGate from '../../components/pbx/RBACGate';

export default function CommunitiesPage() {
  const { profile } = useUser();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadBroadcasts();
  }, []);

  async function loadBroadcasts() {
    setLoading(true);
    try {
      const result: any = await getAdminBroadcasts();
      setBroadcasts(Array.isArray(result) ? result : result?.broadcasts || []);
    } catch (err) {
      console.error('Error loading broadcasts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await sendAdminBroadcast(title.trim(), message.trim());
      setSuccess('Broadcast sent successfully.');
      setTitle('');
      setMessage('');
      loadBroadcasts();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>Communities</Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        Broadcast messages to your community members.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Compose */}
        <RBACGate minimumLevel="ward">
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Send size={20} /> Send Broadcast
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Subject"
                  size="small"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Type your message to the community..."
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<Users size={14} />}
                    label={`Scope: ${getScopeLabel(profile)}`}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendBroadcast}
                    disabled={sending || !title.trim() || !message.trim()}
                    startIcon={<Send size={16} />}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </RBACGate>

        {/* History */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Broadcast History
            </Typography>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="text" height={48} sx={{ mb: 1 }} />
              ))
            ) : broadcasts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No broadcasts sent yet.
              </Typography>
            ) : (
              <List sx={{ py: 0 }}>
                {broadcasts.slice(0, 15).map((broadcast: any, i: number) => (
                  <Box key={broadcast._id || broadcast.id || i}>
                    {i > 0 && <Divider />}
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={broadcast.title || broadcast.subject}
                        secondary={
                          <>
                            {(broadcast.message || '').slice(0, 80)}
                            {(broadcast.message || '').length > 80 ? '...' : ''}
                            <br />
                            <Typography component="span" variant="caption" color="text.secondary">
                              {broadcast.createdAt ? new Date(broadcast.createdAt).toLocaleDateString() : ''}
                            </Typography>
                          </>
                        }
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function getScopeLabel(profile: any): string {
  if (!profile) return '';
  if (profile.role === 'admin') return 'All Members (National)';
  switch (profile.designation) {
    case 'National Coordinator': return 'All Members (National)';
    case 'State Coordinator': return profile.assignedState || 'State';
    case 'LGA Coordinator': return profile.assignedLGA || 'LGA';
    case 'Ward Coordinator': return profile.assignedWard || 'Ward';
    default: return 'Your area';
  }
}
