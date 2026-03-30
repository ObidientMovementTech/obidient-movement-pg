import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import rallyImg from '../../assets/images/po5.jpeg';

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Accountability',
    desc: 'We hold ourselves and our leaders to the highest standards of responsibility and transparency.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Transparency',
    desc: 'Open processes, clear communication, and accessible information for every member.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Unity',
    desc: 'Bringing together Nigerians from every state, every background, for a common purpose.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Service',
    desc: 'Dedicated to serving our communities and building a better Nigeria for all citizens.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Integrity',
    desc: 'Upholding ethical conduct and honest engagement in everything we do.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Innovation',
    desc: 'Leveraging technology and new ideas to modernize civic engagement across Nigeria.',
  },
];

const structure = [
  { title: 'National', count: '1 HQ', icon: '🏛️', desc: 'Central coordination and strategy' },
  { title: 'State', count: '36 + FCT', icon: '🗺️', desc: 'State-level chapters and leadership' },
  { title: 'LGA', count: '774', icon: '🏘️', desc: 'Local government area coordination' },
  { title: 'Ward', count: '8,809', icon: '📍', desc: 'Ward-level organizing and outreach' },
  { title: 'Polling Unit', count: '176,846', icon: '🗳️', desc: 'Ground-level representation' },
];

const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About the Obidient Movement — Our Vision for Nigeria"
        description="Learn about the Obidient Movement's mission to empower every Nigerian through democratic participation, accountability, and collective action."
      />

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
            About Us
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-text-light dark:text-text-dark">
            Building a movement for{' '}
            <span className="text-accent-green">Nigeria's future</span>
          </h1>
          <p className="mt-6 text-base lg:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            The Obidient Movement is a citizen-driven platform committed to democratic participation, accountability, and national progress for every Nigerian.
          </p>

          {/* Hero Banner Image */}
          <div className="mt-12 rounded-2xl overflow-hidden max-w-4xl mx-auto">
            <img
              src={rallyImg}
              alt="Obidient Movement supporters marching for a better Nigeria"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ─────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Vision */}
            <div className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 rounded-xl p-8 lg:p-10">
              <div className="w-12 h-12 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-text-light dark:text-text-dark">Our Vision</h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                A Nigeria where every citizen is empowered to participate in governance, where leaders are held accountable, and where collective action drives meaningful change across all 36 states and the FCT.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 rounded-xl p-8 lg:p-10">
              <div className="w-12 h-12 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-text-light dark:text-text-dark">Our Mission</h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                To mobilize, organize, and empower Nigerians through a verified digital platform that enables democratic participation, strengthens accountability, and builds a nationwide community of engaged citizens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ──────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
              What We Stand For
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Our core values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val) => (
              <div
                key={val.title}
                className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl p-6 lg:p-8 hover:border-accent-green/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                  {val.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-text-light dark:text-text-dark">
                  {val.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Movement Structure ───────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
              Organization
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              How we're organized
            </h2>
            <p className="mt-4 text-base text-text-muted leading-relaxed">
              A clear hierarchical structure covering every level of Nigeria's administrative divisions.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {structure.map((level, i) => (
              <div key={level.title} className="flex-1 flex flex-col items-center">
                <div className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 rounded-xl p-6 text-center w-full hover:border-accent-green/30 transition-colors">
                  <span className="text-3xl" role="img" aria-label={level.title}>
                    {level.icon}
                  </span>
                  <h3 className="mt-3 text-base font-medium text-text-light dark:text-text-dark">
                    {level.title}
                  </h3>
                  <span className="text-accent-green text-sm font-medium">{level.count}</span>
                  <p className="mt-2 text-xs text-text-muted">{level.desc}</p>
                </div>
                {/* Connector arrow (not on last) */}
                {i < structure.length - 1 && (
                  <div className="hidden md:flex items-center text-gray-300 dark:text-gray-600 my-0 absolute" style={{ display: 'none' }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Horizontal arrows between items (desktop) */}
          <div className="hidden md:flex justify-center items-center gap-1 mt-4">
            {structure.map((_, i) =>
              i < structure.length - 1 ? (
                <div key={`arrow-${i}`} className="flex items-center flex-1 justify-center">
                  <svg className="w-5 h-5 text-accent-green/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* ── Join CTA ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
            Ready to be part of the change?
          </h2>
          <p className="mt-4 text-base text-text-muted leading-relaxed max-w-lg mx-auto">
            Join thousands of verified Nigerians who are shaping the future through democratic participation.
          </p>
          <Link
            to="/auth/sign-up"
            className="mt-8 inline-flex items-center gap-2 bg-accent-green text-white px-7 py-3.5 rounded-lg font-medium hover:bg-accent-green/90 transition-colors text-sm"
          >
            Register Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
