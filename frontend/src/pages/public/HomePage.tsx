import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import heroImg from '../../assets/images/po1.webp';
import meetingImg from '../../assets/images/po3.jpg';
import voteAppImg from '../../assets/images/po4.jpg';
import rallyImg from '../../assets/images/po5.jpeg';
import leaderImg from '../../assets/images/po2.webp';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Obidient Movement',
  url: FRONTEND_URL,
  logo: `${FRONTEND_URL}/obidientLogoGreen.svg`,
  description:
    'The Obidient Movement empowers Nigerians for democratic participation, accountability, and national progress.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Abuja',
    addressCountry: 'NG',
  },
};

const steps = [
  {
    num: '01',
    title: 'Verify Your Identity',
    desc: 'Create your account with a valid email and phone number. Quick identity verification ensures a secure membership base.',
  },
  {
    num: '02',
    title: 'Complete Your Profile',
    desc: 'Add your state, LGA, ward, and polling unit. This connects you to your local chapter and fellow members.',
  },
  {
    num: '03',
    title: 'Get Verified',
    desc: 'Once verified, access your digital membership card, join voting blocs, and participate in movement activities.',
  },
];

const missionFeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Secure Registration',
    desc: 'End-to-end verified membership with identity checks and two-factor authentication.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 9.75c0 .746-.092 1.472-.265 2.166M12 10.5c2.998 0 5.74 1.1 7.843 2.918M3.265 11.916A8.959 8.959 0 003 9.75c0-.746.092-1.472.265-2.166" />
      </svg>
    ),
    title: 'Nationwide Coverage',
    desc: 'Members across all 36 states and the FCT, organized down to the polling unit level.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-1.875 6.375a3 3 0 00-3 .75h6.75a3 3 0 00-3-.75z" />
      </svg>
    ),
    title: 'Digital Membership Card',
    desc: 'Receive a verified digital membership card you can share and use for movement activities.',
  },
];

const HomePage = () => {
  return (
    <>
      <SEOHead
        title="Obidient Movement — Join the Movement for a New Nigeria"
        description="Register as an Obidient member, verify your identity, and join millions of Nigerians committed to democratic progress and national transformation."
        jsonLd={organizationJsonLd}
      />

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="min-h-[85vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
                The People's Movement
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-text-light dark:text-text-dark leading-[1.1]">
                Register, verify, and become an{' '}
                <span className="text-accent-green">Obidient member</span>
              </h1>
              <p className="mt-6 text-base lg:text-lg text-text-muted leading-relaxed max-w-lg">
                Join millions of Nigerians committed to democratic progress. Verify your identity, connect with your local chapter, and be part of the change.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/auth/sign-up"
                  className="inline-flex items-center gap-2 bg-accent-green text-white px-7 py-3.5 rounded-lg font-medium hover:bg-accent-green/90 transition-colors text-sm"
                >
                  Register Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark px-7 py-3.5 rounded-lg font-medium hover:border-accent-green hover:text-accent-green transition-colors text-sm"
                >
                  Member Portal
                </Link>
              </div>
            </div>

            {/* Right Imagery */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src={heroImg}
                  alt="Obidient Movement digital platform connecting Nigerian citizens"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission Section ──────────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-xl overflow-hidden">
                <img src={meetingImg} alt="Community meeting with Obidient Movement members" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-xl overflow-hidden mt-8">
                <img src={voteAppImg} alt="Secure digital voting platform" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-xl overflow-hidden -mt-8">
                <img src={rallyImg} alt="Obidient Movement rally for a better Nigeria" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-xl overflow-hidden">
                <img src={leaderImg} alt="Movement leadership" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Right Content */}
            <div>
              <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
                Our Mission
              </span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                Empowering every Nigerian for democratic participation
              </h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                The Obidient Movement is building the largest verified civic membership platform in Nigeria. We mobilize, organize, and empower citizens through technology and collective action.
              </p>

              <div className="mt-8 space-y-6">
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

      {/* ── How It Works Section ─────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm uppercase tracking-wider font-medium text-accent-green">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Three simple steps to join
            </h2>
            <p className="mt-4 text-base text-text-muted leading-relaxed">
              Getting started takes less than 5 minutes. Follow these simple steps to become a verified Obidient member.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gray-200 dark:bg-gray-700" />

            {steps.map((step) => (
              <div
                key={step.num}
                className="relative bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl p-8 hover:border-accent-green/30 transition-colors group"
              >
                <span className="text-4xl font-medium text-accent-green/20 group-hover:text-accent-green/40 transition-colors">
                  {step.num}
                </span>
                <h3 className="mt-4 text-xl font-medium text-text-light dark:text-text-dark">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Section ────────────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-900 text-white relative overflow-hidden">
        <img src={leaderImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/95" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <svg className="w-10 h-10 mx-auto mb-6 text-accent-green/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
          </svg>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug tracking-tight">
            "The power of the people is greater than the people in power."
          </blockquote>
          <p className="mt-6 text-gray-400 text-sm">
            — The Obidient Movement
          </p>
        </div>
      </section>

      {/* ── Final CTA Section ────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-accent-green to-accent-green/80 rounded-3xl px-8 py-16 lg:px-16 lg:py-20 overflow-hidden">
            {/* Decorative blurred circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight">
                Ready to join the movement?
              </h2>
              <p className="mt-4 text-white/80 text-base leading-relaxed">
                Be part of a growing community of verified Nigerians committed to democratic progress and national transformation.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/auth/sign-up"
                  className="inline-flex items-center gap-2 bg-white text-accent-green px-7 py-3.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Register Now
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 rounded-lg font-medium hover:bg-white/10 transition-colors text-sm"
                >
                  Member Portal
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="relative z-10 mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
              {[
                { val: '5 min', label: 'Registration' },
                { val: '100%', label: 'Secure' },
                { val: 'Free', label: 'Registration' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-medium text-white">{stat.val}</div>
                  <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
