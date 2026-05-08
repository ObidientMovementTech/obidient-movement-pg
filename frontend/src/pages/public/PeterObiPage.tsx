import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import { useCountUp } from '../../hooks/useCountUp';
import heroImg from '../../assets/images/po1.webp';
import leaderImg from '../../assets/images/po2.webp';
import meetingImg from '../../assets/images/po3.jpg';
import rallyImg from '../../assets/images/po5.jpeg';

const trackRecord = [
  { value: 8, suffix: ' yrs', label: 'Governor of Anambra' },
  { value: 6, suffix: '.1M', label: 'Votes in 2023' },
  { value: 36, suffix: '+', label: 'States Organized' },
  { value: 25, suffix: 'k+', label: 'Movement Members' },
];

const quotes = [
  "Leadership is service, and service must be measured by the lives it improves.",
  "We must move from consumption to production. That is the only way to build a nation.",
  "I governed Anambra with the money of the state — not the state with my money.",
  "The youth of this country are not the leaders of tomorrow. They are the leaders of today.",
  "Nigeria does not have a revenue problem. Nigeria has a management problem.",
  "When you are a governor and you save money, they call you stingy. But the people know who served them.",
];

const visionPillars = [
  {
    title: 'Education',
    desc: 'Massive investment in education infrastructure, teacher training, and curriculum modernization. Free and compulsory education from primary through secondary, with scholarship programs for higher education.',
    img: '/landing/futuristic/education.png',
  },
  {
    title: 'Security',
    desc: 'Community-based policing, modern intelligence infrastructure, and addressing the root causes of insecurity through economic opportunity and social inclusion.',
    img: '/landing/futuristic/security.png',
  },
  {
    title: 'Economy',
    desc: 'A production-driven economy that creates jobs, supports SMEs, and moves Nigeria away from oil dependency toward agriculture, technology, and manufacturing.',
    img: '/landing/futuristic/agriculture.png',
  },
  {
    title: 'Technology',
    desc: 'Digital transformation of government services, support for Nigeria\'s tech ecosystem, and leveraging technology to improve transparency and service delivery.',
    img: '/landing/futuristic/technology.png',
  },
];

const PeterObiPage = () => {
  const c0 = useCountUp(trackRecord[0].value);
  const c1 = useCountUp(trackRecord[1].value);
  const c2 = useCountUp(trackRecord[2].value);
  const c3 = useCountUp(trackRecord[3].value);
  const counters = [c0, c1, c2, c3];

  return (
    <>
      <SEOHead
        title="Peter Obi — Movement Leader | Obidient Movement"
        description="Learn about Peter Obi's track record, vision for Nigeria, and leadership of the Obidient Movement. From Anambra Governor to national movement leader."
      />

      {/* ── 1. CINEMATIC HERO ──────────────────────────────── */}
      <section className="relative py-32 lg:py-48 bg-gray-950 overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 object-top" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Movement Leader
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-8xl font-medium text-white tracking-tight leading-[1]">
              Peter Obi
            </h1>
            <p className="mt-4 text-lg text-accent-green font-medium tracking-wider uppercase">
              Discipline · Integrity · Service
            </p>
            <p className="mt-6 text-base text-gray-300 leading-relaxed max-w-lg">
              A reform-minded leader who has devoted his public life to proving that good governance — rooted in competence, not connections — can transform Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. BIO NARRATIVE ───────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-accent-green">
                <span className="w-8 h-px bg-accent-green" />
                The Story
              </span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                A life of service
              </h2>

              <div className="mt-8 space-y-5 text-base text-text-muted leading-relaxed">
                <p>
                  Born on July 19, 1961, in Onitsha, Anambra State, Peter Gregory Obi grew up in a Nigeria
                  brimming with potential. After studying philosophy at the University of Nigeria, Nsukka,
                  he went on to build a successful career in business and banking, becoming one of the most
                  respected businessmen in Southeast Nigeria.
                </p>
                <p>
                  His entry into public service came in 2003 when he was elected Governor of Anambra State.
                  Despite facing unprecedented political challenges — including being illegally removed from
                  office and subsequently restored by the courts — Obi served with a discipline that became
                  legendary. He paid teachers' salaries on time, invested heavily in school infrastructure,
                  and left the state treasury with a surplus of over ₦75 billion.
                </p>
                <p>
                  In 2023, Peter Obi ran for President of Nigeria under the Labour Party banner, galvanizing
                  a movement of young Nigerians who demanded a new kind of leadership. He earned 6.1 million
                  votes, winning Lagos State — a historic first — and proving that the appetite for reform-minded
                  governance cuts across ethnic and religious lines.
                </p>
                <p>
                  Today, Peter Obi leads the Obidient Movement, a platform that has organized verified members
                  across all 36 states, building the infrastructure for sustained civic engagement and
                  democratic accountability.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                <img src={leaderImg} alt="Peter Obi" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden aspect-[4/3]">
                  <img src={meetingImg} alt="Peter Obi at a community meeting" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden aspect-[4/3]">
                  <img src={rallyImg} alt="Obidient Movement rally" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TRACK RECORD — By the Numbers ───────────────── */}
      <section className="py-24 lg:py-32 bg-gray-950 relative overflow-hidden">
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
              Track Record
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-white tracking-tight">
              Results, not rhetoric
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trackRecord.map((stat, i) => (
              <div key={stat.label} ref={counters[i].ref} className="text-center">
                <div className="text-4xl lg:text-6xl font-medium text-white tabular-nums">
                  {counters[i].count}<span className="text-accent-green">{stat.suffix}</span>
                </div>
                <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. IN HIS OWN WORDS ────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              In His Own Words
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Quotes that define the movement
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((q, i) => (
              <div
                key={i}
                className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 rounded-xl p-6 lg:p-8 hover:border-accent-green/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <svg className="w-8 h-8 text-accent-green/20 mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                  </svg>
                  <p className="text-sm text-text-light dark:text-text-dark leading-relaxed italic">
                    "{q}"
                  </p>
                </div>
                <p className="mt-4 text-xs text-accent-green font-medium">— Peter Obi</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. VISION FOR NIGERIA ──────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              The Vision
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-5xl font-medium text-text-light dark:text-text-dark tracking-tight">
              A new Nigeria is possible
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {visionPillars.map((pillar) => (
              <div key={pillar.title} className="group relative rounded-2xl overflow-hidden aspect-[16/10]">
                <img src={pillar.img} alt={pillar.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h3 className="text-xl font-medium text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PHOTO GALLERY ───────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Gallery
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              In the field
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[heroImg, leaderImg, meetingImg, rallyImg].map((src, i) => (
              <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/3]'}`}>
                <img src={src} alt="Peter Obi" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. BACK CTA ────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 via-gray-950/80 to-gray-950" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-medium text-white tracking-tight">
            Join the Movement Peter Obi Inspires
          </h2>
          <p className="mt-4 text-base text-gray-300 max-w-lg mx-auto">
            Be part of the largest verified civic movement in Nigeria.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GradientCTA to="/auth/sign-up" size="lg">
              Register Now
            </GradientCTA>
            <Link
              to="/leaders"
              className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              ← Back to All Leaders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default PeterObiPage;
