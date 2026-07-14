import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function RequiresAssistedUser() {
  const { user } = useAuth();
  if (!user?.assisstedUserID) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export default RequiresAssistedUser;
