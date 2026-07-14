import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export type AssistedUserSummary = {
  id: number;
  name: string;
};

export type Guardian = {
  name: string;
  assistedUsers: AssistedUserSummary[];
  role: string;
  contactNumber: string;
  email: string;
  username: string;
};

type AuthContextValue = {
  user: Guardian | null;
  isLoading: boolean;
  activeAssistedUser: AssistedUserSummary | null;
  setActiveAssistedUserID: (id: number) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: Dispatch<SetStateAction<Guardian | null>>;
};

const API_BASE = "http://localhost:3000/web";
const ACTIVE_ASSISTED_USER_KEY = "indepensense.activeAssistedUserID";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Guardian | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssistedUserID, setActiveAssistedUserIDState] = useState<
    number | null
  >(() => {
    const stored = localStorage.getItem(ACTIVE_ASSISTED_USER_KEY);
    if (!stored) return null;
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? null : parsed;
  });

  useEffect(() => {
    if (activeAssistedUserID === null) {
      localStorage.removeItem(ACTIVE_ASSISTED_USER_KEY);
    } else {
      localStorage.setItem(
        ACTIVE_ASSISTED_USER_KEY,
        String(activeAssistedUserID),
      );
    }
  }, [activeAssistedUserID]);

  const setActiveAssistedUserID = (id: number) =>
    setActiveAssistedUserIDState(id);

  const activeAssistedUser =
    user?.assistedUsers?.find((u) => u.id === activeAssistedUserID) ??
    user?.assistedUsers?.[0] ??
    null;

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const guardian = (await response.json()) as Guardian;
      setUser(guardian);
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const signIn = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE}/signin`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Sign in failed: ${response.status} ${body}`);
    }

    const guardian = (await response.json()) as Guardian;
    setUser(guardian);
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE}/signout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeAssistedUser,
        setActiveAssistedUserID,
        signIn,
        signOut,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
