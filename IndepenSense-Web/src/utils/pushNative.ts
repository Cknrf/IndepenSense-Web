import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import {
  deleteToken,
  emitForegroundAlert,
  emitNotificationTap,
  parseAlertData,
  postToken,
  type EnablePushResult,
} from "./pushShared";

/**
 * Native push (FCM) for the Capacitor Android shell.
 *
 * Android's WebView has no Push API, so the web leg in pushWeb.ts cannot cover
 * the app — these are genuinely two transports, dispatched by push.ts.
 */

const CHANNEL_ID = "indepensense-alerts";

let listenersAttached = false;
let currentToken: string | null = null;
/** Set while the toggle is on, so a rotated token isn't re-posted after opt-out. */
let registrationWanted = false;

export function isNativePushSupported(): boolean {
  return (
    Capacitor.isNativePlatform() &&
    Capacitor.isPluginAvailable("PushNotifications")
  );
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
    postToken("fcm", token.value).catch((error) =>
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
      if (data) emitForegroundAlert(data);
    },
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (action) => {
      const data = parseAlertData(action.notification.data);
      if (data) emitNotificationTap(data);
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
export async function enableNativePush(): Promise<EnablePushResult> {
  if (!isNativePushSupported()) return "unsupported";

  try {
    let status = await PushNotifications.checkPermissions();
    if (
      status.receive === "prompt" ||
      status.receive === "prompt-with-rationale"
    ) {
      status = await PushNotifications.requestPermissions();
    }
    if (status.receive !== "granted") return "denied";

    registrationWanted = true;
    await ensureAlertChannel();
    await attachListeners();
    await PushNotifications.register();
    return "enabled";
  } catch (error) {
    console.error("Failed to enable native push:", error);
    return "error";
  }
}

/**
 * Drop this device's token. Must run while the session cookie is still valid —
 * see the sign-out path in AuthContext.
 */
export async function disableNativePush(): Promise<void> {
  registrationWanted = false;
  if (!isNativePushSupported()) return;

  const token = currentToken;
  currentToken = null;

  try {
    if (token) await deleteToken("fcm", token);
  } catch (error) {
    console.error("Failed to unregister push token:", error);
  }

  try {
    await PushNotifications.unregister();
  } catch (error) {
    console.error("Failed to unregister from FCM:", error);
  }
}
