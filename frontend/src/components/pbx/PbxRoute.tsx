import { Navigate } from 'react-router';
import { useUser } from '../../context/UserContext';

const COORDINATOR_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
];

/**
 * Route-level protection for /pbx/* routes.
 * Only admins and coordinators can access the admin dashboard.
 */
export default function PbxRoute({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-700 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth/login" replace />;
  }

  const isCoordinator = profile.designation && COORDINATOR_DESIGNATIONS.includes(profile.designation);

  if (profile.role !== 'admin' && !isCoordinator) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
