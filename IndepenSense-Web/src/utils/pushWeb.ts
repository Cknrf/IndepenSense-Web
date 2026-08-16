import { API_BASE } from "./api";
import {
  deleteToken,
  emitForegroundAlert,
  emitNotificationTap,
  parseAlertData,
  postToken,
  type EnablePushResult,
} from "./pushShared";

/**
 * Web Push (VAPID) for browsers.
 *
 * The service worker in public/sw.js does the actual display, because a push
 * can arrive with no page open at all. It messages the page when one is, so a
 * foreground alert still reaches the in-app Toast.
 */

const SERVICE_WORKER_URL = "/sw.js";

/** Messages posted by public/sw.js. Keep the type strings in sync. */
const SW_ALERT_MESSAGE = "push-alert";
const SW_TAP_MESSAGE = "push-alert-tap";

let messageListenerAttached = false;

export function isWebPushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * VAPID keys are base64url; `applicationServerKey` wants raw bytes.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  // Backed by an explicit ArrayBuffer: applicationServerKey wants a
  // BufferSource, which excludes the SharedArrayBuffer-backed variant.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function fetchVapidPublicKey(): Promise<string> {
  const response = await fetch(`${API_BASE}/push/vapid-key`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`VAPID key fetch failed: ${response.status}`);
  }
  const body = (await response.json()) as { publicKey?: string };
  if (!body.publicKey) {
    throw new Error("VAPID key response is missing publicKey");
  }
  return body.publicKey;
}

/**
 * Bridge service worker messages into the same handlers the native leg uses.
 * Attached once per page lifetime, for the same reason as the native listeners.
 */
function attachMessageListener(): void {
  if (messageListenerAttached) return;
  messageListenerAttached = true;

  navigator.serviceWorker.addEventListener("message", (event) => {
    const message = event.data as { type?: string; data?: unknown } | null;
    if (!message?.type) return;

    const data = parseAlertData(message.data);
    if (!data) return;

    if (message.type === SW_ALERT_MESSAGE) emitForegroundAlert(data);
    else if (message.type === SW_TAP_MESSAGE) emitNotificationTap(data);
  });
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  const existing =
    await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
  return existing ?? null;
}

export async function enableWebPush(): Promise<EnablePushResult> {
  if (!isWebPushSupported()) return "unsupported";

  try {
    if (Notification.permission === "denied") return "denied";
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return "denied";
    }

    const registration = await navigator.serviceWorker.register(
      SERVICE_WORKER_URL,
    );
    await navigator.serviceWorker.ready;
    attachMessageListener();

    // Reuse the existing subscription when there is one — resubscribing would
    // invalidate the endpoint the backend already holds.
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          await fetchVapidPublicKey(),
        ),
      });
    }

    await postToken("webpush", JSON.stringify(subscription));
    return "enabled";
  } catch (error) {
    console.error("Failed to enable web push:", error);
    return "error";
  }
}

export async function disableWebPush(): Promise<void> {
  if (!isWebPushSupported()) return;

  try {
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    // Delete before unsubscribing — the subscription JSON is the token.
    try {
      await deleteToken("webpush", JSON.stringify(subscription));
    } catch (error) {
      console.error("Failed to unregister web push subscription:", error);
    }

    await subscription.unsubscribe();
  } catch (error) {
    console.error("Failed to disable web push:", error);
  }
}
