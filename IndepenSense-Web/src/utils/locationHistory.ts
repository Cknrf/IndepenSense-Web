import { API_BASE } from "./api";
import { deviceLocalDate, deviceToday, shiftDay } from "./deviceDays";
import { isResolvedLocation } from "./alertTypes";

/**
 * Location history: turning a stream of GPS samples into places someone visited.
 *
 * The device reports roughly every 30 seconds, so a day is ~2,880 samples. That
 * is not 2,880 places — a wearable sitting at home emits hundreds of samples at
 * one coordinate, jittering by 10-20 m. Listing them raw would bury the one
 * thing a guardian wants to know, which is where the person actually went.
 *
 * So consecutive nearby samples are collapsed into visits. A normal day becomes
 * a handful; a day spent at home becomes exactly one.
 *
 * The clustering runs here rather than only on the backend so the feature works
 * against a minimal endpoint. When the backend has already clustered, this pass
 * must NOT run its duration floor: a server-side visit carries one timestamp, so
 * its span looks like zero and every stop but the last would be discarded. See
 * `visitsForDay`, which decides which case it is looking at.
 */

export const LOCATION_RETENTION_DAYS = 7;

/**
 * Samples within this distance of a visit's running centre belong to it.
 *
 * Tuned against consumer GPS drift while stationary (commonly 10-20 m, worse
 * indoors) and against how close two genuinely different destinations get on a
 * city street. Raise it and neighbouring shops merge; lower it and standing
 * still splits into several visits.
 */
export const VISIT_RADIUS_METERS = 75;

/**
 * Visits shorter than this are dropped as pass-throughs — samples recorded
 * while walking past somewhere, not stopping at it.
 *
 * Raise it and a genuine short errand disappears; lower it and the list fills
 * with points along the route.
 */
export const MIN_VISIT_MINUTES = 5;

/**
 * Above this many records for one day, the payload must be raw samples: 30s
 * reporting yields ~2,880 a day, while clustered visits are a handful.
 *
 * Used only as a fallback. The backend collapsing samples into visits without
 * sending `lastSeenAt` or `sampleCount` leaves each visit a single instant with
 * zero apparent dwell, which the duration floor would then discard — turning a
 * four-stop day into one. When either field is present this guess is not needed.
 */
const PRE_CLUSTERED_MAX_RECORDS = 50;

export type LocationSample = {
  latitude: number;
  longitude: number;
  location: string;
  /** ISO instant the sample was recorded. */
  recordedAt: string;
  /**
   * Set only when the backend already clustered and told us when the visit
   * ended. Without it a server-side visit collapses to a single instant and
   * its dwell time is unknowable.
   */
  lastSeenAt?: string;
  /** How many raw samples this record stands for, when it is a visit. */
  sampleCount?: number;
};

export type LocationVisit = {
  /** Stable within a day's render: the first sample's timestamp. */
  id: string;
  /** Mean of the visit's samples, so jitter doesn't skew the pin. */
  latitude: number;
  longitude: number;
  /** Geocoded name from the samples; may be absent or unresolvable. */
  location: string;
  arrivedAt: string;
  lastSeenAt: string;
  sampleCount: number;
};

export type LocationHistory = {
  from: string;
  to: string;
  retentionDays: number;
  /** Chronological. Already clustered if the backend did it, raw otherwise. */
  samples: LocationSample[];
};

export type LocationFetch =
  | { status: "ok"; history: LocationHistory }
  | { status: "unauthorized" }
  | { status: "unavailable" }
  | { status: "error" };

const EARTH_RADIUS_METERS = 6_371_000;

/** Great-circle distance. Accurate enough at city scale, and dependency-free. */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b.longitude - a.longitude);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function visitDurationMs(visit: LocationVisit): number {
  return (
    new Date(visit.lastSeenAt).getTime() - new Date(visit.arrivedAt).getTime()
  );
}

type Cluster = {
  latitudeSum: number;
  longitudeSum: number;
  count: number;
  arrivedAt: string;
  lastSeenAt: string;
  /**
   * Every resolved name seen in the cluster, with how often.
   *
   * A cluster absorbs the approach samples too, and those are geocoded to
   * whatever the walk passed through. Taking the first name would label a stop
   * by the street it was reached from, so the most frequent name wins: the
   * stay dominates the approach.
   */
  names: Map<string, number>;
};

