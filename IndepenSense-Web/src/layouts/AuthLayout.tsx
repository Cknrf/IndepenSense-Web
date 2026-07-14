import { Outlet, useLocation } from "react-router";
import "../Authentication.css";

function AuthLayout() {
  const { pathname } = useLocation();
  const title = pathname === "/signup" ? "Sign Up" : "Sign In";

  return (
    <div className="main-container">
      <header className="header">
        <h2>{title}</h2>
      </header>
      <div className="main-interface">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
