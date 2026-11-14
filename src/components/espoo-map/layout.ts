import { ESPOO_DISTRICTS, ESPOO_LANDMARKS, EVENT_VENUE, project, type EspooDistrictName, type MapPlace, type MapPoint } from "@/lib/geo/espoo";
import { ESPOO_VIEW } from "@/lib/geo/espoo-outline";
import { curveControl, curvePath, fanOut, pointOnCurve, separate, type Circle } from "./geometry";
import { nearestPointOf, placeLabels, sidesFrom, type Box, type LabelRequest, type PlacedLabel } from "./labels";
import { dotSchedule } from "./schedule";
import { countByCompany, nodeSize, type FlowTotals, type NodeSize } from "./summary";
import type { FlowMapCompany, FlowMapFlow, FlowMapVariant, FlowState } from "./types";

/**
 * South Espoo, where the city lives and the work goes: every district with a company, room to
 * the west for the names there and room east of the venue, over Helsinki, for the venue's name.
 * The hero and the city panel share it; the inset shows where it sits in the whole city.
 */
function southEspoo(): Box {
  const points = [...Object.values(ESPOO_DISTRICTS), EVENT_VENUE].map((place) => project(place.lat, place.lon));
  const left = Math.min(...points.map((p) => p.x)) - 76;
  const right = Math.max(...points.map((p) => p.x)) + 220;
  const top = Math.min(...points.map((p) => p.y)) - 56;
  const bottom = Math.max(...points.map((p) => p.y)) + 72;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

const SOUTH = southEspoo();

/** The part of the outline each variant shows, in view units. */
const MAP_WINDOW: Record<FlowMapVariant, Box> = {
  hero: SOUTH,
  compact: { x: 0, y: 0, ...ESPOO_VIEW },
  panel: SOUTH,
};

/** CSS position of a point inside the view, as percentages, so it holds at any size. */
export function percentIn(view: Box, x: number, y: number) {
  return { left: `${((x - view.x) / view.width) * 100}%`, top: `${((y - view.y) / view.height) * 100}%` };
}

/** Rendered widths assumed before the map is measured, so server and client agree. */
export const DEFAULT_WIDTH: Record<FlowMapVariant, number> = { hero: 600, panel: 680, compact: 320 };

/** Below this rendered width the map uses smaller markers and names only the busiest companies. */
const NARROW_WIDTH = 480;

/** Companies named on a narrow map; the rest stay dots, named in their card and the table. */
const NARROW_LABELS = 4;

/** Dot radii in pixels by node size: plain dots, sized by the proofs a company received. */
const NODE_RADIUS: Record<"wide" | "narrow" | "compact", readonly [number, number, number]> = {
  wide: [5, 7, 9.5],
  narrow: [4.5, 6, 8],
  compact: [3.5, 4.5, 5.5],
};

/** Pixels between neighbouring company dots, so a cluster opens up enough to name each one. */
const NODE_GAP = { wide: 22, narrow: 12 } as const;

/** The inset of the whole city, in pixels, kept in the lower right corner (the sea). */
const INSET = { wide: { width: 64, margin: 10 }, narrow: { width: 46, margin: 8 } } as const;

/** Pixels between a marker and its label. */
const LABEL_GAP = 5;

/** Approximate advance of one character, as a share of the font size, for label boxes. */
const CHAR_WIDTH = 0.58;

/** Label sizes in pixels. They stay this size however large the map is drawn. */
const LABEL_FONT: Record<"wide" | "narrow", Record<MapLabelKind, number>> = {
  wide: { venue: 14, proof: 12, company: 13, district: 12, landmark: 12 },
  narrow: { venue: 13, proof: 12, company: 12, district: 11, landmark: 11 },
};

/**
 * Bearings that the window would otherwise cut off: Helsinki, named over its own land next to
 * the venue, so a reader sees where Espoo ends.
 */
const WINDOW_LANDMARKS: readonly Pick<MapPlace, "name" | "lat" | "lon">[] = [{ name: "Helsinki", lat: 60.205, lon: 24.9 }];

export interface MapNode extends Circle {
  company: FlowMapCompany;
  size: NodeSize;
  totals: FlowTotals;
}

export interface MapFlow {
  key: string;
  flow: FlowMapFlow;
  path: string;
  from: MapPoint;
  control: MapPoint;
  to: MapPoint;
  /** Seconds for one trip, longer for longer flows. */
  trip: number;
  /** Seconds into the loop when this dot sets off; spread by a hash of the proof. */
  offset: number;
}

export type MapLabelKind = "venue" | "proof" | "company" | "district" | "landmark";

export interface MapLabel extends PlacedLabel {
  kind: MapLabelKind;
  text: string;
  fontSize: number;
}

/** A hairline from a marker to its label, when the label had to sit further out to stay clear. */
interface MapLeader {
  id: string;
  from: MapPoint;
  to: MapPoint;
}

interface MapLayout {
  /** The part of the outline in view, in view units. */
  view: Box;
  /** Rendered pixels per view unit. */
  scale: number;
  venue: Circle;
  nodes: MapNode[];
  /** Drawn in this order: quiet states first, so accent lines sit on top. */
  flows: MapFlow[];
  labels: MapLabel[];
  leaders: MapLeader[];
  /** The inset of the whole city, in view units. Null on the compact thumbnail. */
  inset: Box | null;
  dotRadius: number;
  /** Seconds in one loop of the travelling dots. */
  period: number;
}

/**
 * How companies in one district fan out: start angle and turn between neighbours, in degrees.
 * Otaniemi shares its corner with the venue, so its companies keep to the west of it.
 */
const FAN: Partial<Record<EspooDistrictName, { start: number; step?: number }>> = {
  Otaniemi: { start: 205, step: 75 },
  Tapiola: { start: 180 },
  "Leppävaara": { start: 180 },
};

const DRAW_ORDER: Record<FlowState, number> = { sent: 0, answered: 1, invited: 2, met: 3 };

type Density = "wide" | "narrow";

function densityOf(width: number): Density {
  return width < NARROW_WIDTH ? "narrow" : "wide";
}

/** Sideways bend that bows a flow north, over land, or west when it runs north-south. */
function bendSign(from: MapPoint, to: MapPoint): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > 0.35 * Math.abs(dy)) return dx < 0 ? -1 : 1;
  return dy < 0 ? 1 : -1;
}

