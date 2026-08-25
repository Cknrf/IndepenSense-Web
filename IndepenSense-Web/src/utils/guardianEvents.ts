/**
 * A local record of "a guardian was added" pushes.
 *
 * This is a security signal — it's how a guardian notices an invite they didn't
 * expect being redeemed — so it must outlive the toast that announces it. There
 * is no backend endpoint to list these, so the record is client-side only, and
 * persisted rather than kept in memory: a reload must not erase the one trace
 * of someone gaining access.
 */

const STORAGE_KEY = "indepensense.guardianEvents";

const EVENT_CAP = 20;

export type GuardianEvent = {
  /** Stable across redeliveries of the same push, so a tap can't duplicate it. */
  id: string;
  assistedUserId: number;
  assistedUserName: string;
  guardianName: string;
  receivedAt: string;
};

export function guardianEventID(
  assistedUserId: number,
  guardianName: string,
): string {
  // A guardian can be added to a given assisted user only once — a second
  // redemption is a 409 — so this pair identifies the event.
  return `${assistedUserId}:${guardianName}`;
}

export function loadGuardianEvents(): GuardianEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as GuardianEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read guardian events:", error);
    return [];
  }
}

export function saveGuardianEvents(events: GuardianEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, EVENT_CAP)));
  } catch (error) {
    console.error("Failed to persist guardian events:", error);
  }
}

/** Called on sign-out: the next guardian on this device must not see these. */
export function clearGuardianEvents(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function addGuardianEvent(
  events: GuardianEvent[],
  event: GuardianEvent,
): GuardianEvent[] {
  if (events.some((e) => e.id === event.id)) return events;
  return [event, ...events].slice(0, EVENT_CAP);
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
