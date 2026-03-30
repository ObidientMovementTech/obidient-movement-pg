import { Box, Typography } from '@mui/material';
import { FONT, PRIMARY, PRIMARY_LIGHT, SURFACE_LOW } from '../types';

interface Props {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  infoCards?: { icon: React.ReactNode; title: string; description: string }[];
}

export default function ChatEmptyState({ icon, title, subtitle, action, infoCards }: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 4,
        py: 8,
        textAlign: 'center',
      }}
    >
      {/* Glow icon */}
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3.5 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: -16,
            bgcolor: PRIMARY_LIGHT,
            borderRadius: '50%',
            filter: 'blur(24px)',
            transform: 'scale(1.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,104,55,0.08)',
            color: PRIMARY,
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography
        sx={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          color: '#1a1c1c',
          mb: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: '0.88rem',
            color: '#6f7a70',
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </Typography>
      )}

      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}

      {infoCards && infoCards.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
            mt: 5,
            maxWidth: 420,
            width: '100%',
          }}
        >
          {infoCards.map((card, i) => (
            <Box
              key={i}
              sx={{ p: 2.5, borderRadius: 3, bgcolor: SURFACE_LOW, textAlign: 'left' }}
            >
              <Box sx={{ color: PRIMARY, mb: 1.5 }}>{card.icon}</Box>
              <Typography
                sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: '#1a1c1c', mb: 0.5 }}
              >
                {card.title}
              </Typography>
              <Typography
                sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6f7a70', lineHeight: 1.5 }}
              >
                {card.description}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
