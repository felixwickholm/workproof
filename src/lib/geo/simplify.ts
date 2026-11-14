/** A point as [x, y]. Plain tuples, so the build script can pass raw coordinates straight in. */
export type Point = readonly [number, number];

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Douglas-Peucker line simplification. Keeps the first and last point and every point that
 * lies further than `tolerance` from the simplified line. Iterative, so long borders cannot
 * overflow the stack.
 */
export function simplifyLine(points: readonly Point[], tolerance: number): Point[] {
  if (points.length <= 2) return [...points];
  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    let farthest = -1;
    let farthestDistance = tolerance;
    for (let i = start + 1; i < end; i++) {
      const d = distanceToSegment(points[i], points[start], points[end]);
      if (d > farthestDistance) {
        farthest = i;
        farthestDistance = d;
      }
    }
    if (farthest !== -1) {
      keep[farthest] = true;
      stack.push([start, farthest], [farthest, end]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/**
 * Simplifies a closed ring (first point not repeated at the end). The ring is split at the
 * point farthest from its first point, so the two halves are simplified as open lines and
 * the shape never collapses at the seam.
 */
export function simplifyRing(ring: readonly Point[], tolerance: number): Point[] {
  if (ring.length <= 3) return [...ring];
  const origin = ring[0];
  let split = 1;
  for (let i = 1; i < ring.length; i++) {
    if (Math.hypot(ring[i][0] - origin[0], ring[i][1] - origin[1]) > Math.hypot(ring[split][0] - origin[0], ring[split][1] - origin[1])) {
      split = i;
    }
  }
  const first = simplifyLine(ring.slice(0, split + 1), tolerance);
  const second = simplifyLine([...ring.slice(split), origin], tolerance);
  return [...first, ...second.slice(1, -1)];
}

function cornerAngle(before: Point, at: Point, after: Point): number {
  const ax = before[0] - at[0];
  const ay = before[1] - at[1];
  const bx = after[0] - at[0];
  const by = after[1] - at[1];
  const lengths = Math.hypot(ax, ay) * Math.hypot(bx, by);
  if (lengths === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / lengths))) * 180) / Math.PI;
}

/**
 * Removes needle-thin spikes from a closed ring: corners sharper than `minAngle` degrees.
 * Simplifying a border that runs up a narrow bay leaves such needles, which read as
 * stray lines rather than land.
 */
export function removeSpikes(ring: readonly Point[], minAngle: number): Point[] {
  const result = [...ring];
  let removed = true;
  while (removed && result.length > 3) {
    removed = false;
    for (let i = 0; i < result.length && result.length > 3; i++) {
      const before = result[(i - 1 + result.length) % result.length];
      const after = result[(i + 1) % result.length];
      if (cornerAngle(before, result[i], after) < minAngle) {
        result.splice(i, 1);
        removed = true;
        i--;
      }
    }
  }
  return result;
}

/**
 * Simplifies a ring to about `target` points by searching for the tolerance that gives the
 * nearest count not above the target.
 */
export function simplifyRingToCount(ring: readonly Point[], target: number): Point[] {
  if (ring.length <= target) return [...ring];
  let low = 0;
  let high = 0;
  for (const p of ring) high = Math.max(high, Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1]));
  let best = simplifyRing(ring, high);
  for (let step = 0; step < 50; step++) {
    const mid = (low + high) / 2;
    const candidate = simplifyRing(ring, mid);
    if (candidate.length > target) {
      low = mid;
    } else {
      best = candidate;
      high = mid;
    }
  }
  return best;
}
