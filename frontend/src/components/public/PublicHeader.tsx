import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router';
import TopLogo from '../TopLogo';
import { useUser } from '../../context/UserContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
];

const PublicHeader = () => {
  const { profile } = useUser();
  const isLoggedIn = !!profile;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white dark:bg-background-dark border-b transition-shadow duration-200 ${
        scrolled ? 'shadow-sm border-gray-200 dark:border-gray-700' : 'border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <TopLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors pb-1 ${
                    isActive
                      ? 'text-accent-green after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent-green'
                      : 'text-gray-600 dark:text-gray-300 hover:text-accent-green'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium bg-accent-green text-white px-5 py-2.5 rounded-lg hover:bg-accent-green/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent-green transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="text-sm font-medium bg-accent-green text-white px-5 py-2.5 rounded-lg hover:bg-accent-green/90 transition-colors"
                >
                  Join the Movement
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-background-dark shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-gray-700 dark:text-gray-300"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col px-6 gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `text-base font-medium py-3 border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  isActive
                    ? 'text-accent-green'
                    : 'text-gray-700 dark:text-gray-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="mt-6 flex flex-col gap-3">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-medium bg-accent-green text-white py-2.5 rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/auth/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-sm font-medium bg-accent-green text-white py-2.5 rounded-lg"
                >
                  Join the Movement
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
