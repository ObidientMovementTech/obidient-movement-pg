import { Link } from 'react-router';
import leaderImg from '../../assets/images/po2.webp';
import rallyImg from '../../assets/images/po5.jpeg';

const LeadershipSpotlight = () => {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Leadership
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
            Meet the people driving the movement
          </h2>
          <p className="mt-3 text-base text-text-muted max-w-xl mx-auto">
            From national leadership to state coordinators — a structured movement organized for impact at every level.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Leader Card — takes 3 cols */}
          <div className="lg:col-span-3 group relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[480px]">
            <img
              src={leaderImg}
              alt="Peter Obi — Movement Leader"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
              <span className="text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
                Movement Leader
              </span>
              <h3 className="mt-2 text-3xl lg:text-4xl font-medium text-white">
                Peter Obi
              </h3>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                "Leadership is service, and service must be measured by the lives it improves."
              </p>
            </div>
            <div className="absolute top-0 left-0 w-1 h-16 bg-accent-green" />
          </div>

          {/* National Coordinator Card — takes 2 cols */}
          <div className="lg:col-span-2 group relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[480px]">
            <img
              src={rallyImg}
              alt="National Coordinator"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
                National Coordinator
              </span>
              <h3 className="mt-2 text-2xl lg:text-3xl font-medium text-white">
                National Team
              </h3>
              <p className="mt-2 text-gray-400 text-sm">
                Coordinating across all 36 states and the FCT
              </p>
            </div>
            <div className="absolute top-0 left-0 w-1 h-16 bg-accent-green" />
          </div>
        </div>

        {/* Link to full leaders page */}
        <div className="mt-10 text-center">
          <Link
            to="/leaders"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark hover:text-accent-green transition-colors group"
          >
            View all State Coordinators & Leadership Structure
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSpotlight;