function textBox(text: string, fontSize: number, scale: number) {
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((line) => line.length));
  return { width: (longest * fontSize * CHAR_WIDTH + 2) / scale, height: (lines.length * fontSize * 1.35) / scale };
}

/**
 * The venue's name, to its right toward Helsinki, on two lines when one does not fit the
 * view. Its spot is reserved before the companies are placed, so the origin of every flow
 * is always named.
 */
function venueLabel(venue: Circle, view: Box, scale: number, fontSize: number) {
  const gap = LABEL_GAP / scale;
  const oneLine = textBox(EVENT_VENUE.name, fontSize, scale);
  const fits = venue.x + venue.r + gap + oneLine.width <= view.x + view.width;
  const text = fits ? EVENT_VENUE.name : EVENT_VENUE.name.replace(" ", "\n");
  const size = fits ? oneLine : textBox(text, fontSize, scale);
  const box = { x: venue.x + venue.r + gap, y: venue.y - size.height / 2, ...size };
  // Circles along the box, so markers can be pushed clear of it like any other marker.
  const reserve = size.height / 2 + 2 / scale;
  const count = Math.ceil(size.width / reserve) + 1;
  const keepClear: Circle[] = Array.from({ length: count }, (_, i) => ({ x: box.x + (size.width * i) / (count - 1), y: venue.y, r: reserve }));
  return { text, keepClear };
}

function placeNodes(companies: readonly FlowMapCompany[], totals: Map<string, FlowTotals>, radii: readonly number[], fixed: readonly Circle[], scale: number, gap: number): MapNode[] {
  const busiest = Math.max(0, ...[...totals.values()].map((t) => t.sent));
  const byDistrict = new Map<EspooDistrictName, FlowMapCompany[]>();
  for (const company of [...companies].sort((a, b) => a.id.localeCompare(b.id))) {
    byDistrict.set(company.district, [...(byDistrict.get(company.district) ?? []), company]);
  }
  const spacing = (2 * radii[2] + gap) / scale;
  const nodes: MapNode[] = [];
  for (const [district, members] of byDistrict) {
    const place = ESPOO_DISTRICTS[district];
    if (!place) continue;
    const fan = FAN[district] ?? { start: 135 };
    const points = fanOut(project(place.lat, place.lon), members.length, spacing, fan.start, fan.step);
    members.forEach((company, i) => {
      const companyTotals = totals.get(company.id)!;
      const size = nodeSize(companyTotals.sent, busiest);
      nodes.push({ ...points[i], r: radii[size] / scale, company, size, totals: companyTotals });
    });
  }
  const separated = separate(nodes, fixed, gap / scale);
  return nodes.map((node, i) => ({ ...node, x: separated[i].x, y: separated[i].y }));
}

