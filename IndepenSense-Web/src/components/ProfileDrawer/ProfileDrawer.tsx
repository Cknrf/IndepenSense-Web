import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import "./ProfileDrawer.css";

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, activeAssistedUser, setActiveAssistedUserID, signOut } =
    useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, toggleNotifications } = useNotifications();
  const navigate = useNavigate();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handleAddAssistedUser = () => {
    onClose();
    navigate("/onboarding");
  };

  const handleConfirmSignOut = async () => {
    await signOut();
    setConfirmSignOut(false);
    onClose();
    navigate("/signin");
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmSignOut) {
        setConfirmSignOut(false);
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, confirmSignOut]);

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

              <section className="profile-drawer-section">
                <div className="profile-drawer-section-header">
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
                  <span>ASSISTED USERS</span>
                </div>

                <div className="profile-drawer-assisted-card">
                  {user.assistedUsers.length === 0 ? (
                    <p className="profile-drawer-empty">
                      No assisted users linked yet.
                    </p>
                  ) : (
                    <ul className="profile-drawer-assisted-list">
                      {user.assistedUsers.map((au) => {
                        const isActive = au.id === activeAssistedUser?.id;
                        return (
                          <li key={au.id}>
                            <button
                              type="button"
                              className={`profile-drawer-assisted-item${isActive ? " active" : ""}`}
                              onClick={() => setActiveAssistedUserID(au.id)}
                            >
                              <span>{au.name}</span>
                              {isActive && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="1em"
                                  height="1em"
                                  viewBox="0 0 24 24"
                                  aria-label="active"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M9 20.42L2.79 14.21l2.83-2.83L9 14.77l9.88-9.89l2.83 2.83z"
                                  />
                                </svg>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <button
                    type="button"
                    className="profile-drawer-add-button"
                    onClick={handleAddAssistedUser}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                    </svg>
                    <span>Add assisted user</span>
                  </button>
                </div>
              </section>

              <section className="profile-drawer-section">
                <div className="profile-drawer-section-header">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6A3.6 3.6 0 0 1 8.4 12A3.6 3.6 0 0 1 12 8.4a3.6 3.6 0 0 1 3.6 3.6a3.6 3.6 0 0 1-3.6 3.6"
                    />
                  </svg>
                  <span>SETTINGS</span>
                </div>

                <div className="profile-drawer-settings-card">
                  <div className="profile-drawer-settings-row">
                    <div className="profile-drawer-settings-label">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z"
                        />
                      </svg>
                      <span>Notifications</span>
                    </div>
                    <label className="profile-drawer-toggle">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={toggleNotifications}
                      />
                      <span className="profile-drawer-toggle-slider" />
                    </label>
                  </div>
                  <div className="profile-drawer-settings-row">
                    <div className="profile-drawer-settings-label">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26a5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1"
                        />
                      </svg>
                      <span>Dark theme</span>
                    </div>
                    <label className="profile-drawer-toggle">
                      <input
                        type="checkbox"
                        checked={theme === "dark"}
                        onChange={toggleTheme}
                      />
                      <span className="profile-drawer-toggle-slider" />
                    </label>
                  </div>
                </div>
              </section>

              <button
                type="button"
                className="profile-drawer-signout-button"
                onClick={() => setConfirmSignOut(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M17 8l-1.4 1.4l2.6 2.6H8v2h10.2l-2.6 2.6L17 18l5-5zM4 6h8V4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8v-2H4z"
                  />
                </svg>
                <span>Log out</span>
              </button>
            </>
          )}
        </div>

        {confirmSignOut && (
          <div
            className="profile-drawer-confirm-overlay"
            onClick={() => setConfirmSignOut(false)}
          >
            <div
              className="profile-drawer-confirm-dialog"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="signout-confirm-title"
            >
              <h3 id="signout-confirm-title">Log out?</h3>
              <p>You'll be signed out and returned to the sign-in page.</p>
              <div className="profile-drawer-confirm-actions">
                <button
                  type="button"
                  className="profile-drawer-confirm-cancel"
                  onClick={() => setConfirmSignOut(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="profile-drawer-confirm-confirm"
                  onClick={handleConfirmSignOut}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default ProfileDrawer;
