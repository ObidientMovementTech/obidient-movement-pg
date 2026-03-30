import { Dialog, Box, Typography, IconButton, Chip } from '@mui/material';
import { X, Clock, Megaphone } from 'lucide-react';

const FONT = '"Poppins", sans-serif';

interface NotificationDetailModalProps {
  notification: {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    type: string;
  } | null;
  onClose: () => void;
  formatDate: (dateString: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
}

export default function NotificationDetailModal({
  notification,
  onClose,
  formatDate,
  getTypeIcon,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
          maxHeight: '85vh',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            bgcolor: notification.type === 'adminBroadcast' ? '#fff7ed' : 'rgba(0,104,55,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {getTypeIcon(notification.type)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#1a1c1c',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {notification.title}
          </Typography>
          {notification.type === 'adminBroadcast' && (
            <Chip
              icon={<Megaphone size={12} />}
              label="Official Announcement"
              size="small"
              sx={{
                mt: 0.75,
                fontFamily: FONT,
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 22,
                borderRadius: 1.5,
                bgcolor: '#fff7ed',
                color: '#c2410c',
                '& .MuiChip-icon': { color: '#c2410c' },
              }}
            />
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#6f7a70',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: 3,
          py: 3,
          overflowY: 'auto',
          flex: 1,
          bgcolor: '#fff',
        }}
      >
        {notification.type === 'adminBroadcast' && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              bgcolor: '#fff7ed',
              borderRadius: 2.5,
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Megaphone size={16} color="#c2410c" />
            <Typography
              sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}
            >
              This is an official platform announcement from the administration.
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: '0.92rem',
            color: '#1a1c1c',
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {notification.message}
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: '#f9f9f9',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Clock size={14} color="#6f7a70" />
          <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#6f7a70' }}>
            {formatDate(notification.createdAt)}
          </Typography>
        </Box>
        <Typography
          onClick={onClose}
          sx={{
            fontFamily: FONT,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#6f7a70',
            cursor: 'pointer',
            px: 2,
            py: 0.75,
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
          }}
        >
          Close
        </Typography>
      </Box>
    </Dialog>
  );
}
