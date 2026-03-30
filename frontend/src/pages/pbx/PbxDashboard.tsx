import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
  Chip,
} from '@mui/material';
import { Users, UserPlus, Target, Shield, TrendingUp, Building2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { mobiliseDashboardService } from '../../services/mobiliseDashboardService';
import { stateDashboardService } from '../../services/stateDashboardService';
import RBACGate from '../../components/pbx/RBACGate';
import type { ReactNode } from 'react';

interface StatCard {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  bgColor: string;
}

export default function PbxDashboard() {
  const { profile } = useUser();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [levelInfo, dashData] = await Promise.all([
        mobiliseDashboardService.getUserLevel().catch(() => null),
        stateDashboardService.getDashboardData().catch(() => null),
      ]);

      setDashboardData(dashData);

      const cards: StatCard[] = [];

      if (dashData?.data) {
        const d = dashData.data;
        cards.push({
          label: 'Total Members',
          value: formatNumber(d.totalMembers ?? d.memberCount ?? 0),
          icon: <Users size={22} />,
          color: '#0B6739',
          bgColor: '#e8f5e9',
        });
        cards.push({
          label: 'Coordinators',
          value: formatNumber(d.coordinatorCount ?? d.totalCoordinators ?? 0),
          icon: <Shield size={22} />,
          color: '#1565c0',
          bgColor: '#e3f2fd',
        });
      }

      // Fetch level-specific data
      if (levelInfo?.data) {
        const level = levelInfo.data.level;
        let scopeData: any = null;

        if (level === 'national') {
          scopeData = await mobiliseDashboardService.getNationalData().catch(() => null);
        } else if (level === 'state' && levelInfo.data.assignedLocation) {
          scopeData = await mobiliseDashboardService.getStateData(levelInfo.data.assignedLocation).catch(() => null);
        } else if (level === 'lga' && levelInfo.data.assignedLocation) {
          scopeData = await mobiliseDashboardService.getLGAData(levelInfo.data.assignedLocation).catch(() => null);
        }

        if (scopeData?.data) {
          const sd = scopeData.data;
          if (sd.totalRegistrations !== undefined) {
            cards.push({
              label: 'Registrations',
              value: formatNumber(sd.totalRegistrations),
              icon: <UserPlus size={22} />,
              color: '#7b1fa2',
              bgColor: '#f3e5f5',
            });
          }
          if (sd.states || sd.lgas || sd.wards) {
            const subCount = sd.states?.length || sd.lgas?.length || sd.wards?.length || 0;
            cards.push({
              label: level === 'national' ? 'States' : level === 'state' ? 'LGAs' : 'Wards',
              value: subCount,
              icon: <Building2 size={22} />,
              color: '#e65100',
              bgColor: '#fff3e0',
            });
          }
        }
      }

      // Add voting blocs and mobilisation placeholders
      cards.push({
        label: 'Active Voting Blocs',
        value: formatNumber(dashData?.data?.votingBlocCount ?? 0),
        icon: <Target size={22} />,
        color: '#D21C5B',
        bgColor: '#fce4ec',
      });
      cards.push({
        label: 'Growth',
        value: dashData?.data?.growthRate ? `${dashData.data.growthRate}%` : '—',
        icon: <TrendingUp size={22} />,
        color: '#00897b',
        bgColor: '#e0f2f1',
      });

      setStats(cards);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
          Welcome back, {profile?.name?.split(' ')[0]}
        </Typography>
        <Typography variant="body2">
          Here's an overview of your {getScopeLabel(profile)} operations.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height={40} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : stats.map((stat, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                        {stat.label}
                      </Typography>
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: 2,
                          bgcolor: stat.bgColor,
                          color: stat.color,
                          display: 'flex',
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Quick actions */}
      <RBACGate minimumLevel="state">
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <ActionChip label="View Subordinates" href="/pbx/dashboard/state" />
              <ActionChip label="Manage Members" href="/pbx/membership" />
              <ActionChip label="Send Broadcast" href="/pbx/communications" />
              <ActionChip label="Write Blog Post" href="/pbx/blog/new" />
            </Box>
          </CardContent>
        </Card>
      </RBACGate>

      {/* Recent activity / scope info */}
      {dashboardData?.data && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Scope Information
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile?.assignedState && (
                <Chip label={`State: ${profile.assignedState}`} variant="outlined" size="small" />
              )}
              {profile?.assignedLGA && (
                <Chip label={`LGA: ${profile.assignedLGA}`} variant="outlined" size="small" />
              )}
              {profile?.assignedWard && (
                <Chip label={`Ward: ${profile.assignedWard}`} variant="outlined" size="small" />
              )}
              {profile?.designation && (
                <Chip label={profile.designation} color="primary" size="small" />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function ActionChip({ label, href }: { label: string; href: string }) {
  return (
    <Chip
      label={label}
      component="a"
      href={href}
      clickable
      variant="outlined"
      color="primary"
      sx={{ fontWeight: 500 }}
    />
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getScopeLabel(profile: any): string {
  if (!profile) return '';
  if (profile.role === 'admin') return 'national';
  switch (profile.designation) {
    case 'National Coordinator': return 'national';
    case 'State Coordinator': return profile.assignedState || 'state';
    case 'LGA Coordinator': return profile.assignedLGA || 'LGA';
    case 'Ward Coordinator': return profile.assignedWard || 'ward';
    default: return '';
  }
}
