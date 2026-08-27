import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import AlertInfoContainer from "./AlertInfoContainer";
import { useAuth } from "../../contexts/AuthContext";
import type { OutletData } from "../../layouts/ProtectedLayout";
import {
  ALERT_RETENTION_DAYS,
  alertDay,
  dayOfMonthLabel,
  enumerateDays,
  fetchAlertHistory,
  formatAlertTime,
  groupByDay,
  mergeLiveAlerts,
  monthDayLabel,
  relativeDayLabel,
  shiftDay,
  weekdayLabel,
  type HistoryFetch,
} from "../../utils/alertHistory";

type Tab = "recent" | "history";

/** Recent shows the latest few regardless of day; History is the 7-day browse. */
const RECENT_LABEL = "Recent";

function formatRecentTimestamp(occuredAt: string) {
  return new Date(occuredAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ShieldIcon() {
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
        d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.913T12 22"
      />
    </svg>
  );
}

type EmptyStateProps = {
  title: string;
  body: string;
  fineprint?: string;
  action?: { label: string; onClick: () => void };
};

function AlertEmptyState({ title, body, fineprint, action }: EmptyStateProps) {
  return (
    <div className="alert-empty-state">
      <div className="alert-empty-icon">
        <ShieldIcon />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {fineprint && <p className="alert-empty-fineprint">{fineprint}</p>}
      {action && (
        <button
          type="button"
          className="alert-empty-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function AlertSection() {
  const { alerts } = useOutletContext<OutletData>();
  const { activeAssistedUser } = useAuth();
  const assistedUserID = activeAssistedUser?.id;
  const assistedUserName = activeAssistedUser?.name ?? "this person";

  const [tab, setTab] = useState<Tab>("recent");
  /** null means "the whole window"; a date narrows to that single day. */
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [history, setHistory] = useState<{
    forUser: number;
    result: HistoryFetch;
  } | null>(null);

  const loaded =
    history && assistedUserID && history.forUser === assistedUserID
      ? history.result
      : null;

  // Derived rather than stored, so opening the tab needs no state update.
  const isLoadingHistory = tab === "history" && !!assistedUserID && !loaded;

  useEffect(() => {
    if (tab !== "history" || !assistedUserID) return;
    if (history?.forUser === assistedUserID) return;

    let cancelled = false;
    void (async () => {
      const result = await fetchAlertHistory(assistedUserID);
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

  // Live SSE alerts are folded in so one arriving while this tab is open shows
  // up without a refetch.
  const windowAlerts = historyData
    ? mergeLiveAlerts(
        historyData.alerts,
        alerts ?? [],
        historyData.from,
        historyData.to,
      )
    : [];

  const daysWithAlerts = new Set(windowAlerts.map(alertDay));

  // Validated against the window instead of reset by an effect: switching
  // assisted user can retire the selected day.
  const activeDay =
    selectedDay && days.includes(selectedDay) ? selectedDay : null;

  const visibleAlerts = activeDay
    ? windowAlerts.filter((alert) => alertDay(alert) === activeDay)
    : windowAlerts;

  const groups = groupByDay(visibleAlerts);

  const renderHistoryBody = () => {
    if (isLoadingHistory) return <p className="alert-status">Loading history…</p>;

    if (loaded?.status === "unavailable") {
      return (
        <AlertEmptyState
          title="History isn't available yet"
          body={`The 7-day history for ${assistedUserName} can't be loaded right now.`}
          fineprint="Recent alerts are unaffected."
          action={{ label: "Try again", onClick: () => setHistory(null) }}
        />
      );
    }

    if (loaded?.status === "unauthorized") {
      return (
        <AlertEmptyState
          title="Session expired"
          body="Sign in again to view alert history."
        />
      );
    }

    if (!historyData) {
      return (
        <AlertEmptyState
          title="Couldn't load history"
          body="Check your connection and try again."
          action={{ label: "Try again", onClick: () => setHistory(null) }}
        />
      );
    }

    if (windowAlerts.length === 0) {
      return (
        <AlertEmptyState
          title={`No alerts in the past ${historyData.retentionDays} days`}
          body={`Nothing was raised for ${assistedUserName} between ${monthDayLabel(historyData.from)} and ${monthDayLabel(historyData.to)}.`}
          fineprint={`Alerts are shown for ${historyData.retentionDays} days. ${monthDayLabel(shiftDay(historyData.from, -1))} and earlier is no longer available.`}
        />
      );
    }

    if (visibleAlerts.length === 0 && activeDay) {
      return (
        <AlertEmptyState
          title={`No alerts on ${weekdayLabel(activeDay)}, ${monthDayLabel(activeDay)}`}
          body={`Nothing was raised for ${assistedUserName} that day.`}
          action={{
            label: `Show all ${historyData.retentionDays} days`,
            onClick: () => setSelectedDay(null),
          }}
        />
      );
    }

    return groups.map((group) => (
      <section className="alert-day-group" key={group.date}>
        <header className="alert-day-group-header">
          <span className="alert-day-group-label">
            {relativeDayLabel(group.date)} · {monthDayLabel(group.date)}
          </span>
          <span className="alert-day-group-count">
            {group.alerts.length === 1
              ? "1 alert"
              : `${group.alerts.length} alerts`}
          </span>
        </header>
        {group.alerts.map((alert) => (
          <AlertInfoContainer
            key={alert.id}
            eventType={alert.eventType}
            location={alert.location}
            timeStamp={formatAlertTime(alert)}
          />
        ))}
      </section>
    ));
  };

  const renderRecentBody = () => {
    if (alerts === null) return <p className="alert-status">Loading alerts…</p>;

    if (alerts.length === 0) {
      return (
        <AlertEmptyState
          title="No recent alerts"
          body={`Nothing has been raised for ${assistedUserName}.`}
          fineprint={`Alerts from the past ${ALERT_RETENTION_DAYS} days are in History.`}
        />
      );
    }

    return alerts.map((alert) => (
      <AlertInfoContainer
        key={alert.id}
        eventType={alert.eventType}
        location={alert.location}
        timeStamp={formatRecentTimestamp(alert.occuredAt)}
      />
    ));
  };

  return (
    <div className="alert-section section">
      <div className="alert-header">
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
              d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
            />
          </svg>
          <h2>Alert Logs</h2>
        </div>

        <div className="alert-tabs" role="tablist" aria-label="Alert view">
          {(["recent", "history"] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`alert-tab${tab === value ? " active" : ""}`}
              onClick={() => setTab(value)}
            >
              {value === "recent" ? RECENT_LABEL : "History"}
            </button>
          ))}
        </div>

        {tab === "history" && days.length > 0 && (
          <div className="alert-day-strip">
            {days.map((day) => {
              const isActive = day === activeDay;
              const isToday = day === historyData?.to;
              return (
                <button
                  key={day}
                  type="button"
                  className={`alert-day-chip${isActive ? " active" : ""}${
                    isToday ? " today" : ""
                  }`}
                  // Tapping the active chip returns to the whole window.
                  onClick={() => setSelectedDay(isActive ? null : day)}
                  aria-pressed={isActive}
                >
                  <span className="alert-day-chip-weekday">
                    {weekdayLabel(day)}
                  </span>
                  <span className="alert-day-chip-date">
                    {dayOfMonthLabel(day)}
                  </span>
                  <span
                    className={`alert-day-chip-dot${
                      daysWithAlerts.has(day) ? " has-alerts" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="alert-body">
        <div className="alert-list-container">
          {tab === "history" ? renderHistoryBody() : renderRecentBody()}
        </div>
      </div>
    </div>
  );
}

export default AlertSection;
