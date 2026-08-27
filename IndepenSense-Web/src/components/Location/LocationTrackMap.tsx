import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDeviceTime } from "../../utils/deviceDays";
import { alertLocation } from "../../utils/alertTypes";
import type { LocationVisit } from "../../utils/locationHistory";

/**
 * A day's visits as a dashed path.
 *
 * The dashes are deliberate: the segments join consecutive stops in straight
 * lines, so they show "went from here to there" without implying the roads
 * actually taken. Drawing them solid would look like a route we don't have.
 */

type LocationTrackMapProps = {
  /** Chronological — the path is drawn in this order. */
  visits: LocationVisit[];
};

/**
 * Refits whenever the day changes. MapContainer only reads its initial view, so
 * without this a new day would render outside the visible area.
 */
function FitToVisits({ visits }: LocationTrackMapProps) {
  const map = useMap();

  useEffect(() => {
    if (visits.length === 0) return;

    if (visits.length === 1) {
      map.setView([visits[0].latitude, visits[0].longitude], 17);
      return;
    }

    map.fitBounds(
      visits.map((visit) => [visit.latitude, visit.longitude]),
      { padding: [40, 40], maxZoom: 17 },
    );
  }, [map, visits]);

  return null;
}

function LocationTrackMap({ visits }: LocationTrackMapProps) {
  if (visits.length === 0) {
    return (
      <div className="maps-container">
        <p>No location recorded</p>
      </div>
    );
  }

  const path: LatLngExpression[] = visits.map((visit) => [
    visit.latitude,
    visit.longitude,
  ]);

  const latest = visits[visits.length - 1];

  return (
    <div className="maps-container">
      <MapContainer
        center={[latest.latitude, latest.longitude]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {visits.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{
              color: "#5b8def",
              weight: 3,
              dashArray: "8 10",
              lineCap: "round",
            }}
          />
        )}

        {visits.map((visit, index) => {
          const isLatest = visit === latest;
          return (
            <CircleMarker
              key={visit.id}
              center={[visit.latitude, visit.longitude]}
              radius={isLatest ? 9 : 7}
              pathOptions={{
                // The latest stop is where they are now, so it reads differently.
                color: "#ffffff",
                weight: 2,
                fillColor: isLatest ? "#e05656" : "#5b8def",
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>
                  {index + 1}. {alertLocation(visit.location).text}
                </strong>
                <br />
                {formatDeviceTime(visit.arrivedAt)}
              </Tooltip>
            </CircleMarker>
          );
        })}

        <FitToVisits visits={visits} />
      </MapContainer>
    </div>
  );
}

export default LocationTrackMap;
