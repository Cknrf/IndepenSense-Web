import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { AssistedUserSummary } from "../../contexts/AuthContext";
import { API_BASE } from "../../utils/api";
import { withAssistedUser } from "../../utils/invites";
import BackButton from "./BackButton";

type AssistedUserProps = {
  onDone: () => void;
  onBack: () => void;
};

/**
 * Deliberately one message for a wrong code, an already-claimed device, and a
 * revoked one: telling them apart would let someone probe for live devices.
 */
const INVALID_PAIRING_CODE_MESSAGE =
  "That code isn't valid, or this device has already been set up by someone else.";

function AssistedUser({ onDone, onBack }: AssistedUserProps) {
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmission = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/create-assisted-user-account`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        // Sent as typed: the server normalises case, hyphens and spaces.
        body: JSON.stringify({ name, pairingCode }),
      });

      if (response.status === 400) {
        setError(INVALID_PAIRING_CODE_MESSAGE);
        return;
      }
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Server responded: ${response.status} ${body}`);
      }

      const created = (await response.json()) as AssistedUserSummary;
      setUser((prev) => withAssistedUser(prev, created));
      onDone();
    } catch (submitError) {
      console.error("Creation of Assisted User Account Failed:", submitError);
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setSubmitting(false);
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
              d="m6 22.5l-1.6-1.2L7 17.825V12.5q0-.775.138-1.713T7.5 9.1L6 9.95v3.55H4V8.8l5.4-3.075q.2-.125.425-.175t.475-.05q.6 0 1.1.3t.75.825l.775 1.675q.5 1.1 1.525 1.65t2.55.55v2h-.975l5.475 9.55l-.875.5L14.7 12.225q-1-.325-1.812-.937T11.5 9.8q-.25.725-.387 1.663t-.088 1.737L13 16v6.5h-2v-5l-1.775-2.55L9 18.5zm4.088-18.088Q9.5 3.825 9.5 3t.588-1.412T11.5 1t1.413.588T13.5 3t-.587 1.413T11.5 5t-1.412-.587"
            />
          </svg>
        </div>
        <div className="message-information">
          <p>Set up a new device</p>
          <p>Use the pairing code from the device's manual</p>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmission}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter assisted user's name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pairing-code">Pairing code</label>
            <input
              type="text"
              name="pairingCode"
              id="pairing-code"
              placeholder="EYVN-KB5C-SZV4"
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value)}
            />
            <p className="form-hint">
              Printed in the manual that came with the device. Hyphens, spaces
              and capitals don't matter.
            </p>
          </div>

          {error && <p className="form-error">{error}</p>}

          <input
            className="submit-button"
            type="submit"
            value={submitting ? "Setting up…" : "Set up device"}
            disabled={submitting}
          />
        </form>
      </div>
    </div>
  );
}

export default AssistedUser;
