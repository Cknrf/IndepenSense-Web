import { useState } from "react";
import "./Authentication.css";
import Signin from "./components/Signin/Signin";
import Signup from "./components/Signup/Signup";

function Authentication() {
  const [activeSection, setActiveSection] = useState("sign-up-section");

  return (
    <div className="main-container">
      <header className="header">
        <h2>Sign In</h2>
      </header>
      <div className="main-interface">
        {/* Sign In Section */}
        {activeSection === "sign-in-section" && (
          <Signin onSetActiveSection={setActiveSection}></Signin>
        )}

        {/* Sign Up Section */}
        {activeSection === "sign-up-section" && (
          <Signup onSetActiveSection={setActiveSection}></Signup>
        )}
      </div>
    </div>
  );
}

export default Authentication;
