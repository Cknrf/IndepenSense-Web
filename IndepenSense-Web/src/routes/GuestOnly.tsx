import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function GuestOnly() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}

export default GuestOnly;
