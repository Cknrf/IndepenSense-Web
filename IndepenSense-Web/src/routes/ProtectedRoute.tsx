import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/signin" replace />;
  return <Outlet />;
}

export default ProtectedRoute;
