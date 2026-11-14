import type { MapPoint } from "@/lib/geo/espoo";

/** A round marker on the map, in view units. */
export interface Circle extends MapPoint {
  r: number;
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Control point of a soft quadratic curve from `from` to `to`. `bend` is the sideways offset
 * as a share of the distance; a positive bend bows to the left of the direction of travel
 * (as seen on screen, y down), a negative one to the right.
 */
export function curveControl(from: MapPoint, to: MapPoint, bend: number): MapPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return { x: (from.x + to.x) / 2 + dy * bend, y: (from.y + to.y) / 2 - dx * bend };
}

/** The SVG path of that curve. */
export function curvePath(from: MapPoint, control: MapPoint, to: MapPoint): string {
  return `M${round(from.x)} ${round(from.y)}Q${round(control.x)} ${round(control.y)} ${round(to.x)} ${round(to.y)}`;
}

/** A point on a quadratic curve at t from 0 to 1. */
export function pointOnCurve(from: MapPoint, control: MapPoint, to: MapPoint, t: number): MapPoint {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
  };
}

/** Cubic ease-in-out: a dot sets off gently and settles gently. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Spreads `count` markers around an anchor, starting at `startAngle` degrees (0 = east,
 * 90 = south on screen) and turning `stepAngle` degrees between neighbours; by default they
 * share the full circle. The radius is just big enough for neighbours to sit `spacing`
 * apart. One marker stays on the anchor.
 */
export function fanOut(anchor: MapPoint, count: number, spacing: number, startAngle: number, stepAngle = 360 / count): MapPoint[] {
  if (count <= 1) return count === 1 ? [{ ...anchor }] : [];
  const radius = spacing / (2 * Math.sin((stepAngle * Math.PI) / 360));
  return Array.from({ length: count }, (_, i) => {
    const angle = ((startAngle + stepAngle * i) * Math.PI) / 180;
    return { x: anchor.x + radius * Math.cos(angle), y: anchor.y + radius * Math.sin(angle) };
  });
}

/**
 * Pushes overlapping markers apart until each pair is at least `gap` apart edge to edge.
 * Fixed markers (the venue) never move. Deterministic: same input, same output.
 */
export function separate(markers: readonly Circle[], fixed: readonly Circle[], gap: number, rounds = 60): Circle[] {
  const moved = markers.map((m) => ({ ...m }));
  for (let round = 0; round < rounds; round++) {
    let overlapping = false;
    for (let i = 0; i < moved.length; i++) {
      for (let j = i + 1; j < moved.length; j++) {
        overlapping = pushApart(moved[i], moved[j], gap, 0.5, i + j) || overlapping;
      }
      for (const anchor of fixed) {
        overlapping = pushApart(moved[i], anchor, gap, 1, i) || overlapping;
      }
    }
    if (!overlapping) break;
  }
  return moved;
}

/** Moves `a` (and `b`, unless `shareOfA` is 1) apart along the line between them. */
function pushApart(a: Circle, b: Circle, gap: number, shareOfA: number, seed: number): boolean {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let distance = Math.hypot(dx, dy);
  const needed = a.r + b.r + gap;
  if (distance >= needed - 1e-6) return false;
  if (distance === 0) {
    // Same spot: split along a direction taken from the index, so the result is stable.
    dx = Math.cos(seed);
    dy = Math.sin(seed);
    distance = 1;
  }
  const push = needed - Math.hypot(a.x - b.x, a.y - b.y);
  const ux = dx / distance;
  const uy = dy / distance;
  a.x += ux * push * shareOfA;
  a.y += uy * push * shareOfA;
  if (shareOfA < 1) {
    b.x -= ux * push * (1 - shareOfA);
    b.y -= uy * push * (1 - shareOfA);
  }
  return true;
}
