import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import { getPostBySlug, getPublishedPosts, type BlogPost } from '../../services/blogService';

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').slice(0, 160);
};

const NewsPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await getPostBySlug(slug);
      setPost(data.post);
      setNotFound(false);

      // Fetch related posts
      try {
        const relatedData = await getPublishedPosts(1, 4);
        setRelated(relatedData.posts.filter((p) => p.slug !== slug).slice(0, 3));
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green"></div>
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
    author: { '@type': 'Person', name: post.author_name },
    image: post.featured_image_url || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Obidient Movement',
      logo: { '@type': 'ImageObject', url: 'https://member.obidients.com/obidientLogoGreen.svg' },
    },
  };

  return (
    <>
      <SEOHead
        title={`${post.title} — Obidient Movement`}
        description={post.excerpt || stripHtml(post.content)}
        ogImage={post.featured_image_url || undefined}
        ogType="article"
        canonical={`https://member.obidients.com/news/${post.slug}`}
        article={{
          publishedTime: post.published_at || post.created_at,
          author: post.author_name,
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
            {post.author_name && (
              <>
                <span>·</span>
                <span>{post.author_name}</span>
              </>
            )}
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-text-light dark:text-text-dark mb-3">Share this article</p>
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <h2 className="text-xl font-medium text-text-light dark:text-text-dark mb-6">
              More articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
