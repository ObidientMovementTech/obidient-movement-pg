import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Send, Phone, Mail, BarChart3 } from 'lucide-react';
import {
  createSMSCampaign,
  createVoiceCampaign,
  getCampaigns,
  getAvailableStates,
} from '../../services/communicationsService';

type CampaignType = 'sms' | 'voice';

export default function CommunicationsPage() {
  const [tab, setTab] = useState(0); // 0 = create, 1 = history
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create campaign form
  const [campaignType, setCampaignType] = useState<CampaignType>('sms');
  const [message, setMessage] = useState('');
  const [targetState, setTargetState] = useState('');
  const [states, setStates] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Campaign detail
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  useEffect(() => {
    getAvailableStates()
      .then((res: any) => setStates(Array.isArray(res) ? res : res.data?.states || res.states || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 1) loadCampaigns();
  }, [tab]);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const res: any = await getCampaigns();
      const arr = Array.isArray(res) ? res : res.data?.campaigns || res.campaigns || [];
      setCampaigns(arr);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Message is required.');
      return;
    }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const data: any = {
        message: message.trim(),
      };
      if (targetState) data.state = targetState;

      if (campaignType === 'sms') {
        await createSMSCampaign(data);
      } else {
        await createVoiceCampaign(data);
      }
      setSuccess(`${campaignType.toUpperCase()} campaign created successfully.`);
      setMessage('');
      setTargetState('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create campaign.');
    } finally {
      setSending(false);
    }
  };

  const openDetail = async (campaign: any) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>Communications</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Send SMS and voice campaigns to members.
      </Typography>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="Create Campaign" icon={<Send size={16} />} iconPosition="start" />
          <Tab label="Campaign History" icon={<BarChart3 size={16} />} iconPosition="start" />
        </Tabs>

        {tab === 0 && (
          <CardContent>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={campaignType}
                        label="Type"
                        onChange={(e) => setCampaignType(e.target.value as CampaignType)}
                      >
                        <MenuItem value="sms">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Mail size={16} /> SMS
                          </Box>
                        </MenuItem>
                        <MenuItem value="voice">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone size={16} /> Voice
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Target State</InputLabel>
                      <Select
                        value={targetState}
                        label="Target State"
                        onChange={(e) => setTargetState(e.target.value)}
                      >
                        <MenuItem value="">All States</MenuItem>
                        {states.map((s: any) => (
                          <MenuItem key={typeof s === 'string' ? s : s.name} value={typeof s === 'string' ? s : s.name}>
                            {typeof s === 'string' ? s : s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <TextField
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder={campaignType === 'sms' ? 'Type your SMS message (max 160 chars per segment)...' : 'Type your voice message script...'}
                  />

                  <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    startIcon={<Send size={16} />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {sending ? 'Creating...' : `Create ${campaignType.toUpperCase()} Campaign`}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {tab === 1 && (
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Recipients</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No campaigns found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c: any) => (
                    <TableRow
                      key={c._id || c.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => openDetail(c)}
                    >
                      <TableCell>
                        <Chip
                          icon={c.type === 'sms' ? <Mail size={14} /> : <Phone size={14} />}
                          label={c.type?.toUpperCase() || 'SMS'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {c.message?.slice(0, 60) || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.status || 'unknown'}
                          size="small"
                          color={c.status === 'completed' ? 'success' : c.status === 'failed' ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {c.recipientCount ?? c.totalRecipients ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Campaign detail dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Campaign Details</DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{selectedCampaign.type?.toUpperCase()}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2">{selectedCampaign.status}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Recipients</Typography>
                  <Typography variant="body2">{selectedCampaign.recipientCount ?? selectedCampaign.totalRecipients ?? '—'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2">
                    {selectedCampaign.createdAt ? new Date(selectedCampaign.createdAt).toLocaleString() : '—'}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">Message</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedCampaign.message || '—'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
