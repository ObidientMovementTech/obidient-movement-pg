import { Link } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import MarqueeTicker from '../../components/public/MarqueeTicker';
import MissionSection from '../../components/public/MissionSection';
import FuturisticSectors from '../../components/public/FuturisticSectors';
import LeadershipSpotlight from '../../components/public/LeadershipSpotlight';
import VideoShowcase from '../../components/public/VideoShowcase';
import ValuesPillars from '../../components/public/ValuesPillars';
import MobileAppSection from '../../components/public/MobileAppSection';
import LatestNews from '../../components/public/LatestNews';
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
  const heroSlides = [heroImg, leaderImg, meetingImg, voteAppImg, rallyImg];
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);

  const advanceSlide = useCallback(() => {
    setPrevSlide(activeSlide);
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  }, [activeSlide, heroSlides.length]);

  useEffect(() => {
    const interval = setInterval(advanceSlide, 6000);
    return () => clearInterval(interval);
  }, [advanceSlide]);

  // Clear prevSlide after transition completes
  useEffect(() => {
    if (prevSlide !== null) {
      const timeout = setTimeout(() => setPrevSlide(null), 1200);
      return () => clearTimeout(timeout);
    }
  }, [prevSlide]);

  return (
    <>
      <SEOHead
        title="Obidient Movement — Join the Movement for a New Nigeria"
        description="Register as an Obidient member, verify your identity, and join millions of Nigerians committed to democratic progress and national transformation."
        jsonLd={organizationJsonLd}
      />

      {/* ── Cinematic Hero Section ──────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
                index === activeSlide
                  ? 'opacity-100 animate-kenburns'
                  : index === prevSlide
                  ? 'opacity-0'
                  : 'opacity-0'
              }`}
              style={{ animationDelay: index === activeSlide ? '0ms' : undefined }}
            />
          ))}
        </div>

        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

        {/* Subtle grid pattern overlay for corporate texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Accent top border line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D42B27] to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#D42B27] mb-8">
              <span className="w-8 h-px bg-[#D42B27]" />
              The People's Movement
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-medium tracking-tight text-white leading-[1.02]">
              A New Nigeria
              <br />
              <span className="text-white/90">is POssible</span>
            </h1>
            <p className="mt-8 text-lg lg:text-xl text-gray-300 leading-relaxed max-w-xl">
              Join millions of Nigerians committed to democratic progress. Register, verify your identity, and be part of the movement reshaping our nation.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <GradientCTA to="/auth/sign-up">
                Join the Movement
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </GradientCTA>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:border-white/50 hover:bg-white/5 transition-all text-sm backdrop-blur-sm hover:-translate-y-0.5"
              >
                Member Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-8 lg:gap-12">
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">36</span>
                <span className="text-xs uppercase tracking-wider text-gray-400">States</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">774</span>
                <span className="text-xs uppercase tracking-wider text-gray-400">LGAs Covered</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">25k+</span>
                <span className="text-xs uppercase tracking-wider text-gray-400">Members</span>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-2 mx-auto sm:mx-0">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPrevSlide(activeSlide);
                    setActiveSlide(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === activeSlide ? 'w-8 bg-[#D42B27]' : 'w-3 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-20 right-8 text-white/40 animate-bounce hidden lg:block">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </section>

      {/* ── Marquee Ticker ────────────────────────────────────── */}
      <MarqueeTicker />

      {/* ── Mission Section ──────────────────────────────────────── */}
      <MissionSection missionFeatures={missionFeatures} />

      {/* ── Futuristic Sectors — "A New Nigeria Is Possible" ─────── */}
      <FuturisticSectors />

      {/* ── Leadership Spotlight ──────────────────────────────────── */}
      <LeadershipSpotlight />

      {/* ── Video Showcase ───────────────────────────────────────── */}
      <VideoShowcase />

      {/* ── Mobile App Section ───────────────────────────────────── */}
      <MobileAppSection />

      {/* ── Values / Pillars ─────────────────────────────────────── */}
      <ValuesPillars />

      {/* ── How It Works — Vertical Timeline ────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo + Movement Name centered above */}
          <div className="flex flex-col items-center mb-16">
            <img src="/obi-icon.svg" alt="Obidient Movement" className="w-28 h-28 lg:w-36 lg:h-36" />
            <h3 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              The Obidient Movement
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left — Heading */}
            <div className="lg:sticky lg:top-32">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
                <span className="w-8 h-px bg-accent-green" />
                How It Works
              </span>
              <h2 className="mt-4 text-3xl lg:text-5xl font-medium text-text-light dark:text-text-dark tracking-tight leading-[1.1]">
                Three steps to join the movement
              </h2>
              <p className="mt-5 text-base text-text-muted leading-relaxed">
                Getting started takes less than 5 minutes. Follow these simple steps to become a verified Obidient member.
              </p>
              <div className="mt-8">
                <GradientCTA to="/auth/sign-up">
                  Start Registration
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </GradientCTA>
              </div>
            </div>

            {/* Right — Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-12">
                {steps.map((step) => (
                  <div key={step.num} className="relative pl-14 group">
                    {/* Timeline node */}
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark flex items-center justify-center group-hover:border-accent-green transition-colors">
                      <span className="text-sm font-semibold text-accent-green">
                        {step.num}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl p-6 lg:p-8 group-hover:border-accent-green/30 transition-all duration-300">
                      <h3 className="text-xl font-medium text-text-light dark:text-text-dark">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm text-text-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest News ──────────────────────────────────────────── */}
      <LatestNews />

      {/* ── Quote Section — Full-bleed ────────────────────────────── */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <img src={leaderImg} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-gray-950/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-transparent to-gray-950/50" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-px bg-[#D42B27] mx-auto mb-10" />
          <blockquote className="text-3xl sm:text-4xl lg:text-6xl font-medium text-white leading-[1.15] tracking-tight italic">
            "The power of the people is greater than the people in power."
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-white/30" />
            <p className="text-gray-400 text-sm uppercase tracking-[0.2em]">
              The Obidient Movement
            </p>
            <div className="w-8 h-px bg-white/30" />
          </div>
        </div>
      </section>

      {/* ── Final CTA Section — "Get Involved" ─────────────────── */}
      <section className="py-24 lg:py-32 bg-gray-950 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#D42B27]/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy + CTA */}
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
                <span className="w-8 h-px bg-accent-green" />
                Get Involved
              </span>
              <h2 className="mt-5 text-3xl lg:text-5xl font-medium text-white tracking-tight leading-[1.1]">
                The future won't build itself.{' '}
                <span className="text-white/70">Nigeria needs you.</span>
              </h2>
              <p className="mt-6 text-gray-400 text-base lg:text-lg leading-relaxed max-w-lg">
                The Obidient Movement is committed to building a stronger, more accountable Nigeria through verified civic participation — with a growing community of members organized across every state.
              </p>
              <div className="mt-8">
                <GradientCTA to="/auth/sign-up">
                  Learn How
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </GradientCTA>
              </div>
            </div>

            {/* Right — Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '36', label: 'States Organized' },
                { val: '774', label: 'LGAs Covered' },
                { val: '25k+', label: 'Verified Members' },
                { val: '8k+', label: 'Polling Units Mapped' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8 hover:border-accent-green/30 transition-colors"
                >
                  <div className="text-3xl lg:text-4xl font-medium text-white">
                    {stat.val}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                    {stat.label}
                  </div>
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
