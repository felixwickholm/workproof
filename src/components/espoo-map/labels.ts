import type { LabelSide, MapPoint } from "@/lib/geo/espoo";
import type { Circle } from "./geometry";

/** Where a label sits around its anchor: the four sides, the four corners, or on it. */
export type LabelPlacement = LabelSide | "above-right" | "above-left" | "below-right" | "below-left" | "center";

/** Corner placements sit on the 45° line, so they clear a round marker by the same distance. */
const DIAGONAL = Math.SQRT1_2;

export interface LabelRequest {
  id: string;
  anchor: MapPoint;
  /**
   * Distances from the anchor to the nearest edge of the label, in view units, tried in
   * order. A label that must sit further out than the first gets a leader line.
   */
  clearances: readonly number[];
  width: number;
  height: number;
  /** Placements to try in order. */
  sides: readonly LabelPlacement[];
  /**
   * A label the reader needs (a company's name). When no spot is clear of the flow lines it may
   * cross a line, but never a marker or another label.
   */
  required?: boolean;
}

export interface PlacedLabel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: LabelPlacement;
  /** Sits further out than the first clearance, so a leader line joins it to its anchor. */
  leader: boolean;
  /** A required label that found room only across a flow line; drawn on a plate of the map's tone. */
  onLine: boolean;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function boxAt(request: LabelRequest, side: LabelPlacement, clearance: number): Box {
  const { anchor, width, height } = request;
  const corner = clearance * DIAGONAL;
  switch (side) {
    case "above-right":
      return { x: anchor.x + corner, y: anchor.y - corner - height, width, height };
    case "above-left":
      return { x: anchor.x - corner - width, y: anchor.y - corner - height, width, height };
    case "below-right":
      return { x: anchor.x + corner, y: anchor.y + corner, width, height };
    case "below-left":
      return { x: anchor.x - corner - width, y: anchor.y + corner, width, height };
    case "right":
      return { x: anchor.x + clearance, y: anchor.y - height / 2, width, height };
    case "left":
      return { x: anchor.x - clearance - width, y: anchor.y - height / 2, width, height };
    case "above":
      return { x: anchor.x - width / 2, y: anchor.y - clearance - height, width, height };
    case "below":
      return { x: anchor.x - width / 2, y: anchor.y + clearance, width, height };
    case "center":
      return { x: anchor.x - width / 2, y: anchor.y - height / 2, width, height };
  }
}

function boxesOverlap(a: Box, b: Box, gap: number): boolean {
  return a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;
}

function boxHitsCircle(box: Box, circle: Circle, gap: number): boolean {
  const nearestX = Math.max(box.x, Math.min(circle.x, box.x + box.width));
  const nearestY = Math.max(box.y, Math.min(circle.y, box.y + box.height));
  return Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.r + gap;
}

/** The point of a box nearest to a given point: where a leader line from it would end. */
export function nearestPointOf(box: Box, point: MapPoint): MapPoint {
  return {
    x: Math.max(box.x, Math.min(point.x, box.x + box.width)),
    y: Math.max(box.y, Math.min(point.y, box.y + box.height)),
  };
}

/** True when a leader from the anchor to the box would run through another label or marker. */
function leaderCrosses(anchor: MapPoint, box: Box, placed: readonly Box[], solid: readonly Circle[], gap: number): boolean {
  const end = nearestPointOf(box, anchor);
  const blockers = solid.filter((m) => Math.hypot(m.x - anchor.x, m.y - anchor.y) > m.r);
  const steps = 24;
  for (let i = 1; i < steps; i++) {
    const point = { x: anchor.x + ((end.x - anchor.x) * i) / steps, y: anchor.y + ((end.y - anchor.y) * i) / steps };
    if (placed.some((p) => point.x > p.x - gap && point.x < p.x + p.width + gap && point.y > p.y - gap && point.y < p.y + p.height + gap)) return true;
    if (blockers.some((m) => Math.hypot(point.x - m.x, point.y - m.y) < m.r + gap)) return true;
  }
  return false;
}

/**
 * Places labels in priority order, each on the first side (at the nearest distance) where
 * it touches no marker, no label placed before it, no blocked area, and stays inside the bounds.
 * A required label that finds no such spot may then cross the thin `markers` (flow lines) but
 * still not the `solid` ones. A label with no free spot is left out, so labels never overlap.
 */
export function placeLabels(
  requests: readonly LabelRequest[],
  markers: readonly Circle[],
  bounds: Box,
  gap: number,
  /** Markers a leader line may not cross, and a required label may not cover. */
  solid: readonly Circle[] = [],
  /** Areas no label may cover, such as an inset map. */
  blocked: readonly Box[] = [],
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const free = (box: Box, withLeader: boolean, anchor: MapPoint, avoid: readonly Circle[]) => {
    const inside = box.x >= bounds.x && box.y >= bounds.y && box.x + box.width <= bounds.x + bounds.width && box.y + box.height <= bounds.y + bounds.height;
    return (
      inside &&
      !avoid.some((m) => boxHitsCircle(box, m, gap)) &&
      !placed.some((p) => boxesOverlap(box, p, gap)) &&
      !blocked.some((b) => boxesOverlap(box, b, gap)) &&
      !(withLeader && leaderCrosses(anchor, box, [...placed, ...blocked], solid, gap))
    );
  };
  for (const request of requests) {
    const spots = request.clearances.flatMap((clearance, i) => request.sides.map((side) => ({ side, box: boxAt(request, side, clearance), leader: i > 0 })));
    const clear = spots.find(({ box, leader }) => free(box, leader, request.anchor, markers));
    const spot = clear ?? (request.required ? spots.find(({ box, leader }) => free(box, leader, request.anchor, solid)) : undefined);
    if (spot) placed.push({ id: request.id, side: spot.side, leader: spot.leader, onLine: !clear, ...spot.box });
  }
  return placed;
}

/** The given side first, then its neighbouring corners, then the rest. */
export function sidesFrom(preferred: LabelSide): LabelPlacement[] {
  const order: Record<LabelSide, LabelPlacement[]> = {
    right: ["right", "above-right", "below-right", "above", "below", "above-left", "below-left", "left"],
    left: ["left", "above-left", "below-left", "above", "below", "above-right", "below-right", "right"],
    above: ["above", "above-right", "above-left", "right", "left", "below-right", "below-left", "below"],
    below: ["below", "below-right", "below-left", "right", "left", "above-right", "above-left", "above"],
  };
  return order[preferred];
}
