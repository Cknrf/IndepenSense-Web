import { useNavigate } from "react-router";

type Location = {
  latitude: number;
  longitude: number;
  location: string;
};

function LocationBox(location: Location) {
  const navigate = useNavigate();
  return (
    <div
      className="location-container box"
      onClick={() => navigate("/location")}
    >
      <div className="top-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7"
          />
        </svg>

        <span>Location</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path strokeDasharray="20" d="M3 12h17.5">
              <animate
                fill="freeze"
                attributeName="stroke-dashoffset"
                dur="0.3s"
                values="20;0"
              />
            </path>
            <path
              strokeDasharray="12"
              strokeDashoffset="12"
              d="M21 12l-7 7M21 12l-7 -7"
            >
              <animate
                fill="freeze"
                attributeName="stroke-dashoffset"
                begin="0.3s"
                dur="0.2s"
                to="0"
              />
            </path>
          </g>
        </svg>
      </div>

      <div className="bottom-container">
        <div>
          {" "}
          Latitude:
          <span>{location.latitude}</span>
        </div>
        <div>
          {" "}
          Longitude:
          <span>{location.longitude}</span>
        </div>
        <div>
          {" "}
          Location:
          <span>{location.location}</span>
        </div>
      </div>
    </div>
  );
}

export default LocationBox;
