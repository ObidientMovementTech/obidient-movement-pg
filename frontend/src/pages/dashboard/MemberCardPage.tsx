import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Download, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import html2canvas from 'html2canvas';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';
const ACCENT = '#8cc63f';

export default function MemberCardPage() {
  const { profile } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);

  const isVerified = profile?.kycStatus === 'approved';

  // Proxy S3 images to avoid CORS issues with html2canvas
  const getProxiedImage = (url: string | undefined) => {
    if (!url) return '';
    if (url.includes('amazonaws.com')) {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      return `${apiUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const [imgSrc, setImgSrc] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (profile?.profileImage) {
      setImgSrc(getProxiedImage(profile.profileImage));
      setImgLoaded(false);
    }
  }, [profile?.profileImage]);

  const handleDownload = async () => {
    if (!cardRef.current || !isVerified) return;
    try {
      // Ensure all images inside the card have crossOrigin set
      const images = cardRef.current.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.crossOrigin) img.crossOrigin = 'anonymous';
      });

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
      });
      const link = document.createElement('a');
      link.download = `obidient-card-${profile?.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Could not generate card image. Please try again.');
    }
  };

  if (!profile) return null;

  const registeredDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 5 }, fontFamily: FONT }}>
      <Box>
        <Typography variant="h5" fontWeight={600} sx={{ fontFamily: FONT, letterSpacing: '-0.02em' }}>
          Membership Card
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: FONT }}>
          Your official Obidient Movement membership card
        </Typography>
      </Box>

      {/* ─── Card Preview ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Box
            ref={cardRef}
            sx={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #004d2a 60%, ${ACCENT} 100%)`,
              borderRadius: 4,
              p: { xs: 3.5, sm: 4.5 },
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              aspectRatio: '1.6 / 1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 24px 64px rgba(0,104,55,0.25)',
            }}
          >
            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.06)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 160,
                height: 160,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.04)',
              }}
            />

            {/* UNVERIFIED Watermark */}
            {!isVerified && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <Box
                  sx={{
                    transform: 'rotate(-25deg)',
                    border: '3px solid rgba(255,80,80,0.6)',
                    px: 4,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ color: 'rgba(255,80,80,0.6)', letterSpacing: 4 }}
                  >
                    UNVERIFIED
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Top row: Logo + Validity */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <Box>
                <img
                  src="/obidientLogo.svg"
                  alt="Obidient"
                  style={{ height: 28, opacity: 0.9 }}
                  crossOrigin="anonymous"
                />
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, mt: 0.5, fontFamily: FONT, letterSpacing: 2 }}>
                  MEMBERSHIP CARD
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  Member Since
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {registeredDate}
                </Typography>
              </Box>
            </Box>

            {/* Middle: Photo + Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  width: { xs: 60, sm: 72 },
                  height: { xs: 72, sm: 86 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={profile.name}
                    crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: imgLoaded ? 'block' : 'none' }}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => { setImgSrc(''); setImgLoaded(false); }}
                  />
                ) : null}
                {(!imgSrc || !imgLoaded) && (
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: 20, sm: 28 } }}>
                    {profile.name?.[0]}
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={600} noWrap sx={{ fontFamily: FONT }}>
                  {profile.name}
                </Typography>
                {profile.votingPU && (
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }} noWrap>
                    {profile.votingPU}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ opacity: 0.5 }} noWrap>
                  {[profile.votingWard, profile.votingLGA].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            </Box>

            {/* Bottom: ID + State */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  Member ID
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontFamily: 'monospace', letterSpacing: 2 }}
                >
                  {profile._id?.slice(-8).toUpperCase() || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  State
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.votingState || profile.personalInfo?.state_of_origin || '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ─── Card Status ─── */}
          <Card
            elevation={0}
            sx={{
              mt: 4,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: isVerified ? 'success.light' : 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isVerified ? (
                <ShieldCheck size={20} color={PRIMARY} />
              ) : (
                <Clock size={20} color="#D97706" />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: FONT }}>
                {isVerified ? 'Card Active' : 'Pending Verification'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>
                {isVerified
                  ? 'Your identity is verified. Card is ready to download.'
                  : 'Complete KYC verification to activate your card.'}
              </Typography>
            </Box>
            <Chip
              label={profile.kycStatus}
              size="small"
              color={isVerified ? 'success' : 'warning'}
              sx={{ textTransform: 'capitalize' }}
            />
          </Card>

          {/* KYC warning */}
          {!isVerified && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 3 }}>
              <AlertTitle>KYC Not Complete</AlertTitle>
              Your card shows an "UNVERIFIED" watermark. Complete identity verification to
              remove it and enable downloads.
              <Button
                component={Link}
                to="/dashboard/profile"
                size="small"
                color="inherit"
                sx={{ mt: 1, textTransform: 'none', display: 'block' }}
              >
                Complete Verification →
              </Button>
            </Alert>
          )}

          {/* Download button */}
          <Button
            fullWidth
            variant="contained"
            disabled={!isVerified}
            onClick={handleDownload}
            startIcon={<Download size={18} />}
            sx={{
              mt: 3,
              borderRadius: 3,
              textTransform: 'none',
              fontFamily: FONT,
              fontWeight: 600,
              py: 1.5,
              bgcolor: PRIMARY,
              '&:hover': { bgcolor: '#005030' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            {isVerified ? 'Download Card' : 'Verify Identity to Download'}
          </Button>

          {!isVerified && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, justifyContent: 'center' }}>
              <AlertTriangle size={14} color="#D97706" />
              <Typography variant="caption" color="text.secondary">
                Download is disabled until KYC is approved
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
