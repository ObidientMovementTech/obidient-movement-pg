import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import { useCountUp } from '../../hooks/useCountUp';
import rallyImg from '../../assets/images/po5.jpeg';
import meetingImg from '../../assets/images/po3.jpg';
import voteImg from '../../assets/images/po4.jpg';
import leaderImg from '../../assets/images/po2.webp';

/* ── Data ──────────────────────────────────────────────── */

const timeline = [
  {
    year: '2022',
    title: 'A Movement Is Born',
    desc: 'Citizens across Nigeria rallied around a shared vision — demanding a new kind of leadership rooted in competence, accountability, and service. What began as scattered social media conversations grew into a nationwide groundswell of civic awakening.',
    img: rallyImg,
  },
  {
    year: '2023',
    title: 'The Election That Changed Everything',
    desc: '6.1 million Nigerians voted for a new direction. The movement proved its weight at the ballot box, winning states previously considered impossible and demonstrating that organized citizens can challenge the political establishment.',
    img: voteImg,
  },
  {
    year: '2024–Present',
    title: 'Building the Machine',
    desc: 'From protest energy to organized structure. The movement expanded into all 36 states, established ward-level networks, built a verified digital membership platform, and created the infrastructure for sustained civic engagement across 176,000+ polling units.',
    img: meetingImg,
  },
];

const stats = [
  { value: 36, suffix: '+', label: 'States Organized' },
  { value: 774, suffix: '', label: 'LGAs Covered' },
  { value: 8809, suffix: '', label: 'Wards Reached' },
  { value: 176846, suffix: '', label: 'Polling Units' },
  { value: 25000, suffix: '+', label: 'Verified Members' },
];

