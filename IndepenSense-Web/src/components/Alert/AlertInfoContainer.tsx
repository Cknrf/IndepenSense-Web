import { alertLocation, alertTypeMeta, type AlertIcon } from "../../utils/alertTypes";

type AlertInfo = {
  /** Raw DB enum value; the label and styling are derived from it. */
  eventType: string;
  location: string;
  timeStamp: string;
};

function AlertTypeIcon({ icon }: { icon: AlertIcon }) {
  const paths: Record<AlertIcon, string> = {
    alert: "M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z",
    fall: "m6 22.5l-1.6-1.2L7 17.825V12.5q0-.775.138-1.713T7.5 9.1L6 9.95v3.55H4V8.8l5.4-3.075q.2-.125.425-.175t.475-.05q.6 0 1.1.3t.75.825l.775 1.675q.5 1.1 1.525 1.65t2.55.55v2h-.975l5.475 9.55l-.875.5L14.7 12.225q-1-.325-1.812-.937T11.5 9.8q-.25.725-.387 1.663t-.088 1.737L13 16v6.5h-2v-5l-1.775-2.55L9 18.5zm4.088-18.088Q9.5 3.825 9.5 3t.588-1.412T11.5 1t1.413.588T13.5 3t-.587 1.413T11.5 5t-1.412-.587",
    battery:
      "M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.34C7 21.4 7.6 22 8.33 22h7.34c.73 0 1.33-.6 1.33-1.33V5.33C17 4.6 16.4 4 15.67 4M13 18h-2v-2h2zm0-4h-2V9h2z",
    signal:
      "M2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l2 2c1.24-1.24 2.67-2.16 4.2-2.76l2.24 2.24C7.81 10.89 6.27 11.73 5 13l2 2a9.08 9.08 0 0 1 3.66-2.2l2.35 2.35L12 15l-3 3l3 3l3-3l6 6l1.41-1.41L3.41 1.64zm20.99 5.95c-3.84-3.84-9.19-5.24-14.15-4.22l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7z",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="currentColor" d={paths[icon]} />
    </svg>
  );
}

function AlertInfoContainer({ eventType, location, timeStamp }: AlertInfo) {
  const { label, severity, icon } = alertTypeMeta(eventType);
  const place = alertLocation(location);

  return (
    <div className={`alert-info-container ${severity}`}>
      <div className="icon-container">
        <AlertTypeIcon icon={icon} />
      </div>
      <div className="alert-information">
        <p className="alert-type">{label}</p>
        <p className={`details${place.known ? "" : " unknown"}`}>
          {place.text}
        </p>
        <p className="timestamp">{timeStamp}</p>
      </div>
    </div>
  );
}

export default AlertInfoContainer;
