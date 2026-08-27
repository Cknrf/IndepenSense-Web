import { API_BASE } from "./api";
import { deviceLocalDate, deviceToday, formatDeviceTime, shiftDay } from "./deviceDays";
import type { AlertLog } from "../layouts/ProtectedLayout";

/**
 * The 7-day alert history behind the Alerts screen's History tab.
 *
 * The window itself is the server's to decide — it enforces the 7 days, and
 * this module only renders what it reports. A client-side cutoff would be
 * cosmetic, since the older alerts would already be in the browser.
 *
 * Day bucketing lives in deviceDays.ts, shared with the location history.
 */

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

/** The day an alert belongs to. Prefers the server's value over re-deriving. */
export function alertDay(alert: HistoryAlert): string {
  return alert.occuredAtLocalDate ?? deviceLocalDate(alert.occuredAt);
}

export function formatAlertTime(alert: HistoryAlert): string {
  return formatDeviceTime(alert.occuredAt);
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
