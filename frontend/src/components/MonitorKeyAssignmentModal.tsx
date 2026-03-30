import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Grid,
  Alert,
  Checkbox,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import { X, Key, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { monitorKeyService } from '../services/monitorKeyService.ts';

interface Election {
  election_id: string;
  election_name: string;
  election_type: string;
  state: string;
  election_date: string;
  status: string;
}

interface MonitorKeyAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    designation?: string;
    assignedState?: string;
    assignedLGA?: string;
    assignedWard?: string;
    votingState?: string;
    votingLGA?: string;
    votingWard?: string;
    votingPU?: string;
  };
  onSuccess: () => void;
}

const ELIGIBLE = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
  'Polling Unit Agent',
  'Vote Defender',
];

const MonitorKeyAssignmentModal = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}: MonitorKeyAssignmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const loc = useMemo(
    () => ({
      state: user.votingState || user.assignedState || '',
      lga: user.votingLGA || user.assignedLGA || '',
      ward: user.votingWard || user.assignedWard || '',
      pu: user.votingPU || '',
    }),
    [user],
  );

  const issues = useMemo(() => {
    const arr: string[] = [];
    const d = user.designation || '';
    if (!loc.state && d !== 'National Coordinator') arr.push('No voting state');
    if (
      ['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent', 'Vote Defender'].includes(d) &&
      !loc.lga
    )
      arr.push('No voting LGA');
    if (
      ['Ward Coordinator', 'Polling Unit Agent', 'Vote Defender'].includes(d) &&
      !loc.ward
    )
      arr.push('No voting ward');
    if (['Polling Unit Agent', 'Vote Defender'].includes(d) && !loc.pu)
      arr.push('No polling unit');
    return arr;
  }, [loc, user.designation]);

  const canAssign = ELIGIBLE.includes(user.designation || '');

  const fetchElections = useCallback(async () => {
    try {
      const r = await monitorKeyService.getActiveElections();
      setElections(r.data || []);
    } catch (e) {
      console.error('Error fetching elections:', e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchElections();
      setSelected([]);
    }
  }, [fetchElections, isOpen, user.id]);

  const handleAssign = async () => {
    if (!user.id || !selected.length || issues.length > 0) return;
    setLoading(true);
    try {
      await monitorKeyService.assignMonitorKey(user.id, {
        electionIds: selected,
        key_status: 'active' as const,
        election_access_level: user.designation || undefined,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign monitor key');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const locationCards = [
    { label: 'State', value: loc.state },
    { label: 'LGA', value: loc.lga },
    { label: 'Ward', value: loc.ward },
    { label: 'Polling Unit', value: loc.pu },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Key size={20} color="#3b82f6" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Assign Monitor Key
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Grant {user.name} monitoring access
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {/* User Info */}
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, mb: 2 }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.name}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Designation
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.designation || 'Not assigned'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {!canAssign && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Designation &ldquo;{user.designation}&rdquo; is not eligible for monitoring
            access.
          </Alert>
        )}

        {canAssign && (
          <>
            {/* Location */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <MapPin size={16} /> Monitoring Location
            </Typography>

            {issues.length > 0 && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                icon={<AlertTriangle size={18} />}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Missing location details
                </Typography>
                {issues.map((i) => (
                  <Typography key={i} variant="caption" component="div">
                    &bull; {i}
                  </Typography>
                ))}
              </Alert>
            )}

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {locationCards.map(({ label, value }) => (
                <Grid size={{ xs: 6 }} key={label}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {value || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Elections */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Calendar size={16} /> Election Access
            </Typography>

            {elections.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No active elections available
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {elections.map((el) => (
                  <Box
                    key={el.election_id}
                    onClick={() => toggle(el.election_id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      p: 1.5,
                      mb: 1,
                      border: '1px solid',
                      borderColor: selected.includes(el.election_id)
                        ? 'primary.main'
                        : 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: selected.includes(el.election_id)
                        ? 'primary.light'
                        : 'transparent',
                      '&:hover': { bgcolor: 'grey.50' },
                    }}
                  >
                    <Checkbox
                      checked={selected.includes(el.election_id)}
                      size="small"
                      sx={{ p: 0, mt: 0.25 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {el.election_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {el.state} &middot; {el.election_type} &middot;{' '}
                        {new Date(el.election_date).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={el.status}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{
                          ml: 1,
                          textTransform: 'capitalize',
                          height: 20,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        {canAssign && (
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={loading || selected.length === 0}
            startIcon={
              loading ? <CircularProgress size={16} /> : <Key size={16} />
            }
          >
            {loading ? 'Assigning...' : 'Assign Monitor Key'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MonitorKeyAssignmentModal;
