import { useEffect } from "react";
import type { ReactNode } from "react";
import "./ProfileDrawer.css";

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
};

function ProfileDrawer({ open, onClose, children }: ProfileDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`profile-drawer-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`profile-drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <div className="profile-drawer-header">
          <h2>Profile</h2>
          <button
            className="profile-drawer-close"
            onClick={onClose}
            aria-label="Close profile"
            type="button"
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
        <div className="profile-drawer-body">{children}</div>
      </aside>
    </>
  );
}

export default ProfileDrawer;
