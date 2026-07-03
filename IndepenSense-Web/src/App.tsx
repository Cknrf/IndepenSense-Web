import './App.css'
import HomeSection from './components/Home/HomeSection'
import ContactSection from './components/Contacts/ContactSection';
import LocationSection from './components/Location/LocationSection';
import {useEffect, useState} from "react";


type IntervalInformation = {
    batteryHealth: number,
    internetStatus: number,
    latitude: number,
    longitude: number,
    location: string
}


function App() {


    const [intervalInformation, setIntervalInformation] = useState<IntervalInformation>();
    const [activeSection, setActiveSection] = useState("HomeSection");

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

  return (
    <div className="main-container">
        <header className="header">
            <h2>Location</h2>
        </header>

{/*  Main Section Interface */}
        <div className="main-interface">

          {/* Home Section */}


          {!intervalInformation && (
              <span>Unable To Retrieve Information</span>
          )}

          {intervalInformation && activeSection === "HomeSection" && (
          <HomeSection {...intervalInformation}
          ></HomeSection>
          )}

          {/* Location Section */}

          {intervalInformation && activeSection === "LocationSection" && (
          <LocationSection
          {...intervalInformation}
          ></LocationSection>
          )}


          {/* Contact Section */}

          {activeSection === "ContactSection" && (
          <ContactSection>
            
          </ContactSection>
          )}
         

        </div>


        <footer className="footer">
            {/* Home Icon*/}
            <div onClick={() => setActiveSection("HomeSection")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	                <path d="M0 0h24v24H0z" fill="none" />
	                <path fill="currentColor" d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19" />
                </svg>
              <span>Home</span>

            </div>
            {/* Alert Icon*/}
            <div onClick={() => setActiveSection("AlertSection")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z" />
                </svg>
              <span>Alerts</span>

            </div>
            {/* Location Icon */}
             <div onClick={() => setActiveSection("LocationSection")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path fill="currentColor" d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7" />
                </svg>
              <span>Location</span>

            </div>
            {/* Contacts Icon*/}
            <div onClick={() => setActiveSection("ContactSection")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="currentColor" d="M6 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6m9-9a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2" />
                </svg>
                <span>Contacts</span>
            </div>
        </footer>
    </div>
  )
}

export default App;
