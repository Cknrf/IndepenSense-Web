import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import MapBox from "../Home/MapBox";
import LocationTrackMap from "./LocationTrackMap";
import ViewTabs from "../common/ViewTabs";
import DayStrip from "../common/DayStrip";
import { useAuth } from "../../contexts/AuthContext";
import type { OutletData } from "../../layouts/ProtectedLayout";
import { alertLocation } from "../../utils/alertTypes";
import {
  deviceToday,
  enumerateDays,
  formatDeviceTime,
  monthDayLabel,
  relativeDayLabel,
  shiftDay,
  weekdayLabel,
} from "../../utils/deviceDays";
import {
  fetchLocationHistory,
  formatCoordinates,
  formatVisitDuration,
  newestFirst,
  visitsForDay,
  type LocationFetch,
  type LocationVisit,
} from "../../utils/locationHistory";

type Tab = "current" | "history";

const TABS = [
  { value: "current" as const, label: "Current" },
  { value: "history" as const, label: "History" },
];

function PinIcon() {
  return (
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
  );
}

type StopRowProps = {
  visit: LocationVisit;
  index: number;
  isLatest: boolean;
};

function StopRow({ visit, index, isLatest }: StopRowProps) {
  const place = alertLocation(visit.location);

  return (
    <li className={`location-stop${isLatest ? " latest" : ""}`}>
      <div className="location-stop-icon">
        <PinIcon />
        <span className="location-stop-index">{index}</span>
      </div>
      <div className="location-stop-text">
        <p className={`location-stop-name${place.known ? "" : " unknown"}`}>
          {place.text}
        </p>
        <p className="location-stop-meta">
          {isLatest ? "Most recent" : `Stop ${index}`}
        </p>
      </div>
      <div className="location-stop-times">
        <p className="location-stop-arrived">
          {formatDeviceTime(visit.arrivedAt)}
        </p>
        <p className="location-stop-duration">{formatVisitDuration(visit)}</p>
      </div>
    </li>
  );
}

