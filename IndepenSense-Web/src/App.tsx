import './App.css'
import HomeSection from './components/Home/HomeSection'
import ContactSection from './components/Contacts/ContactSection';
import LocationSection from './components/Location/LocationSection';



function App() {

  return (
    <div className="main-container">
        <header className="header">
            <h2>Location</h2>
        </header>

{/*  Main Section Interface */}
        <div className="main-interface">

          {/* Home Section */}
          <HomeSection></HomeSection>


          {/* Location Section */}

          <LocationSection 
          latitude={13.94291}
          longitude={121.14773}
          location="De La"
          ></LocationSection>

          {/* Contact Section */}

          <ContactSection>
            
          </ContactSection>
         




        </div>


        <footer className="footer">
            {/* Home Icon*/}
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	                <path d="M0 0h24v24H0z" fill="none" />
	                <path fill="currentColor" d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19" />
                </svg>
              <span>Home</span>

            </div>
            {/* Alert Icon*/}
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z" />
                </svg>
              <span>Alerts</span>

            </div>
            {/* Contacts Icon*/}
            <div>
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
