import { useState } from "react";
import { useNavigate } from "react-router";
import type { Guardian } from "./Signup";
import { API_BASE } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  CONTACT_NUMBER_HELP,
  normalizePhilippineMobile,
} from "../../utils/phone";
import BackButton from "./BackButton";

type SetDetail = {
  guardian: Guardian;
  onSetCredential: React.Dispatch<React.SetStateAction<Guardian>>;
  onBack: () => void;
};

type CreateResult = {
  ok: boolean;
  /**
   * The backend's own message. Both failure modes are a 400 differing only by
   * this string, so it is the only thing worth showing the user.
   */
  message?: string;
};

function Detail({ guardian, onSetCredential, onBack }: SetDetail) {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [contactError, setContactError] = useState<string | null>(null);
  const [normalizedContact, setNormalizedContact] = useState<string | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      // Clearing rather than re-checking: the number is invalid for most of the
      // time it is being typed, so keystroke validation would nag.
      setContactError(null);
      setNormalizedContact(null);
    }

    onSetCredential((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /** Returns the E.164 form, or null having displayed the reason. */
  const validateContactNumber = (): string | null => {
    const normalized = normalizePhilippineMobile(guardian.contactNumber);

    if (!normalized) {
      setNormalizedContact(null);
      setContactError(CONTACT_NUMBER_HELP);
      return null;
    }

    setContactError(null);
    setNormalizedContact(normalized);
    return normalized;
  };

  const handleContactBlur = () => {
    // An untouched empty field isn't a mistake yet; `required` catches it on
    // submit. Complaining at someone who only tabbed past is noise.
    if (!guardian.contactNumber.trim()) return;
    validateContactNumber();
  };

  async function createGuardian(contactNumber: string): Promise<CreateResult> {
    const response = await fetch(`${API_BASE}/create-guardian-account`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: guardian.name,
        role: guardian.role,
        // Normalised, so client and server store the same thing.
        contactNumber,
        email: guardian.email,
        username: guardian.username,
        password: guardian.password,
      }),
    });

    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!response.ok) {
      return { ok: false, message: body?.message };
    }
    return { ok: true };
  }

  const handleSubmission = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const contactNumber = validateContactNumber();
    if (!contactNumber) return;

    setSubmitting(true);

    let result: CreateResult;
    try {
      result = await createGuardian(contactNumber);
    } catch (error) {
      console.error("createGuardian failed:", error);
      setSubmitting(false);
      setFormError(
        "Couldn't reach the server. Check your connection and try again.",
      );
      return;
    }

    if (!result.ok) {
      // The client check is a convenience, not the authority: the backend can
      // still reject this — a duplicate username only exists server-side — so
      // show what it said rather than a guess.
      setSubmitting(false);
      setFormError(
        result.message ?? "Something went wrong while creating the account.",
      );
      return;
    }

    // Sign in with the credentials already in hand rather than sending them to
    // the sign-in screen. An invitee reaches this page mid-redemption, and the
    // invite expires in 30 minutes — a manual sign-in is a step they can't
    // afford. GuestOnly does the routing from here, invite or not.
    try {
      await signIn(guardian.username, guardian.password);
    } catch (error) {
      // The account does exist at this point, so say so rather than implying
      // the sign-up failed.
      console.error("Sign in after sign up failed:", error);
      alert("Your account was created. Please sign in.");
      navigate("/signin");
    }
  };

  return (
    <div className="stack-container detail-component">
      <BackButton onBack={onBack} label="Back to credentials" />
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
              d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.913T12 22"
            />
          </svg>
        </div>
        <div className="message-information">
          <p>Your Information</p>
          <p>Enter your details</p>
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
              placeholder="Enter your full name"
              required
              value={guardian?.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              required
              value={guardian?.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              id="contactNumber"
              placeholder="09171234567"
              required
              autoComplete="tel"
              aria-invalid={Boolean(contactError)}
              aria-describedby="contact-number-feedback"
              value={guardian?.contactNumber}
              onChange={handleChange}
              onBlur={handleContactBlur}
            />
            <p
              id="contact-number-feedback"
              className={
                contactError
                  ? "form-error"
                  : normalizedContact
                    ? "form-confirm"
                    : "form-hint"
              }
            >
              {contactError ??
                (normalizedContact
                  ? `Will be saved as ${normalizedContact}`
                  : "Philippine mobile number — the device texts emergency alerts here.")}
            </p>
          </div>

          <div>
            <label htmlFor="role">Role</label>
            <input
              type="text"
              name="role"
              id="role"
              placeholder="Enter your role"
              required
              value={guardian?.role}
              onChange={handleChange}
            />
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <input
            className="submit-button"
            type="submit"
            value={submitting ? "Creating account…" : "Create account"}
            disabled={submitting}
          />
        </form>
      </div>
    </div>
  );
}

export default Detail;
