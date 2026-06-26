import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import SEOHead from '../../components/public/SEOHead';
import GradientCTA from '../../components/ui/GradientCTA';
import { getPublicLeaders, getDirectorateHeads, type PublicLeader, type DirectorateLeader } from '../../services/publicLeadersService';
import { PETER_OBI } from '../../data/leaderProfiles';
import leaderImg from '../../assets/images/po2.webp';
import rallyImg from '../../assets/images/po5.jpeg';

const philosophy = [
  {
    title: 'Accountability',
    desc: 'Every leader reports to the people they serve. Performance is measured, funds are tracked, and results are published.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    title: 'Meritocracy',
    desc: 'Positions are earned through competence and service, not purchased through money or connections.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Transparency',
    desc: 'Open selection processes, clear communication, and accessible information at every leadership level.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const orgStructure = [
  { title: 'National', count: '1 HQ', icon: '🏛️' },
  { title: 'State', count: '36 + FCT', icon: '🗺️' },
  { title: 'LGA', count: '774', icon: '🏘️' },
  { title: 'Ward', count: '8,809', icon: '📍' },
  { title: 'Polling Unit', count: '176,846', icon: '🗳️' },
];

const DIRECTORATE_LABELS: Record<string, string> = {
  operations: 'Operations',
  political_engagement: 'Political Engagement',
  legal: 'Legal',
  technology: 'Technology',
  communications: 'Communications',
  mobilisation: 'Mobilisation',
  finance: 'Finance',
  research: 'Research',
  diaspora_engagement: 'Diaspora Engagement',
};

const LeadersPage = () => {
  const [leaders, setLeaders] = useState<PublicLeader[]>([]);
  const [directorateHeads, setDirectorateHeads] = useState<DirectorateLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      getPublicLeaders().then((res) => setLeaders(res.leaders)),
      getDirectorateHeads().then((res) => setDirectorateHeads(res.leaders)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nationalCoordinators = leaders.filter((l) => l.designation === 'National Coordinator');
  const stateCoordinators = leaders.filter((l) => l.designation === 'State Coordinator');

  const zoneMap: Record<string, string[]> = {
    'North Central': ['Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'FCT'],
    'North East': ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
    'North West': ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
    'South East': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
    'South South': ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'],
    'South West': ['Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo'],
  };

  const getZone = (state: string | null) => {
    if (!state) return 'Unknown';
    for (const [zone, states] of Object.entries(zoneMap)) {
      if (states.some((s) => state.toLowerCase().includes(s.toLowerCase()))) return zone;
    }
    return 'Other';
  };

  const filteredCoordinators = zoneFilter === 'all'
    ? stateCoordinators
    : stateCoordinators.filter((c) => getZone(c.assignedState) === zoneFilter);

  const zones = ['all', ...Object.keys(zoneMap)];

  return (
    <>
      <SEOHead
        title="Our Leaders — Obidient Movement"
        description="Meet the leadership structure of the Obidient Movement — from national coordination to state-level organization across Nigeria."
      />

      {/* ── 1. CINEMATIC HERO ──────────────────────────────── */}
      <section className="relative py-28 lg:py-40 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
            <span className="w-8 h-px bg-accent-green" />
            Leadership Structure
            <span className="w-8 h-px bg-accent-green" />
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight">
            The People Behind<br className="hidden lg:block" /> <span className="text-accent-green">the Movement</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            A structured movement organized for impact — from national coordination to every state in the federation.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-8 lg:gap-14">
            {['1 Movement Leader', 'National Team', '36 State Directors', '774 LGA Coordinators'].map((s) => (
              <span key={s} className="text-sm text-white/80 font-medium">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. MOVEMENT LEADER — Peter Obi ─────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img src={leaderImg} alt="Peter Obi — Movement Leader" className="w-full h-full object-cover" />
              <div className="absolute top-0 left-0 w-1 h-24 bg-accent-green" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
                <span className="w-8 h-px bg-accent-green" />
                Movement Leader
              </span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                Peter Obi
              </h2>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                {PETER_OBI.shortBio}
              </p>
              <blockquote className="mt-6 pl-4 border-l-2 border-accent-green text-text-muted italic">
                "{PETER_OBI.quotes[5].text}"
              </blockquote>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { num: '2006–2014', label: 'Governor of Anambra' },
                  { num: '6.1M', label: 'Votes in 2023' },
                  { num: '36 States', label: 'Movement organized' },
                  { num: '#1', label: 'Civic platform' },
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

      {/* ── 3. LEADERSHIP PHILOSOPHY ───────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30 relative overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.03]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Our Approach
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              What sets our leadership apart
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {philosophy.map((p) => (
              <div key={p.title} className="bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700 border-t-4 border-t-accent-green rounded-b-xl rounded-t-none p-8 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                  {p.icon}
                </div>
                <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">{p.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. NATIONAL COORDINATORS ───────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
              <span className="w-8 h-px bg-accent-green" />
              National Team
            </span>
            <h2 className="mt-2 text-2xl lg:text-3xl font-medium text-text-light dark:text-text-dark tracking-tight">
              National Coordinators
            </h2>
            <p className="mt-2 text-sm text-text-muted">The team driving strategy and coordination at the national level.</p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-6">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="mt-3 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : nationalCoordinators.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {nationalCoordinators.map((coord) => (
                <div key={coord.id} className="group relative bg-white dark:bg-secondary-light rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-accent-green/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-green/5">
                  {/* Large Image */}
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    {coord.profileImage ? (
                      <img
                        src={coord.profileImage}
                        alt={coord.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-light text-gray-300 dark:text-gray-600">
                          {coord.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Designation badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/90 text-white text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        National
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text-light dark:text-text-dark group-hover:text-accent-green transition-colors">
                      {coord.name}
                    </h3>
                    <p className="mt-1 text-sm text-accent-green/80 font-medium">{coord.designation}</p>

                    {/* Phone Actions */}
                    {coord.phone && (
                      <div className="mt-4 flex items-center gap-3">
                        <a
                          href={`https://wa.me/${coord.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.573-1.462A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.418-.295-2.724.87.9-2.662-.326-.472A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${coord.phone}`}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                          {coord.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-green via-accent-green/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">National coordinator positions are being filled.</p>
          )}
        </div>
      </section>

      {/* ── 5. DIRECTORATE LEADERSHIP ──────────────────────── */}
      {directorateHeads.length > 0 && (
        <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
                <span className="w-8 h-px bg-accent-green" />
                Directorate Leadership
              </span>
              <h2 className="mt-2 text-2xl lg:text-3xl font-medium text-text-light dark:text-text-dark tracking-tight">
                Heads of Directorate
              </h2>
              <p className="mt-2 text-sm text-text-muted">Specialist leaders driving each functional area of the movement.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {directorateHeads.map((head) => (
                <Link
                  key={head.id}
                  to={`/leaders/${head.profileSlug ?? head.id}`}
                  className="group relative bg-white dark:bg-secondary-light rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-accent-green/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-green/5"
                >
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    {head.profileImage ? (
                      <img
                        src={head.profileImage}
                        alt={head.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-light text-gray-300 dark:text-gray-600">
                          {head.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/90 text-white text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Directorate
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text-light dark:text-text-dark group-hover:text-accent-green transition-colors">
                      {head.name}
                    </h3>
                    <p className="mt-1 text-sm text-accent-green/80 font-medium">
                      Head of {DIRECTORATE_LABELS[head.assignedDirectorate] ?? head.assignedDirectorate} Directorate
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-text-muted group-hover:text-accent-green transition-colors">
                      View profile
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-green via-accent-green/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. STATE COORDINATORS ──────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gray-50/50 dark:bg-secondary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-green font-semibold">
                <span className="w-8 h-px bg-accent-green" />
                36 States + FCT
              </span>
              <h2 className="mt-2 text-2xl lg:text-3xl font-medium text-text-light dark:text-text-dark tracking-tight">
                State Coordinators
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setZoneFilter(zone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    zoneFilter === zone
                      ? 'bg-accent-green text-white'
                      : 'bg-white dark:bg-gray-800 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {zone === 'all' ? 'All Zones' : zone}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-4 p-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="mt-3 h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCoordinators.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCoordinators.map((coord) => (
                <div key={coord.id} className="group bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden hover:border-accent-green/30 hover:shadow-lg hover:shadow-accent-green/5 transition-all duration-300">
                  <div className="flex gap-4 p-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 ring-2 ring-transparent group-hover:ring-accent-green/30 transition-all">
                      {coord.profileImage ? (
                        <img src={coord.profileImage} alt={coord.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg font-semibold">
                          {coord.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-light dark:text-text-dark truncate group-hover:text-accent-green transition-colors">
                        {coord.name}
                      </h3>
                      <p className="text-xs text-accent-green/80 font-medium mt-0.5">
                        {coord.assignedState || 'Unassigned'}
                      </p>

                      {/* Phone links */}
                      {coord.phone && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <a
                            href={`https://wa.me/${coord.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[11px] font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.573-1.462A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.418-.295-2.724.87.9-2.662-.326-.472A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                            </svg>
                            WA
                          </a>
                          <a
                            href={`tel:${coord.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Call directly"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            {coord.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted">
                {zoneFilter === 'all'
                  ? 'State coordinator positions are being filled across the nation.'
                  : `No coordinators assigned yet for the ${zoneFilter} zone.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. ORGANIZATIONAL DEPTH ────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              The Machine
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              From HQ to every polling unit
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {orgStructure.map((level, i) => (
              <div key={level.title} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full bg-white dark:bg-secondary-light border border-gray-100 dark:border-gray-700 rounded-xl p-6 text-center hover:border-accent-green/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto">
                    <span className="text-xl">{level.icon}</span>
                  </div>
                  <h3 className="mt-3 text-base font-medium text-text-light dark:text-text-dark">{level.title}</h3>
                  <span className="text-accent-green text-lg font-bold">{level.count}</span>
                </div>
                {i < orgStructure.length - 1 && (
                  <svg className="md:hidden w-5 h-5 text-accent-green/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CTA ─────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 bg-gray-950 overflow-hidden">
        <img src={rallyImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 via-gray-950/80 to-gray-950" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-medium text-white tracking-tight">
            Become a Coordinator in Your State
          </h2>
          <p className="mt-4 text-base text-gray-300 max-w-lg mx-auto">
            Join the movement, get verified, and connect with your state coordinator to explore leadership opportunities.
          </p>
          <div className="mt-8">
            <GradientCTA to="/auth/sign-up" size="lg">
              Join the Movement
            </GradientCTA>
          </div>
          <p className="mt-6 text-xs text-gray-500">Free to join · Verified membership · Active in all 36 states</p>
        </div>
      </section>
    </>
  );
};

export default LeadersPage;
