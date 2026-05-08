import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Download,
  Smartphone,
  Shield,
  CheckCircle,
  Settings,
  FileDown,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';

interface AppInfo {
  version: string;
  fileSize: string;
  releaseNotes: string;
  releasedAt: string;
}

export default function AppDownloadPage() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get('/api/app-download/info')
      .then((res) => setAppInfo(res.data))
      .catch(() => setError('Failed to load app info'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/api/app-download/request-token');
      const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/app-download/file?token=${data.downloadToken}`;
      window.location.href = downloadUrl;
      setDownloaded(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const installSteps = [
    {
      label: 'Download the APK',
      description: 'Tap the download button above. The file will be saved to your Downloads folder.',
      icon: <FileDown size={20} />,
    },
    {
      label: 'Open the downloaded file',
      description: 'Go to your Downloads folder or tap the notification that says "Download complete" to open the APK file.',
      icon: <Smartphone size={20} />,
    },
    {
      label: 'Allow installation from this source',
      description: 'Your phone will show a warning about installing from unknown sources. Tap "Settings" → enable "Allow from this source" → go back.',
      icon: <Settings size={20} />,
    },
    {
      label: 'Install the app',
      description: 'Tap "Install" on the installation screen. Wait for it to complete, then tap "Open".',
      icon: <Shield size={20} />,
    },
    {
      label: 'Log in with your account',
      description: 'Use the same email/phone and password you use on this website. Your account is already set up!',
      icon: <CheckCircle size={20} />,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FONT, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box>
        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: { xs: '1.5rem', md: '2rem' },
            letterSpacing: '-0.02em',
            color: '#111827',
          }}
        >
          Get the Mobile App
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.95rem', color: 'text.secondary', mt: 1 }}>
          Download the Obidient Movement app for Android and stay connected on the go.
        </Typography>
      </Box>

      {/* App Info Card + Download */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Green header strip */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #008c4a 100%)`,
            px: { xs: 3, md: 4 },
            py: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 3,
          }}
        >
          {/* App icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={36} color="#fff" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
              Obidient Movement
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {appInfo?.version && (
                <Chip
                  size="small"
                  label={`v${appInfo.version}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: '0.7rem' }}
                />
              )}
              {appInfo?.fileSize && (
                <Chip
                  size="small"
                  label={appInfo.fileSize}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: '0.7rem' }}
                />
              )}
              <Chip
                size="small"
                label="Android"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={downloading || !appInfo?.fileSize}
            startIcon={downloading ? <CircularProgress size={18} sx={{ color: PRIMARY }} /> : <Download size={18} />}
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: '0.85rem',
              bgcolor: '#fff',
              color: PRIMARY,
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#f0fdf4', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.5)', color: 'rgba(0,0,0,0.3)' },
            }}
          >
            {downloading ? 'Preparing...' : 'Download APK'}
          </Button>
        </Box>

        {/* Release notes */}
        {appInfo?.releaseNotes && (
          <Box sx={{ px: { xs: 3, md: 4 }, py: 2.5, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              Release Notes
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.9rem', color: '#374151' }}>
              {appInfo.releaseNotes}
            </Typography>
          </Box>
        )}
      </Card>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 3, fontFamily: FONT }}>
          {error}
        </Alert>
      )}

      {downloaded && (
        <Alert severity="success" sx={{ borderRadius: 3, fontFamily: FONT }}>
          Download started! Follow the installation steps below to set up the app.
        </Alert>
      )}

      {/* Installation Guide */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border: '1px solid rgba(0,0,0,0.08)',
          p: { xs: 3, md: 4 },
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#111827',
            mb: 0.5,
          }}
        >
          How to Install
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6b7280', mb: 3 }}>
          Since this app isn't from the Play Store, you'll need to allow installation from your browser. It only takes a moment.
        </Typography>

        <Stepper orientation="vertical" activeStep={-1}>
          {installSteps.map((step, index) => (
            <Step key={index} active expanded>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: `${PRIMARY}14`,
                      color: PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6b7280', pb: 2 }}>
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Security Note */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border: '1px solid rgba(0,0,0,0.08)',
          p: { xs: 3, md: 4 },
          bgcolor: '#f0fdf4',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Shield size={24} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
              Safe & Secure
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#4b5563', mt: 0.5 }}>
              This APK is the official Obidient Movement app, built and signed by our team. 
              Your data is encrypted and protected with the same security as this website. 
              We're working on getting it on the Google Play Store soon.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
