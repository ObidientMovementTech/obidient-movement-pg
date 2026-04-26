import { useUserContext } from "../context/UserContext";
import { Navigate, useLocation } from "react-router";
import { isProfileComplete } from "../utils/profileCompleteness";

const COMPLETE_PROFILE_PATH = "/complete-profile";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { profile, isLoading } = useUserContext();
  const location = useLocation();

  if (isLoading) return null;

  if (!profile) {
    return <Navigate to="/auth/login" replace />;
  }

  // If profile is incomplete and user is NOT already on the completion page,
  // redirect them there. This blocks access to dashboard and all protected pages.
  if (!isProfileComplete(profile) && location.pathname !== COMPLETE_PROFILE_PATH) {
    return <Navigate to={COMPLETE_PROFILE_PATH} replace />;
  }

  // If profile IS complete but user is on the completion page, send them to dashboard.
  if (isProfileComplete(profile) && location.pathname === COMPLETE_PROFILE_PATH) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
