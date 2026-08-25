import { API_BASE } from "./api";
import type { AssistedUserSummary, Guardian } from "../contexts/AuthContext";

/**
 * Guardian invites.
 *
 * A device is claimed exactly once, using the pairing code printed in its
 * manual. Every guardian after that first one joins by redeeming a single-use
 * invite minted by someone already linked to the assisted user — a device UUID
 * grants nothing and is never asked for.
 */

/**
 * Held while a signed-out invitee is sent through sign-up, so the token
 * survives the detour without riding along in every URL. sessionStorage, not
 * local: an invite is scoped to the tab that opened the link.
 */
const PENDING_INVITE_KEY = "indepensense.pendingInviteToken";

/** Invites last 30 minutes, so a held token is worthless long before this. */
export const INVITE_LIFETIME_MS = 30 * 60 * 1000;

export type MintedInvite = {
  token: string;
  expiresAt: string;
};

/**
 * The backend deliberately collapses unknown / expired / already-redeemed into
 * one 400, so an attacker can't tell them apart. The UI must not either.
 */
export type RedeemOutcome =
  | { status: "redeemed"; assistedUser: AssistedUserSummary }
  | { status: "invalid" }
  | { status: "already-linked" }
  | { status: "unauthenticated" }
  | { status: "error" };

export const INVALID_INVITE_MESSAGE =
  "This invite is no longer valid. Ask them to send you a new one.";

export const ALREADY_LINKED_MESSAGE =
  "You already have access to this person.";

export async function redeemInvite(token: string): Promise<RedeemOutcome> {
  try {
    const response = await fetch(`${API_BASE}/invites/redeem`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() }),
    });

    if (response.ok) {
      return {
        status: "redeemed",
        assistedUser: (await response.json()) as AssistedUserSummary,
      };
    }
    if (response.status === 409) return { status: "already-linked" };
    if (response.status === 401) return { status: "unauthenticated" };
    if (response.status === 400) return { status: "invalid" };
    return { status: "error" };
  } catch (error) {
    console.error("Invite redemption failed:", error);
    return { status: "error" };
  }
}

/**
 * Mint an invite for an assisted user. Only a guardian already linked to them
 * may do this — anyone else gets a 403, which is why the action is only ever
 * offered against the caller's own assisted user list.
 */
export async function mintInvite(
  assistedUserID: number,
): Promise<MintedInvite> {
  const response = await fetch(`${API_BASE}/invites`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assistedUserID }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Invite creation failed: ${response.status} ${body}`);
  }

  return (await response.json()) as MintedInvite;
}

export function inviteLink(token: string): string {
  return `${window.location.origin}/invite/${encodeURIComponent(token)}`;
}

export function holdPendingInvite(token: string): void {
  sessionStorage.setItem(PENDING_INVITE_KEY, token);
}

export function peekPendingInvite(): string | null {
  return sessionStorage.getItem(PENDING_INVITE_KEY);
}

export function clearPendingInvite(): void {
  sessionStorage.removeItem(PENDING_INVITE_KEY);
}

/**
 * Append a newly linked assisted user. Tolerates a duplicate, because a `/me`
 * refresh can land between the redeem response and this update.
 */
export function withAssistedUser(
  guardian: Guardian | null,
  assistedUser: AssistedUserSummary,
): Guardian | null {
  if (!guardian) return guardian;
  if (guardian.assistedUsers.some((u) => u.id === assistedUser.id)) {
    return guardian;
  }
  return {
    ...guardian,
    assistedUsers: [...guardian.assistedUsers, assistedUser],
  };
}
