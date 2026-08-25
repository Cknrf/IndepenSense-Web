import { Outlet, useLocation } from "react-router";
import "../Authentication.css";

function AuthLayout() {
  const { pathname } = useLocation();
  const title = pathname.startsWith("/invite")
    ? "Invitation"
    : pathname === "/signup"
      ? "Sign Up"
      : "Sign In";

  return (
    <div className="main-container">
      <header className="header header-centered">
        <h2>{title}</h2>
      </header>
      <div className="main-interface">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
