import { formatDeviceTime, deviceLocalDate, monthDayLabel } from "./deviceDays";

/**
 * Whether the latest interval report still describes the device right now.
 *
 * The backend serves the newest row it has, however old. Without this check a
 * wearable that was switched off yesterday kept showing "Connected: Yes" and
 * its last position as if live — `internetStatus` is the device's own claim,
 * made at the moment it reported, and says nothing once it stops reporting.
 */

/**
 * The device reports every 30s. Four missed reports is a device that is off,
 * out of coverage or out of battery, not one that is merely a little late.
 */
export const DEVICE_STALE_MS = 2 * 60_000;

export function isDeviceLive(
  reportedAt: string | null | undefined,
  now: number,
): boolean {
  if (!reportedAt) return false;
  const at = new Date(reportedAt).getTime();
  return Number.isFinite(at) && now - at < DEVICE_STALE_MS;
}

/** "Just now", "12 min ago", "3:14 PM", or "Oct 4, 3:14 PM" for older days. */
export function formatLastSeen(
  reportedAt: string | null | undefined,
  now: number,
): string {
  if (!reportedAt) return "Unknown";
  const at = new Date(reportedAt).getTime();
  if (!Number.isFinite(at)) return "Unknown";

  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const day = deviceLocalDate(reportedAt);
  const time = formatDeviceTime(reportedAt);
  return day === deviceLocalDate(new Date(now).toISOString())
    ? time
    : `${monthDayLabel(day)}, ${time}`;
}
