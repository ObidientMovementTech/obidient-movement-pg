import { Box, Typography, Avatar, Chip, Dialog, IconButton } from '@mui/material';
import { MapPin, X } from 'lucide-react';
import { FONT, PRIMARY, PRIMARY_LIGHT, SURFACE_LOW } from '../types';
import { richDesignation } from '../utils';
import type { ProfileInfo } from '../types';

interface Props {
  user: ProfileInfo | null;
  onClose: () => void;
}

export default function ProfileModal({ user, onClose }: Props) {
  if (!user) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'visible',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ position: 'relative', textAlign: 'center' }}>
        {/* Banner */}
        <Box
          sx={{
            height: 88,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #006b3e 100%)`,
            borderRadius: '16px 16px 0 0',
          }}
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
          size="small"
        >
          <X size={16} />
        </IconButton>

        {/* Avatar */}
        <Avatar
          src={user.image || undefined}
          sx={{
            width: 88,
            height: 88,
            bgcolor: '#fff',
            color: PRIMARY,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: '2rem',
            border: '4px solid #fff',
            mx: 'auto',
            mt: -5.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {user.name?.[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{ px: 3, pb: 3.5, pt: 1.5 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#1a1c1c',
              letterSpacing: '-0.01em',
            }}
          >
            {user.name}
          </Typography>
          {user.designation && (
            <Chip
              label={richDesignation(user)}
              size="small"
              sx={{
                fontFamily: FONT,
                fontSize: '0.7rem',
                fontWeight: 700,
                height: 24,
                mt: 0.75,
                bgcolor: PRIMARY_LIGHT,
                color: PRIMARY,
                borderRadius: 2,
              }}
            />
          )}

          {(user.voting_state || user.voting_lga || user.voting_ward) && (
            <Box
              sx={{
                mt: 2.5,
                textAlign: 'left',
                bgcolor: SURFACE_LOW,
                borderRadius: 3,
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <MapPin size={14} color={PRIMARY} />
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: PRIMARY,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Voting Location
                </Typography>
              </Box>
              {[
                ['State', user.voting_state],
                ['LGA', user.voting_lga],
                ['Ward', user.voting_ward],
                ['Polling Unit', user.voting_pu],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 0.6,
                      '&:not(:last-child)': { borderBottom: '1px solid rgba(0,0,0,0.04)' },
                    }}
                  >
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#6f7a70' }}>
                      {label}
                    </Typography>
                    <Typography
                      sx={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600, color: '#1a1c1c' }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
