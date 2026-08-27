import { useCallback, useEffect, useState } from "react";
import "./Toast.css";

/**
 * "alert" is an emergency from the assisted user's device; "warning" is a
 * non-urgent device notice (low battery, offline); "info" is an account notice
 * such as another guardian gaining access. They differ in colour, icon, and
 * where tapping them leads — the destination is the caller's to decide.
 */
export type ToastKind = "alert" | "warning" | "info";

type ToastProps = {
  toastId: string;
  kind: ToastKind;
  title: string;
  body: string;
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
};

const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 200;

function Toast({ toastId, kind, title, body, onOpen, onDismiss }: ToastProps) {
  const [leaving, setLeaving] = useState(false);

  const dismissWithExit = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toastId), EXIT_ANIMATION_MS);
  }, [toastId, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismissWithExit, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismissWithExit]);

  const handleOpen = () => {
    dismissWithExit();
    onOpen(toastId);
  };

  return (
    <div className={`toast ${kind}${leaving ? " leaving" : ""}`} role="alert">
      <button type="button" className="toast-body" onClick={handleOpen}>
        <div className="toast-icon">
          {kind !== "info" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M16 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4M8 6a3 3 0 0 1 3 3c0 .79-.31 1.5-.81 2.03A4.99 4.99 0 0 0 8 15a4.99 4.99 0 0 0-2.19-3.97A2.99 2.99 0 0 1 5 9a3 3 0 0 1 3-3m8 8c2.67 0 8 1.34 8 4v2h-8v-2c0-1.4-.61-2.62-1.55-3.5c.53-.32 1.09-.5 1.55-.5M8 13c2.67 0 8 1.34 8 4v2H0v-2c0-2.66 5.33-4 8-4"
              />
            </svg>
          )}
        </div>
        <div className="toast-content">
          <p className="toast-title">{title}</p>
          <p className="toast-message">{body}</p>
        </div>
      </button>
      <button
        type="button"
        className="toast-close"
        onClick={dismissWithExit}
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
          />
        </svg>
      </button>
    </div>
  );
}

export default Toast;
