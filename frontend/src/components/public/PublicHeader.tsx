import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router';
import TopLogo from '../TopLogo';
import GradientCTA from '../ui/GradientCTA';
import { useUser } from '../../context/UserContext';

interface NavChild {
  to: string;
  label: string;
  desc: string;
  icon: JSX.Element;
}

interface NavItem {
  to?: string;
  label: string;
  desc?: string;
  icon: JSX.Element;
  children?: NavChild[];
}

const navLinks: NavItem[] = [
  {
    to: '/', label: 'Home', desc: 'Back to homepage',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  },
  {
    to: '/about', label: 'About Us', desc: 'Vision, mission & values',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
  },
  {
    to: '/leaders', label: 'Our Leaders', desc: 'National & state coordinators',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  },
  {
    label: 'News & Updates',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>,
    children: [
      {
        to: '/news', label: 'Latest News', desc: 'Latest movement news & updates',
        icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>,
      },
      {
        to: '/newsletter', label: 'Newsletter', desc: 'Our regular email newsletter',
        icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.209-3.888a2.25 2.25 0 012.134 0l7.209 3.888A2.25 2.25 0 0121.75 8.844v8.156z" /></svg>,
      },
    ],
  },
  {
    to: '/mobile-app', label: 'Mobile App', desc: 'Download for iOS & Android',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>,
  },
  {
    to: '/get-involved', label: 'Get Involved', desc: 'Volunteer, donate, organize',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  },
  {
    to: '/contact', label: 'Contact Us', desc: 'Reach the team',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  },
];

const X_URL = 'https://x.com/obaborcharity';

const PublicHeader = () => {
  const { profile } = useUser();
  const location = useLocation();
  const isLoggedIn = !!profile;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const isGroupActive = (item: NavItem) =>
    item.children?.some(c => location.pathname === c.to || location.pathname.startsWith(c.to + '/')) ?? false;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-200/60 dark:border-white/[0.06]'
            : 'bg-white dark:bg-gray-950 border-b border-transparent'
        }`}
      >
        <nav className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <div className="flex-shrink-0">
              <TopLogo />
            </div>

            {/* Desktop Navigation — centered */}
            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {navLinks.map((link) => {
                if (link.children) {
                  const active = isGroupActive(link);
                  const isOpen = openDropdown === link.label;
                  return (
                    <div key={link.label} className="relative">
                      <button
                        onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-[13px] font-medium tracking-wide transition-all duration-150 ${
                          active || isOpen
                            ? 'text-text-light dark:text-white bg-gray-100 dark:bg-white/[0.06]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        {link.label}
                        <svg
                          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {/* Dropdown panel */}
                      {isOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-xl shadow-black/[0.08] overflow-hidden z-50">
                          <div className="p-1.5 flex flex-col gap-0.5">
                            {link.children.map((child) => {
                              const childActive = location.pathname === child.to || location.pathname.startsWith(child.to + '/');
                              return (
                                <NavLink
                                  key={child.to}
                                  to={child.to}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                    childActive
                                      ? 'bg-accent-green/8 dark:bg-accent-green/10'
                                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                  }`}
                                >
                                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    childActive
                                      ? 'bg-accent-green/10 text-accent-green'
                                      : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {child.icon}
                                  </span>
                                  <div>
                                    <p className={`text-[13px] font-medium ${childActive ? 'text-accent-green' : 'text-text-light dark:text-text-dark'}`}>
                                      {child.label}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5 leading-tight">
                                      {child.desc}
                                    </p>
                                  </div>
                                </NavLink>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={link.to}
                    to={link.to!}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `relative px-4 py-2 rounded-lg text-[13px] font-medium tracking-wide transition-all duration-150 ${
                        isActive
                          ? 'text-text-light dark:text-white bg-gray-100 dark:bg-white/[0.06]'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-text-light dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                aria-label="Follow us on X"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="text-[13px] font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-5 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
                  >
                    Login
                  </Link>
                  <GradientCTA to="/mobile-app" className="!px-5 !py-2 !text-[13px] !rounded-lg !shadow-none">
                    Download App
                  </GradientCTA>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay — OUTSIDE header to escape stacking context */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Panel — OUTSIDE header to escape stacking context */}
      <div
        className={`fixed top-0 right-0 z-[9999] h-full w-[320px] max-w-[85vw] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-white/[0.06] shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden overflow-y-auto ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <img src="/obi-icon.svg" alt="Obidient Movement" className="w-10 h-10" />
            <div>
              <p className="text-sm font-semibold text-text-light dark:text-text-dark">Obidient Movement</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-accent-green font-medium">For a New Nigeria</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation label */}
        <div className="px-5 pt-5 pb-2">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-accent-green">
            <span className="w-5 h-px bg-accent-green" />
            Navigate
          </span>
        </div>

        {/* Nav links — rich cards */}
        <div className="px-3 pb-4 flex flex-col gap-0.5">
          {navLinks.map((link) => {
            if (link.children) {
              const active = isGroupActive(link);
              const expanded = mobileExpanded === link.label;
              return (
                <div key={link.label}>
                  {/* Accordion trigger */}
                  <button
                    onClick={() => setMobileExpanded(expanded ? null : link.label)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      active
                        ? 'bg-accent-green/5 dark:bg-accent-green/10 border border-accent-green/20'
                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {link.icon}
                    </span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-text-light dark:text-text-dark">{link.label}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">News, updates & newsletter</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Children */}
                  {expanded && (
                    <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l-2 border-gray-100 dark:border-white/[0.06] pl-3">
                      {link.children.map((child) => {
                        const childActive = location.pathname === child.to || location.pathname.startsWith(child.to + '/');
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                              childActive
                                ? 'bg-accent-green/5 dark:bg-accent-green/10 border border-accent-green/20'
                                : 'hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {child.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-light dark:text-text-dark">{child.label}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">{child.desc}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to!}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-accent-green/5 dark:bg-accent-green/10 border border-accent-green/20'
                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent'
                  }`
                }
              >
                <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {link.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-light dark:text-text-dark">{link.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </NavLink>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-accent-green to-accent-green/80 text-white">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-80">📲 Get the App</p>
          <p className="mt-1.5 text-base font-medium leading-tight">Stay connected on the go.</p>
          <p className="mt-1 text-xs opacity-80">Download the Obidient Movement app for iOS & Android.</p>
          <Link
            to="/mobile-app"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-white text-accent-green text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Download App
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </Link>
        </div>

        {/* Bottom section — Social + Dashboard */}
        <div className="mx-4 mb-6 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-white/[0.1] hover:border-gray-300 transition-colors"
            >
              Already a member? Login
            </Link>
          )}

          {/* Social link — X */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Follow us</span>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-text-light dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicHeader;
