import { useState } from 'react';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import rallyImg from '../../assets/images/po5.jpeg';

const categories = ['All', 'Rallies', 'Leadership', 'Community', 'Vision'] as const;
type Category = (typeof categories)[number];

interface GalleryItem {
  src: string;
  alt: string;
  category: Exclude<Category, 'All'>;
  span?: 'tall' | 'wide' | 'large';
}

const galleryItems: GalleryItem[] = [
  { src: '/landing/portraits/1.webp', alt: 'Movement supporter at rally', category: 'Rallies', span: 'tall' },
  { src: '/landing/portraits/2.webp', alt: 'Community member', category: 'Community' },
  { src: '/landing/portraits/3.webp', alt: 'Youth engagement', category: 'Community' },
  { src: '/landing/futuristic/education.png', alt: 'Vision for education', category: 'Vision', span: 'wide' },
  { src: '/landing/portraits/4.webp', alt: 'Rally attendee', category: 'Rallies' },
  { src: '/landing/portraits/5.webp', alt: 'Volunteer', category: 'Community', span: 'tall' },
  { src: '/landing/futuristic/technology.png', alt: 'Vision for technology', category: 'Vision' },
  { src: '/landing/futuristic/healthcare.png', alt: 'Vision for healthcare', category: 'Vision' },
  { src: '/landing/portraits/6.webp', alt: 'Community leader', category: 'Leadership' },
  { src: '/landing/futuristic/security.png', alt: 'Vision for security', category: 'Vision', span: 'wide' },
  { src: '/landing/portraits/7.webp', alt: 'Movement supporter', category: 'Rallies' },
  { src: '/landing/portraits/8.webp', alt: 'Grassroots coordinator', category: 'Leadership', span: 'tall' },
  { src: '/landing/futuristic/agriculture.png', alt: 'Vision for agriculture', category: 'Vision' },
  { src: '/landing/futuristic/power.png', alt: 'Vision for power and energy', category: 'Vision' },
  { src: '/landing/futuristic/transport.png', alt: 'Vision for transport', category: 'Vision', span: 'wide' },
  { src: '/landing/futuristic/lots-more.png', alt: 'Building a new Nigeria', category: 'Vision' },
];

const GalleryPage = () => {
  const [active, setActive] = useState<Category>('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = active === 'All' ? galleryItems : galleryItems.filter((g) => g.category === active);

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const goPrev = () => setLightbox((prev) => (prev !== null && prev > 0 ? prev - 1 : filtered.length - 1));
  const goNext = () => setLightbox((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : 0));

  return (
    <>
      <SEOHead
        title="Gallery — Obidient Movement"
        description="Photos and visuals from the Obidient Movement — rallies, community events, leadership, and our vision for Nigeria."
      />

      {/* ── 1. HERO ────────────────────────────────────────── */}
      <section className="relative py-28 lg:py-36 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Gallery
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight">
            The Movement <span className="text-accent-green">in Pictures</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            Moments captured from rallies, community outreach, and our shared vision for a new Nigeria.
          </p>
        </div>
      </section>

      {/* ── 2. FILTER TABS ─────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active === cat
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

      {/* ── 3. MASONRY GRID ────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <button
                key={`${active}-${i}`}
                onClick={() => openLightbox(i)}
                className="block w-full break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs uppercase tracking-wider font-medium text-accent-green">{item.category}</span>
                  <p className="text-sm text-white mt-1">{item.alt}</p>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted">No photos in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ───────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-gray-950/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 text-white/70 hover:text-white p-2"
            aria-label="Previous"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <img
            src={filtered[lightbox].src}
            alt={filtered[lightbox].alt}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 text-white/70 hover:text-white p-2"
            aria-label="Next"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-sm text-white/70">{filtered[lightbox].alt}</p>
            <p className="text-xs text-white/40 mt-1">{lightbox + 1} / {filtered.length}</p>
          </div>
        </div>
      )}

      {/* ── 4. SUBMIT CTA ──────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 via-gray-950/80 to-gray-950" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight">Have photos to share?</h2>
          <p className="mt-4 text-base text-gray-300 max-w-lg mx-auto">
            Captured moments from a rally, town hall, or community event? Send them to us and let the movement tell its own story.
          </p>
          <div className="mt-8">
            <GradientCTA to="/contact" size="lg">Submit Your Photos</GradientCTA>
          </div>
        </div>
      </section>
    </>
  );
};

export default GalleryPage;
