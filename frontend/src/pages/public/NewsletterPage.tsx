import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Box, Typography, Container, Card, CardContent, CardMedia, Skeleton, Pagination } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { getSentNewsletters, getNewsletterBySlug, type Newsletter } from '../../services/newsletterService';

// Newsletter archive list
export default function NewsletterPage() {
  const { slug } = useParams<{ slug?: string }>();

  if (slug) {
    return <NewsletterDetail slug={slug} />;
  }
  return <NewsletterArchive />;
}

function NewsletterArchive() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSentNewsletters(page, 12);
        setNewsletters(data.newsletters || []);
        setTotalPages(data.pages || 1);
      } catch (err) {
        console.error('Error loading newsletters:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <>
      <Helmet>
        <title>Newsletter | Obidient Movement</title>
        <meta name="description" content="Stay updated with the latest newsletters from Obidient Movement." />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Masthead */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'success.main', letterSpacing: 2, fontWeight: 700 }}>
            Newsletter
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Obidient Movement Newsletter
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            Regular updates on our mission, progress, and what you can do to make a difference.
          </Typography>
        </Box>

        {/* Newsletter list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="30%" />
                </CardContent>
              </Card>
            ))
          ) : newsletters.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">No newsletters yet.</Typography>
              <Typography variant="body2" color="text.secondary">Check back soon for updates.</Typography>
            </Box>
          ) : (
            newsletters.map((nl) => (
              <Card
                key={nl.id}
                variant="outlined"
                component={Link}
                to={`/newsletter/${nl.slug}`}
                sx={{
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'success.main', boxShadow: 2 },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  {nl.featured_image_url && (
                    <CardMedia
                      component="img"
                      image={nl.featured_image_url}
                      alt={nl.title}
                      sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 160, sm: 'auto' }, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {nl.sent_at ? new Date(nl.sent_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                      {nl.title}
                    </Typography>
                    {nl.preview_text && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {nl.preview_text}
                      </Typography>
                    )}
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                      Read more →
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            ))
          )}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Container>
    </>
  );
}

function NewsletterDetail({ slug }: { slug: string }) {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getNewsletterBySlug(slug);
        setNewsletter(data.newsletter);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
        console.error('Error loading newsletter:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (notFound || !newsletter) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Newsletter not found</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This newsletter may not exist or hasn't been published yet.
        </Typography>
        <Link to="/newsletter" style={{ color: '#0B6739', fontWeight: 500 }}>← Back to all newsletters</Link>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{newsletter.title} | Obidient Movement Newsletter</title>
        <meta name="description" content={newsletter.preview_text || newsletter.title} />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Back link */}
        <Link to="/newsletter" style={{ color: '#0B6739', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
          ← All Newsletters
        </Link>

        {/* Header */}
        <Box sx={{ mt: 3, mb: 4 }}>
          <Typography variant="caption" color="text.secondary">
            {newsletter.sent_at
              ? new Date(newsletter.sent_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : ''}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, mb: 1, lineHeight: 1.2 }}>
            {newsletter.title}
          </Typography>
          {newsletter.author_name && (
            <Typography variant="body2" color="text.secondary">
              By {newsletter.author_name}
            </Typography>
          )}
        </Box>

        {/* Featured image */}
        {newsletter.featured_image_url && (
          <Box
            component="img"
            src={newsletter.featured_image_url}
            alt={newsletter.title}
            sx={{ width: '100%', borderRadius: 2, mb: 4, maxHeight: 400, objectFit: 'cover' }}
          />
        )}

        {/* Content */}
        <Box
          sx={{
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'text.primary',
            '& img': { maxWidth: '100%', borderRadius: 2, my: 2 },
            '& h1, & h2, & h3': { mt: 3, mb: 1 },
            '& p': { mb: 2 },
            '& a': { color: 'success.main' },
          }}
          dangerouslySetInnerHTML={{ __html: newsletter.content }}
        />
      </Container>
    </>
  );
}
