import { useState, useEffect } from 'react';

const portraits = [
  { src: '/landing/portraits/1.webp', alt: 'Nigerian elder in traditional attire' },
  { src: '/landing/portraits/2.webp', alt: 'Young Nigerian woman' },
  { src: '/landing/portraits/3.webp', alt: 'Nigerian professional' },
  { src: '/landing/portraits/4.webp', alt: 'Nigerian citizen' },
  { src: '/landing/portraits/5.webp', alt: 'Nigerian university student' },
  { src: '/landing/portraits/6.webp', alt: 'Nigerian market woman' },
  { src: '/landing/portraits/7.webp', alt: 'Nigerian fisherman' },
  { src: '/landing/portraits/8.webp', alt: 'Nigerian doctor' },
];

interface MissionFeature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const MissionSection = ({ missionFeatures }: { missionFeatures: MissionFeature[] }) => {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((current) => {
        setPrev(current);
        return (current + 1) % portraits.length;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left — Portrait Morph Slideshow */}
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
            {/* Previous portrait — stays fully visible underneath */}
            <img
              key={`prev-${prev}`}
              src={portraits[prev].src}
              alt={portraits[prev].alt}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Active portrait — fades in on top, creating the morph */}
            <img
              key={`active-${active}`}
              src={portraits[active].src}
              alt={portraits[active].alt}
              className="absolute inset-0 w-full h-full object-cover z-10 portrait-morph-in"
            />
            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-20 pointer-events-none" />

            {/* Slide indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
              {portraits.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPrev(active); setActive(i); }}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === active ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Portrait ${i + 1}`}
                />
              ))}
            </div>

            {/* Floating stat card */}
            <div className="absolute bottom-12 left-5 right-5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-lg z-30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-green/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-light dark:text-text-dark">25,000+ members</p>
                  <p className="text-xs text-text-muted">Verified and growing daily</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Our Mission
            </span>
            <h2 className="mt-5 text-3xl lg:text-5xl font-medium text-text-light dark:text-text-dark tracking-tight leading-[1.1]">
              Empowering every Nigerian for democratic participation
            </h2>
            <p className="mt-6 text-base lg:text-lg text-text-muted leading-relaxed">
              The Obidient Movement is building the largest verified civic membership platform in Nigeria. We mobilize, organize, and empower citizens through technology and collective action.
            </p>

            {/* Vertical accent line + features */}
            <div className="mt-10 border-l-2 border-accent-green/20 pl-6 space-y-8">
              {missionFeatures.map((feat) => (
                <div key={feat.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-text-light dark:text-text-dark">
                      {feat.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
