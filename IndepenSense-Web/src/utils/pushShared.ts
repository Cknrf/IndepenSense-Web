import { API_BASE } from "./api";

/**
 * Transport-agnostic pieces shared by the FCM (native) and Web Push legs.
 *
 * Both transports sync to the same backend endpoint and surface alerts through
 * the same handler pair, so the only thing that differs between them is how a
 * token is obtained and how a delivered push reaches the page.
 */

export type PushPlatform = "fcm" | "webpush";

/** Data payload the backend attaches to every alert push, on both transports. */
export type PushAlertData = {
  alertId: number;
  assistedUserId: number;
  eventType: string;
  location: string;
};

export type EnablePushResult = "enabled" | "denied" | "unsupported" | "error";

export type PushHandlers = {
  /** Push arrived while the app was in the foreground — render it in-app. */
  onForegroundAlert?: (data: PushAlertData) => void;
  /** User tapped the notification. */
  onNotificationTap?: (data: PushAlertData) => void;
};

let handlers: PushHandlers = {};

/**
 * Register the callbacks that turn a delivered push into UI. Called once by
 * ProtectedLayout; later calls replace the previous handlers.
 */
export function setPushHandlers(next: PushHandlers): void {
  handlers = next;
}

export function emitForegroundAlert(data: PushAlertData): void {
  handlers.onForegroundAlert?.(data);
}

export function emitNotificationTap(data: PushAlertData): void {
  handlers.onNotificationTap?.(data);
}

export function parseAlertData(raw: unknown): PushAlertData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  // FCM flattens every data value to a string on Android; Web Push preserves
  // JSON types. Number() handles both.
  const alertId = Number(data.alertId);
  const assistedUserId = Number(data.assistedUserId);
  if (!Number.isFinite(alertId) || !Number.isFinite(assistedUserId)) return null;

  return {
    alertId,
    assistedUserId,
    eventType: typeof data.eventType === "string" ? data.eventType : "Alert",
    location: typeof data.location === "string" ? data.location : "",
  };
}

export async function postToken(
  platform: PushPlatform,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE}/push/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, token }),
  });
  if (!response.ok) {
    throw new Error(`Push register failed: ${response.status}`);
  }
}

export async function deleteToken(
  platform: PushPlatform,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE}/push/register`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, token }),
  });
  if (!response.ok) {
    throw new Error(`Push unregister failed: ${response.status}`);
  }
}
