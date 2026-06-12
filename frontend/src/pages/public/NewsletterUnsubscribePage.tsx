import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Box, Container, Typography, CircularProgress, Button } from '@mui/material';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function NewsletterUnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function unsubscribe() {
      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link — no token provided.');
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/api/newsletter/unsubscribe`, {
          params: { token },
        });
        setStatus('success');
        setMessage(res.data.message || 'You have been unsubscribed successfully.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Failed to process unsubscribe request.');
      }
    }
    unsubscribe();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Unsubscribe | Obidient Movement Newsletter</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">Processing your request...</Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'success.main' }}>
                <CheckCircle2 size={56} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Unsubscribed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You will no longer receive newsletter emails. You can still read newsletters anytime on our website.
              </Typography>
              <Button component={Link} to="/newsletter" variant="outlined" color="success">
                Browse Newsletters
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'error.main' }}>
                <XCircle size={56} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button component={Link} to="/newsletter" variant="outlined">
                Back to Newsletters
              </Button>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
