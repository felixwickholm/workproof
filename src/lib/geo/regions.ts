import type { MapPoint } from "./espoo";

/** A closed polygon, as its corners in order. */
export type Polygon = MapPoint[];

export interface RegionSeed {
  name: string;
  point: MapPoint;
}

export interface Region {
  name: string;
  polygon: Polygon;
}

/** A circle as a polygon with `sides` corners, so it can be cut like any other region. */
function circlePolygon(centre: MapPoint, radius: number, sides: number): Polygon {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i) / sides;
    return { x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle) };
  });
}

/**
 * Keeps the part of a convex polygon that is nearer to `own` than to `other`, minus a margin
 * on each side of the bisector, so two neighbouring regions never touch (Sutherland-Hodgman
 * against one half-plane).
 */
function keepNearer(polygon: Polygon, own: MapPoint, other: MapPoint, margin: number): Polygon {
  const nx = other.x - own.x;
  const ny = other.y - own.y;
  const length = Math.hypot(nx, ny);
  if (length === 0) return polygon;
  const mx = (own.x + other.x) / 2 - (nx / length) * margin;
  const my = (own.y + other.y) / 2 - (ny / length) * margin;
  // Positive inside: on the own side of the shifted bisector.
  const side = (p: MapPoint) => -((p.x - mx) * nx + (p.y - my) * ny);
  const result: Polygon = [];
  polygon.forEach((current, i) => {
    const next = polygon[(i + 1) % polygon.length];
    const a = side(current);
    const b = side(next);
    if (a >= 0) result.push(current);
    if (a >= 0 !== b >= 0) {
      const t = a / (a - b);
      result.push({ x: current.x + (next.x - current.x) * t, y: current.y + (next.y - current.y) * t });
    }
  });
  return result;
}

/** Cuts every corner twice (Chaikin), so a cell reads as a soft blob, still inside the cell. */
export function smoothPolygon(polygon: Polygon, rounds = 2): Polygon {
  let points = polygon;
  for (let round = 0; round < rounds && points.length > 2; round++) {
    points = points.flatMap((p, i) => {
      const q = points[(i + 1) % points.length];
      return [
        { x: 0.75 * p.x + 0.25 * q.x, y: 0.75 * p.y + 0.25 * q.y },
        { x: 0.25 * p.x + 0.75 * q.x, y: 0.25 * p.y + 0.75 * q.y },
      ];
    });
  }
  return points;
}

/**
 * One soft region per district: the area nearer to that district than to any other (a Voronoi
 * cell), no further than `radius` from it, rounded, with `gap` view units kept clear between
 * neighbours. Convex, so a region never reaches into another one. The caller clips them to the
 * city outline.
 */
export function districtRegions(seeds: readonly RegionSeed[], radius: number, gap: number, sides = 48): Region[] {
  return seeds.map((seed) => {
    let polygon = circlePolygon(seed.point, radius, sides);
    for (const other of seeds) {
      if (other !== seed) polygon = keepNearer(polygon, seed.point, other.point, gap / 2);
    }
    return { name: seed.name, polygon: smoothPolygon(polygon) };
  });
}

/** True when the point lies inside the polygon (even-odd rule). */
export function insidePolygon(polygon: Polygon, point: MapPoint): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** The SVG path of a polygon, rounded to a tenth of a unit. */
export function polygonPath(polygon: Polygon): string {
  const round = (value: number) => Math.round(value * 10) / 10;
  return polygon.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`).join("") + "Z";
}
