import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getPublishedPosts, type BlogPost } from '../../services/blogService';

const LatestNews = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedPosts(1, 3)
      .then((res) => setPosts(res.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#D42B27]">
              <span className="w-8 h-px bg-[#D42B27]" />
              Latest Updates
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              From the movement
            </h2>
          </div>
          <Link
            to="/news"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-[#D42B27] transition-colors group"
          >
            View all
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="mt-3 h-6 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/news/${post.slug}`}
                className="group"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="mt-4">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="uppercase tracking-wider font-medium text-[#D42B27]">
                      {post.category || 'News'}
                    </span>
                    {post.published_at && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <time>
                          {new Date(post.published_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-text-light dark:text-text-dark group-hover:text-[#D42B27] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-text-muted line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile "View All" link */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#D42B27]"
          >
            View all news
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
