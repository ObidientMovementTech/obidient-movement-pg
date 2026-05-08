import { Link } from 'react-router';

const screenshotHome = '/landing/screenshots/home.JPG';
const screenshotFeeds = '/landing/screenshots/feed.JPG';
const screenshotChat = '/landing/screenshots/chat.JPG';
const screenshotBloc = '/landing/screenshots/bloc.JPG';
const screenshotWelcome = '/landing/screenshots/welcome.jpg';

const features = [
  {
    title: 'Real-time Chat',
    desc: 'Send direct messages, join location-based group rooms, react to messages, see typing indicators, and stay in touch with your community — all in real time.',
    highlights: ['Direct Messages', 'Group Rooms', 'Message Reactions', 'Typing Indicators', 'Read Receipts'],
    screenshot: screenshotChat,
  },
  {
    title: 'News & Alerts',
    desc: 'Never miss an update. Get national news, movement broadcasts, and urgent alerts delivered straight to your phone with push notifications.',
    highlights: ['Blog Posts', 'Admin Broadcasts', 'Push Notifications', 'Emoji Reactions', 'Category Filters'],
    screenshot: screenshotFeeds,
  },
  {
    title: 'Voting Blocs',
    desc: 'Manage your voting bloc, track member engagement, share mobilization flyers, and climb the national leaderboard — all from your pocket.',
    highlights: ['Bloc Overview', 'Member Management', 'Engagement Analytics', 'Flyer Generator', 'Leaderboard'],
    screenshot: screenshotBloc,
  },
  {
    title: 'Leadership & Coordination',
    desc: 'Connect directly with your ward, LGA, and state coordinators. View hierarchical dashboards, assign roles, and manage your team on the go.',
    highlights: ['Coordinator Profiles', 'State Dashboard', 'Team Management', 'Role Assignment', 'Hierarchical Navigation'],
    screenshot: screenshotHome,
  },
];

const additionalFeatures = [
  { title: 'Digital Member Card', desc: 'Your official membership card — verifiable and shareable as an image.' },
  { title: 'KYC Verification', desc: 'Complete identity verification with ID upload and selfie — right from the app.' },
  { title: 'Two-Factor Auth', desc: 'Secure your account with TOTP-based 2FA via authenticator apps.' },
  { title: 'Push Notifications', desc: 'Real-time alerts for messages, broadcasts, and movement updates.' },
  { title: 'Dark Mode', desc: 'Full dark/light/system theme support for comfortable viewing anytime.' },
  { title: 'Polling Unit Finder', desc: 'Know exactly who in your voting bloc shares your polling unit.' },
];

const MobileAppPage = () => {
  return (
    <div className="bg-white dark:bg-background-dark">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-[#0a0f0d]">
        {/* Gradient top */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #169043, #D42B27, transparent)' }} />

        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(11,103,57,0.25) 0%, transparent 70%)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(212,43,39,0.15) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
                <span className="w-8 h-px bg-accent-green" />
                Android App
              </span>
              <h1 className="mt-4 text-4xl lg:text-6xl font-medium text-white tracking-tight leading-[1.05]">
                One App.<br />One Movement.<br />One Nigeria.
              </h1>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Everything you need to stay connected, organized, and mobilized — in a single app built for the Obidient community.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  to="/auth/sign-up"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent-green text-white font-semibold text-sm hover:bg-accent-green/90 transition-colors"
                >
                  Join & Download
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Available on Android • You must be a registered member to download
              </p>
            </div>

            {/* Phone */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[280px] sm:w-[300px] rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-900 shadow-2xl shadow-black/50 overflow-hidden">
                <img
                  src={screenshotWelcome}
                  alt="Obidient Movement App Welcome Screen"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Deep Dives ───────────────────── */}
      {features.map((feature, index) => (
        <section
          key={feature.title}
          className={`py-20 lg:py-28 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-secondary-light/10' : 'bg-white dark:bg-background-dark'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Text — alternates position */}
              <div className={index % 2 !== 0 ? 'lg:order-2' : ''}>
                <h2 className="text-2xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
                  {feature.title}
                </h2>
                <p className="mt-4 text-base text-text-muted leading-relaxed">
                  {feature.desc}
                </p>
                {/* Highlights */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/20"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screenshot */}
              <div className={`flex justify-center ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <div className="w-[240px] sm:w-[260px] rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
                  <img
                    src={feature.screenshot}
                    alt={`${feature.title} screenshot`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── Additional Features Grid ─────────────── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              And More
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Built for the movement
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-secondary-light/10 hover:border-accent-green/30 transition-colors"
              >
                <h3 className="text-lg font-medium text-text-light dark:text-text-dark">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Section ──────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50 dark:bg-secondary-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
              <span className="w-8 h-px bg-accent-green" />
              Security
              <span className="w-8 h-px bg-accent-green" />
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              Your data is protected
            </h2>
            <p className="mt-4 text-base text-text-muted leading-relaxed">
              The app uses the same security infrastructure as our web platform — encrypted communications, 
              secure token storage, two-factor authentication, and KYC verification to ensure every member is real.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
              <div className="p-5 rounded-xl bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h4 className="font-medium text-text-light dark:text-text-dark text-sm">End-to-End Encryption</h4>
                <p className="mt-1 text-xs text-text-muted">Messages and data encrypted in transit and at rest.</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h4 className="font-medium text-text-light dark:text-text-dark text-sm">Two-Factor Auth</h4>
                <p className="mt-1 text-xs text-text-muted">TOTP-based 2FA keeps your account locked down.</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-text-light dark:text-text-dark text-sm">KYC Verification</h4>
                <p className="mt-1 text-xs text-text-muted">Every member verified with government ID + selfie.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How to Get the App ────────────────────── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-medium text-text-light dark:text-text-dark tracking-tight">
              How to get the app
            </h2>
            <p className="mt-4 text-base text-text-muted">
              Three simple steps to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-lg font-medium text-text-light dark:text-text-dark">Create an Account</h3>
              <p className="mt-2 text-sm text-text-muted">
                Sign up on our website with your email and complete your profile.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-lg font-medium text-text-light dark:text-text-dark">Go to Your Dashboard</h3>
              <p className="mt-2 text-sm text-text-muted">
                Log in and find the "Mobile App" option in your Quick Actions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-lg font-medium text-text-light dark:text-text-dark">Download & Install</h3>
              <p className="mt-2 text-sm text-text-muted">
                Download the APK and follow the simple on-screen installation guide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#0a0f0d] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(11,103,57,0.15) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-5xl font-medium text-white tracking-tight">
            Join the movement today
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Over 900 members are already organizing on the app. Be part of building a New Nigeria.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent-green text-white font-semibold hover:bg-accent-green/90 transition-colors"
            >
              Create Account & Get the App
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MobileAppPage;
