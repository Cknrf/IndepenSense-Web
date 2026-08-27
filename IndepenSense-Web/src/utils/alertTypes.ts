/**
 * Presentation for the backend's alert type enum.
 *
 * `eventType` arrives as one of four DB enum values. Rendering it raw is wrong
 * in two ways: "Connectivity" isn't a sentence a worried relative should have to
 * interpret, and a low battery is not an emergency — showing it with the same
 * red emergency triangle as a fall trains guardians to discount the triangle.
 */

export type AlertSeverity = "emergency" | "warning";

export type AlertIcon = "alert" | "fall" | "battery" | "signal";

export type AlertTypeMeta = {
  label: string;
  severity: AlertSeverity;
  icon: AlertIcon;
};

/** Keys are the exact DB enum values from alert_log.entity.ts. */
const ALERT_TYPES: Record<string, AlertTypeMeta> = {
  "Emergency Alert": {
    label: "Emergency Alert",
    severity: "emergency",
    icon: "alert",
  },
  "Fall Detection": {
    label: "Fall Detected",
    severity: "emergency",
    icon: "fall",
  },
  "Low Battery": {
    label: "Low Battery",
    severity: "warning",
    icon: "battery",
  },
  Connectivity: {
    label: "Device Offline",
    severity: "warning",
    icon: "signal",
  },
};

/**
 * Unknown types are treated as emergencies, not warnings.
 *
 * The enum can grow on the backend before this map is updated, and in a safety
 * product the safe default is to over-alert rather than quietly downgrade
 * something that might be a fall. The raw value is shown so it's still legible.
 */
export function alertTypeMeta(eventType: string): AlertTypeMeta {
  return (
    ALERT_TYPES[eventType] ?? {
      label: eventType || "Alert",
      severity: "emergency",
      icon: "alert",
    }
  );
}

export function alertTypeLabel(eventType: string): string {
  return alertTypeMeta(eventType).label;
}

/**
 * The backend stores this literal string when the reverse geocode fails, and it
 * would otherwise be rendered to the user as if it were a place name.
 */
const LOCATION_UNAVAILABLE = "unable to retrieve location";

export type AlertLocation = {
  text: string;
  /** False when there is no real place name, so the UI can mute it. */
  known: boolean;
};

export function alertLocation(location: string | null | undefined): AlertLocation {
  const trimmed = (location ?? "").trim();

  if (!trimmed || trimmed.toLowerCase() === LOCATION_UNAVAILABLE) {
    return { text: "Location unavailable", known: false };
  }

  return { text: trimmed, known: true };
}
