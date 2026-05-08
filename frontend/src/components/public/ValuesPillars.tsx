import rallyImg from '../../assets/images/po5.jpeg';

const pillars = [
  {
    num: '01',
    title: 'Accountability',
    desc: 'Leaders who answer to the people — not the other way around.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Transparency',
    desc: 'Open processes, public records, and citizens who can verify.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Unity',
    desc: 'One nation, beyond tribe, tongue, or religion — bound by purpose.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Progress',
    desc: 'Moving from consumption to production — building a nation that works.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Service',
    desc: 'Public office as a duty to the people — not a reward for ambition.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

const ValuesPillars = () => {
  return (
    <section className="py-24 lg:py-32 bg-accent-green relative overflow-hidden">
      {/* Gradient borders top & bottom */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />

      {/* Faded background image from hero */}
      <img
        src={rallyImg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.08] dark:opacity-[0.12]"
      />

      {/* Side gradient glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(11,103,57,0.25) 0%, transparent 70%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(212,43,39,0.18) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-white/80">
            <span className="w-8 h-px bg-white/60" />
            Our Pillars
          </span>
          <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight">
              What we stand for
            </h2>
            <p className="text-base text-white/70 max-w-md">
              Five non-negotiable principles that guide every action, every leader, and every decision.
            </p>
          </div>
        </div>
      </div>

      {/* Infinite scrolling cards */}
      <div className="relative z-10 overflow-hidden">
        <div className="animate-scroll-cards flex w-max">
          {[...pillars, ...pillars].map((pillar, idx) => (
            <div
              key={`${pillar.num}-${idx}`}
              className="flex-shrink-0 w-[300px] sm:w-[340px] mx-2.5 bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 border-t-2 border-t-accent-red rounded-2xl p-7 group hover:border-accent-red/30 hover:border-t-accent-red transition-all duration-300 hover:-translate-y-1"
            >
              {/* Number + Icon row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-accent-green/40 group-hover:text-accent-green transition-colors">
                  {pillar.num}
                </span>
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                  {pillar.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="mt-6 text-xl font-medium text-text-light dark:text-text-dark">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesPillars;
