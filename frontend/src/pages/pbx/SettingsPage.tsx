import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Link2, Save, ExternalLink, Users, Vote, Heart, MessageSquare } from 'lucide-react';
import axios from 'axios';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CTA_FIELDS = [
  {
    key: 'cta_volunteer_url',
    label: 'Volunteer Link',
    description: 'Link for the "Join a Directorate" button on the dashboard.',
    icon: Users,
    color: '#16a34a',
  },
  {
    key: 'cta_run_for_office_url',
    label: 'Run for Office Link',
    description: 'Link for the "Run for Public Office" button on the dashboard.',
    icon: Vote,
    color: '#2563eb',
  },
  {
    key: 'cta_donate_url',
    label: 'Donate Link',
    description: 'Link for the "Donate" button on the dashboard.',
    icon: Heart,
    color: '#9333ea',
  },
  {
    key: 'cta_feedback_url',
    label: 'Feedback Link',
    description: 'Link for the "Drop Feedback" button on the dashboard.',
    icon: MessageSquare,
    color: '#ca8a04',
  },
] as const;

export default function SettingsPage() {
  const [mobilizationUrl, setMobilizationUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // CTA state
  const [ctaValues, setCtaValues] = useState<Record<string, string>>({
    cta_volunteer_url: '',
    cta_run_for_office_url: '',
    cta_donate_url: '',
    cta_feedback_url: '',
  });
  const [ctaLoading, setCtaLoading] = useState(true);
  const [ctaSaving, setCtaSaving] = useState(false);
  const [ctaSaved, setCtaSaved] = useState(false);
  const [ctaError, setCtaError] = useState('');

  useEffect(() => {
    // Fetch mobilization URL
    axios
      .get(`${API}/api/settings/mobilization_pack_url`, { withCredentials: true })
      .then((r) => setMobilizationUrl(r.data.value || ''))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch all CTA URLs in parallel
    Promise.all(
      CTA_FIELDS.map((f) =>
        axios
          .get(`${API}/api/settings/${f.key}`, { withCredentials: true })
          .then((r) => ({ key: f.key, value: r.data.value || '' }))
          .catch(() => ({ key: f.key, value: '' }))
      )
    ).then((results) => {
      const values: Record<string, string> = {};
      results.forEach((r) => (values[r.key] = r.value));
      setCtaValues(values);
      setCtaLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await axios.put(
        `${API}/api/settings/mobilization_pack_url`,
        { value: mobilizationUrl.trim() },
        { withCredentials: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCtaSave = async () => {
    setCtaSaving(true);
    setCtaError('');
    setCtaSaved(false);
    try {
      await Promise.all(
        CTA_FIELDS.map((f) =>
          axios.put(
            `${API}/api/settings/${f.key}`,
            { value: (ctaValues[f.key] || '').trim() },
            { withCredentials: true }
          )
        )
      );
      setCtaSaved(true);
      setTimeout(() => setCtaSaved(false), 3000);
    } catch (err: any) {
      setCtaError(err.response?.data?.message || 'Failed to save CTA links');
    } finally {
      setCtaSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.5rem', mb: 3 }}>
        Settings
      </Typography>

      {/* ─── Mobilization Pack ─── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Link2 size={18} color={PRIMARY} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem' }}>
            Mobilization Pack
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#666', mb: 2.5 }}>
          Set the URL for the Mobilization Pack banner shown on every member's dashboard.
          This can be a Google Drive link, Dropbox folder, or any external URL.
        </Typography>

        {loading ? (
          <CircularProgress size={24} sx={{ color: PRIMARY }} />
        ) : (
          <>
            <TextField
              fullWidth
              placeholder="https://drive.google.com/drive/folders/..."
              value={mobilizationUrl}
              onChange={(e) => setMobilizationUrl(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Link2 size={16} color="#999" />
                  </InputAdornment>
                ),
                sx: { fontFamily: FONT, fontSize: '0.9rem', borderRadius: 2 },
              }}
              sx={{ mb: 2 }}
            />

            {mobilizationUrl.trim() && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  component="a"
                  href={mobilizationUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: PRIMARY,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <ExternalLink size={12} />
                  Preview link
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: FONT }}>
                {error}
              </Alert>
            )}
            {saved && (
              <Alert severity="success" sx={{ mb: 2, fontFamily: FONT }}>
                Mobilization Pack URL saved successfully!
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: PRIMARY,
                '&:hover': { bgcolor: '#005530' },
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </Card>

      {/* ─── Call-to-Action Links ─── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
          mt: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Link2 size={18} color={PRIMARY} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem' }}>
            Call-to-Action Links
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#666', mb: 2.5 }}>
          Configure the action buttons shown on every member's dashboard. Leave a field empty
          to hide that button.
        </Typography>

        {ctaLoading ? (
          <CircularProgress size={24} sx={{ color: PRIMARY }} />
        ) : (
          <>
            {CTA_FIELDS.map((field, idx) => {
              const Icon = field.icon;
              return (
                <Box key={field.key}>
                  {idx > 0 && <Divider sx={{ my: 2 }} />}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Icon size={16} color={field.color} />
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem' }}>
                      {field.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: '#888', mb: 1 }}>
                    {field.description}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="https://..."
                    value={ctaValues[field.key] || ''}
                    onChange={(e) =>
                      setCtaValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Link2 size={14} color="#999" />
                        </InputAdornment>
                      ),
                      sx: { fontFamily: FONT, fontSize: '0.85rem', borderRadius: 2 },
                    }}
                  />
                  {(ctaValues[field.key] || '').trim() && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        component="a"
                        href={(ctaValues[field.key] || '').trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          fontFamily: FONT,
                          fontSize: '0.75rem',
                          color: PRIMARY,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <ExternalLink size={10} />
                        Preview link
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}

            {ctaError && (
              <Alert severity="error" sx={{ mt: 2, fontFamily: FONT }}>
                {ctaError}
              </Alert>
            )}
            {ctaSaved && (
              <Alert severity="success" sx={{ mt: 2, fontFamily: FONT }}>
                CTA links saved successfully!
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleCtaSave}
              disabled={ctaSaving}
              startIcon={
                ctaSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />
              }
              sx={{
                mt: 2,
                fontFamily: FONT,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: PRIMARY,
                '&:hover': { bgcolor: '#005530' },
              }}
            >
              {ctaSaving ? 'Saving...' : 'Save CTA Links'}
            </Button>
          </>
        )}
      </Card>
    </Box>
  );
}
