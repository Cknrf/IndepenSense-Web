import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { AssistedUserSummary } from "../../contexts/AuthContext";

type LinkAssistedUserProps = {
  onDone: () => void;
};

function LinkAssistedUser({ onDone }: LinkAssistedUserProps) {
  const { setUser } = useAuth();
  const [uuid, setUuid] = useState("");

  const handleSubmission = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/web/link-assisted-user-account",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceID: uuid }),
        },
      );

      if (response.status === 409) {
        alert("This assisted user is already linked to your account.");
        return;
      }
      if (!response.ok) {
        alert("No assisted user found for that device ID.");
        return;
      }

      const linked = (await response.json()) as AssistedUserSummary;
      setUser((prev) =>
        prev
          ? { ...prev, assistedUsers: [...prev.assistedUsers, linked] }
          : prev,
      );
      onDone();
    } catch (error) {
      console.error("Linking assisted user failed:", error);
      alert("Something went wrong while linking the assisted user.");
    }
  };

  return (
    <div className="stack-container assisted-user-component">
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
              d="M10.59 13.41c.41.39.41 1.03 0 1.42c-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0a5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24a2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24m2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0a5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24a2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24a.973.973 0 0 1 0-1.42"
            />
          </svg>
        </div>
        <div className="message-information">
          <p>Link assisted user</p>
          <p>Connect an existing account to your Guardian Account</p>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmission}>
          <div>
            <label htmlFor="unique-id">Unique ID</label>
            <input
              type="password"
              name="uuid"
              id="unique-id"
              placeholder="Check UUID in the device"
              required
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
            />
          </div>
          <input
            className="submit-button"
            type="submit"
            value="Link account"
          />
        </form>
      </div>
    </div>
  );
}

export default LinkAssistedUser;
