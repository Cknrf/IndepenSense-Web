import { useOutletContext } from "react-router";
import MapBox from "../Home/MapBox";
import type { OutletData } from "../../layouts/ProtectedLayout";

function LocationSection() {
  const { intervalInformation } = useOutletContext<OutletData>();
  if (!intervalInformation) return <span>Unable To Retrieve Information</span>;
  const { latitude, longitude, location } = intervalInformation;
  return (
    <div className="location-section section">
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
              d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7"
            />
          </svg>
          <h2>Current Status</h2>
        </div>
      </div>

      <div className="stack-container">
        <div className="stack-child-container">
          <div className="map-header">{location}</div>
          <MapBox
            latitude={latitude}
            longitude={longitude}
            location={location}
          ></MapBox>
          <div className="message-banner-container">
            <p>
              Last Updated: <span>Just Now</span>
            </p>
            <p>
              Coordinates:{" "}
              <span>
                {latitude}, {longitude}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSection;
