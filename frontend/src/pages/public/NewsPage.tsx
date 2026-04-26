import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import { getPublishedPosts, type BlogPost, type BlogListResponse } from '../../services/blogService';

const PostCard = ({ post }: { post: BlogPost }) => (
  <Link to={`/news/${post.slug}`} className="group block">
    <article className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:border-accent-green/30 transition-colors">
      {/* Featured Image */}
      <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-green/10 to-accent-green/20">
            <svg className="w-10 h-10 text-accent-green/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-5">
        {post.category && (
          <span className="text-xs uppercase tracking-wider font-medium text-accent-green">
            {post.category}
          </span>
        )}
        <h3 className="mt-2 text-base font-medium text-text-light dark:text-text-dark group-hover:text-accent-green transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-text-muted line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
          <span>Obidient Movement</span>
          {post.published_at && (
            <>
              <span>·</span>
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </>
          )}
        </div>
      </div>
    </article>
  </Link>
);

const NewsPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data: BlogListResponse = await getPublishedPosts(pageNum, 12);
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

  const featured = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <>
      <SEOHead
        title="News & Updates — Obidient Movement"
        description="Stay informed with the latest news, updates, and stories from the Obidient Movement across Nigeria."
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
              News & Updates
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-medium tracking-tight text-text-light dark:text-text-dark">
              Latest from the movement
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-text-muted">{error}</p>
              <button
                onClick={() => fetchPosts(1)}
                className="mt-4 text-sm text-accent-green font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
              <h2 className="text-xl font-medium text-text-light dark:text-text-dark">No posts yet</h2>
              <p className="mt-2 text-text-muted">Check back soon for updates.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <Link to={`/news/${featured.slug}`} className="group block mb-12">
                  <article className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[21/9] md:aspect-[21/8]">
                    {featured.featured_image_url ? (
                      <img
                        src={featured.featured_image_url}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-green/30 to-gray-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      {featured.category && (
                        <span className="text-xs uppercase tracking-wider font-medium text-accent-green">
                          {featured.category}
                        </span>
                      )}
                      <h2 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-medium text-white tracking-tight max-w-3xl">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mt-3 text-sm text-gray-300 max-w-xl line-clamp-2">
                          {featured.excerpt}
                        </p>
                      )}
                      {featured.published_at && (
                        <time
                          dateTime={featured.published_at}
                          className="mt-4 block text-xs text-gray-400"
                        >
                          {new Date(featured.published_at).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      )}
                    </div>
                  </article>
                </Link>
              )}

              {/* Post Grid */}
              {gridPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-green"></div>
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
    </>
  );
};

export default NewsPage;
