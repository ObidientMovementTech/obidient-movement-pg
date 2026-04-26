import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Typography,
  Container,
} from '@mui/material';
import {
  Home,
  Users,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  CreditCard,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { logoutUser } from '../../services/authService';
import { getNotifications } from '../../services/notificationService';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', exact: true },
  { path: '/dashboard/voting-bloc', label: 'Voting Bloc' },
  { path: '/dashboard/chat', label: 'Chat' },
  { path: '/dashboard/notifications', label: 'Notifications', hasBadge: true },
  { path: '/dashboard/profile', label: 'Profile' },
];

const MOBILE_NAV = [
  { path: '/dashboard', icon: Home, exact: true },
  { path: '/dashboard/voting-bloc', icon: Users },
  { path: '/dashboard/chat', icon: MessageSquare },
  { path: '/dashboard/notifications', icon: Bell, hasBadge: true },
  { path: '/dashboard/profile', icon: User },
];

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

export default function DashboardLayout() {
  const { profile, isLoading, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !profile) navigate('/auth/login');
  }, [isLoading, profile, navigate]);

  useEffect(() => {
    if (!profile) return;
    getNotifications()
      .then((n: any[]) => setUnreadCount(n.filter((x: any) => !x.read).length))
      .catch(() => {});
  }, [profile, location.pathname]);

  useEffect(() => {
    if (profile && !isLoading) {
      const pendingJoin = localStorage.getItem('pending-voting-bloc-join');
      if (pendingJoin) {
        try {
          const joinData = JSON.parse(pendingJoin);
          const hoursDiff = (Date.now() - new Date(joinData.timestamp).getTime()) / (1000 * 60 * 60);
          if (hoursDiff < 24) {
            localStorage.removeItem('pending-voting-bloc-join');
            navigate(`/voting-bloc/${joinData.joinCode}`);
            return;
          }
          localStorage.removeItem('pending-voting-bloc-join');
        } catch {
          localStorage.removeItem('pending-voting-bloc-join');
        }
      }
    }
  }, [profile, isLoading, navigate]);

  const isCoordinator = profile?.designation && ['National Coordinator', 'State Coordinator', 'LGA Coordinator', 'Ward Coordinator'].includes(profile.designation);

  const isActive = (path: string, exact?: boolean) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      await logoutUser();
      window.location.replace('/auth/login');
    } catch {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/auth/login');
    }
  };

  if (isLoading || !profile) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
        <Box sx={{ width: 32, height: 32, border: '2px solid #e5e5e5', borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>

      {/* ─── Top Bar ─── */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Toolbar disableGutters sx={{ height: { xs: 56, md: 56 }, gap: 0 }}>

            {/* Logo */}
            <Box component={Link} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: { xs: 0, md: 5 } }}>
              <img src="/obidientLogoGreen.svg" alt="Obidient" style={{ height: 36 }} />
            </Box>

            {/* Desktop Nav — text only, no icons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0, flex: 1, ml: 1 }}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Box key={item.path} component={Link} to={item.path} sx={{ textDecoration: 'none', position: 'relative', px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography
                      sx={{
                        fontFamily: FONT,
                        fontSize: '0.82rem',
                        fontWeight: active ? 500 : 400,
                        color: active ? '#0a0a0a' : '#737373',
                        letterSpacing: '-0.01em',
                        transition: 'color 0.15s',
                        '&:hover': { color: '#0a0a0a' },
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.hasBadge && unreadCount > 0 && (
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Box>
                    )}
                    {/* Active indicator — thin bottom line */}
                    {active && (
                      <Box sx={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, bgcolor: '#0a0a0a', borderRadius: 1 }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Desktop avatar */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Box
                onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.25, pl: 2, py: 1, borderRadius: 2, transition: 'background 0.15s', '&:hover': { bgcolor: '#fafafa' } }}
              >
                <Avatar src={profile.profileImage || undefined} alt={profile.name} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 30, height: 30, bgcolor: '#171717', fontSize: '0.75rem', fontWeight: 500, fontFamily: FONT }}>
                  {profile.name?.[0]}
                </Avatar>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 500, color: '#0a0a0a', display: { xs: 'none', lg: 'block' } }}>
                  {profile.name?.split(' ')[0]}
                </Typography>
              </Box>
            </Box>

            {/* Mobile — just avatar */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', ml: 'auto' }}>
              <Avatar
                src={profile.profileImage || undefined}
                alt={profile.name}
                imgProps={{ referrerPolicy: 'no-referrer' }}
                sx={{ width: 28, height: 28, bgcolor: '#171717', fontSize: '0.7rem', fontWeight: 500, fontFamily: FONT, cursor: 'pointer' }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                {profile.name?.[0]}
              </Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ─── Profile Menu ─── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { width: 220, mt: 1, borderRadius: 2.5, border: '1px solid #f0f0f0', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontFamily: FONT } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 500, fontSize: '0.84rem', color: '#0a0a0a' }}>{profile.name}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#a3a3a3' }} noWrap>{profile.email}</Typography>
        </Box>
        <Divider sx={{ borderColor: '#f0f0f0' }} />
        <MenuItem component={Link} to="/dashboard/profile" onClick={() => setAnchorEl(null)} sx={{ fontFamily: FONT, fontSize: '0.82rem', py: 1, color: '#525252' }}>
          <User size={15} style={{ marginRight: 10, opacity: 0.5 }} /> Profile
        </MenuItem>
        <MenuItem component={Link} to="/dashboard/card" onClick={() => setAnchorEl(null)} sx={{ fontFamily: FONT, fontSize: '0.82rem', py: 1, color: '#525252' }}>
          <CreditCard size={15} style={{ marginRight: 10, opacity: 0.5 }} /> Membership Card
        </MenuItem>
        {(profile.role === 'admin' || isCoordinator) && (
          <MenuItem component="a" href="/pbx/dashboard" target="_blank" rel="noopener noreferrer" onClick={() => setAnchorEl(null)} sx={{ fontFamily: FONT, fontSize: '0.82rem', py: 1, color: '#525252' }}>
            <ShieldCheck size={15} style={{ marginRight: 10, opacity: 0.5 }} /> Admin Panel
            <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.3 }} />
          </MenuItem>
        )}
        <Divider sx={{ borderColor: '#f0f0f0' }} />
        <MenuItem onClick={handleLogout} sx={{ fontFamily: FONT, fontSize: '0.82rem', py: 1, color: '#dc2626' }}>
          <LogOut size={15} style={{ marginRight: 10, opacity: 0.6 }} /> Log out
        </MenuItem>
      </Menu>

      {/* ─── Content ─── */}
      <Box sx={{ flex: 1, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 2.5, md: 4 }, py: { xs: 3, md: 5 }, pb: { xs: 11, md: 5 } }}>
          <Outlet context={{ profile, refreshProfile: useUser().refreshProfile }} />
        </Container>
      </Box>

      {/* ─── Footer (desktop) ─── */}
      <Box component="footer" sx={{ display: { xs: 'none', md: 'block' }, borderTop: '1px solid #f0f0f0', py: 3, mt: 'auto' }}>
        <Container maxWidth="lg" disableGutters sx={{ px: 4 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#a3a3a3', textAlign: 'center' }}>
            © {new Date().getFullYear()} Obidient Movement
          </Typography>
        </Container>
      </Box>

      {/* ─── Mobile Bottom Nav — icons only, minimal ─── */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          bgcolor: '#fff',
          borderTop: '1px solid #f0f0f0',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 52,
          pb: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.path, item.exact);
          const Icon = item.icon;
          return (
            <Box
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                py: 0.75,
                flex: 1,
                position: 'relative',
                color: active ? '#0a0a0a' : '#a3a3a3',
                transition: 'color 0.15s',
              }}
            >
              {item.hasBadge && unreadCount > 0 ? (
                <Badge variant="dot" color="error" overlap="circular" sx={{ '& .MuiBadge-dot': { width: 6, height: 6, minWidth: 6, top: 2, right: 2 } }}>
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                </Badge>
              ) : (
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              )}
              {/* Active dot */}
              {active && (
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#0a0a0a', mt: 0.5 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
