import { hash } from "@/lib/util/hash";

/** At most this many dots travel at the same moment, so the map reads calm at any event size. */
export const MAX_IN_FLIGHT = 6;

export interface Trip {
  key: string;
  /** Seconds the dot needs from the venue to the company. */
  seconds: number;
}

interface DotSchedule {
  /** Seconds into the loop when each dot sets off, by key. */
  offsets: Map<string, number>;
  /** Seconds in one loop. */
  period: number;
}

/**
 * Sets the dots off one after another at an even beat, in an order mixed by a hash of their
 * key so neighbouring companies take turns. The beat is the longest trip divided by the cap, so
 * a dot never sets off while `maxInFlight` others are still on their way. Pure and stable.
 */
export function dotSchedule(trips: readonly Trip[], maxInFlight = MAX_IN_FLIGHT): DotSchedule {
  if (trips.length === 0) return { offsets: new Map(), period: 1 };
  const longest = Math.max(...trips.map((t) => t.seconds));
  // A hair over the exact beat, so rounding never lets one more dot overlap.
  const beat = (longest / maxInFlight) * 1.001;
  const order = [...trips].sort((a, b) => (hash(a.key) % 1000) - (hash(b.key) % 1000) || a.key.localeCompare(b.key));
  const offsets = new Map(order.map((trip, i) => [trip.key, i * beat]));
  return { offsets, period: Math.max(order.length * beat, longest + beat) };
}

/** How many dots are on their way at a moment of the loop. */
export function inFlightAt(trips: readonly Trip[], schedule: DotSchedule, seconds: number): number {
  return trips.filter((trip) => {
    const since = (((seconds - (schedule.offsets.get(trip.key) ?? 0)) % schedule.period) + schedule.period) % schedule.period;
    return since < trip.seconds;
  }).length;
}