function buildFlows(flows: readonly FlowMapFlow[], nodes: readonly MapNode[], venue: Circle, variant: FlowMapVariant) {
  const result: Omit<MapFlow, "offset">[] = [];
  for (const node of nodes) {
    const incoming = flows.filter((f) => f.companyId === node.company.id).sort((a, b) => a.proofLabel.localeCompare(b.proofLabel));
    // Each proof to the same company gets its own bend, so the lines open into a sheaf.
    const spread = Math.min(0.05 * (incoming.length - 1), 0.24);
    const to = { x: node.x, y: node.y };
    const distance = Math.hypot(to.x - venue.x, to.y - venue.y);
    const trip = Math.min(4, 2.5 + distance / 300 + (variant === "hero" ? 0.4 : 0));
    incoming.forEach((flow, i) => {
      const bend = (0.08 + (incoming.length > 1 ? (spread * i) / (incoming.length - 1) : 0)) * bendSign(venue, to);
      const control = curveControl(venue, to, bend);
      const key = `${flow.proofLabel}:${flow.companyId}`;
      result.push({ key, flow, path: curvePath(venue, control, to), from: venue, control, to, trip });
    });
  }
  const schedule = dotSchedule(result.map((f) => ({ key: f.key, seconds: f.trip })));
  const mapped: MapFlow[] = result.map((f) => ({ ...f, offset: schedule.offsets.get(f.key) ?? 0 }));
  return {
    flows: mapped.sort((a, b) => DRAW_ORDER[a.flow.state] - DRAW_ORDER[b.flow.state] || a.key.localeCompare(b.key)),
    period: schedule.period,
  };
}

/** Points along every flow line, so labels can keep off the lines as well as the markers. */
function lineSamples(flows: readonly MapFlow[], scale: number): Circle[] {
  return flows.flatMap((flow) => {
    const steps = Math.max(2, Math.ceil((Math.hypot(flow.to.x - flow.from.x, flow.to.y - flow.from.y) * scale) / 6));
    return Array.from({ length: steps - 1 }, (_, i) => ({ ...pointOnCurve(flow.from, flow.control, flow.to, (i + 1) / steps), r: 1 / scale }));
  });
}

/** The companies to name: every one on a wide map, the busiest few on a narrow one. */
function namedNodes(nodes: readonly MapNode[], density: Density, highlightId: string | undefined): MapNode[] {
  const byBusy = [...nodes].sort((a, b) => b.totals.sent - a.totals.sent || a.company.name.localeCompare(b.company.name));
  const chosen = density === "wide" ? byBusy : byBusy.slice(0, NARROW_LABELS);
  const highlighted = nodes.find((n) => n.company.id === highlightId);
  return highlighted ? [highlighted, ...chosen.filter((n) => n !== highlighted)] : chosen;
}

/** The inset's box in view units: the lower right corner, over the sea. */
function insetBox(view: Box, scale: number, density: Density): Box {
  const { width, margin } = INSET[density];
  const w = width / scale;
  const h = (w * ESPOO_VIEW.height) / ESPOO_VIEW.width;
  return { x: view.x + view.width - w - margin / scale, y: view.y + view.height - h - margin / scale, width: w, height: h };
}

function buildLabels(
  nodes: readonly MapNode[],
  flows: readonly MapFlow[],
  venue: Circle,
  venueName: string,
  view: Box,
  scale: number,
  density: Density,
  highlight: MapFlow | undefined,
  blocked: readonly Box[],
): MapLabel[] {
  const fonts = LABEL_FONT[density];
  const requests: (LabelRequest & { kind: MapLabelKind; text: string })[] = [];
  const add = (kind: MapLabelKind, text: string, request: Omit<LabelRequest, "width" | "height">) =>
    requests.push({ ...request, ...textBox(text, fonts[kind], scale), kind, text });
  const gap = LABEL_GAP / scale;

  // Right of the venue is reserved; the other spots, further out with a leader, are fallbacks.
  const venueReach = [0, 34, 60, 90].map((extra) => venue.r + gap + extra / scale);
  const venueSides = ["right", "below-right", "above-right", "below", "above", "below-left", "left"] as const;
  add("venue", venueName, { id: "venue", anchor: venue, clearances: venueReach, sides: venueSides, required: true });

  if (highlight) {
    const middle = pointOnCurve(highlight.from, highlight.control, highlight.to, 0.5);
    add("proof", highlight.flow.proofLabel, { id: "proof", anchor: middle, clearances: [8 / scale, 16 / scale], sides: ["above", "below", "above-left", "below-right", "above-right", "below-left"] });
  }

  // Next to the dot first; further out, joined by a short leader, when a neighbour is in the way.
  for (const node of namedNodes(nodes, density, highlight?.flow.companyId)) {
    const side = ESPOO_DISTRICTS[node.company.district].labelSide;
    const clearances = [0, 14, 28, 44, 62].map((extra) => node.r + gap + extra / scale);
    add("company", node.company.name, { id: `company:${node.company.id}`, anchor: node, clearances, sides: sidesFrom(side), required: true });
  }

  // A district with companies is named beside its own cluster (centred on its markers, which
  // may have moved apart) and only on the near sides, so the name never drifts to a neighbour.
  for (const place of Object.values(ESPOO_DISTRICTS)) {
    const members = nodes.filter((n) => n.company.district === place.name);
    const anchor =
      members.length === 0
        ? project(place.lat, place.lon)
        : { x: members.reduce((sum, n) => sum + n.x, 0) / members.length, y: members.reduce((sum, n) => sum + n.y, 0) / members.length };
    const reach = Math.max(0, ...members.map((n) => Math.hypot(n.x - anchor.x, n.y - anchor.y) + n.r));
    const sides = members.length === 0 ? ["center" as const, ...sidesFrom(place.labelSide)] : sidesFrom(place.labelSide).slice(0, 5);
    add("district", place.name, { id: `district:${place.name}`, anchor, clearances: [reach + gap], sides });
  }

  if (density === "wide") {
    for (const landmark of [...ESPOO_LANDMARKS.filter((l) => !WINDOW_LANDMARKS.some((w) => w.name === l.name)), ...WINDOW_LANDMARKS]) {
      add("landmark", landmark.name, { id: `landmark:${landmark.name}`, anchor: project(landmark.lat, landmark.lon), clearances: [0], sides: ["center"] });
    }
  }

  // A company that held a meeting wears a ring, so its label keeps clear of the ring too.
  const solid = [venue, ...nodes.map((n) => ({ x: n.x, y: n.y, r: n.r + (n.totals.met > 0 ? 5 : 1) / scale }))];
  const placed = placeLabels(requests, [...solid, ...lineSamples(flows, scale)], view, 3 / scale, solid, blocked);
  const byId = new Map(requests.map((r) => [r.id, r]));
  return placed.map((label) => {
    const request = byId.get(label.id)!;
    return { ...label, kind: request.kind, text: request.text, fontSize: fonts[request.kind] };
  });
}

