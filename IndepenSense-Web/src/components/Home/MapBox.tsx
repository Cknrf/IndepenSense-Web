import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";


type Coordinates = {
    latitude: number,
    longitude: number,
    location: string
}

function MapBox({latitude, longitude, location}: Coordinates) {

    return(
            <div className="maps-container">
                {latitude && longitude ?
                <MapContainer center={[latitude, longitude]} zoom={17} scrollWheelZoom={false}
                    style={{
                        height: "100%",
                        width: "100%",
                    }}
                    >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[latitude, longitude]}>
                        <Popup>
                        {location}
                        </Popup>
                    </Marker>
                </MapContainer> :
                <p>Unable to retrieve location</p>
                }
                
            </div>
    );

}

export default MapBox;