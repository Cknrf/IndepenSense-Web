import { API_BASE } from "./api";
import type { AlertLog } from "../layouts/ProtectedLayout";

/**
 * The 7-day alert history behind the Alerts screen's History tab.
 *
 * Day boundaries are Asia/Manila, not the viewer's timezone: the device and the
 * assisted user are in PH, so "Thursday" has to mean their Thursday. A guardian
 * checking in from abroad must see events bucketed the way they were lived.
 *
 * The window itself is the server's to decide — it enforces the 7 days, and
 * this module only renders what it reports. A client-side cutoff would be
 * cosmetic, since the older alerts would already be in the browser.
 */

/** Matches the device's timezone, not the viewer's. See the note above. */
const DEVICE_TIME_ZONE = "Asia/Manila";

export const ALERT_RETENTION_DAYS = 7;

export type HistoryAlert = AlertLog & {
  /** Manila calendar date of `occuredAt`, supplied by the backend. */
  occuredAtLocalDate?: string;
};

export type AlertHistory = {
  /** Inclusive first day of the served window, `YYYY-MM-DD`. */
  from: string;
  /** Inclusive last day, normally today. */
  to: string;
  retentionDays: number;
  alerts: HistoryAlert[];
};

export type HistoryFetch =
  | { status: "ok"; history: AlertHistory }
  | { status: "unauthorized" }
  /** The route isn't deployed yet — worth saying plainly rather than "error". */
  | { status: "unavailable" }
  | { status: "error" };

/*
 * Formatters are module-level: constructing an Intl formatter is not cheap, and
 * these are hit once per alert per render.
 */

const localDateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: DEVICE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const localTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DEVICE_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

/*
 * Plain `YYYY-MM-DD` strings are parsed as UTC midnight and formatted back in
 * UTC, so a calendar date never drifts a day through a timezone offset.
 */

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
});

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

/** `YYYY-MM-DD` for an instant, in the device's timezone. */
export function deviceLocalDate(iso: string): string {
  const parts = localDateParts.formatToParts(new Date(iso));
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Today's calendar date in the device's timezone. */
export function deviceToday(): string {
  return deviceLocalDate(new Date().toISOString());
}

/** The day an alert belongs to. Prefers the server's value over re-deriving. */
export function alertDay(alert: HistoryAlert): string {
  return alert.occuredAtLocalDate ?? deviceLocalDate(alert.occuredAt);
}

export function formatAlertTime(alert: HistoryAlert): string {
  return localTimeFormatter.format(new Date(alert.occuredAt));
}

function parsePlainDate(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function toPlainDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function shiftDay(ymd: string, days: number): string {
  const date = parsePlainDate(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return toPlainDate(date);
}

/** Every day in an inclusive range, oldest first — the day strip's order. */
export function enumerateDays(from: string, to: string): string[] {
  const days: string[] = [];
  const last = parsePlainDate(to).getTime();
  for (
    let cursor = parsePlainDate(from);
    cursor.getTime() <= last;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    days.push(toPlainDate(cursor));
    // A malformed range must not spin forever.
    if (days.length > 400) break;
  }
  return days;
}

export function weekdayLabel(ymd: string): string {
  return weekdayFormatter.format(parsePlainDate(ymd));
}

export function dayOfMonthLabel(ymd: string): string {
  return String(parsePlainDate(ymd).getUTCDate());
}

export function monthDayLabel(ymd: string): string {
  return monthDayFormatter.format(parsePlainDate(ymd));
}

/** "TODAY", "YESTERDAY", or the weekday — the group heading in the list. */
export function relativeDayLabel(ymd: string, today = deviceToday()): string {
  if (ymd === today) return "Today";
  if (ymd === shiftDay(today, -1)) return "Yesterday";
  return weekdayLabel(ymd);
}

export type AlertDayGroup = {
  date: string;
  alerts: HistoryAlert[];
};

/** Newest day first, and newest alert first within each day. */
export function groupByDay(alerts: HistoryAlert[]): AlertDayGroup[] {
  const byDate = new Map<string, HistoryAlert[]>();

  for (const alert of alerts) {
    const day = alertDay(alert);
    const existing = byDate.get(day);
    if (existing) existing.push(alert);
    else byDate.set(day, [alert]);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, dayAlerts]) => ({
      date,
      alerts: dayAlerts.sort(
        (a, b) =>
          new Date(b.occuredAt).getTime() - new Date(a.occuredAt).getTime(),
      ),
    }));
}

/**
 * Fold live SSE alerts into the fetched window.
 *
 * Without this, an alert arriving while History is open wouldn't show until a
 * refetch. Merging by id also sidesteps the live list's own truncation — this
 * is a union, so it can only add.
 */
export function mergeLiveAlerts(
  history: HistoryAlert[],
  live: AlertLog[],
  from: string,
  to: string,
): HistoryAlert[] {
  const seen = new Set(history.map((alert) => alert.id));
  const merged = [...history];

  for (const alert of live) {
    if (seen.has(alert.id)) continue;
    const day = deviceLocalDate(alert.occuredAt);
    if (day < from || day > to) continue;
    seen.add(alert.id);
    merged.push(alert);
  }

  return merged;
}

export async function fetchAlertHistory(
  assistedUserID: number,
): Promise<HistoryFetch> {
  try {
    const response = await fetch(
      `${API_BASE}/alerts/${assistedUserID}/history`,
      { credentials: "include" },
    );

    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 404) return { status: "unavailable" };
    if (!response.ok) return { status: "error" };

    const body = (await response.json()) as unknown;

    // Tolerates a bare array, in case the endpoint ships without the envelope:
    // the window is then derived here rather than the screen breaking.
    if (Array.isArray(body)) {
      const to = deviceToday();
      return {
        status: "ok",
        history: {
          from: shiftDay(to, -(ALERT_RETENTION_DAYS - 1)),
          to,
          retentionDays: ALERT_RETENTION_DAYS,
          alerts: body as HistoryAlert[],
        },
      };
    }

    const envelope = body as Partial<AlertHistory> | null;
    if (!envelope || !Array.isArray(envelope.alerts)) return { status: "error" };

    const to = envelope.to ?? deviceToday();
    return {
      status: "ok",
      history: {
        from: envelope.from ?? shiftDay(to, -(ALERT_RETENTION_DAYS - 1)),
        to,
        retentionDays: envelope.retentionDays ?? ALERT_RETENTION_DAYS,
        alerts: envelope.alerts,
      },
    };
  } catch (error) {
    console.error("Failed to load alert history:", error);
    return { status: "error" };
  }
}
