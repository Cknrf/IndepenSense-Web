import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./Toast.css";

export type ToastAlert = {
  eventType: string;
  location: string;
};

type ToastProps = {
  toastId: string;
  alert: ToastAlert;
  onDismiss: (id: string) => void;
};

const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 200;

function Toast({ toastId, alert, onDismiss }: ToastProps) {
  const navigate = useNavigate();
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
    navigate("/alerts");
  };

  return (
    <div className={`toast${leaving ? " leaving" : ""}`} role="alert">
      <button type="button" className="toast-body" onClick={handleOpen}>
        <div className="toast-icon">
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
        </div>
        <div className="toast-content">
          <p className="toast-title">{alert.eventType}</p>
          <p className="toast-location">{alert.location}</p>
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
