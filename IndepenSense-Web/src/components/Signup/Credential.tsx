import { Link } from "react-router";
import type { Guardian } from "./Signup";
import { API_BASE } from "../../utils/api";

type SetCredential = {
  guardian: Guardian;
  onSetCredential: React.Dispatch<React.SetStateAction<Guardian>>;
  onNext: (step: "credentials" | "details") => void;
};

function Credential({ guardian, onSetCredential, onNext }: SetCredential) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    onSetCredential((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function doesUsernameExist(name: string) {
    const response = await fetch(
      `${API_BASE}/does-username-exist`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to check username. Server responded ${response.status}: ${body}`,
      );
    }

    return await response.json();
  }

  const handleSubmission = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (guardian?.password != guardian?.confirmPassword) {
      alert("Password do not much");
      return;
    }

    try {
      const doesUserExist = await doesUsernameExist(guardian.username);
      if (doesUserExist) {
        alert("Username is already existing");
        return;
      }

      onNext("details");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while checking your username.");
    }
  };

  return (
    <div className="stack-container credential-component">
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
          <p>Create Account</p>
          <p>Choose how you'll sign in</p>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmission}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              required
              value={guardian?.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              required
              value={guardian?.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirm-password"
              placeholder="Confirm password"
              required
              value={guardian?.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <input className="submit-button" type="submit" value="Continue" />
        </form>
      </div>
      <div className="bottom-container">
        <p>
          Already have an account?
          <Link className="sign-in-redirect" to="/signin">
            {" "}
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Credential;
