import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
} from '@mui/material';
import { Target, Users, TrendingUp, Award } from 'lucide-react';
import { mobiliseDashboardService } from '../../services/mobiliseDashboardService';
import { getLeaderboard } from '../../services/votingBlocService';
import type { ReactNode } from 'react';

export default function MobilisationPage() {
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [levelInfo, lb] = await Promise.all([
        mobiliseDashboardService.getUserLevel().catch(() => null),
        getLeaderboard({ limit: 20 }).catch(() => ({ leaderboard: [] })),
      ]);

      setStats(levelInfo?.data || null);
      setLeaderboard(lb?.leaderboard || []);
    } catch (err) {
      console.error('Error loading mobilisation data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>Mobilisation</Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        Track mobilisation metrics (voting blocs and registrations).
      </Typography>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <MiniCard icon={<Target size={22} />} label="Your Level" value={stats?.level || '—'} color="#0B6739" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <MiniCard icon={<Users size={22} />} label="Location" value={stats?.assignedLocation || '—'} color="#1565c0" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <MiniCard icon={<TrendingUp size={22} />} label="Leaderboard Entries" value={leaderboard.length} color="#7b1fa2" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <MiniCard icon={<Award size={22} />} label="Top Score" value={leaderboard[0]?.score || leaderboard[0]?.engagementScore || '—'} color="#e65100" />
            </Grid>
          </>
        )}
      </Grid>

      {/* Leaderboard */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Voting Bloc Leaderboard</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Members</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No leaderboard data available.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((entry: any, i: number) => (
                    <TableRow key={entry._id || entry.id || i} hover>
                      <TableCell>
                        <Chip
                          label={i + 1}
                          size="small"
                          color={i < 3 ? 'primary' : 'default'}
                          variant={i < 3 ? 'filled' : 'outlined'}
                          sx={{ minWidth: 32 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entry.name || entry.votingBlocName || `Bloc ${i + 1}`}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{entry.memberCount ?? entry.totalMembers ?? '—'}</TableCell>
                      <TableCell align="right">{entry.score ?? entry.engagementScore ?? '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

function MiniCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}14`, color, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{label}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
