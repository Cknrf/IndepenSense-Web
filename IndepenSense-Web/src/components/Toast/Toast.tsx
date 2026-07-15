import { useEffect } from "react";
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

function Toast({ toastId, alert, onDismiss }: ToastProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toastId), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toastId, onDismiss]);

  const handleOpen = () => {
    onDismiss(toastId);
    navigate("/alerts");
  };

  return (
    <div className="toast" role="alert">
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
        onClick={() => onDismiss(toastId)}
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59z"
          />
        </svg>
      </button>
    </div>
  );
}

export default Toast;
