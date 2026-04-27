import { useLocation, useNavigate } from 'react-router';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  LayoutDashboard,
  Target,
  FileText,
  UserCog,
  Megaphone,
  ArrowLeft,
  IdCard,
  Settings,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import RBACGate from './RBACGate';
import type { ReactNode } from 'react';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  /** RBAC props — missing means visible to all /pbx users */
  minimumLevel?: 'national' | 'state' | 'lga' | 'ward' | 'pu';
  allowedRoles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/pbx/dashboard' },
  { label: 'Users', icon: <UserCog size={20} />, path: '/pbx/users', allowedRoles: ['admin'] },
  { label: 'Membership', icon: <IdCard size={20} />, path: '/pbx/membership', minimumLevel: 'state' },
  { label: 'Mobilisation', icon: <Target size={20} />, path: '/pbx/mobilisation' },
  { label: 'Blog', icon: <FileText size={20} />, path: '/pbx/blog', minimumLevel: 'state' },
  { label: 'Communications', icon: <Megaphone size={20} />, path: '/pbx/communications', minimumLevel: 'state' },
  { label: 'Mobile Feeds', icon: <Smartphone size={20} />, path: '/pbx/mobile-feeds', allowedRoles: ['admin'] },
  { label: 'ADC Verification', icon: <ShieldCheck size={20} />, path: '/pbx/adc', minimumLevel: 'state' },
  { label: 'Settings', icon: <Settings size={20} />, path: '/pbx/settings', allowedRoles: ['admin'] },
];

interface PbxSidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarContent() {
  const { profile } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 3, pb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', letterSpacing: '-0.02em' }}>
          Admin Panel
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Obidient Movement
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const button = (
            <ListItemButton
              key={item.label}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItemButton>
          );

          // Wrap in RBACGate if RBAC constraints exist
          if (item.allowedRoles || item.minimumLevel) {
            return (
              <RBACGate
                key={item.label}
                allowedRoles={item.allowedRoles}
                minimumLevel={item.minimumLevel}
              >
                {button}
              </RBACGate>
            );
          }

          return button;
        })}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* User section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={profile?.profileImage}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}
          >
            {profile?.name?.[0] || '?'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
              {profile?.name}
            </Typography>
            <Chip
              label={profile?.designation || profile?.role}
              size="small"
              sx={{ height: 20, fontSize: '0.625rem', mt: 0.25 }}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        <ListItemButton
          onClick={() => navigate('/dashboard')}
          sx={{ borderRadius: 2, mx: -0.5, py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ArrowLeft size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Back to Portal"
            primaryTypographyProps={{ fontSize: '0.8125rem', color: 'text.secondary' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function PbxSidebar({ open, onClose }: PbxSidebarProps) {
  return (
    <>
      {/* Desktop: permanent sidebar — width + flexShrink so it reserves space in flex layout */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
