import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  ALREADY_LINKED_MESSAGE,
  INVALID_INVITE_MESSAGE,
  clearPendingInvite,
  redeemInvite,
  withAssistedUser,
} from "../../utils/invites";
import BackButton from "./BackButton";

type RedeemInviteProps = {
  onDone: () => void;
  onBack: () => void;
};

/**
 * Manual invite entry, for someone who was sent the code rather than the link.
 * The link route (/invite/:token) is the same redemption with the token filled
 * in already.
 */
function RedeemInvite({ onDone, onBack }: RedeemInviteProps) {
  const { setUser, setActiveAssistedUserID } = useAuth();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmission = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const outcome = await redeemInvite(token);
    setSubmitting(false);

    switch (outcome.status) {
      case "redeemed":
        clearPendingInvite();
        setUser((prev) => withAssistedUser(prev, outcome.assistedUser));
        setActiveAssistedUserID(outcome.assistedUser.id);
        onDone();
        return;
      case "already-linked":
        setError(ALREADY_LINKED_MESSAGE);
        return;
      case "unauthenticated":
        setError("Your session expired. Sign in again to accept this invite.");
        return;
      case "invalid":
        setError(INVALID_INVITE_MESSAGE);
        return;
      default:
        setError("Something went wrong. Check your connection and try again.");
    }
  };

  return (
    <div className="stack-container assisted-user-component">
      <BackButton onBack={onBack} label="Back to setup options" />
      <div className="message-container">
        <div className="icon-container">
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
        </div>
        <div className="message-information">
          <p>Accept an invite</p>
          <p>Enter the code another guardian sent you</p>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmission}>
          <div>
            <label htmlFor="invite-token">Invite code</label>
            <input
              type="text"
              name="token"
              id="invite-token"
              placeholder="TEK1-PMV9-6Y09"
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="form-hint">
              Invites expire 30 minutes after they're created and work only
              once.
            </p>
          </div>

          {error && <p className="form-error">{error}</p>}

          <input
            className="submit-button"
            type="submit"
            value={submitting ? "Accepting…" : "Accept invite"}
            disabled={submitting}
          />
        </form>
      </div>
    </div>
  );
}

export default RedeemInvite;
