import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
  LayoutDashboard,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { logoutUser } from '../../services/authService';
import { getNotifications } from '../../services/notificationService';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
  { path: '/dashboard/voting-bloc', label: 'My Voting Bloc', icon: Users },
  { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
];

const MOBILE_NAV = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/voting-bloc', label: 'Blocs', icon: Users },
  { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { path: '/dashboard/notifications', label: 'Alerts', icon: Bell },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
];

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';
const PRIMARY_LIGHT = 'rgba(0,104,55,0.08)';

export default function DashboardLayout() {
  const { profile, isLoading, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !profile) {
      navigate('/auth/login');
    }
  }, [isLoading, profile, navigate]);

  // Fetch unread notification count
  useEffect(() => {
    if (!profile) return;
    getNotifications()
      .then((notifications: any[]) => {
        setUnreadCount(notifications.filter((n: any) => !n.read).length);
      })
      .catch(() => {});
  }, [profile, location.pathname]);

  // Check for pending voting bloc join
  useEffect(() => {
    if (profile && !isLoading) {
      const pendingJoin = localStorage.getItem('pending-voting-bloc-join');
      if (pendingJoin) {
        try {
          const joinData = JSON.parse(pendingJoin);
          const hoursDiff =
            (Date.now() - new Date(joinData.timestamp).getTime()) / (1000 * 60 * 60);
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

  const isCoordinator =
    profile?.designation &&
    [
      'National Coordinator',
      'State Coordinator',
      'LGA Coordinator',
      'Ward Coordinator',
    ].includes(profile.designation);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: PRIMARY,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
      {/* ─── AppBar ─── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: { xs: 64, md: 72 }, gap: 3 }}>
            {/* Logo */}
            <Box component={Link} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: { xs: 0, md: 4 } }}>
              <img src="/obidientLogoGreen.svg" alt="Obidient Movement Logo" style={{ width: 192, height: 64 }} />
            </Box>

            {/* Desktop Nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, flex: 1 }}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      px: 2.5,
                      py: 1.25,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontFamily: FONT,
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.875rem',
                      letterSpacing: '-0.01em',
                      color: active ? PRIMARY : 'text.secondary',
                      bgcolor: active ? PRIMARY_LIGHT : 'transparent',
                      '&:hover': { bgcolor: active ? PRIMARY_LIGHT : 'action.hover' },
                    }}
                    startIcon={
                      item.label === 'Notifications' ? (
                        <Badge badgeContent={unreadCount} color="error" max={99}>
                          <Icon size={18} />
                        </Badge>
                      ) : (
                        <Icon size={18} />
                      )
                    }
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Desktop Profile menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar
                  src={profile.profileImage || undefined}
                  alt={profile.name}
                  sx={{ width: 36, height: 36, bgcolor: PRIMARY }}
                >
                  {profile.name?.[0]}
                </Avatar>
              </IconButton>
            </Box>

            {/* Mobile — Notification + Avatar + Hamburger */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <IconButton
                component={Link}
                to="/dashboard/notifications"
                sx={{ p: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error" max={99} variant="dot">
                  <Bell size={20} color="#71717a" />
                </Badge>
              </IconButton>
              <Avatar
                src={profile.profileImage || undefined}
                alt={profile.name}
                sx={{ width: 32, height: 32, bgcolor: PRIMARY, border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                {profile.name?.[0]}
              </Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ─── Profile Menu (shared desktop + mobile) ─── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { width: 260, mt: 1.5, borderRadius: 3, fontFamily: FONT } } }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="subtitle2" sx={{ fontFamily: FONT, fontWeight: 600 }}>{profile.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontFamily: FONT }}>
            {profile.email}
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', gap: 0.75 }}>
            <Chip
              label={profile.kycStatus}
              size="small"
              color={profile.kycStatus === 'approved' ? 'success' : 'warning'}
              sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
            />
            {profile.emailVerified && (
              <Chip label="Email Verified" size="small" color="info" sx={{ fontSize: '0.7rem' }} />
            )}
          </Box>
        </Box>
        <Divider />
        <MenuItem component={Link} to="/dashboard/profile" onClick={() => setAnchorEl(null)}>
          <User size={16} style={{ marginRight: 10 }} /> My Profile
        </MenuItem>
        <MenuItem component={Link} to="/dashboard/card" onClick={() => setAnchorEl(null)}>
          <CreditCard size={16} style={{ marginRight: 10 }} /> Membership Card
        </MenuItem>
        {(profile.role === 'admin' || isCoordinator) && (
          <MenuItem component="a" href="/pbx/dashboard" target="_blank" rel="noopener noreferrer" onClick={() => setAnchorEl(null)}>
            <ShieldCheck size={16} style={{ marginRight: 10 }} /> Admin Panel
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogOut size={16} style={{ marginRight: 10 }} /> Logout
        </MenuItem>
      </Menu>

      {/* ─── Mobile Drawer (kept for deep-link items) ─── */}
      <Drawer
        anchor="top"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { top: 64, borderRadius: '0 0 16px 16px', fontFamily: FONT } } }}
        ModalProps={{ keepMounted: true }}
      >
        <List sx={{ py: 2, px: 0.5 }}>
          <ListItemButton component={Link} to="/dashboard/card" onClick={() => setDrawerOpen(false)} sx={{ mx: 1.5, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><CreditCard size={20} /></ListItemIcon>
            <ListItemText primary="Membership Card" primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: FONT }} />
          </ListItemButton>
          {(profile.role === 'admin' || isCoordinator) && (
            <ListItemButton component="a" href="/pbx/dashboard" target="_blank" rel="noopener noreferrer" onClick={() => setDrawerOpen(false)} sx={{ mx: 1.5, borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}><ShieldCheck size={20} /></ListItemIcon>
              <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: FONT }} />
              <ExternalLink size={14} style={{ opacity: 0.4 }} />
            </ListItemButton>
          )}
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleLogout} sx={{ mx: 1.5, borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><LogOut size={20} /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: FONT }} />
          </ListItemButton>
        </List>
      </Drawer>

      {/* ─── Content ─── */}
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 6 }, px: { xs: 2.5, sm: 3, md: 4 }, pb: { xs: 12, md: 6 } }}>
        <Outlet context={{ profile, refreshProfile: useUser().refreshProfile }} />
      </Container>

      {/* ─── Desktop Footer ─── */}
      <Box
        component="footer"
        sx={{
          display: { xs: 'none', md: 'block' },
          bgcolor: '#fff',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 3.5,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center" sx={{ fontFamily: FONT }}>
            © {new Date().getFullYear()} Obidient Movement
          </Typography>
        </Container>
      </Box>

      {/* ─── Mobile Bottom Navigation ─── */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-around',
          alignItems: 'center',
          px: 1,
          pt: 1,
          pb: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
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
                px: 1.5,
                py: 0.75,
                borderRadius: 3,
                bgcolor: active ? PRIMARY_LIGHT : 'transparent',
                color: active ? PRIMARY : '#a1a1aa',
                transition: 'all 0.15s',
                minWidth: 56,
              }}
            >
              {item.label === 'Alerts' ? (
                <Badge badgeContent={unreadCount} color="error" max={99} variant="dot">
                  <Icon size={22} />
                </Badge>
              ) : (
                <Icon size={22} />
              )}
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.6rem',
                  fontWeight: active ? 700 : 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  mt: 0.25,
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
