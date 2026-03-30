import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
  Grid,
} from '@mui/material';
import { ChevronRight, Users, Shield, MapPin, TrendingUp } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { mobiliseDashboardService } from '../../services/mobiliseDashboardService';
import { hasAccess } from '../../components/pbx/RBACGate';

type Level = 'national' | 'state' | 'lga' | 'ward' | 'pu';

const LEVEL_ORDER: Level[] = ['national', 'state', 'lga', 'ward', 'pu'];
const LEVEL_LABELS: Record<Level, string> = {
  national: 'National',
  state: 'State',
  lga: 'LGA',
  ward: 'Ward',
  pu: 'Polling Unit',
};

export default function HierarchyDashboard() {
  const { level: rawLevel, locationId } = useParams<{ level: string; locationId?: string }>();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const level = (rawLevel || 'national') as Level;

  useEffect(() => {
    // RBAC: check if user can view this level
    if (!hasAccess(profile ?? null, { minimumLevel: level })) {
      navigate('/pbx/dashboard', { replace: true });
      return;
    }
    loadData();
  }, [level, locationId]);

  async function loadData() {
    setLoading(true);
    try {
      let result: any;
      switch (level) {
        case 'national':
          result = await mobiliseDashboardService.getNationalData();
          break;
        case 'state':
          result = locationId
            ? await mobiliseDashboardService.getStateData(locationId)
            : await mobiliseDashboardService.getNationalData();
          break;
        case 'lga':
          if (locationId) result = await mobiliseDashboardService.getLGAData(locationId);
          break;
        case 'ward':
          if (locationId) result = await mobiliseDashboardService.getWardData(locationId);
          break;
        case 'pu':
          if (locationId) result = await mobiliseDashboardService.getPollingUnitData(locationId);
          break;
      }
      setData(result?.data || null);
    } catch (err) {
      console.error('Error loading hierarchy data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Build breadcrumb trail
  const buildBreadcrumbs = () => {
    const crumbs: { label: string; path?: string }[] = [];
    const currentIdx = LEVEL_ORDER.indexOf(level);

    for (let i = 0; i <= currentIdx; i++) {
      const l = LEVEL_ORDER[i];
      if (l === 'national') {
        crumbs.push({ label: 'National', path: i < currentIdx ? '/pbx/dashboard/national' : undefined });
      } else if (l === level) {
        crumbs.push({ label: locationId ? decodeURIComponent(locationId) : LEVEL_LABELS[l] });
      } else {
        crumbs.push({ label: LEVEL_LABELS[l] });
      }
    }
    return crumbs;
  };

  // Get subordinate items for drill-down
  const getSubordinates = (): any[] => {
    if (!data) return [];
    return data.states || data.lgas || data.wards || data.pollingUnits || [];
  };

  const getNextLevel = (): Level | null => {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  };

  const handleDrillDown = (item: any) => {
    const next = getNextLevel();
    if (!next) return;
    const id = item.id || item.slug || item.name;
    navigate(`/pbx/dashboard/${next}/${encodeURIComponent(id)}`);
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 3 }}>
        {buildBreadcrumbs().map((crumb, i) =>
          crumb.path ? (
            <MuiLink
              key={i}
              underline="hover"
              color="text.secondary"
              sx={{ cursor: 'pointer', fontSize: '0.875rem' }}
              onClick={() => navigate(crumb.path!)}
            >
              {crumb.label}
            </MuiLink>
          ) : (
            <Typography key={i} variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {crumb.label}
            </Typography>
          ),
        )}
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 1 }}>
        {LEVEL_LABELS[level]} Dashboard
      </Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        {locationId ? decodeURIComponent(locationId) : 'Overview of all areas in your scope'}
      </Typography>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
          <Grid size={12}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
        </Grid>
      ) : (
        <>
          {/* Stats row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {data?.totalMembers !== undefined && (
              <Grid size={{ xs: 6, md: 3 }}>
                <StatMini icon={<Users size={20} />} label="Members" value={data.totalMembers} color="#0B6739" />
              </Grid>
            )}
            {data?.memberCount !== undefined && (
              <Grid size={{ xs: 6, md: 3 }}>
                <StatMini icon={<Users size={20} />} label="Members" value={data.memberCount} color="#0B6739" />
              </Grid>
            )}
            {(data?.coordinatorCount ?? data?.totalCoordinators) !== undefined && (
              <Grid size={{ xs: 6, md: 3 }}>
                <StatMini icon={<Shield size={20} />} label="Coordinators" value={data.coordinatorCount ?? data.totalCoordinators} color="#1565c0" />
              </Grid>
            )}
            {data?.registrationRate !== undefined && (
              <Grid size={{ xs: 6, md: 3 }}>
                <StatMini icon={<TrendingUp size={20} />} label="Registration Rate" value={`${data.registrationRate}%`} color="#00897b" />
              </Grid>
            )}
            {(data?.states?.length ?? data?.lgas?.length ?? data?.wards?.length ?? data?.pollingUnits?.length) !== undefined && (
              <Grid size={{ xs: 6, md: 3 }}>
                <StatMini
                  icon={<MapPin size={20} />}
                  label={getNextLevel() ? LEVEL_LABELS[getNextLevel()!] + 's' : 'Units'}
                  value={getSubordinates().length}
                  color="#e65100"
                />
              </Grid>
            )}
          </Grid>

          {/* Coordinator info */}
          {data?.coordinator && (
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield size={28} color="#0B6739" />
                <Box>
                  <Typography variant="subtitle1">{data.coordinator.name || 'Coordinator'}</Typography>
                  <Typography variant="body2">
                    {data.coordinator.designation} {data.coordinator.phone && `• ${data.coordinator.phone}`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Subordinates table */}
          {getSubordinates().length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {getNextLevel() ? LEVEL_LABELS[getNextLevel()!] + 's' : 'Details'}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Members</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Coordinators</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getSubordinates().map((item: any, i: number) => (
                        <TableRow
                          key={i}
                          hover
                          onClick={() => handleDrillDown(item)}
                          sx={{ cursor: getNextLevel() ? 'pointer' : 'default' }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.name || item.stateName || item.lgaName || item.wardName || item.puName || `Item ${i + 1}`}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.memberCount ?? item.totalMembers ?? '—'}</TableCell>
                          <TableCell align="right">{item.coordinatorCount ?? '—'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.hasCoordinator ? 'Active' : 'Vacant'}
                              size="small"
                              color={item.hasCoordinator ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!data && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <MapPin size={40} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
                <Typography variant="h6" color="text.secondary">
                  No data available for this level
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data will appear once members register in this area.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}

function StatMini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}14`, color, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{label}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
