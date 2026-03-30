import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Slide } from '@mui/material';
import { Download, X } from 'lucide-react';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';
const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if user recently dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't flash on page load
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <Slide direction="up" in={showBanner} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 24 },
          left: { xs: 12, md: 'auto' },
          right: { xs: 12, md: 24 },
          maxWidth: 400,
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          border: '1px solid rgba(0,104,55,0.12)',
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          zIndex: 1300,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: 'rgba(0,104,55,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src="/obi-icon.svg"
            alt="Obidient"
            sx={{ width: 32, height: 32 }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: '0.92rem',
              color: '#1a1c1c',
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            Install Obidient App
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: '0.78rem',
              color: '#6f7a70',
              lineHeight: 1.5,
              mb: 1.5,
            }}
          >
            Add to your home screen for quick access, offline support, and a native app experience.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleInstall}
              startIcon={<Download size={16} />}
              sx={{
                fontFamily: FONT,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.75,
                color: '#fff',
                bgcolor: PRIMARY,
                '&:hover': { bgcolor: '#005530' },
              }}
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              sx={{
                fontFamily: FONT,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.75,
                color: '#6f7a70',
                bgcolor: '#f3f3f4',
                '&:hover': { bgcolor: '#e8e8e8' },
              }}
            >
              Not now
            </Button>
          </Box>
        </Box>

        {/* Close button */}
        <IconButton
          onClick={handleDismiss}
          size="small"
          sx={{ color: '#bec9be', mt: -0.5, mr: -0.5 }}
        >
          <X size={16} />
        </IconButton>
      </Box>
    </Slide>
  );
}
