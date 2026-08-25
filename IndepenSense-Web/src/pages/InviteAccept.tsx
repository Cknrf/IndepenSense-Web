import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import {
  ALREADY_LINKED_MESSAGE,
  INVALID_INVITE_MESSAGE,
  clearPendingInvite,
  holdPendingInvite,
  peekPendingInvite,
  redeemInvite,
  withAssistedUser,
  type RedeemOutcome,
} from "../utils/invites";

const ENVELOPE_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill="currentColor"
      d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
    />
  </svg>
);

/**
 * Landing page for an invite link.
 *
 * Invites live 30 minutes, so the signed-out path has to be short: hold the
 * token, send the invitee through sign-up, and redeem the moment they have a
 * session — GuestOnly routes them back here once they do. Arriving with a token
 * already held means they've consented, so it redeems on sight; a link opened
 * cold while signed in asks first.
 */
function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const { user, isLoading, setUser, setActiveAssistedUserID } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Guards against a second redeem — of a single-use token — in StrictMode. */
  const attempted = useRef(false);

  /**
   * Derived rather than state: true from the very first render at which a
   * session exists, so the automatic path can show a spinner without an extra
   * state update on mount.
   */
  const autoRedeeming =
    !isLoading && !!user && !!token && peekPendingInvite() === token;

  const applyOutcome = useCallback(
    (outcome: RedeemOutcome) => {
      switch (outcome.status) {
        case "redeemed":
          clearPendingInvite();
          setUser((prev) => withAssistedUser(prev, outcome.assistedUser));
          setActiveAssistedUserID(outcome.assistedUser.id);
          navigate("/home", { replace: true });
          return;
        case "already-linked":
          clearPendingInvite();
          setError(ALREADY_LINKED_MESSAGE);
          return;
        case "unauthenticated":
          // Session died mid-flow. Keep the token held so signing in returns.
          setError("Sign in again to accept this invite.");
          return;
        case "invalid":
          clearPendingInvite();
          setError(INVALID_INVITE_MESSAGE);
          return;
        default:
          // Nothing was consumed, unlike the outcomes above, so allow a retry.
          attempted.current = false;
          setError(
            "Something went wrong. Check your connection and try again.",
          );
      }
    },
    [setUser, setActiveAssistedUserID, navigate],
  );

  // Signed out: park the token so it survives the trip through sign-up.
  useEffect(() => {
    if (isLoading || user || !token) return;
    holdPendingInvite(token);
  }, [isLoading, user, token]);

  // Signed in, having already agreed to this invite before signing up.
  useEffect(() => {
    if (!autoRedeeming || !token || attempted.current) return;
    attempted.current = true;

    let cancelled = false;
    void (async () => {
      const outcome = await redeemInvite(token);
      if (!cancelled) applyOutcome(outcome);
    })();

    return () => {
      cancelled = true;
    };
  }, [autoRedeeming, token, applyOutcome]);

  const acceptFromButton = async () => {
    if (!token || attempted.current) return;
    attempted.current = true;
    setSubmitting(true);
    const outcome = await redeemInvite(token);
    setSubmitting(false);
    applyOutcome(outcome);
  };

  const section = (content: React.ReactNode) => (
    <div className="invite-section section">{content}</div>
  );

  if (!token) {
    return section(
      <div className="stack-container invite-component">
        <div className="message-container">
          <div className="message-information">
            <p>Invite not found</p>
            <p>That link is incomplete. Ask for a new one.</p>
          </div>
        </div>
      </div>,
    );
  }

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return section(
      <div className="stack-container invite-component">
        <div className="message-container">
          <div className="message-information">
            <p>Invite not accepted</p>
            <p>{error}</p>
          </div>
        </div>
        <div className="invite-actions">
          {user ? (
            <button
              type="button"
              className="submit-button"
              onClick={() => navigate("/home", { replace: true })}
            >
              Continue
            </button>
          ) : (
            <Link className="submit-button" to="/signin">
              Sign in
            </Link>
          )}
        </div>
      </div>,
    );
  }

  if (autoRedeeming || submitting) return <LoadingSpinner />;

  if (!user) {
    return section(
      <div className="stack-container invite-component">
        <div className="message-container">
          <div className="icon-container">{ENVELOPE_ICON}</div>
          <div className="message-information">
            <p>You&apos;ve been invited</p>
            <p>
              Someone wants you to help monitor the person they assist. Create
              an account or sign in, and the invite is accepted straight away.
            </p>
          </div>
        </div>
        <div className="invite-actions">
          <Link className="submit-button" to="/signup">
            Create an account
          </Link>
          <Link className="submit-button secondary" to="/signin">
            I already have one
          </Link>
        </div>
        <p className="form-hint invite-expiry-note">
          Invites expire 30 minutes after they&apos;re created, so it&apos;s
          worth doing this now.
        </p>
      </div>,
    );
  }

  return section(
    <div className="stack-container invite-component">
      <div className="message-container">
        <div className="icon-container">{ENVELOPE_ICON}</div>
        <div className="message-information">
          <p>Accept this invite?</p>
          <p>
            You&apos;ll be able to see this person&apos;s location, alerts and
            contacts. Everyone already watching them is told that you joined.
          </p>
        </div>
      </div>
      <div className="invite-actions">
        <button
          type="button"
          className="submit-button"
          onClick={() => void acceptFromButton()}
        >
          Accept invite
        </button>
        <button
          type="button"
          className="submit-button secondary"
          onClick={() => navigate("/home", { replace: true })}
        >
          Not now
        </button>
      </div>
    </div>,
  );
}

export default InviteAccept;
