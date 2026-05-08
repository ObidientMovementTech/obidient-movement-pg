import { Link } from 'react-router';
import type { ReactNode } from 'react';

interface GradientCTAProps {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-5 py-2.5 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

const GradientCTA = ({ to, href, onClick, children, className = '', type = 'button', size = 'md' }: GradientCTAProps) => {
  const baseClasses = `btn-gradient-cta inline-flex items-center justify-center gap-3 text-white ${sizeClasses[size]} rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
};

export default GradientCTA;
