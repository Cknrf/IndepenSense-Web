import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function GuestOnly() {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}

export default GuestOnly;
