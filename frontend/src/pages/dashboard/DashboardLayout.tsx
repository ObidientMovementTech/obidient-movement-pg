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
  Drawer,
  IconButton,
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
  Menu as MenuIcon,
  X,
  ChevronRight,
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                ml: 'auto',
                mr: 1,
                color: '#525252',
                p: 0.75,
              }}
              aria-label="Open navigation menu"
            >
              <MenuIcon size={22} strokeWidth={2} />
            </IconButton>

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
                        fontWeight: active ? 600 : 400,
                        color: active ? PRIMARY : '#737373',
                        letterSpacing: '-0.01em',
                        transition: 'color 0.15s',
                        '&:hover': { color: active ? PRIMARY : '#0a0a0a' },
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.hasBadge && unreadCount > 0 && (
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Box>
                    )}
                    {/* Active indicator — brand-colored bottom line */}
                    {active && (
                      <Box sx={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2.5, bgcolor: PRIMARY, borderRadius: 2 }} />
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

            {/* Mobile — avatar (right side) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
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

      {/* ─── Mobile Bottom Nav — icons only, branded active ─── */}
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
                color: active ? PRIMARY : '#a3a3a3',
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
              {/* Active dot — brand color */}
              {active && (
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY, mt: 0.5 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* ─── Mobile Drawer ─── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: '#fff',
            borderRight: 'none',
            boxShadow: '4px 0 40px rgba(0,0,0,0.08)',
          },
        }}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' } },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 2.5,
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img src="/obidientLogoGreen.svg" alt="Obidient" style={{ height: 32 }} />
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: '#737373', p: 0.5 }}
            aria-label="Close menu"
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#f5f5f5' }} />

        {/* User card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 2,
          }}
        >
          <Avatar
            src={profile.profileImage || undefined}
            alt={profile.name}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{
              width: 40,
              height: 40,
              bgcolor: PRIMARY,
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            {profile.name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#0a0a0a',
                lineHeight: 1.2,
              }}
              noWrap
            >
              {profile.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: '0.72rem',
                color: '#a3a3a3',
                mt: 0.25,
              }}
              noWrap
            >
              {profile.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f5f5f5', mx: 2 }} />

        {/* Nav links */}
        <Box sx={{ py: 1, px: 1 }}>
          {[
            { path: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
            { path: '/dashboard/voting-bloc', label: 'Voting Bloc', icon: Users },
            { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
            { path: '/dashboard/notifications', label: 'Notifications', icon: Bell, hasBadge: true },
            { path: '/dashboard/profile', label: 'Profile', icon: User },
            { path: '/dashboard/card', label: 'Membership Card', icon: CreditCard },
          ].map((item) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;
            return (
              <Box
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  px: 2,
                  py: 1.25,
                  borderRadius: 2.5,
                  mb: 0.25,
                  bgcolor: active ? `${PRIMARY}0A` : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: active ? `${PRIMARY}12` : '#fafafa',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: active ? `${PRIMARY}14` : '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? PRIMARY : '#737373',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.84rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? PRIMARY : '#525252',
                    flex: 1,
                  }}
                >
                  {item.label}
                </Typography>
                {item.hasBadge && unreadCount > 0 && (
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      bgcolor: '#ef4444',
                      color: '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      fontFamily: FONT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.5,
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Box>
                )}
                {active && (
                  <ChevronRight size={14} color={PRIMARY} style={{ opacity: 0.5 }} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Admin link (conditional) */}
        {(profile.role === 'admin' || isCoordinator) && (
          <>
            <Divider sx={{ borderColor: '#f5f5f5', mx: 2 }} />
            <Box sx={{ py: 1, px: 1 }}>
              <Box
                component="a"
                href="/pbx/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDrawerOpen(false)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  px: 2,
                  py: 1.25,
                  borderRadius: 2.5,
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#fafafa' },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#737373',
                  }}
                >
                  <ShieldCheck size={16} strokeWidth={1.8} />
                </Box>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 400, color: '#525252', flex: 1 }}>
                  Admin Panel
                </Typography>
                <ExternalLink size={13} style={{ opacity: 0.3 }} />
              </Box>
            </Box>
          </>
        )}

        {/* Spacer + logout */}
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ borderColor: '#f5f5f5' }} />
          <Box sx={{ px: 1, py: 1.5 }}>
            <Box
              onClick={() => { setDrawerOpen(false); handleLogout(); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 2.5,
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#fef2f2' },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                }}
              >
                <LogOut size={16} strokeWidth={1.8} />
              </Box>
              <Typography sx={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 500, color: '#dc2626' }}>
                Log out
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
