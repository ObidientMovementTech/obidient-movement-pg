import { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import { X, MessageCircle, Phone as PhoneIcon, Shield } from 'lucide-react';
import type { ChatContact } from '../../../services/conversationService';
import { getOrCreateConversation } from '../../../services/conversationService';
import { useNavigate } from 'react-router';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  ward: { bg: '#f3e8ff', text: '#7e22ce' },
  lga: { bg: '#ffedd5', text: '#c2410c' },
  state: { bg: '#dbeafe', text: '#1e40af' },
  national: { bg: '#ffdada', text: '#7b2c33' },
};

interface Props {
  leader: ChatContact | null;
  onClose: () => void;
  richDesignation?: string;
}

export default function LeaderInfoModal({ leader, onClose, richDesignation }: Props) {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  if (!leader) return null;

  const levelStyle = LEVEL_COLORS[leader.level || ''] || { bg: '#f3f4f6', text: '#374151' };

  // Level-aware banner gradient
  const bannerGradients: Record<string, string> = {
    national: `linear-gradient(135deg, #991b1b 0%, ${PRIMARY} 100%)`,
    state: `linear-gradient(135deg, #1e40af 0%, ${PRIMARY} 100%)`,
    lga: `linear-gradient(135deg, #9a3412 0%, ${PRIMARY} 100%)`,
    ward: `linear-gradient(135deg, #5b21b6 0%, ${PRIMARY} 100%)`,
  };
  const bannerBg = bannerGradients[leader.level || ''] || `linear-gradient(135deg, ${PRIMARY} 0%, #006b3e 100%)`;

  async function handleSendMessage() {
    if (starting) return;
    setStarting(true);
    try {
      await getOrCreateConversation(leader!.id);
      onClose();
      navigate('/dashboard/chat');
    } catch {
      alert('Could not start conversation. Please try again.');
    } finally {
      setStarting(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: 'visible',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ position: 'relative', textAlign: 'center' }}>
        {/* Level-colored gradient banner */}
        <Box
          sx={{
            height: 96,
            background: bannerBg,
            borderRadius: '20px 20px 0 0',
          }}
        />

        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          <X size={16} />
        </IconButton>

        {/* Avatar overlapping banner */}
        <Avatar
          src={leader.profileImage || undefined}
          imgProps={{ referrerPolicy: 'no-referrer' }}
          sx={{
            width: 96,
            height: 96,
            bgcolor: PRIMARY,
            color: '#fff',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: '2.2rem',
            border: '4px solid #fff',
            mx: 'auto',
            mt: -6,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          {leader.name?.[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{ px: 3, pb: 3.5, pt: 1.5 }}>
          {/* Name */}
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#1a1c1c',
              letterSpacing: '-0.01em',
            }}
          >
            {leader.name}
          </Typography>

          {/* Designation with location */}
          <Chip
            icon={<Shield size={12} />}
            label={richDesignation || leader.designation}
            size="small"
            sx={{
              fontFamily: FONT,
              fontSize: '0.68rem',
              fontWeight: 700,
              height: 28,
              mt: 1,
              bgcolor: levelStyle.bg,
              color: levelStyle.text,
              borderRadius: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              border: '1px solid',
              borderColor: `${levelStyle.text}15`,
              '& .MuiChip-icon': { color: levelStyle.text, ml: 0.5 },
            }}
          />

          {/* Phone number */}
          {leader.phone && (
            <Box
              component="a"
              href={`tel:${leader.phone}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 2.5,
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                bgcolor: '#f9fafb',
                textDecoration: 'none',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <PhoneIcon size={15} color="#9ca3af" />
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                {leader.phone}
              </Typography>
            </Box>
          )}

          {/* Send Message button */}
          <Button
            onClick={handleSendMessage}
            disabled={starting}
            fullWidth
            startIcon={starting ? <CircularProgress size={16} color="inherit" /> : <MessageCircle size={16} />}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: '0.88rem',
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #006b3e 100%)`,
              color: '#fff',
              boxShadow: `0 4px 16px ${PRIMARY}33`,
              '&:hover': { transform: 'scale(0.98)' },
              '&:disabled': { opacity: 0.6, color: '#fff' },
              transition: 'all 0.15s',
            }}
          >
            {starting ? 'Opening chat...' : 'Send Message'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
