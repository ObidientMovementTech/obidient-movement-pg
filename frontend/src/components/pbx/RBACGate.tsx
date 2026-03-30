import type { ReactNode } from 'react';
import { useUser } from '../../context/UserContext';

const COORDINATOR_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
];

const DESIGNATION_LEVELS: Record<string, number> = {
  'National Coordinator': 4,
  'State Coordinator': 3,
  'LGA Coordinator': 2,
  'Ward Coordinator': 1,
  'Polling Unit Agent': 0,
};

interface RBACGateProps {
  /** Exact roles allowed (e.g., ['admin']) */
  allowedRoles?: string[];
  /** Exact designations allowed */
  allowedDesignations?: string[];
  /** Minimum designation level: users at this level or above can see the content */
  minimumLevel?: 'national' | 'state' | 'lga' | 'ward' | 'pu';
  /** Content to render when authorized */
  children: ReactNode;
  /** Fallback to render when not authorized (defaults to null) */
  fallback?: ReactNode;
}

const LEVEL_MAP: Record<string, number> = {
  national: 4,
  state: 3,
  lga: 2,
  ward: 1,
  pu: 0,
};

export default function RBACGate({
  allowedRoles,
  allowedDesignations,
  minimumLevel,
  children,
  fallback = null,
}: RBACGateProps) {
  const { profile } = useUser();

  if (!profile) return <>{fallback}</>;

  // Admins always pass
  if (profile.role === 'admin') return <>{children}</>;

  // Check by explicit role
  if (allowedRoles && allowedRoles.includes(profile.role)) {
    return <>{children}</>;
  }

  // Check by explicit designation
  if (allowedDesignations && profile.designation && allowedDesignations.includes(profile.designation)) {
    return <>{children}</>;
  }

  // Check by minimum level
  if (minimumLevel && profile.designation) {
    const requiredLevel = LEVEL_MAP[minimumLevel] ?? -1;
    const userLevel = DESIGNATION_LEVELS[profile.designation] ?? -1;
    if (userLevel >= requiredLevel) {
      return <>{children}</>;
    }
  }

  return <>{fallback}</>;
}

/** Helper to check RBAC programmatically (for non-component use) */
export function hasAccess(
  profile: { role: string; designation?: string } | null,
  opts: { allowedRoles?: string[]; allowedDesignations?: string[]; minimumLevel?: string }
): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  if (opts.allowedRoles?.includes(profile.role)) return true;
  if (opts.allowedDesignations && profile.designation && opts.allowedDesignations.includes(profile.designation)) return true;
  if (opts.minimumLevel && profile.designation) {
    const required = LEVEL_MAP[opts.minimumLevel] ?? -1;
    const userLvl = DESIGNATION_LEVELS[profile.designation] ?? -1;
    if (userLvl >= required) return true;
  }
  return false;
}

export { COORDINATOR_DESIGNATIONS, DESIGNATION_LEVELS };
