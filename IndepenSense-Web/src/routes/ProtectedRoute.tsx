import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/signin" replace />;
  return <Outlet />;
}

export default ProtectedRoute;
