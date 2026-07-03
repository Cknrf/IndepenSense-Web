type Alert = {
    event: string;
    location: string;
    timestamp: number;
}



function AlertBox(alert: Alert) {


    return(
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
                <span>{alert.event}</span>
            </div>

            <div> Location: 
                <span>{alert.location}</span>
            </div>

            <div> Timestamp: 
            <span>{alert.timestamp}</span>
            </div>
        </div>

    </div>
    );
}

export default AlertBox;