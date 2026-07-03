import BatteryHealth from "./BatteryHealth"
import LocationBox from "./LocationBox"
import ConnectivityStatus from "./ConnectivityStatus";
import MapBox from "./MapBox";
import { useState, useEffect } from "react";

type IntervalInformation = {
    batteryHealth: number,
    internetStatus: number,
    latitude: number,
    longitude: number, 
    location: string
}

function HomeSection() {

    const [intervalInformation, setIntervalInformation] = useState<IntervalInformation>();

    useEffect(() => {

        async function fetchIntervalInformation() {
            const response = await fetch("http://localhost:3000/web/get-interval-information");
            const data = await response.json();
            setIntervalInformation(data);
        }

        fetchIntervalInformation();
        const intervalID = setInterval(fetchIntervalInformation, 5000);
        return () => clearInterval(intervalID);


    }, []);


          {/* Home Section */}
    return(
          <div className="home-section section">

            <div className="stack-container">
              <div className="message-container">
                <h2> Hello, Guardian <span>Yoru</span></h2>
                <h4> Keep monitoring <span>Rowela</span></h4>
             </div>
            </div>

            <div className="stack-container">

                <BatteryHealth percentage={
                    intervalInformation ? intervalInformation.batteryHealth : 0
                }>
                </BatteryHealth>

                <ConnectivityStatus isConnected={
                    intervalInformation?.internetStatus === 1
                }>

                </ConnectivityStatus>


              <div className="stack-child-container">

                <div className="alert-container box">
                  <div className="top-container">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z" />
                      </svg>

                      <span>Alert Logs</span>

                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                          <path stroke-dasharray="20" d="M3 12h17.5">
                            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="20;0" />
                          </path>
                          <path stroke-dasharray="12" stroke-dashoffset="12" d="M21 12l-7 7M21 12l-7 -7">
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.3s" dur="0.2s" to="0" />
                          </path>
                        </g>
                      </svg>


                  </div>

                  <div className="bottom-container">
                    <div> Event:
                      <span> Manual Emergency</span>
                    </div>
                    <div> Location:
                     <span>Maharlika</span>
                    </div>
                    <div> Timestamp:
                    <span> 4:56 PM </span>
                    </div>
                  </div>

                </div>


                <LocationBox
                latitude={
                    intervalInformation ? intervalInformation.latitude : 0
                }
                longitude={
                    intervalInformation ? intervalInformation.longitude : 0
                }
                location={" De La Salle Lipa"}
                ></LocationBox>

              </div>

            </div>

            <div className="stack-container">
                <MapBox
                latitude={
                  intervalInformation ? intervalInformation.latitude : 0
                }

                longitude={
                  intervalInformation ? intervalInformation.longitude : 0
                }

                location={
                  intervalInformation ? intervalInformation.location : "error"
                }
                ></MapBox>
            </div>


          </div>
    )
}

export default HomeSection