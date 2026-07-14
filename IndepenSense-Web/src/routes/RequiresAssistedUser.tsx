import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function RequiresAssistedUser() {
  const { user } = useAuth();
  if (!user?.assistedUsers?.length)
    return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export default RequiresAssistedUser;
