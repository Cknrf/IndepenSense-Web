import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationsContext";
import ProfileDrawer from "../components/ProfileDrawer/ProfileDrawer";
import Toast from "../components/Toast/Toast";
import { playAlertSound } from "../utils/sound";
import { API_BASE } from "../utils/api";
import {
  disablePush,
  enablePush,
  isPushSupported,
  setPushHandlers,
} from "../utils/push";
import "../App.css";

export type IntervalInformation = {
  batteryHealth: number;
  internetStatus: boolean;
  latitude: number;
  longitude: number;
  location: string;
};

export type AlertLog = {
  id: number;
  eventType: string;
  latitude: number;
  longitude: number;
  occuredAt: string;
  location: string;
};

export type OutletData = {
  intervalInformation: IntervalInformation | null;
  alerts: AlertLog[] | null;
};

const ALERT_HISTORY_CAP = 5;

const TITLES: Record<string, string> = {
  "/home": "Home",
  "/alerts": "Alert",
  "/location": "Location",
  "/contacts": "Contact",
  "/onboarding": "Setup",
};

type ActiveToast = {
  id: string;
  eventType: string;
  location: string;
};

const TOAST_CAP = 3;

/** How many alert IDs to remember for cross-transport toast dedup. */
const SEEN_ALERT_CAP = 100;

function ProtectedLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, activeAssistedUser, setUser, setActiveAssistedUserID } =
    useAuth();
  const { notifications, setNotifications } = useNotifications();
  const assistedUserID = activeAssistedUser?.id;
  const hasAssistedUsers = (user?.assistedUsers?.length ?? 0) > 0;
  const [intervalInformation, setIntervalInformation] =
    useState<IntervalInformation | null>(null);
  const [alerts, setAlerts] = useState<AlertLog[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const notificationsEnabledRef = useRef(notifications);
  useEffect(() => {
    notificationsEnabledRef.current = notifications;
  }, [notifications]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // An alert can reach us twice: over SSE while foregrounded, and as an FCM
  // push. Whichever lands first wins; the other is dropped.
  const seenAlertIDs = useRef<Set<number>>(new Set());

  const markAlertSeen = useCallback((alertID: number): boolean => {
    const seen = seenAlertIDs.current;
    if (seen.has(alertID)) return false;
    seen.add(alertID);
    if (seen.size > SEEN_ALERT_CAP) {
      const oldest = seen.values().next().value;
      if (oldest !== undefined) seen.delete(oldest);
    }
    return true;
  }, []);

  const showAlertToast = useCallback(
    (alert: { id: number; eventType: string; location: string }) => {
      if (!notificationsEnabledRef.current) return;
      if (!markAlertSeen(alert.id)) return;
      setToasts((prev) =>
        [
          ...prev,
          {
            id: String(alert.id),
            eventType: alert.eventType,
            location: alert.location,
          },
        ].slice(-TOAST_CAP),
      );
      playAlertSound();
    },
    [markAlertSeen],
  );

  useEffect(() => {
    setIntervalInformation(null);
    if (!assistedUserID) return;

    async function fetchIntervalInformation() {
      const response = await fetch(
        `${API_BASE}/interval-information/${assistedUserID}`,
        { credentials: "include" },
      );
      if (response.status === 401) {
        setUser(null);
        return;
      }
      if (!response.ok) return;
      const text = await response.text();
      const data = text
        ? (JSON.parse(text) as IntervalInformation | null)
        : null;
      setIntervalInformation(data);
    }

    fetchIntervalInformation();
    const intervalID = setInterval(fetchIntervalInformation, 5000);
    return () => clearInterval(intervalID);
  }, [assistedUserID, setUser]);

  useEffect(() => {
    setAlerts(null);
    if (!assistedUserID) return;

    async function fetchInitialAlerts() {
      const response = await fetch(
        `${API_BASE}/alerts/${assistedUserID}`,
        { credentials: "include" },
      );
      if (response.status === 401) {
        setUser(null);
        return;
      }
      if (!response.ok) return;
      const text = await response.text();
      const data = text ? (JSON.parse(text) as AlertLog[]) : [];
      setAlerts(data);
    }

    fetchInitialAlerts();

    const eventSource = new EventSource(
      `${API_BASE}/alerts-stream/${assistedUserID}`,
      { withCredentials: true },
    );

    eventSource.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data) as AlertLog;
        setAlerts((prev) =>
          prev ? [alert, ...prev].slice(0, ALERT_HISTORY_CAP) : [alert],
        );
        showAlertToast(alert);
      } catch (error) {
        console.error("Failed to parse SSE alert:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => eventSource.close();
  }, [assistedUserID, setUser, showAlertToast]);

  // Keep FCM registration in step with the Notifications toggle. This lives
  // here rather than in NotificationsProvider because registration needs an
  // authenticated session, and ProtectedLayout only renders when there is one.
  useEffect(() => {
    if (!isPushSupported()) return;

    let cancelled = false;

    if (notifications) {
      enablePush().then((result) => {
        // The OS permission was refused, so the toggle would be lying. Turning
        // it off also stops the in-app toasts, which is the honest reading of
        // "notifications are off" for this device.
        if (!cancelled && result === "denied") setNotifications(false);
      });
    } else {
      void disablePush();
    }

    return () => {
      cancelled = true;
    };
  }, [notifications, setNotifications]);

  // Route delivered pushes into the same UI the SSE stream feeds.
  useEffect(() => {
    if (!isPushSupported()) return;

    setPushHandlers({
      onForegroundAlert: (data) =>
        showAlertToast({
          id: data.alertId,
          eventType: data.eventType,
          location: data.location,
        }),
      onNotificationTap: (data) => {
        // Already shown by the OS — don't toast it again once SSE reconnects.
        markAlertSeen(data.alertId);
        setActiveAssistedUserID(data.assistedUserId);
        navigate("/alerts");
      },
    });

    return () => setPushHandlers({});
  }, [showAlertToast, markAlertSeen, setActiveAssistedUserID, navigate]);

  const isOnboarding = pathname.startsWith("/onboarding");
  const hideFooter = isOnboarding && !hasAssistedUsers;
  const header = TITLES[pathname] ?? "";

  return (
    <div className="main-container">
      <header className="header">
        <h2>{header}</h2>
        <button
          className="header-profile-button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open profile"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 3a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 14.2c2.5 0 4.71-1.28 6-3.22c-.03-1.99-4-3.08-6-3.08c-2.01 0-5.97 1.09-6 3.08a7.23 7.23 0 0 0 6 3.22"
            />
          </svg>
        </button>
      </header>

      <div className="main-interface">
        <Outlet
          context={{ intervalInformation, alerts } satisfies OutletData}
        />
      </div>

      {!hideFooter && (
        <footer className="footer">
          <NavLink to="/home">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19"
              />
            </svg>
            <span>Home</span>
          </NavLink>

          <NavLink to="/alerts">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
              />
            </svg>
            <span>Alerts</span>
          </NavLink>

          <NavLink to="/location">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7"
              />
            </svg>
            <span>Location</span>
          </NavLink>

          <NavLink to="/contacts">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M6 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6m9-9a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2"
              />
            </svg>
            <span>Contacts</span>
          </NavLink>
        </footer>
      )}

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toastId={toast.id}
              alert={{
                eventType: toast.eventType,
                location: toast.location,
              }}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProtectedLayout;
