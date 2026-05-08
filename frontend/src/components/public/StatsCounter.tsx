import { useCountUp } from '../../hooks/useCountUp';

const stats = [
  { value: 36, suffix: '+', label: 'States Organized', context: 'Across the federation' },
  { value: 774, suffix: '', label: 'LGAs Covered', context: 'Every local government' },
  { value: 25, suffix: 'k+', label: 'Verified Members', context: 'And counting daily' },
  { value: 8, suffix: 'k+', label: 'Polling Units', context: 'Mapped & monitored' },
];

const StatsCounter = () => {
  const s0 = useCountUp(stats[0].value);
  const s1 = useCountUp(stats[1].value);
  const s2 = useCountUp(stats[2].value);
  const s3 = useCountUp(stats[3].value);
  const counters = [s0, s1, s2, s3];

  return (
    <section className="py-24 lg:py-32 bg-gray-950 relative overflow-hidden">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Our Reach
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-white tracking-tight">
            A movement that spans the nation
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              ref={counters[index].ref}
              className="text-center relative group"
            >
              {/* Divider between items */}
              {index > 0 && (
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/10" />
              )}
              <div className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white tabular-nums">
                {counters[index].count}
                <span className="text-accent-green">{stat.suffix}</span>
              </div>
              <div className="mt-2 text-sm text-gray-300 font-medium">
                {stat.label}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {stat.context}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
