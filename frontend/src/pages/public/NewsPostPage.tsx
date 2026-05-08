import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import DOMPurify from 'dompurify';
import SEOHead from '../../components/public/SEOHead';
import { getPostBySlug, getPublishedPosts, type BlogPost } from '../../services/blogService';

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').slice(0, 160);
};

const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return progress;
};

const NewsPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const progress = useReadingProgress();

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await getPostBySlug(slug);
      setPost(data.post);
      setNotFound(false);

      // Fetch related posts
      try {
        const relatedData = await getPublishedPosts(1, 6);
        setRelated(relatedData.posts.filter((p) => p.slug !== slug).slice(0, 4));
      } catch {
        // Related posts are non-critical
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [fetchPost]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    if (!post) return;
    const text = encodeURIComponent(post.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    if (!post) return;
    const text = encodeURIComponent(`${post.title} — ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full mx-auto px-4 space-y-6 py-16">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-medium text-text-light dark:text-text-dark">Post not found</h1>
        <p className="mt-2 text-text-muted">The article you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/news"
          className="mt-6 text-sm font-medium text-accent-green hover:underline"
        >
          ← Back to News
        </Link>
      </div>
    );
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: 'Obidient Movement' },
    image: post.featured_image_url || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Obidient Movement',
      logo: { '@type': 'ImageObject', url: `${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/obidientLogoGreen.svg` },
    },
  };

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div className="h-full bg-accent-green transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <SEOHead
        title={`${post.title} — Obidient Movement`}
        description={post.excerpt || stripHtml(post.content)}
        ogImage={post.featured_image_url || undefined}
        ogType="article"
        canonical={`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/news/${post.slug}`}
        article={{
          publishedTime: post.published_at || post.created_at,
          author: 'Obidient Movement',
          category: post.category,
          tags: post.tags || [],
        }}
        jsonLd={articleJsonLd}
      />

      <article className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            to="/news"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-green transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to News
          </Link>

          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {post.category && (
              <span className="text-xs uppercase tracking-wider font-medium text-accent-green bg-accent-green/10 px-2.5 py-1 rounded">
                {post.category}
              </span>
            )}
            {post.published_at && (
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <span>·</span>
            <span>Obidient Movement</span>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mt-8 rounded-xl overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div
            className="mt-8 prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-medium prose-headings:tracking-tight
              prose-a:text-accent-green prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl
              prose-blockquote:border-l-accent-green prose-blockquote:text-text-muted
              text-text-light dark:text-text-dark leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Share Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-text-light dark:text-text-dark mb-3">Share this article</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 text-sm text-text-muted border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:border-accent-green/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.879" />
                </svg>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button
                onClick={handleShareTwitter}
                className="inline-flex items-center gap-2 text-sm text-text-muted border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:border-accent-green/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 text-sm text-text-muted border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:border-accent-green/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
              <button
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-2 text-sm text-text-muted border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:border-accent-green/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Author Card */}
          <div className="mt-8 bg-gray-50 dark:bg-secondary-light/50 rounded-xl p-6 flex items-center gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-accent-green/10 flex items-center justify-center">
              <img src="/obidientLogoGreen.svg" alt="Obidient Movement" className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-light dark:text-text-dark">Obidient Movement</p>
              <p className="text-sm text-text-muted">Official news and updates from the Obidient Movement across Nigeria.</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">More Articles</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/news/${p.slug}`} className="group block">
                  <div className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:border-accent-green/30 transition-colors">
                    <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {p.featured_image_url ? (
                        <img
                          src={p.featured_image_url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-green/10 to-accent-green/20" />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-medium text-text-light dark:text-text-dark group-hover:text-accent-green transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      {p.published_at && (
                        <time
                          dateTime={p.published_at}
                          className="mt-2 block text-xs text-text-muted"
                        >
                          {new Date(p.published_at).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default NewsPostPage;
