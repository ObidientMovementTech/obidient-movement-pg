import { Box, TextField, IconButton, Typography } from '@mui/material';
import { Send } from 'lucide-react';
import { FONT, PRIMARY, SURFACE_LOW } from '../types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string | null;
}

export default function MessageInput({ value, onChange, onSend, disabled, placeholder, error }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2.5 },
        py: 1.5,
        borderTop: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        bgcolor: '#fff',
      }}
    >
      {error && (
        <Box
          sx={{
            px: 2,
            py: 0.75,
            mb: 1,
            bgcolor: '#ffdad6',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            component="span"
            sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#93000a' }}
          >
            {error}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
        <TextField
          multiline
          maxRows={4}
          fullWidth
          placeholder={placeholder || 'Type a message...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              fontFamily: FONT,
              fontSize: '0.9rem',
              bgcolor: SURFACE_LOW,
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
              '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
            },
          }}
        />
        <IconButton
          onClick={onSend}
          disabled={!value.trim() || disabled}
          sx={{
            background: `linear-gradient(145deg, ${PRIMARY} 0%, #006b3e 100%)`,
            color: '#fff',
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            boxShadow: '0 4px 16px rgba(0,104,55,0.3)',
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 6px 20px rgba(0,104,55,0.35)' },
            '&.Mui-disabled': { bgcolor: '#e8e8e8', color: '#bbb', background: '#e8e8e8', boxShadow: 'none' },
          }}
        >
          <Send size={18} />
        </IconButton>
      </Box>
    </Box>
  );
}
