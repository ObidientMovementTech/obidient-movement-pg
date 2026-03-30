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
} from '@mui/material';
import { Link2, Save, ExternalLink } from 'lucide-react';
import axios from 'axios';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#006837';
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const [mobilizationUrl, setMobilizationUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${API}/api/settings/mobilization_pack_url`, { withCredentials: true })
      .then((r) => setMobilizationUrl(r.data.value || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
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
    </Box>
  );
}
