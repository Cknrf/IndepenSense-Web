import { API_BASE } from "./api";

/**
 * Transport-agnostic pieces shared by the FCM (native) and Web Push legs.
 *
 * Both transports sync to the same backend endpoint and surface pushes through
 * the same handler pair, so the only thing that differs between them is how a
 * token is obtained and how a delivered push reaches the page.
 */

export type PushPlatform = "fcm" | "webpush";

/** An emergency alert from the assisted user's device. */
export type PushAlertData = {
  type: "alert";
  alertId: number;
  assistedUserId: number;
  eventType: string;
  location: string;
};

/** Someone redeemed an invite and can now see one of our assisted users. */
export type PushGuardianAddedData = {
  type: "guardian-added";
  assistedUserId: number;
  assistedUserName: string;
  guardianName: string;
};

export type PushData = PushAlertData | PushGuardianAddedData;

/** Whether the push merely arrived, or the user tapped the notification. */
export type PushDelivery = "received" | "tapped";

export type EnablePushResult = "enabled" | "denied" | "unsupported" | "error";

export type PushHandlers = {
  onAlert?: (data: PushAlertData, delivery: PushDelivery) => void;
  onGuardianAdded?: (
    data: PushGuardianAddedData,
    delivery: PushDelivery,
  ) => void;
};

let handlers: PushHandlers = {};

/**
 * Register the callbacks that turn a delivered push into UI. Called once by
 * ProtectedLayout; later calls replace the previous handlers.
 */
export function setPushHandlers(next: PushHandlers): void {
  handlers = next;
}

export function emitPush(data: PushData, delivery: PushDelivery): void {
  if (data.type === "guardian-added") {
    handlers.onGuardianAdded?.(data, delivery);
    return;
  }
  handlers.onAlert?.(data, delivery);
}

export function parsePushData(raw: unknown): PushData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  // Payloads predating the `type` field are all alerts. Absent means alert;
  // anything unrecognised is dropped rather than mishandled as one.
  const type = typeof data.type === "string" ? data.type : "alert";

  // FCM flattens every data value to a string on Android; Web Push preserves
  // JSON types. Number() handles both.
  const assistedUserId = Number(data.assistedUserId);
  if (!Number.isFinite(assistedUserId)) return null;

  if (type === "guardian-added") {
    return {
      type: "guardian-added",
      assistedUserId,
      assistedUserName:
        typeof data.assistedUserName === "string" ? data.assistedUserName : "",
      guardianName:
        typeof data.guardianName === "string"
          ? data.guardianName
          : "Someone new",
    };
  }

  if (type !== "alert") return null;

  const alertId = Number(data.alertId);
  if (!Number.isFinite(alertId)) return null;

  return {
    type: "alert",
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
