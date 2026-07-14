import { Navigate, Outlet, useOutletContext } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function RequiresAssistedUser() {
  const { user } = useAuth();
  const parentContext = useOutletContext();
  if (!user?.assistedUsers?.length)
    return <Navigate to="/onboarding" replace />;
  return <Outlet context={parentContext} />;
}

export default RequiresAssistedUser;
