import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

type NotificationsContextValue = {
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  toggleNotifications: () => void;
};

const STORAGE_KEY = "indepensense.notifications";

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotificationsState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(notifications));
  }, [notifications]);

  // Memoized: ProtectedLayout's push registration effect depends on these
  // identities, and re-running it would churn native FCM registration.
  const setNotifications = useCallback(
    (value: boolean) => setNotificationsState(value),
    [],
  );
  const toggleNotifications = useCallback(
    () => setNotificationsState((prev) => !prev),
    [],
  );

  return (
    <NotificationsContext.Provider
      value={{ notifications, setNotifications, toggleNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside <NotificationsProvider>",
    );
  return ctx;
}
