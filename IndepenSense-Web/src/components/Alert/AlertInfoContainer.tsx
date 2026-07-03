type AlertInfo = {
  alertType: string;
  message: string;
  timeStamp: string;
};

function AlertInfoContainer({ alertType, message, timeStamp }: AlertInfo) {
  return (
    <div className="alert-info-container">
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
            d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
          />
        </svg>
      </div>
      <div className="alert-information">
        <p className="alert-type">{alertType}</p>
        <p className="details">{message}</p>
        <p className="timestamp">{timeStamp}</p>
      </div>
    </div>
  );
}

export default AlertInfoContainer;