/** The most frequently seen resolved name, or "" if none resolved. */
function dominantName(names: Map<string, number>): string {
  let best = "";
  let bestCount = 0;
  for (const [name, count] of names) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

function countName(cluster: Cluster, location: string): void {
  if (!isResolvedLocation(location)) return;
  const name = location.trim();
  cluster.names.set(name, (cluster.names.get(name) ?? 0) + 1);
}

function laterOf(a: string, b: string): string {
  return new Date(b).getTime() > new Date(a).getTime() ? b : a;
}

function clusterCentre(cluster: Cluster) {
  return {
    latitude: cluster.latitudeSum / cluster.count,
    longitude: cluster.longitudeSum / cluster.count,
  };
}

function toVisit(cluster: Cluster): LocationVisit {
  const centre = clusterCentre(cluster);
  return {
    id: cluster.arrivedAt,
    latitude: centre.latitude,
    longitude: centre.longitude,
    location: dominantName(cluster.names),
    arrivedAt: cluster.arrivedAt,
    lastSeenAt: cluster.lastSeenAt,
    sampleCount: cluster.count,
  };
}

function isUsableSample(sample: LocationSample): boolean {
  return (
    Number.isFinite(sample.latitude) &&
    Number.isFinite(sample.longitude) &&
    // 0,0 is in the Atlantic — it means "no fix", not a location.
    !(sample.latitude === 0 && sample.longitude === 0) &&
    !Number.isNaN(new Date(sample.recordedAt).getTime())
  );
}

export type ClusterOptions = {
  radiusMeters?: number;
  minVisitMinutes?: number;
  /**
   * Drop visits below the duration floor. Turned off for input that is already
   * clustered, where a zero span means "no end time was reported", not "they
   * only stayed a moment".
   */
  applyDurationFloor?: boolean;
};

/**
 * Collapse samples into visits.
 *
 * 1. Sweep chronologically, growing a cluster while samples stay within the
 *    radius of its running centre. The centre is used rather than the first
 *    sample so slow drift doesn't spuriously end a visit.
 * 2. Merge consecutive clusters whose centres are within the radius — jitter at
 *    the boundary can otherwise split one stay in two.
 * 3. Drop clusters below the duration floor, always keeping the last one (that
 *    is where the person is now, however briefly) and never returning empty
 *    when there was data (fall back to the longest).
 */
export function clusterVisits(
  samples: LocationSample[],
  options: ClusterOptions = {},
): LocationVisit[] {
  const radius = options.radiusMeters ?? VISIT_RADIUS_METERS;
  const minDurationMs = (options.minVisitMinutes ?? MIN_VISIT_MINUTES) * 60_000;
  const applyFloor = options.applyDurationFloor ?? true;

  const ordered = samples
    .filter(isUsableSample)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

  if (ordered.length === 0) return [];

  const clusters: Cluster[] = [];

  for (const sample of ordered) {
    const current = clusters[clusters.length - 1];

    if (
      current &&
      distanceMeters(clusterCentre(current), sample) <= radius
    ) {
      const weight = sample.sampleCount ?? 1;
      current.latitudeSum += sample.latitude * weight;
      current.longitudeSum += sample.longitude * weight;
      current.count += weight;
      current.lastSeenAt = laterOf(
        current.lastSeenAt,
        sample.lastSeenAt ?? sample.recordedAt,
      );
      countName(current, sample.location);
      continue;
    }

    const weight = sample.sampleCount ?? 1;
    const started: Cluster = {
      latitudeSum: sample.latitude * weight,
      longitudeSum: sample.longitude * weight,
      count: weight,
      arrivedAt: sample.recordedAt,
      lastSeenAt: sample.lastSeenAt ?? sample.recordedAt,
      names: new Map(),
    };
    countName(started, sample.location);
    clusters.push(started);
  }

  // Step 2: merge neighbours that are really the same place.
  const merged: Cluster[] = [];
  for (const cluster of clusters) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      distanceMeters(clusterCentre(previous), clusterCentre(cluster)) <= radius
    ) {
      previous.latitudeSum += cluster.latitudeSum;
      previous.longitudeSum += cluster.longitudeSum;
      previous.count += cluster.count;
      previous.lastSeenAt = cluster.lastSeenAt;
      for (const [name, count] of cluster.names) {
        previous.names.set(name, (previous.names.get(name) ?? 0) + count);
      }
      continue;
    }
    merged.push({ ...cluster, names: new Map(cluster.names) });
  }

  const visits = merged.map(toVisit);

  // Step 3: drop pass-throughs.
  if (!applyFloor) return visits;

  const lastVisit = visits[visits.length - 1];
  const kept = visits.filter(
    (visit) =>
      visit === lastVisit || visitDurationMs(visit) >= minDurationMs,
  );

  if (kept.length > 0) return kept;

  const longest = visits.reduce((best, visit) =>
    visitDurationMs(visit) > visitDurationMs(best) ? visit : best,
  );
  return [longest];
}

