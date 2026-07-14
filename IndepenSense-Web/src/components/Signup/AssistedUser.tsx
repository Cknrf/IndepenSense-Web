import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { AssistedUserSummary } from "../../contexts/AuthContext";

type AssistedUserProps = {
  onDone: () => void;
};

type AssistedUserInfo = {
  name: string;
  uuid: string;
};

function AssistedUser({ onDone }: AssistedUserProps) {
  const { setUser } = useAuth();
  const [assistedUser, setAssistedUser] = useState<AssistedUserInfo>({
    name: "",
    uuid: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setAssistedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function createAssistedUser(): Promise<AssistedUserSummary> {
    const response = await fetch(
      "http://localhost:3000/web/create-assisted-user-account/",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: assistedUser.name,
          deviceID: assistedUser.uuid,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Server responded: ${response.status} ${body}`);
    }

    return (await response.json()) as AssistedUserSummary;
  }

  const handleSubmission = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const created = await createAssistedUser();
      setUser((prev) =>
        prev
          ? { ...prev, assistedUsers: [...prev.assistedUsers, created] }
          : prev,
      );
      onDone();
    } catch (error) {
      console.error("Creation of Assisted User Account Failed:", error);
      alert("Something went wrong while creating account");
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
              d="m6 22.5l-1.6-1.2L7 17.825V12.5q0-.775.138-1.713T7.5 9.1L6 9.95v3.55H4V8.8l5.4-3.075q.2-.125.425-.175t.475-.05q.6 0 1.1.3t.75.825l.775 1.675q.5 1.1 1.525 1.65t2.55.55v2h-.975l5.475 9.55l-.875.5L14.7 12.225q-1-.325-1.812-.937T11.5 9.8q-.25.725-.387 1.663t-.088 1.737L13 16v6.5h-2v-5l-1.775-2.55L9 18.5zm4.088-18.088Q9.5 3.825 9.5 3t.588-1.412T11.5 1t1.413.588T13.5 3t-.587 1.413T11.5 5t-1.412-.587"
            />
          </svg>
        </div>
        <div className="message-information">
          <p>Create assisted user</p>
          <p>Link a person to your Guardian Account</p>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmission}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter assisted user's name"
              required
              value={assistedUser.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="unique-id">Unique ID</label>
            <input
              type="password"
              name="uuid"
              id="unique-id"
              placeholder="Check UUID in the device"
              required
              value={assistedUser.uuid}
              onChange={handleChange}
            />
          </div>
          <input
            className="submit-button"
            type="submit"
            value="Create account"
          />
        </form>
      </div>
    </div>
  );
}

export default AssistedUser;
