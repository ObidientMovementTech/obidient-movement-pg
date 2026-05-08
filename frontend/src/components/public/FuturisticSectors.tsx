import { useState, useEffect, useCallback } from 'react';

const sectors = [
  {
    id: 'power',
    name: 'Power & Energy',
    desc: '24/7 electricity for 200 million Nigerians — solar, wind, and smart grids powering every home.',
    gradient: 'from-amber-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/power.png',
  },
  {
    id: 'education',
    name: 'Education',
    desc: 'World-class schools in every LGA — where every child has access to technology and quality teachers.',
    gradient: 'from-emerald-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/education.png',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    desc: 'Modern hospitals within 30 minutes of every Nigerian — equipped, staffed, and accessible to all.',
    gradient: 'from-sky-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/healthcare.png',
  },
  {
    id: 'transport',
    name: 'Transport',
    desc: 'Connected cities and towns — rail, roads, and transit systems that move 200 million people efficiently.',
    gradient: 'from-violet-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/transport.png',
  },
  {
    id: 'security',
    name: 'Security',
    desc: 'Safe streets, smart policing, and community trust — a Nigeria where every citizen feels protected.',
    gradient: 'from-rose-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/security.png',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    desc: 'From subsistence to surplus — technology-driven agriculture feeding the nation and exporting to the world.',
    gradient: 'from-lime-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/agriculture.png',
  },
  {
    id: 'technology',
    name: 'Technology',
    desc: "Africa's silicon valley — where Nigerian innovators build solutions for the continent and beyond.",
    gradient: 'from-cyan-900/90 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/technology.png',
  },
  {
    id: 'more',
    name: 'And Lots More',
    desc: 'Housing, manufacturing, sports, arts, tourism — every sector transformed. This is the Nigeria we are building together.',
    gradient: 'from-accent-green/80 via-gray-950/80 to-transparent',
    img: '/landing/futuristic/lots-more.png',
  },
];

const FuturisticSectors = () => {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  const advance = useCallback(() => {
    setPrev(active);
    setActive((p) => (p + 1) % sectors.length);
  }, [active]);

  useEffect(() => {
    const interval = setInterval(advance, 5500);
    return () => clearInterval(interval);
  }, [advance]);

  useEffect(() => {
    if (prev !== null) {
      const t = setTimeout(() => setPrev(null), 1000);
      return () => clearTimeout(t);
    }
  }, [prev]);

  const goTo = (index: number) => {
    if (index === active) return;
    setPrev(active);
    setActive(index);
  };

  return (
    <section className="relative bg-gray-950 overflow-hidden">
      {/* Main slideshow area */}
      <div className="relative min-h-[70vh] lg:min-h-[80vh] flex items-end overflow-hidden">
        {/* Background slides */}
        {sectors.map((sector, i) => (
          <div
            key={sector.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === active ? 'opacity-100' : i === prev ? 'opacity-0' : 'opacity-0'
            }`}
          >
            {/* Sector image */}
            <img
              src={sector.img}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover ${
                i === active ? 'animate-kenburns' : ''
              }`}
            />
            {/* Gradient overlay — heavier on left for text, lighter on right to show image */}
            <div className={`absolute inset-0 bg-gradient-to-r ${sector.gradient}`} style={{ backgroundSize: '70% 100%', backgroundRepeat: 'no-repeat' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(3,7,18) 0%, rgb(3,7,18) 5%, transparent 40%)' }} />
          </div>
        ))}

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />

        {/* Content overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-24">
          {/* Top statement */}
          <div className="mb-auto">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-white tracking-tight leading-snug max-w-lg">
              This is what it means when we say a{' '}
              <span className="uppercase">New Nigeria</span> is{' '}
              <span className="uppercase">Possible</span>
            </h2>
          </div>

          {/* Sector name + description (animated) */}
          <div className="mt-16 lg:mt-24">
            {sectors.map((sector, i) => (
              <div
                key={sector.id}
                className={`transition-all duration-700 ease-out ${
                  i === active
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 absolute pointer-events-none'
                }`}
                style={{ position: i === active ? 'relative' : 'absolute' }}
              >
                <h2 className="text-5xl sm:text-6xl lg:text-8xl font-medium text-white tracking-tight leading-none">
                  {sector.name}
                </h2>
                <p className="mt-5 text-base lg:text-lg text-gray-300 leading-relaxed max-w-xl">
                  {sector.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Navigation arrows + indicators */}
          <div className="mt-12 flex items-center justify-between">
            {/* Slide indicators */}
            <div className="flex gap-2">
              {sectors.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === active ? 'w-8 bg-accent-green' : 'w-3 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to sector ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-3">
              <button
                onClick={() => goTo((active - 1 + sectors.length) % sectors.length)}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-colors"
                aria-label="Previous sector"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <button
                onClick={() => goTo((active + 1) % sectors.length)}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-colors"
                aria-label="Next sector"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Slide counter */}
        <div className="absolute top-8 right-8 text-white/30 text-sm font-medium tabular-nums hidden lg:block">
          <span className="text-white">{String(active + 1).padStart(2, '0')}</span>
          <span className="mx-1">/</span>
          <span>{String(sectors.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Sector pills/tabs */}
      <div className="border-t border-white/5 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-1 py-1">
            {sectors.map((sector, i) => (
              <button
                key={sector.id}
                onClick={() => goTo(i)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-medium transition-all duration-300 border-b-2 ${
                  i === active
                    ? 'text-white border-accent-green'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {sector.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FuturisticSectors;
