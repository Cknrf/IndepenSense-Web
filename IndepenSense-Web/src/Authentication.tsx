import "./Authentication.css";
import Signin from "./components/Signin/Signin";

function Authentication() {
  return (
    <div className="main-container">
      <header className="header">
        <h2>Sign In</h2>
      </header>
      <div className="main-interface">
        {/* Sign In Section */}
        <Signin></Signin>
      </div>
    </div>
  );
}

export default Authentication;
