type SetActiveSection = {
  onSetActiveSection: (section: string) => void;
};

function Signin({ onSetActiveSection }: SetActiveSection) {
  return (
    <div className="sign-in-section section">
      <div className="stack-container">
        <div className="message-container">
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.913T12 22"
              />
            </svg>
          </div>
          <div className="message-information">
            <p>Welcome Back</p>
            <p>Sign in to keep monitoring</p>
          </div>
        </div>
        <div className="form-container">
          <form action="">
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>

            <input className="submit-button" type="submit" value="Sign In" />
          </form>
        </div>
        <div className="bottom-container">
          <p>
            Don't have an account?
            <button
              className="sign-up-redirect"
              onClick={() => onSetActiveSection("sign-up-section")}
            >
              {" "}
              Create One
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
