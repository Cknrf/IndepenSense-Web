import {
  disableNativePush,
  enableNativePush,
  isNativePushSupported,
} from "./pushNative";
import { disableWebPush, enableWebPush, isWebPushSupported } from "./pushWeb";
import type { EnablePushResult } from "./pushShared";

/**
 * Push notifications, dispatched to whichever transport this build can use.
 *
 * The Capacitor Android shell gets FCM; browsers get Web Push (VAPID). They are
 * mutually exclusive — Android's WebView implements neither the Push API nor
 * service worker push, so the native leg always wins where it is available.
 *
 * Callers see one API and never branch on platform, with one exception:
 * `isNativePush()`, because a refused permission means different things on the
 * two platforms. See the registration effect in ProtectedLayout.
 */

export type {
  PushAlertData,
  PushGuardianAddedData,
  PushData,
  PushDelivery,
  EnablePushResult,
} from "./pushShared";
export { setPushHandlers } from "./pushShared";

export function isNativePush(): boolean {
  return isNativePushSupported();
}

export function isPushSupported(): boolean {
  return isNativePushSupported() || isWebPushSupported();
}

export async function enablePush(): Promise<EnablePushResult> {
  if (isNativePushSupported()) return enableNativePush();
  if (isWebPushSupported()) return enableWebPush();
  return "unsupported";
}

/**
 * Drop this device's token. Must run while the session cookie is still valid —
 * see the sign-out path in AuthContext.
 */
export async function disablePush(): Promise<void> {
  if (isNativePushSupported()) {
    await disableNativePush();
    return;
  }
  if (isWebPushSupported()) await disableWebPush();
}