/** Newest first, for the stops list. The map wants chronological order. */
export function newestFirst(visits: LocationVisit[]): LocationVisit[] {
  return [...visits].sort(
    (a, b) =>
      new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime(),
  );
}

/** True when these records are visits the backend already collapsed. */
export function looksPreClustered(records: LocationSample[]): boolean {
  // An explicit end time or sample count is proof, and is the intended signal.
  if (
    records.some(
      (record) => record.lastSeenAt !== undefined || record.sampleCount !== undefined,
    )
  ) {
    return true;
  }

  // Otherwise fall back on density: 30s reporting cannot produce a day this
  // sparse, so these must be visits.
  return records.length > 0 && records.length <= PRE_CLUSTERED_MAX_RECORDS;
}

/**
 * The visits to draw for one day, whichever shape the backend sent.
 *
 * Clustering pre-clustered records is safe as long as the duration floor is
 * skipped: consecutive visits are far apart, so each stays its own cluster, and
 * the pass then just normalises them into `LocationVisit`.
 */
export function visitsForDay(
  samples: LocationSample[],
  day: string,
): LocationVisit[] {
  const forDay = samplesForDay(samples, day);
  return clusterVisits(forDay, {
    applyDurationFloor: !looksPreClustered(forDay),
  });
}

export function samplesForDay(
  samples: LocationSample[],
  day: string,
): LocationSample[] {
  return samples.filter(
    (sample) => deviceLocalDate(sample.recordedAt) === day,
  );
}

/**
 * Coordinates rounded for display.
 *
 * Raw values arrive at full float precision (`13.937378433333333`), which is
 * sub-micron nonsense from a consumer GPS and long enough to wrap onto three
 * lines on a phone. Five decimals is about a metre — finer than the fix itself.
 */
const COORDINATE_DECIMALS = 5;

export function formatCoordinate(value: number): string {
  return Number.isFinite(value) ? value.toFixed(COORDINATE_DECIMALS) : "—";
}

export function formatCoordinates(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "—";
  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}

export function formatVisitDuration(visit: LocationVisit): string {
  const minutes = Math.round(visitDurationMs(visit) / 60_000);
  if (minutes < 1) return "moments";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/**
 * Field names differ between "what the interval endpoint stores" and what a
 * history route might emit, so the timestamp is read from any of the plausible
 * keys rather than failing silently on a mismatch.
 */
function normalizeSample(raw: unknown): LocationSample | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const recordedAt =
    record.recordedAt ?? record.occuredAt ?? record.createdAt ?? record.timestamp;
  if (typeof recordedAt !== "string") return null;

  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const lastSeenAt = record.lastSeenAt ?? record.departedAt ?? record.endedAt;
  const sampleCount = Number(record.sampleCount);

  return {
    latitude,
    longitude,
    location: typeof record.location === "string" ? record.location : "",
    recordedAt,
    ...(typeof lastSeenAt === "string" ? { lastSeenAt } : {}),
    ...(Number.isFinite(sampleCount) && sampleCount > 0
      ? { sampleCount }
      : {}),
  };
}

export async function fetchLocationHistory(
  assistedUserID: number,
): Promise<LocationFetch> {
  try {
    const response = await fetch(
      `${API_BASE}/interval-information/${assistedUserID}/history`,
      { credentials: "include" },
    );

    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 404) return { status: "unavailable" };
    if (!response.ok) return { status: "error" };

    const body = (await response.json()) as unknown;
    const to = deviceToday();
    const fallbackFrom = shiftDay(to, -(LOCATION_RETENTION_DAYS - 1));

    const rawSamples = Array.isArray(body)
      ? body
      : ((body as { samples?: unknown[] } | null)?.samples ?? null);

    if (!Array.isArray(rawSamples)) return { status: "error" };

    const samples = rawSamples
      .map(normalizeSample)
      .filter((sample): sample is LocationSample => sample !== null);

    const envelope = Array.isArray(body)
      ? null
      : (body as Partial<LocationHistory>);

    return {
      status: "ok",
      history: {
        from: envelope?.from ?? fallbackFrom,
        to: envelope?.to ?? to,
        retentionDays: envelope?.retentionDays ?? LOCATION_RETENTION_DAYS,
        samples,
      },
    };
  } catch (error) {
    console.error("Failed to load location history:", error);
    return { status: "error" };
  }
}
