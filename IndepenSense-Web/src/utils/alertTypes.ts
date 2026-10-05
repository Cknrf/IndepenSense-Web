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

/** Whether a geocoded string is a real place name rather than a failure. */
export function isResolvedLocation(
  location: string | null | undefined,
): boolean {
  const trimmed = (location ?? "").trim();
  return trimmed !== "" && trimmed.toLowerCase() !== LOCATION_UNAVAILABLE;
}

/**
 * Whether a coordinate pair is a real GPS fix. The device sends 0,0 when it has
 * none, which is a point in the ocean rather than a place.
 */
export function hasFix(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0)
  );
}

/**
 * The place to show for a record. Falls back to its coordinates when the
 * geocoder had no name: the coordinates are where the person actually was, and
 * in an emergency that is far more useful than "Location unavailable".
 */
export function alertLocation(
  location: string | null | undefined,
  latitude?: number | null,
  longitude?: number | null,
): AlertLocation {
  if (isResolvedLocation(location)) {
    return { text: (location ?? "").trim(), known: true };
  }

  if (hasFix(latitude, longitude)) {
    return {
      text: `${latitude.toFixed(COORDINATE_DECIMALS)}, ${(longitude as number).toFixed(COORDINATE_DECIMALS)}`,
      known: true,
    };
  }

  return { text: "Location unavailable", known: false };
}

/**
 * Matches formatCoordinate in locationHistory.ts, which imports this module and
 * so can't be imported back here.
 */
const COORDINATE_DECIMALS = 5;
