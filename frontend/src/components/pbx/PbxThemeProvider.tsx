import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactNode } from 'react';

const pbxTheme = createTheme({
  palette: {
    primary: {
      main: '#0B6739',
      light: '#e8f5e9',
      dark: '#084a29',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D21C5B',
      light: '#fce4ec',
      dark: '#9c1443',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#64748b',
    },
    divider: 'rgba(0,0,0,0.06)',
  },
  typography: {
    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 500, letterSpacing: '-0.02em' },
    h5: { fontWeight: 500, letterSpacing: '-0.01em' },
    h6: { fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    body2: { color: '#64748b' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(11,103,57,0.25)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(11,103,57,0.08)',
            '&:hover': { backgroundColor: 'rgba(11,103,57,0.12)' },
          },
        },
      },
    },
  },
});

export default function PbxThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={pbxTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
