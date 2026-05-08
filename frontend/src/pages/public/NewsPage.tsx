import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import { getPublishedPosts, type BlogPost, type BlogListResponse } from '../../services/blogService';
import rallyImg from '../../assets/images/po5.jpeg';

const formatDate = (iso: string, style: 'short' | 'long' = 'short') =>
  new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  });

/* ── Post card (grid) ─────────────────────────────────── */
const PostCard = ({ post }: { post: BlogPost }) => (
  <Link to={`/news/${post.slug}`} className="group block">
    <article className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:border-accent-green/30 transition-colors h-full flex flex-col">
      <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {post.featured_image_url ? (
          <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-green/10 to-accent-green/20">
            <svg className="w-10 h-10 text-accent-green/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <span className="text-xs uppercase tracking-wider font-medium text-accent-green">{post.category}</span>
        )}
        <h3 className="mt-2 text-base font-medium text-text-light dark:text-text-dark group-hover:text-accent-green transition-colors line-clamp-2">{post.title}</h3>
        {post.excerpt && <p className="mt-2 text-sm text-text-muted line-clamp-2">{post.excerpt}</p>}
        <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-text-muted">
          <span>Obidient Movement</span>
          {post.published_at && (
            <>
              <span>·</span>
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </>
          )}
        </div>
      </div>
    </article>
  </Link>
);

/* ── Secondary feature card (side cards) ──────────────── */
const SecondaryCard = ({ post }: { post: BlogPost }) => (
  <Link to={`/news/${post.slug}`} className="group flex gap-4 items-start">
    <div className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
      {post.featured_image_url ? (
        <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-accent-green/10 to-accent-green/20" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      {post.category && (
        <span className="text-xs uppercase tracking-wider font-medium text-accent-green">{post.category}</span>
      )}
      <h3 className="mt-1 text-sm font-medium text-text-light dark:text-text-dark group-hover:text-accent-green transition-colors line-clamp-2">{post.title}</h3>
      {post.published_at && (
        <time dateTime={post.published_at} className="mt-1 block text-xs text-text-muted">{formatDate(post.published_at)}</time>
      )}
    </div>
  </Link>
);

/* ── Skeleton loaders ─────────────────────────────────── */
const HeroSkeleton = () => (
  <div className="grid lg:grid-cols-5 gap-6">
    <div className="lg:col-span-3 rounded-2xl bg-gray-200 dark:bg-gray-800 aspect-[16/10] animate-pulse" />
    <div className="lg:col-span-2 space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-24 h-20 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);



const NewsPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const fetchPosts = async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data: BlogListResponse = await getPublishedPosts(pageNum, 18);
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setTotalPages(data.pages);
      setPage(pageNum);
      setError(null);
    } catch {
      setError('Unable to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Derive categories from posts
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => p.category && cats.add(p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [posts]);

  // Filter
  const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  const featured = filtered.length > 0 ? filtered[0] : null;
  const secondary = filtered.length > 1 ? filtered.slice(1, 4) : [];
  const gridPosts = filtered.length > 4 ? filtered.slice(4) : [];

  return (
    <>
      <SEOHead
        title="News & Updates — Obidient Movement"
        description="Stay informed with the latest news, updates, and stories from the Obidient Movement across Nigeria."
      />

      {/* ── 1. HERO BANNER ─────────────────────────────────── */}
      <section className="relative py-28 lg:py-36 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Movement Dispatch
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight">
            News & <span className="text-accent-green">Updates</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            Stories, updates, and dispatches from the movement shaping Nigeria's future.
          </p>
        </div>
      </section>

      {/* ── 2. CATEGORY FILTER ─────────────────────────────── */}
      {!loading && categories.length > 2 && (
        <section className="border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-accent-green text-white'
                      : 'text-text-muted hover:text-text-light dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. FEATURED + SECONDARY ────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <HeroSkeleton />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-text-muted">{error}</p>
              <button onClick={() => fetchPosts(1)} className="mt-4 text-sm text-accent-green font-medium hover:underline">
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
              <h2 className="text-xl font-medium text-text-light dark:text-text-dark">No posts yet</h2>
              <p className="mt-2 text-text-muted">Check back soon for updates.</p>
            </div>
          ) : (
            <>
              {/* Featured hero layout */}
              <div className="grid lg:grid-cols-5 gap-6 mb-16">
                {/* Main featured */}
                {featured && (
                  <Link to={`/news/${featured.slug}`} className="lg:col-span-3 group block">
                    <article className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[16/10]">
                      {featured.featured_image_url ? (
                        <img src={featured.featured_image_url} alt={featured.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/30 to-gray-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        {featured.category && (
                          <span className="inline-block px-3 py-1 rounded-full bg-accent-green/20 text-xs uppercase tracking-wider font-medium text-accent-green mb-3">{featured.category}</span>
                        )}
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white tracking-tight max-w-2xl">{featured.title}</h2>
                        {featured.excerpt && <p className="mt-3 text-sm text-gray-300 max-w-lg line-clamp-2">{featured.excerpt}</p>}
                        {featured.published_at && (
                          <time dateTime={featured.published_at} className="mt-4 block text-xs text-gray-400">{formatDate(featured.published_at, 'long')}</time>
                        )}
                      </div>
                    </article>
                  </Link>
                )}

                {/* Secondary cards */}
                {secondary.length > 0 && (
                  <div className="lg:col-span-2 flex flex-col justify-between gap-4">
                    {secondary.map((post) => (
                      <SecondaryCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Newsletter banner ──────────────────────────── */}
              <div className="relative mb-16 rounded-2xl overflow-hidden bg-gray-950 p-8 md:p-12">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-medium text-white">Stay in the loop</h3>
                    <p className="mt-1 text-sm text-gray-400">Follow us on X for the latest movement dispatches and updates.</p>
                  </div>
                  <a
                    href="https://x.com/ObidientUpdate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-accent-green text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    Follow @ObidientUpdate
                  </a>
                </div>
              </div>

              {/* ── Post Grid ──────────────────────────────────── */}
              {gridPosts.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">More Stories</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              )}

              {/* Load More */}
              {page < totalPages && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => fetchPosts(page + 1, true)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-white dark:bg-secondary-light border border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark px-6 py-3 rounded-lg text-sm font-medium hover:border-accent-green/30 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-green" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── 4. CTA ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-medium text-text-light dark:text-text-dark tracking-tight">Have a story to share?</h2>
          <p className="mt-3 text-base text-text-muted">We welcome contributions from members across the movement.</p>
          <div className="mt-6">
            <GradientCTA to="/contact" size="md">Contact Us</GradientCTA>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewsPage;
