/**
 * IndepenSense service worker — push delivery only.
 *
 * Deliberately implements no fetch/caching. Offline behaviour in the Android
 * shell is handled by Capacitor's errorPath (public/offline.html), and adding
 * a cache here would silently change how the web app serves assets.
 *
 * Expected push payload from the backend:
 *   { title, body, data: { type, ... } }
 * where type is either
 *   "alert"          → alertId, assistedUserId, eventType, location
 *   "guardian-added" → assistedUserId, assistedUserName, guardianName
 * A payload with no `type` is treated as an alert, which is what every payload
 * was before the field existed.
 */

const RECEIVED_MESSAGE = "push-received";
const TAP_MESSAGE = "push-tapped";
const ALERTS_PATH = "/alerts";
const HOME_PATH = "/home";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("push", (event) => {
  event.waitUntil(showPush(event));
});

async function showPush(event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // A malformed or plain-text payload still deserves a visible notification —
    // userVisibleOnly requires one, and a dropped alert is worse than a vague one.
  }

  const data = payload.data ?? {};
  const isGuardianAdded = data.type === "guardian-added";

  const visibleClient = await findVisibleClient();

  // A visible page renders this in-app, so don't buzz the device on top of
  // that. The notification itself is not optional: subscriptions are
  // userVisibleOnly, and staying silent gets the origin penalised by the browser.
  if (visibleClient) {
    visibleClient.postMessage({ type: RECEIVED_MESSAGE, data });
  }

  const options = isGuardianAdded
    ? guardianAddedOptions(payload, data)
    : alertOptions(payload, data, visibleClient);

  await self.registration.showNotification(options.title, {
    body: options.body,
    icon: "/favicon.svg",
    tag: options.tag,
    silent: Boolean(visibleClient),
    requireInteraction: options.requireInteraction,
    data,
  });
}

function alertOptions(payload, data, visibleClient) {
  return {
    title: payload.title ?? data.eventType ?? "Alert",
    body: payload.body ?? data.location ?? "",
    tag: data.alertId ? `alert-${data.alertId}` : "alert",
    // An emergency must not be dismissible by inattention.
    requireInteraction: !visibleClient,
  };
}

function guardianAddedOptions(payload, data) {
  const fallbackBody =
    data.guardianName && data.assistedUserName
      ? `${data.guardianName} can now see ${data.assistedUserName}.`
      : "Someone new has access to your assisted user.";

  return {
    title: payload.title ?? "New guardian added",
    body: payload.body ?? fallbackBody,
    // Per assisted user and guardian, so repeated deliveries collapse but two
    // different people being added stay two notifications.
    tag: `guardian-${data.assistedUserId}-${data.guardianName ?? "unknown"}`,
    // Important, but not an emergency — let it be swiped away.
    requireInteraction: false,
  };
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(openForPush(event.notification.data ?? {}));
});

async function openForPush(data) {
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

  return self.clients.openWindow(
    data.type === "guardian-added" ? HOME_PATH : ALERTS_PATH,
  );
}

async function findVisibleClient() {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return clientList.find((client) => client.visibilityState === "visible");
}
