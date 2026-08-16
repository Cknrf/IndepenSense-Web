import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { API_BASE } from "./api";

/**
 * Native push (FCM) registration.
 *
 * Phase 1 of push notifications: the Android shell only. The backend keeps a
 * platform-tagged token per guardian, so the web-push leg can be added later
 * without changing this contract.
 *
 * Everything here no-ops on the web build — a browser tab has no FCM token, and
 * Android's WebView has no Push API either, so `isPushSupported()` is the single
 * gate every entry point goes through.
 */

const CHANNEL_ID = "indepensense-alerts";
const PLATFORM = "fcm";

/** Data payload the backend attaches to every alert push. */
export type PushAlertData = {
  alertId: number;
  assistedUserId: number;
  eventType: string;
  location: string;
};

export type EnablePushResult = "enabled" | "denied" | "unsupported" | "error";

type PushHandlers = {
  /** Push arrived while the app was foregrounded — render it in-app. */
  onForegroundAlert?: (data: PushAlertData) => void;
  /** User tapped the notification from the tray. */
  onNotificationTap?: (data: PushAlertData) => void;
};

let handlers: PushHandlers = {};
let listenersAttached = false;
let currentToken: string | null = null;
/** Set while the toggle is on, so a rotated token isn't re-posted after opt-out. */
let registrationWanted = false;

export function isPushSupported(): boolean {
  return (
    Capacitor.isNativePlatform() &&
    Capacitor.isPluginAvailable("PushNotifications")
  );
}

/**
 * Register the callbacks that turn a delivered push into UI. Called once by
 * ProtectedLayout; later calls replace the previous handlers.
 */
export function setPushHandlers(next: PushHandlers): void {
  handlers = next;
}

function parseAlertData(raw: unknown): PushAlertData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  // FCM flattens every data value to a string on Android.
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

async function postToken(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/push/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform: PLATFORM, token }),
  });
  if (!response.ok) {
    throw new Error(`Push register failed: ${response.status}`);
  }
}

async function deleteToken(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/push/register`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform: PLATFORM, token }),
  });
  if (!response.ok) {
    throw new Error(`Push unregister failed: ${response.status}`);
  }
}

/**
 * Attach the native listeners exactly once per app lifetime.
 *
 * Deliberately not scoped to a React effect: StrictMode double-mounts would
 * churn native listeners, and `registration` can fire before a remount settles.
 */
async function attachListeners(): Promise<void> {
  if (listenersAttached) return;
  listenersAttached = true;

  // Fires on first register() and again whenever FCM rotates the token.
  await PushNotifications.addListener("registration", (token) => {
    currentToken = token.value;
    if (!registrationWanted) return;
    postToken(token.value).catch((error) =>
      console.error("Failed to sync push token:", error),
    );
  });

  await PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error:", error.error);
  });

  await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      const data = parseAlertData(notification.data);
      if (data) handlers.onForegroundAlert?.(data);
    },
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (action) => {
      const data = parseAlertData(action.notification.data);
      if (data) handlers.onNotificationTap?.(data);
    },
  );
}

/**
 * Heads-up channel so an alert interrupts rather than sitting silently in the
 * tray. Referenced by name from AndroidManifest.xml for background delivery.
 */
async function ensureAlertChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== "android") return;
  await PushNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Alerts",
    description: "Emergency alerts from the person you assist",
    importance: 5,
    visibility: 1,
    vibration: true,
  });
}

/**
 * Request permission if needed, then register with FCM. The token is posted to
 * the backend by the `registration` listener, not here — it arrives async.
 */
export async function enablePush(): Promise<EnablePushResult> {
  if (!isPushSupported()) return "unsupported";

  try {
    let status = await PushNotifications.checkPermissions();
    if (status.receive === "prompt" || status.receive === "prompt-with-rationale") {
      status = await PushNotifications.requestPermissions();
    }
    if (status.receive !== "granted") return "denied";

    registrationWanted = true;
    await ensureAlertChannel();
    await attachListeners();
    await PushNotifications.register();
    return "enabled";
  } catch (error) {
    console.error("Failed to enable push:", error);
    return "error";
  }
}

/**
 * Drop this device's token. Must run while the session cookie is still valid —
 * see the sign-out path in AuthContext.
 */
export async function disablePush(): Promise<void> {
  registrationWanted = false;
  if (!isPushSupported()) return;

  const token = currentToken;
  currentToken = null;

  try {
    if (token) await deleteToken(token);
  } catch (error) {
    console.error("Failed to unregister push token:", error);
  }

  try {
    await PushNotifications.unregister();
  } catch (error) {
    console.error("Failed to unregister from FCM:", error);
  }
}
