/**
 * Contact-number normalisation, mirroring the backend rule exactly.
 *
 * This number is what the wearable dials to send emergency SMS over its
 * cellular modem. The modem dials it verbatim and fails *silently* on anything
 * that isn't E.164 — a bad number looks perfectly fine on the form and then
 * reaches nobody at the one moment it matters. Hence the strictness, and hence
 * landlines being rejected despite being valid phone numbers: they cannot
 * receive SMS.
 *
 * Only Philippine mobile numbers are supported. A foreign number is rejected
 * even though it is well-formed E.164.
 *
 * This is a UX affordance only. The backend re-validates everything and stays
 * authoritative — see the 400 handling in Detail.tsx.
 */

/** A PH mobile in E.164: +63 then 9 then nine more digits. */
const PH_MOBILE = /^\+639\d{9}$/;

export const CONTACT_NUMBER_HELP =
  "Enter a mobile number that can receive SMS, e.g. 09171234567. Landlines won't work — the device sends emergency alerts by text.";

/**
 * Returns the number in E.164 form, or null if it isn't a PH mobile.
 *
 * The prefix branches are order-sensitive: "00" has to be consumed before a
 * single leading "0" would be read as the national trunk prefix.
 */
export function normalizePhilippineMobile(raw: string): string | null {
  let candidate = raw.trim().replace(/[\s\-().]/g, "");

  if (candidate.startsWith("00")) {
    candidate = `+${candidate.slice(2)}`;
  } else if (candidate.startsWith("0")) {
    candidate = `+63${candidate.slice(1)}`;
  } else if (/^639\d{9}$/.test(candidate)) {
    candidate = `+${candidate}`;
  } else if (/^9\d{9}$/.test(candidate)) {
    candidate = `+63${candidate}`;
  }

  return PH_MOBILE.test(candidate) ? candidate : null;
}
