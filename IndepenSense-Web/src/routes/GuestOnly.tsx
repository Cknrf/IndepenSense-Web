import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { peekPendingInvite } from "../utils/invites";

function GuestOnly() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (user) {
    // The single place post-authentication routing is decided, so signing in
    // and signing up can't race their own redirects against this one. An
    // invitee who came in through a link is returned to it to redeem.
    const pending = peekPendingInvite();
    return (
      <Navigate
        to={pending ? `/invite/${encodeURIComponent(pending)}` : "/home"}
        replace
      />
    );
  }
  return <Outlet />;
}

export default GuestOnly;
