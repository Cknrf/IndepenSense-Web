import { useOutletContext } from "react-router";
import AlertInfoContainer from "./AlertInfoContainer";
import type { OutletData } from "../../layouts/ProtectedLayout";

function formatOccuredAt(occuredAt: string) {
  const date = new Date(occuredAt);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AlertSection() {
  const { alerts } = useOutletContext<OutletData>();

  return (
    <div className="alert-section section">
      <div className="stack-container">
        <div className="message-container">
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
          <h2>Alert Logs</h2>
        </div>
      </div>

      <div className="stack-container">
        <div className="alert-list-container">
          {alerts === null ? (
            <p>Loading alerts…</p>
          ) : alerts.length === 0 ? (
            <p>No alerts yet.</p>
          ) : (
            alerts.map((alert) => (
              <AlertInfoContainer
                key={alert.id}
                alertType={alert.eventType}
                message={alert.location}
                timeStamp={formatOccuredAt(alert.occuredAt)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertSection;
