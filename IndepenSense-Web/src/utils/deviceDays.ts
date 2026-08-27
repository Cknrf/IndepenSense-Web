/**
 * Calendar-day helpers in the device's timezone.
 *
 * Day boundaries are Asia/Manila, not the viewer's: the device and the assisted
 * user are in PH, so "Thursday" has to mean their Thursday. A guardian checking
 * in from abroad must see events bucketed the way they were lived.
 *
 * Shared by the alert and location history screens, which both group records
 * into days and both render the same day strip.
 */

const DEVICE_TIME_ZONE = "Asia/Manila";

/*
 * Formatters are module-level: constructing an Intl formatter is not cheap, and
 * these are hit once per record per render.
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

/** Clock time of an instant, in the device's timezone. */
export function formatDeviceTime(iso: string): string {
  return localTimeFormatter.format(new Date(iso));
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

/** "Today", "Yesterday", or the weekday — the group heading in a day list. */
export function relativeDayLabel(ymd: string, today = deviceToday()): string {
  if (ymd === today) return "Today";
  if (ymd === shiftDay(today, -1)) return "Yesterday";
  return weekdayLabel(ymd);
}
