import { useAuth } from "../../contexts/AuthContext";

type LandingPageProps = {
  onAdd: () => void;
  onLink: () => void;
};

function LandingPage({ onAdd, onLink }: LandingPageProps) {
  const { user } = useAuth();
  const hasExisting = (user?.assistedUsers?.length ?? 0) > 0;

  return (
    <div className="landing-page-component">
      <div className="stack-child-container">
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
      </div>
      <div className="message-container">
        <h2>
          {hasExisting ? "Add another assisted user" : "No assisted user yet"}
        </h2>
        <p>
          {hasExisting
            ? "Create a new assisted user account or link one that's already registered to your Guardian account."
            : "Guardian features like Home, Alerts, and Contacts are made for monitoring an assisted user. Add one to unlock them."}
        </p>
      </div>
      <button onClick={onAdd}>Add assisted user</button>
      <button className="secondary" onClick={onLink}>
        Link assisted user
      </button>
      <div className="tip-container">
        <p>TIP:</p>
        <p>
          You'll need the assisted user's device / registration ID to link them
          to your Guardian account.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
