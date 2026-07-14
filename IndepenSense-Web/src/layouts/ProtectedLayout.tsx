import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

export type IntervalInformation = {
  batteryHealth: number;
  internetStatus: boolean;
  latitude: number;
  longitude: number;
  location: string;
};

const TITLES: Record<string, string> = {
  "/home": "Home",
  "/alerts": "Alert",
  "/location": "Location",
  "/contacts": "Contact",
  "/onboarding": "Setup",
};

function ProtectedLayout() {
  const { pathname } = useLocation();
  const { setUser } = useAuth();
  const [intervalInformation, setIntervalInformation] =
    useState<IntervalInformation | null>(null);

  useEffect(() => {
    async function fetchIntervalInformation() {
      const response = await fetch(
        "http://localhost:3000/web/interval-information",
        { credentials: "include" },
      );
      if (response.status === 401) {
        setUser(null);
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as IntervalInformation | null;
      setIntervalInformation(data);
    }

    fetchIntervalInformation();
    const intervalID = setInterval(fetchIntervalInformation, 5000);
    return () => clearInterval(intervalID);
  }, [setUser]);

  const isOnboarding = pathname.startsWith("/onboarding");
  const header = TITLES[pathname] ?? "";

  return (
    <div className="main-container">
      <header className="header">
        <h2>{header}</h2>
      </header>

      <div className="main-interface">
        <Outlet context={intervalInformation} />
      </div>

      {!isOnboarding && (
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
    </div>
  );
}

export default ProtectedLayout;
