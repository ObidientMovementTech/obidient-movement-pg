import { Navigate } from "react-router";
import { useUserContext } from "../context/UserContext";

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { profile, isLoading } = useUserContext();

  if (isLoading) {
    return null;
  }

  if (!profile) {
    return <Navigate to="/auth/login" replace />;
  }

  if (profile.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