const values = [
  {
    title: 'Accountability',
    desc: 'We hold ourselves and our leaders to the highest standards. Every decision is documented, every fund is tracked, every leader reports to the people they serve.',
    large: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    title: 'Transparency',
    desc: 'Open processes, clear communication, and accessible information for every member at every level.',
    large: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Unity',
    desc: 'Bringing together Nigerians from every state, every ethnicity, every faith — for a common purpose that transcends division.',
    large: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Service',
    desc: 'Dedicated to serving communities and building a Nigeria where leadership means sacrifice, not privilege.',
    large: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: 'Integrity',
    desc: 'Upholding ethical conduct and honest engagement in everything we do — from ward meetings to national strategy.',
    large: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    desc: 'Leveraging technology and new ideas to modernize civic engagement and build Africa\'s most advanced movement platform.',
    large: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

const structure = [
  { title: 'National', count: '1 HQ', desc: 'Central coordination and strategy', icon: '🏛️' },
  { title: 'State', count: '36 + FCT', desc: 'State-level chapters and leadership', icon: '🗺️' },
  { title: 'LGA', count: '774', desc: 'Local government area coordination', icon: '🏘️' },
  { title: 'Ward', count: '8,809', desc: 'Ward-level organizing and outreach', icon: '📍' },
  { title: 'Polling Unit', count: '176,846', desc: 'Ground-level representation', icon: '🗳️' },
];

const portraits = [
  { src: '/landing/portraits/1.webp', alt: 'Movement member — elder in traditional attire' },
  { src: '/landing/portraits/2.webp', alt: 'Movement member — young woman' },
  { src: '/landing/portraits/3.webp', alt: 'Movement member — professional' },
  { src: '/landing/portraits/4.webp', alt: 'Movement member — citizen' },
  { src: '/landing/portraits/5.webp', alt: 'Movement member — student' },
  { src: '/landing/portraits/6.webp', alt: 'Movement member — market woman' },
  { src: '/landing/portraits/7.webp', alt: 'Movement member — worker' },
  { src: '/landing/portraits/8.webp', alt: 'Movement member — doctor' },
];

/* ── Component ─────────────────────────────────────────── */

const AboutPage = () => {
  const s0 = useCountUp(stats[0].value);
  const s1 = useCountUp(stats[1].value);
  const s2 = useCountUp(stats[2].value);
  const s3 = useCountUp(stats[3].value);
  const s4 = useCountUp(stats[4].value);
  const counters = [s0, s1, s2, s3, s4];

  return (
    <>
      <SEOHead
        title="About the Obidient Movement — Our Vision for Nigeria"
        description="Learn about the Obidient Movement's mission to empower every Nigerian through democratic participation, accountability, and collective action across all 36 states."
      />

      {/* ── 1. CINEMATIC HERO ──────────────────────────────── */}
      <section className="relative py-28 lg:py-40 overflow-hidden bg-gray-950">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            The Obidient Movement
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight leading-[1.1]">
            We Are the Largest Verified<br className="hidden lg:block" />
            <span className="text-accent-green"> Civic Movement</span> in Nigeria
          </h1>
          <p className="mt-6 text-base lg:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            A citizen-driven platform committed to democratic participation, accountability, and national progress — organized across every state, every LGA, every ward.
          </p>

          {/* Hero stats bar */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 lg:gap-16">
            {['36+ States', '774 LGAs', '25,000+ Members', '176,846 Polling Units'].map((s) => (
              <div key={s} className="text-center">
                <span className="text-sm font-medium text-white/90">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. ORIGIN STORY ────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Our Story
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-5xl font-medium text-text-light dark:text-text-dark tracking-tight">
              How it all began
            </h2>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  i % 2 === 1 ? 'lg:direction-rtl' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative rounded-2xl overflow-hidden aspect-[4/3] ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 bg-accent-green text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {item.year}
                  </div>
                </div>

                {/* Text */}
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full border-2 border-accent-green flex items-center justify-center">
                      <span className="text-sm font-bold text-accent-green">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="h-px flex-1 bg-accent-green/20" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-medium text-text-light dark:text-text-dark tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. VISION & MISSION ────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Vision */}
            <div className="relative bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 border-l-4 border-l-accent-green rounded-xl p-8 lg:p-10 overflow-hidden">
              <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" aria-hidden="true" />
              <div className="relative">
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
                <p className="mt-3 text-base text-text-muted leading-relaxed">
                  We envision a democracy where the power truly belongs to the people — verified, organized, and ready to hold their representatives accountable at every level.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="relative bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 border-l-4 border-l-accent-green rounded-xl p-8 lg:p-10 overflow-hidden">
              <img src={meetingImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" aria-hidden="true" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-medium text-text-light dark:text-text-dark">Our Mission</h2>
                <p className="mt-4 text-base text-text-muted leading-relaxed">
                  To mobilize, organize, and empower Nigerians through a verified digital platform that enables democratic participation, strengthens accountability, and builds a nationwide community of engaged citizens.
                </p>
                <p className="mt-3 text-base text-text-muted leading-relaxed">
                  We achieve this through technology-driven membership, transparent leadership structures, and ward-level organizing that gives every Nigerian a voice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MOVEMENT BY THE NUMBERS ─────────────────────── */}
      <section className="py-24 lg:py-32 bg-gray-950 relative overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.05]" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Our Reach
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-white tracking-tight">
              The movement in numbers
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {stats.map((stat, i) => (
              <div key={stat.label} ref={counters[i].ref} className="text-center relative">
                {i > 0 && (
                  <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/10" />
                )}
                <div className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white tabular-nums">
                  {counters[i].count.toLocaleString()}
                  <span className="text-accent-green">{stat.suffix}</span>
                </div>
                <div className="mt-2 text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Single purpose card */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-accent-green/10 border border-accent-green/20 rounded-2xl px-10 py-6">
              <div className="text-5xl lg:text-6xl font-bold text-accent-green">1</div>
              <div className="mt-2 text-sm text-gray-300 font-medium uppercase tracking-wider">Common Purpose</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. LEADERSHIP SPOTLIGHT ────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img src={leaderImg} alt="Peter Obi — Movement Leader" className="w-full h-full object-cover" />
              <div className="absolute top-0 left-0 w-1 h-24 bg-accent-green" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-accent-green">
                <span className="w-8 h-px bg-accent-green" />
                Movement Leader
              </span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                Peter Obi
              </h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                A reform-minded leader known for prudent stewardship of public funds, evidence-based
                policy, and a relentless focus on production over consumption. His public life has been
                defined by a disciplined approach to governance and a belief that leadership must be
                judged by outcomes that citizens can feel.
              </p>
              <p className="mt-3 text-base text-text-muted leading-relaxed">
                As Governor of Anambra State, he transformed the state's finances, invested heavily in education and healthcare infrastructure, and left office with a surplus — a rarity in Nigerian politics.
              </p>
              <blockquote className="mt-6 pl-4 border-l-2 border-accent-green text-text-muted italic">
                "Leadership is service, and service must be measured by the lives it improves."
              </blockquote>

              {/* Key stats */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { num: '2006–2014', label: 'Governor of Anambra' },
                  { num: '6.1M', label: 'Votes in 2023' },
                  { num: '36 States', label: 'Movement organized' },
                  { num: '#1', label: 'Civic platform in Nigeria' },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 dark:bg-secondary-light rounded-lg p-3">
                    <div className="text-sm font-bold text-accent-green">{s.num}</div>
                    <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/leaders/peter-obi"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-green hover:underline"
              >
                Read Full Profile
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CORE VALUES — Bento Grid ────────────────────── */}
      <section className="py-20 lg:py-24 bg-accent-green relative overflow-hidden">
        {/* Gradient borders top & bottom */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />

        {/* Faded background image */}
        <img
          src={rallyImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
        />

        {/* Side gradient glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(11,103,57,0.25) 0%, transparent 70%)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(212,43,39,0.18) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-white/80">
              <span className="w-8 h-px bg-white/60" />
              What We Stand For
              <span className="w-8 h-px bg-white/60" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-white tracking-tight">
              Our core values
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((val) => (
              <div
                key={val.title}
                className={`bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 border-t-4 border-t-accent-red rounded-2xl p-6 lg:p-8 hover:border-accent-red/30 hover:border-t-accent-red transition-all duration-300 hover:-translate-y-1 ${
                  val.large ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col justify-between' : ''
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                    {val.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-text-light dark:text-text-dark">
                    {val.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{val.desc}</p>
                </div>
                {val.large && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-text-muted italic">
                      "The foundation of any great nation is the character of its people."
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. HOW WE'RE ORGANIZED ─────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Organization
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              From HQ to every polling unit
            </h2>
            <p className="mt-4 text-base text-text-muted">
              A clear hierarchical structure covering every level of Nigeria's administrative divisions.
            </p>
          </div>

          {/* Vertical flow on mobile, horizontal on desktop */}
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {structure.map((level, i) => (
              <div key={level.title} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl p-6 text-center hover:border-accent-green/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto">
                    <span className="text-xl" role="img" aria-label={level.title}>{level.icon}</span>
                  </div>
                  <h3 className="mt-3 text-base font-medium text-text-light dark:text-text-dark">
                    {level.title}
                  </h3>
                  <span className="text-accent-green text-lg font-bold">{level.count}</span>
                  <p className="mt-1 text-xs text-text-muted">{level.desc}</p>
                </div>
                {/* Connector arrow */}
                {i < structure.length - 1 && (
                  <>
                    <svg className="hidden md:block w-6 h-6 text-accent-green/40 rotate-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    <svg className="md:hidden w-6 h-6 text-accent-green/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/leaders"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-green hover:underline"
            >
              Meet our leaders across all levels
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. PORTRAIT MOSAIC ─────────────────────────────── */}
      <section className="relative overflow-hidden h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-1 h-full">
          {[...portraits, portraits[0], portraits[1]].map((p, i) => (
            <div
              key={i}
              className={`overflow-hidden ${
                i === 0 || i === 4 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-green/10 to-black/70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 text-center pb-10 sm:pb-14 px-8">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white italic drop-shadow-lg max-w-2xl mx-auto">
            "Every face is a story. Every story is the movement."
          </p>
        </div>
      </section>

      {/* ── 9. NOTABLE QUOTE ───────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-12 h-12 mx-auto text-accent-green/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
          </svg>
          <blockquote className="text-2xl lg:text-3xl font-medium text-text-light dark:text-text-dark leading-relaxed tracking-tight">
            "If we get leadership right, everything else follows. The Obidient Movement is proof that Nigerians are ready for a different kind of politics — one built on competence, not connections."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <img src={leaderImg} alt="Peter Obi" className="w-12 h-12 rounded-full object-cover" />
            <div className="text-left">
              <p className="text-sm font-medium text-text-light dark:text-text-dark">Peter Obi</p>
              <p className="text-xs text-text-muted">Movement Leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CTA ──────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-950">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 via-gray-950/80 to-gray-950" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-medium text-white tracking-tight">
            Ready to Build a New Nigeria?
          </h2>
          <p className="mt-4 text-base text-gray-300 max-w-lg mx-auto">
            Join 25,000+ verified members shaping the future of democratic participation across all 36 states.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GradientCTA to="/auth/sign-up" size="lg">
              Register Now
            </GradientCTA>
            <Link
              to="/leaders"
              className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Meet Our Leaders
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Verified membership · Free to join · Active in 36 states
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
