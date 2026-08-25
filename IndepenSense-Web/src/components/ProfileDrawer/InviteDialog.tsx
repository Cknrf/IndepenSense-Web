import { useEffect, useRef, useState } from "react";
import type { AssistedUserSummary } from "../../contexts/AuthContext";
import { inviteLink, mintInvite, type MintedInvite } from "../../utils/invites";

type InviteDialogProps = {
  assistedUser: AssistedUserSummary;
  onClose: () => void;
};

/** How long the "Copied" acknowledgement stays up. */
const COPIED_FEEDBACK_MS = 1500;

function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Mints an invite and shows it once.
 *
 * The token is stored hashed server-side and can never be retrieved again, so
 * this dialog is the only place it will ever exist — hence the copy buttons and
 * the blunt warning. Losing one costs nothing; minting another is cheap.
 */
function InviteDialog({ assistedUser, onClose }: InviteDialogProps) {
  const [invite, setInvite] = useState<MintedInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [now, setNow] = useState(() => Date.now());
  /** Bumped to mint again; also the mint effect's only trigger. */
  const [attempt, setAttempt] = useState(0);

  /**
   * Minting is not idempotent — each call burns a token — so StrictMode's
   * double-invoked effect must not run it twice.
   */
  const mintedFor = useRef(-1);

  useEffect(() => {
    if (mintedFor.current === attempt) return;
    mintedFor.current = attempt;

    let cancelled = false;
    void (async () => {
      try {
        const minted = await mintInvite(assistedUser.id);
        if (cancelled) return;
        setInvite(minted);
        setNow(Date.now());
      } catch (mintError) {
        console.error("Failed to create invite:", mintError);
        if (cancelled) return;
        setError(
          "Couldn't create an invite. Check your connection and try again.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [assistedUser.id, attempt]);

  const mintAgain = () => {
    setInvite(null);
    setError(null);
    setAttempt((prev) => prev + 1);
  };

  // Users otherwise send the token and expect it to work tomorrow.
  useEffect(() => {
    if (!invite) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [invite]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const copy = async (value: string, which: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch (copyError) {
      // Insecure context or a denied permission — the value is on screen and
      // selectable, so this is a downgrade rather than a failure.
      console.error("Clipboard write failed:", copyError);
    }
  };

  const expiresAt = invite ? new Date(invite.expiresAt).getTime() : 0;
  const msRemaining = expiresAt - now;
  const hasExpired = Boolean(invite) && msRemaining <= 0;

  return (
    <div className="profile-drawer-confirm-overlay" onClick={onClose}>
      <div
        className="profile-drawer-confirm-dialog invite-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
      >
        <h3 id="invite-dialog-title">Invite a guardian</h3>

        {error && (
          <>
            <p className="invite-dialog-error">{error}</p>
            <div className="profile-drawer-confirm-actions">
              <button
                type="button"
                className="profile-drawer-confirm-cancel"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="profile-drawer-confirm-confirm"
                onClick={mintAgain}
              >
                Try again
              </button>
            </div>
          </>
        )}

        {!error && !invite && <p>Creating an invite…</p>}

        {!error && invite && (
          <>
            <p>
              Send this to whoever should also be able to see{" "}
              <strong>{assistedUser.name}</strong>. It works once, for one
              person.
            </p>

            <div className="invite-dialog-field">
              <span className="invite-dialog-label">Invite link</span>
              <div className="invite-dialog-value-row">
                <code className="invite-dialog-value invite-dialog-link">
                  {inviteLink(invite.token)}
                </code>
                <button
                  type="button"
                  className="invite-dialog-copy"
                  onClick={() => void copy(inviteLink(invite.token), "link")}
                >
                  {copied === "link" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="invite-dialog-field">
              <span className="invite-dialog-label">Or the code alone</span>
              <div className="invite-dialog-value-row">
                <code className="invite-dialog-value invite-dialog-code">
                  {invite.token}
                </code>
                <button
                  type="button"
                  className="invite-dialog-copy"
                  onClick={() => void copy(invite.token, "code")}
                >
                  {copied === "code" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <p
              className={`invite-dialog-expiry${hasExpired ? " expired" : ""}`}
            >
              {hasExpired
                ? "This invite has expired. Create a new one."
                : `Expires in ${formatCountdown(msRemaining)}`}
            </p>

            <p className="invite-dialog-warning">
              This is the only time the code is shown. If you lose it, just
              create another one.
            </p>

            <div className="profile-drawer-confirm-actions">
              <button
                type="button"
                className="profile-drawer-confirm-cancel"
                onClick={mintAgain}
              >
                New invite
              </button>
              <button
                type="button"
                className="profile-drawer-confirm-confirm"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InviteDialog;