function LocationSection() {
  const { intervalInformation } = useOutletContext<OutletData>();
  const { activeAssistedUser } = useAuth();
  const assistedUserID = activeAssistedUser?.id;
  const assistedUserName = activeAssistedUser?.name ?? "this person";

  const [tab, setTab] = useState<Tab>("current");
  const [selectedDay, setSelectedDay] = useState<string>(deviceToday);
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<{
    forUser: number;
    result: LocationFetch;
  } | null>(null);

  const loaded =
    history && assistedUserID && history.forUser === assistedUserID
      ? history.result
      : null;

  const isLoadingHistory = tab === "history" && !!assistedUserID && !loaded;

  useEffect(() => {
    if (tab !== "history" || !assistedUserID) return;
    if (history?.forUser === assistedUserID) return;

    let cancelled = false;
    void (async () => {
      const result = await fetchLocationHistory(assistedUserID);
      if (!cancelled) setHistory({ forUser: assistedUserID, result });
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, assistedUserID, history]);

  const historyData = loaded?.status === "ok" ? loaded.history : null;
  const days = historyData
    ? enumerateDays(historyData.from, historyData.to)
    : [];

  // Unlike the alerts strip, a day is always selected: seven days of paths on
  // one map would be unreadable, so there is no "whole window" view here.
  const activeDay =
    days.length > 0 && days.includes(selectedDay)
      ? selectedDay
      : (historyData?.to ?? selectedDay);

  const visits = historyData
    ? visitsForDay(historyData.samples, activeDay)
    : [];

  const stopsNewestFirst = newestFirst(visits);
  const latestVisit = visits[visits.length - 1];

  const renderCurrent = () => {
    if (!intervalInformation) {
      return (
        <div className="location-card">
          <div className="location-empty-state">
            <p>Unable to retrieve information</p>
          </div>
        </div>
      );
    }

    const { latitude, longitude, location } = intervalInformation;
    const place = alertLocation(location);

    return (
      <div className="location-card">
        <div className="map-header">{place.text}</div>
        <MapBox latitude={latitude} longitude={longitude} location={place.text} />
        <div className="message-banner-container">
          <div className="message-banner-row">
            <span className="message-banner-label">Last updated</span>
            <span className="message-banner-value">Just now</span>
          </div>
          <div className="message-banner-row">
            <span className="message-banner-label">Coordinates</span>
            <span className="message-banner-value">
              {formatCoordinates(latitude, longitude)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    if (isLoadingHistory) {
      return (
        <div className="location-card">
          <div className="location-empty-state">
            <p>Loading location history…</p>
          </div>
        </div>
      );
    }

    if (loaded?.status === "unavailable") {
      return (
        <div className="location-card">
          <div className="location-empty-state">
            <h3>History isn&apos;t available yet</h3>
            <p>
              Location history for {assistedUserName} can&apos;t be loaded
              right now. The Current tab is unaffected.
            </p>
            <button
              type="button"
              className="location-retry"
              onClick={() => setHistory(null)}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (loaded?.status === "unauthorized") {
      return (
        <div className="location-card">
          <div className="location-empty-state">
            <h3>Session expired</h3>
            <p>Sign in again to view location history.</p>
          </div>
        </div>
      );
    }

    if (!historyData) {
      return (
        <div className="location-card">
          <div className="location-empty-state">
            <h3>Couldn&apos;t load history</h3>
            <p>Check your connection and try again.</p>
            <button
              type="button"
              className="location-retry"
              onClick={() => setHistory(null)}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/*
          No dots: with an always-on device every day has data, so a dot per day
          would light up every chip and tell the guardian nothing.
        */}
        <DayStrip
          days={days}
          selected={activeDay}
          onSelect={(day) => day && setSelectedDay(day)}
          today={historyData.to}
          accent="location"
        />

        <div className="location-card">
          <header className="location-day-header">
            <h3>
              {relativeDayLabel(activeDay, historyData.to)},{" "}
              {monthDayLabel(activeDay)}
            </h3>
            <span className="location-day-summary">
              {visits.length === 1 ? "1 stop" : `${visits.length} stops`}
            </span>
          </header>

          {visits.length === 0 ? (
            <div className="location-empty-state">
              <h3>
                No location recorded on {weekdayLabel(activeDay)},{" "}
                {monthDayLabel(activeDay)}
              </h3>
              <p>
                The device may have been off or without a signal all day.
              </p>
              <p className="location-fineprint">
                Location is shown for {historyData.retentionDays} days.{" "}
                {monthDayLabel(shiftDay(historyData.from, -1))} and earlier is no
                longer available.
              </p>
            </div>
          ) : (
            <>
              <LocationTrackMap visits={visits} />

              <div className="location-stops-panel">
                <ul className="location-stops-list">
                  {(expanded ? stopsNewestFirst : stopsNewestFirst.slice(0, 1)).map(
                    (visit) => (
                      <StopRow
                        key={visit.id}
                        visit={visit}
                        index={visits.indexOf(visit) + 1}
                        isLatest={visit === latestVisit}
                      />
                    ),
                  )}
                </ul>

                {visits.length > 1 && (
                  <button
                    type="button"
                    className="location-stops-toggle"
                    onClick={() => setExpanded((prev) => !prev)}
                    aria-expanded={expanded}
                  >
                    {expanded
                      ? "Show less"
                      : `Show the other ${visits.length - 1} ${
                          visits.length - 1 === 1 ? "stop" : "stops"
                        }`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="location-section section">
      <div className="location-header">
        <div className="message-container">
          <PinIcon />
          <h2>
            {tab === "history"
              ? `Where ${activeAssistedUser?.name ?? "they"} went`
              : "Current Status"}
          </h2>
        </div>

        <ViewTabs
          tabs={TABS}
          active={tab}
          onChange={setTab}
          label="Location view"
          accent="location"
        />
      </div>

      <div className="location-body">
        {tab === "current" ? renderCurrent() : renderHistory()}
      </div>
    </div>
  );
}

export default LocationSection;
