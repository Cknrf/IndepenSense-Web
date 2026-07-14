import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./ProfileDrawer.css";

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user } = useAuth();

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
        <div className="profile-drawer-body">
          {user && (
            <>
              <section className="profile-drawer-identity">
                <div className="profile-drawer-identity-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.913T12 22"
                    />
                  </svg>
                </div>
                <div className="profile-drawer-identity-text">
                  <h3>{user.name}</h3>
                  <p>{user.role}</p>
                </div>
              </section>

              <section className="profile-drawer-details">
                <div className="profile-drawer-details-row">
                  <span className="profile-drawer-details-label">Username</span>
                  <span className="profile-drawer-details-value">
                    {user.username}
                  </span>
                </div>
                <div className="profile-drawer-details-row">
                  <span className="profile-drawer-details-label">Email</span>
                  <span className="profile-drawer-details-value">
                    {user.email}
                  </span>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default ProfileDrawer;
