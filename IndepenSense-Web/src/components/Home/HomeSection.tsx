import { useNavigate, useOutletContext } from "react-router";
import BatteryHealth from "./BatteryHealth";
import LocationBox from "./LocationBox";
import ConnectivityStatus from "./ConnectivityStatus";
import MapBox from "./MapBox";
import type { IntervalInformation } from "../../layouts/ProtectedLayout";
import { useAuth } from "../../contexts/AuthContext";

function HomeSection() {
  const data = useOutletContext<IntervalInformation | null>();
  const { user, activeAssistedUser } = useAuth();
  const navigate = useNavigate();
  if (!data) return <span>Unable To Retrieve Information</span>;
  const { batteryHealth, internetStatus, latitude, longitude, location } = data;
  const guardianName = user?.name ?? "";
  const assistedName = activeAssistedUser?.name ?? "";
  {
    /* Home Section */
  }
  return (
    <div className="home-section section">
      <div className="stack-container">
        <div className="message-container">
          <h2>
            {" "}
            Hello, Guardian <span>{guardianName}</span>
          </h2>
          <h4>
            {" "}
            Keep monitoring <span>{assistedName}</span>
          </h4>
        </div>
      </div>

      <div className="stack-container">
        <BatteryHealth percentage={batteryHealth}></BatteryHealth>

        <ConnectivityStatus isConnected={internetStatus}></ConnectivityStatus>

        <div className="stack-child-container">
          <div
            className="alert-container box"
            onClick={() => navigate("/alerts")}
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
                  d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
                />
              </svg>

              <span>Alert Logs</span>

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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path stroke-dasharray="20" d="M3 12h17.5">
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.3s"
                      values="20;0"
                    />
                  </path>
                  <path
                    stroke-dasharray="12"
                    stroke-dashoffset="12"
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
                Event:
                <span> Manual Emergency</span>
              </div>
              <div>
                {" "}
                Location:
                <span>Maharlika</span>
              </div>
              <div>
                {" "}
                Timestamp:
                <span> 4:56 PM </span>
              </div>
            </div>
          </div>

          <LocationBox
            latitude={latitude}
            longitude={longitude}
            location={location}
          ></LocationBox>
        </div>
      </div>

      <div className="stack-container">
        <MapBox
          latitude={latitude}

          longitude={longitude}

          location={location}
        ></MapBox>
      </div>
    </div>
  );
}

export default HomeSection;
