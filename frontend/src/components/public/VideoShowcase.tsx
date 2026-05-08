import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_VIDEO_ID = 'k75SwmK_w80';

/** Extract a YouTube video ID from various URL formats */
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch {
    // If it's already just a video ID (no protocol), return as-is
    if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  }
  return null;
}

const VideoShowcase = () => {
  const [videoId, setVideoId] = useState(FALLBACK_VIDEO_ID);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/settings/landing_video_url`)
      .then((r) => {
        const id = extractVideoId(r.data.value || '');
        if (id) setVideoId(id);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            See The Movement
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
            This is what a <span className="uppercase">New Nigeria</span> looks like in motion
          </h2>
        </div>

        {/* Video frame with gradient glow border */}
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-2xl p-[2px]"
            style={{ background: 'linear-gradient(135deg, #169043, #D42B27)' }}
          >
            <div className="rounded-[14px] overflow-hidden bg-gray-950">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="The Obidient Movement"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Subtle caption */}
          <p className="mt-6 text-center text-sm text-text-muted">
            Don't just read about it — see what the movement is building across Nigeria.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
