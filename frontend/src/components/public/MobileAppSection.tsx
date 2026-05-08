import { Link } from 'react-router';

const screenshotHome = '/landing/screenshots/home.JPG';
const screenshotFeeds = '/landing/screenshots/feed.JPG';
const screenshotChat = '/landing/screenshots/chat.JPG';

const features = [
  {
    title: 'Real-time Chat',
    desc: 'Direct messages, group rooms, reactions, and typing indicators.',
  },
  {
    title: 'News & Alerts',
    desc: 'Stay updated with movement news, broadcasts, and urgent notifications.',
  },
  {
    title: 'Voting Blocs',
    desc: 'Manage your bloc, track members, view analytics, and mobilize.',
  },
  {
    title: 'Leadership',
    desc: 'Connect with coordinators from ward to national level.',
  },
  {
    title: 'Member Card',
    desc: 'Your official digital membership card — shareable and verifiable.',
  },
];

const MobileAppSection = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#0a0f0d]">
      {/* Gradient borders top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }}
      />

      {/* Subtle green/red glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(11,103,57,0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3"
          style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(212,43,39,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Mobile App
            </span>

            <h2 className="mt-4 text-3xl lg:text-5xl font-medium text-white tracking-tight leading-[1.1]">
              The movement in your pocket
            </h2>

            <p className="mt-5 text-base text-gray-400 leading-relaxed max-w-lg">
              Organize, chat, track leadership, and mobilize — all from one app. 
              Available for Android. Stay connected wherever you are.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-medium text-sm">{f.title}</span>
                    <span className="text-gray-500 text-sm ml-1">— {f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/mobile-app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-green text-white font-semibold text-sm hover:bg-accent-green/90 transition-colors"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/auth/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Join & Get the App
              </Link>
            </div>

            {/* Android badge */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 2.236l1.442-1.442a.5.5 0 01.707.707l-1.57 1.57A8.31 8.31 0 0120.5 7H3.5a8.31 8.31 0 012.398-3.929L4.328 1.5a.5.5 0 01.707-.707L6.477 2.236A8.24 8.24 0 0112 .5a8.24 8.24 0 015.523 1.736zM3 8.5h18v11a3 3 0 01-3 3H6a3 3 0 01-3-3v-11zm6.5-3.25a.75.75 0 100-1.5.75.75 0 000 1.5zm5 0a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              Available on Android • iOS coming soon
            </div>
          </div>

          {/* Right — Phone Screenshots */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Main phone mockup */}
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[260px] sm:w-[280px] rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-900 shadow-2xl shadow-black/50 overflow-hidden">
                <img
                  src={screenshotHome}
                  alt="Obidient Movement App — Home Screen"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>

              {/* Second phone — offset behind */}
              <div className="absolute -right-16 top-12 w-[200px] sm:w-[220px] rounded-[2rem] border-[6px] border-gray-800 bg-gray-900 shadow-xl shadow-black/40 overflow-hidden opacity-80 hidden sm:block -z-10 rotate-3">
                <img
                  src={screenshotChat}
                  alt="Obidient Movement App — Chat"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>

              {/* Third phone — offset left */}
              <div className="absolute -left-12 top-24 w-[180px] sm:w-[200px] rounded-[2rem] border-[6px] border-gray-800 bg-gray-900 shadow-xl shadow-black/40 overflow-hidden opacity-60 hidden lg:block -z-10 -rotate-3">
                <img
                  src={screenshotFeeds}
                  alt="Obidient Movement App — Feeds"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient border bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }}
      />
    </section>
  );
};

export default MobileAppSection;
