import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Guardian = {
  name: string;
  assisstedUserID: number;
  role: string;
  contactNumber: string;
  email: string;
  username: string;
};

type AuthContextValue = {
  user: Guardian | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const STORAGE_KEY = "indepensense.user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Guardian | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Guardian) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signIn = async (username: string, password: string) => {
    const response = await fetch("http://localhost:3000/web/signin", {
      method: "POST",
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

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
