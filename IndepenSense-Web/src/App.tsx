import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="main-container">
        <header className="header">
            <h2>Home</h2>
        </header>

{/*  Main Section Interface */}
        <div className="main-interface">

          {/* Home Section */}
          <div className="home-section">


            <div className="stack-container">
              <div className="message-container">
                <h2> Hello, Guardian <span>Joseph</span></h2>
                <h4> Keep monitoring <span>Rowela</span></h4>
             </div>
            </div>

            <div className="stack-container">

              <div className="battery-health-container long-box">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20">
                    <path d="M0 0h20v20H0z" fill="none" />
                    <g fill="currentColor">
                      <rect width="2" height="5" x="16" y="7.5" rx=".5" />
                      <path d="M4 7.5h2.5v5H4zm3.25 0h2.5v5h-2.5zm3.25 0H13v5h-2.5z" />
                      <path fill-rule="evenodd" d="M14 5.5H3A1.5 1.5 0 0 0 1.5 7v6A1.5 1.5 0 0 0 3 14.5h11a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 14 5.5M2.5 7a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z" clip-rule="evenodd" />
                    </g>
                   </svg>
                </div>
                <div>
                  Battery Health: 
                </div>
                <div>
                  95
                  <span>%</span>
                </div>
              </div>

              <div className="connectivity-container long-box">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path fill="currentColor" d="M10.225 20.275Q9.5 19.55 9.5 18.5t.725-1.775T12 16t1.775.725t.725 1.775t-.725 1.775T12 21t-1.775-.725M6.35 15.35l-2.1-2.15q1.475-1.475 3.463-2.337T12 10t4.288.875t3.462 2.375l-2.1 2.1q-1.1-1.1-2.55-1.725T12 13t-3.1.625t-2.55 1.725M2.1 11.1L0 9q2.3-2.35 5.375-3.675T12 4t6.625 1.325T24 9l-2.1 2.1q-1.925-1.925-4.462-3.012T12 7T6.563 8.088T2.1 11.1" />
                  </svg>
                </div>

                <div>
                  Is connected:
                </div>
                <div>
                  Yes
                </div>

              </div>

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

                <div className="location-container box">
                  <div className="top-container">

                  </div>
                </div>

              </div>

              <div className="maps-container"></div>
            </div>

            







          </div>




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

export default App
