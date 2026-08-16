/**
 * IndepenSense service worker — alert push delivery only.
 *
 * Deliberately implements no fetch/caching. Offline behaviour in the Android
 * shell is handled by Capacitor's errorPath (public/offline.html), and adding
 * a cache here would silently change how the web app serves assets.
 *
 * Expected push payload from the backend:
 *   { title, body, data: { alertId, assistedUserId, eventType, location } }
 */

const ALERT_MESSAGE = "push-alert";
const TAP_MESSAGE = "push-alert-tap";
const ALERTS_PATH = "/alerts";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("push", (event) => {
  event.waitUntil(showAlert(event));
});

async function showAlert(event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // A malformed or plain-text payload still deserves a visible notification —
    // userVisibleOnly requires one, and a dropped alert is worse than a vague one.
  }

  const data = payload.data ?? {};
  const title = payload.title ?? data.eventType ?? "Alert";
  const body = payload.body ?? data.location ?? "";

  const visibleClient = await findVisibleClient();

  // A visible page renders this as an in-app Toast, so don't buzz the device on
  // top of that. The notification itself is not optional: subscriptions are
  // userVisibleOnly, and staying silent gets the origin penalised by the browser.
  if (visibleClient) visibleClient.postMessage({ type: ALERT_MESSAGE, data });

  await self.registration.showNotification(title, {
    body,
    icon: "/favicon.svg",
    tag: data.alertId ? `alert-${data.alertId}` : "alert",
    silent: Boolean(visibleClient),
    requireInteraction: !visibleClient,
    data,
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(openAlerts(event.notification.data ?? {}));
});

async function openAlerts(data) {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  const existing = clientList[0];
  if (existing) {
    // Let the page switch to the right assisted user and route itself, rather
    // than a hard navigation that would drop app state.
    existing.postMessage({ type: TAP_MESSAGE, data });
    return existing.focus();
  }

  return self.clients.openWindow(ALERTS_PATH);
}

async function findVisibleClient() {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return clientList.find((client) => client.visibilityState === "visible");
}
