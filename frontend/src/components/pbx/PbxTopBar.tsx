import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { Menu as MenuIcon, Bell, LogOut, User, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { getNotifications } from '../../services/notificationService';

const BREADCRUMB_MAP: Record<string, string> = {
  '/pbx/dashboard': 'Dashboard',
  '/pbx/membership': 'Membership',
  '/pbx/chat': 'Chat',
  '/pbx/communities': 'Communities',
  '/pbx/mobilisation': 'Mobilisation',
  '/pbx/blog': 'Blog',
  '/pbx/blog/new': 'New Post',
  '/pbx/users': 'Users',
  '/pbx/communications': 'Communications',
};

interface PbxTopBarProps {
  onMenuToggle: () => void;
}

export default function PbxTopBar({ onMenuToggle }: PbxTopBarProps) {
  const { profile, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    getNotifications()
      .then((data) => {
        const count = Array.isArray(data) ? data.filter((n: { read: boolean }) => !n.read).length : 0;
        setUnreadCount(count);
      })
      .catch(() => {});
  }, [location.pathname]);

  const pageTitle = () => {
    // Check for exact match first
    const exact = BREADCRUMB_MAP[location.pathname];
    if (exact) return exact;

    // Check for hierarchy dashboard
    if (location.pathname.startsWith('/pbx/dashboard/')) {
      const segments = location.pathname.split('/').filter(Boolean);
      if (segments.length >= 3) {
        const level = segments[2];
        return `Dashboard — ${level.charAt(0).toUpperCase() + level.slice(1)}`;
      }
    }

    // Check for blog edit
    if (location.pathname.startsWith('/pbx/blog/edit/')) return 'Edit Post';

    // Fallback: last path segment
    const last = location.pathname.split('/').filter(Boolean).pop() || 'Dashboard';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  const breadcrumbs = () => {
    const parts: { label: string; path?: string }[] = [{ label: 'Admin', path: '/pbx/dashboard' }];
    const title = pageTitle();
    if (title !== 'Dashboard') {
      parts.push({ label: title });
    }
    return parts;
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/auth/login');
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{ bgcolor: 'background.paper', zIndex: (theme) => theme.zIndex.drawer - 1 }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Mobile hamburger */}
        <IconButton
          onClick={onMenuToggle}
          sx={{ display: { lg: 'none' }, mr: 1 }}
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={22} />
        </IconButton>

        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          {breadcrumbs().map((crumb, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {i > 0 && <ChevronRight size={14} style={{ color: '#94a3b8' }} />}
              <Typography
                variant="body2"
                onClick={crumb.path ? () => navigate(crumb.path!) : undefined}
                sx={{
                  cursor: crumb.path ? 'pointer' : 'default',
                  color: i === breadcrumbs().length - 1 ? 'text.primary' : 'text.secondary',
                  fontWeight: i === breadcrumbs().length - 1 ? 500 : 400,
                  '&:hover': crumb.path ? { color: 'primary.main' } : {},
                }}
              >
                {crumb.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Notification bell */}
        <IconButton onClick={() => navigate('/dashboard')} aria-label="Notifications">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Bell size={20} />
          </Badge>
        </IconButton>

        {/* User avatar dropdown */}
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar
            src={profile?.profileImage}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}
          >
            {profile?.name?.[0] || '?'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 180 } } }}
        >
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
            <ListItemIcon><User size={16} /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogOut size={16} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