/** A hairline from the edge of a marker to the nearest point of its label. */
function leaderTo(id: string, marker: Circle, label: MapLabel, scale: number): MapLeader | null {
  const nearest = nearestPointOf(label, marker);
  const distance = Math.hypot(nearest.x - marker.x, nearest.y - marker.y);
  const start = marker.r + 2 / scale;
  const end = distance - 2 / scale;
  if (end - start < 6 / scale) return null;
  const ux = (nearest.x - marker.x) / distance;
  const uy = (nearest.y - marker.y) / distance;
  return { id, from: { x: marker.x + ux * start, y: marker.y + uy * start }, to: { x: marker.x + ux * end, y: marker.y + uy * end } };
}

function leadersFor(labels: readonly MapLabel[], venue: Circle, nodes: readonly MapNode[], scale: number): MapLeader[] {
  return labels.flatMap((label) => {
    if (!label.leader) return [];
    const marker = label.kind === "venue" ? venue : nodes.find((n) => `company:${n.company.id}` === label.id);
    const leader = marker && leaderTo(label.id, marker, label, scale);
    return leader ? [leader] : [];
  });
}

/** Everything the map draws, in view units, for one rendered width. */
export function buildMapLayout(input: {
  companies: readonly FlowMapCompany[];
  flows: readonly FlowMapFlow[];
  variant: FlowMapVariant;
  width: number;
  highlightProof?: string;
}): MapLayout {
  const { variant } = input;
  const width = input.width > 0 ? input.width : DEFAULT_WIDTH[variant];
  const density = densityOf(width);
  const view = MAP_WINDOW[variant];
  const scale = width / view.width;
  const companyIds = new Set(input.companies.map((c) => c.id));
  const flows = input.flows.filter((f) => companyIds.has(f.companyId));
  const venuePoint = project(EVENT_VENUE.lat, EVENT_VENUE.lon);
  const venue: Circle = { ...venuePoint, r: (variant === "compact" ? 4.5 : 8) / scale };
  const venueSpot = venueLabel(venue, view, scale, LABEL_FONT[density].venue);
  const keepClear = variant === "compact" ? [venue] : [venue, ...venueSpot.keepClear];
  const radii = variant === "compact" ? NODE_RADIUS.compact : NODE_RADIUS[density];
  const gap = variant === "compact" ? 3 : NODE_GAP[density];
  const nodes = placeNodes(input.companies, countByCompany(input.companies, flows), radii, keepClear, scale, gap);
  const built = buildFlows(flows, nodes, venue, variant);
  const inset = variant === "compact" ? null : insetBox(view, scale, density);
  const highlight = built.flows.find((f) => f.flow.proofLabel === input.highlightProof);
  const labels = variant === "compact" ? [] : buildLabels(nodes, built.flows, venue, venueSpot.text, view, scale, density, highlight, inset ? [inset] : []);
  return {
    view,
    scale,
    venue,
    nodes,
    flows: built.flows,
    labels,
    leaders: leadersFor(labels, venue, nodes, scale),
    inset,
    dotRadius: (variant === "compact" ? 2 : 3) / scale,
    period: built.period,
  };
}
