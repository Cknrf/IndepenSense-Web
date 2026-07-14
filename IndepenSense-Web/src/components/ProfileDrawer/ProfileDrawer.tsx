import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import "./ProfileDrawer.css";

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, activeAssistedUser, setActiveAssistedUserID } = useAuth();
  const navigate = useNavigate();

  const handleAddAssistedUser = () => {
    onClose();
    navigate("/onboarding");
  };

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
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default ProfileDrawer;
