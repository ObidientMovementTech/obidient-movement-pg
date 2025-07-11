import { useUserContext } from "../context/UserContext";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { profile, isLoading } = useUserContext();

  if (isLoading) return null;

  if (!profile) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
