import { ESPOO_DISTRICTS, ESPOO_LANDMARKS, EVENT_VENUE, project, type EspooDistrictName, type MapPlace, type MapPoint } from "@/lib/geo/espoo";
import { ESPOO_VIEW } from "@/lib/geo/espoo-outline";
import { districtRegions, polygonPath } from "@/lib/geo/regions";
import { sectorFamily, type CompanyFamily } from "./families";
import { curveControl, curvePath, fanOut, pointOnCurve, separate, type Circle } from "./geometry";
import { nearestPointOf, placeLabels, sidesFrom, type Box, type LabelRequest, type PlacedLabel } from "./labels";
import { dotSchedule } from "./schedule";
import { countByCompany, lineWeight, STAGE_ORDER, stageOf, stepOf, type FlowStage, type FlowTotals, type Step } from "./summary";
import type { FlowMapCompany, FlowMapFlow, FlowMapVariant } from "./types";

/**
 * South Espoo, where the city lives and the work goes: every district with a company, room to
 * the west for the names there and room east of the venue, over Helsinki, for the venue's name.
 * The hero and the city panel share it; the inset shows where it sits in the whole city.
 */
function southEspoo(): Box {
  const points = [...Object.values(ESPOO_DISTRICTS), EVENT_VENUE].map((place) => project(place.lat, place.lon));
  const left = Math.min(...points.map((p) => p.x)) - 96;
  const right = Math.max(...points.map((p) => p.x)) + 200;
  const top = Math.min(...points.map((p) => p.y)) - 60;
  const bottom = Math.max(...points.map((p) => p.y)) + 64;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

const SOUTH = southEspoo();

/** The part of the outline each variant shows, in view units. */
const MAP_WINDOW: Record<FlowMapVariant, Box> = {
  hero: SOUTH,
  compact: { x: 0, y: 0, ...ESPOO_VIEW },
  panel: SOUTH,
};

/** The districts every map names; Kera joins them when a company sits there. */
const NAMED_DISTRICTS: readonly EspooDistrictName[] = ["Otaniemi", "Keilaniemi", "Tapiola", "Leppävaara", "Matinkylä", "Espoonlahti", "Espoon keskus"];

/** How far a district's shaded region reaches from its centre, in view units (about 4.5 km). */
const REGION_RADIUS = 104;

/** CSS position of a point inside the view, as percentages, so it holds at any size. */
export function percentIn(view: Box, x: number, y: number) {
  return { left: `${((x - view.x) / view.width) * 100}%`, top: `${((y - view.y) / view.height) * 100}%` };
}

/** Rendered widths assumed before the map is measured, so server and client agree. */
export const DEFAULT_WIDTH: Record<FlowMapVariant, number> = { hero: 600, panel: 680, compact: 320 };

/** Below this rendered width the map uses smaller pins and 13px names. */
export const NARROW_WIDTH = 480;

/** Pin radii in pixels by size step, sized by the work a company received. */
const PIN_RADIUS: Record<"wide" | "narrow" | "compact", readonly [number, number, number]> = {
  wide: [6, 7.5, 9.5],
  narrow: [5.5, 6.5, 8],
  compact: [3, 3.5, 4.5],
};

/** Pixels between neighbouring pins, so a cluster opens up enough to point at each one. */
const PIN_GAP = { wide: 14, narrow: 9 } as const;

/** The inset of the whole city, in pixels, kept in the lower right corner (the sea). */
const INSET = { wide: { width: 64, margin: 12 }, narrow: { width: 46, margin: 8 } } as const;

/** The height in pixels of the sea the map adds below the coast to hold the headline figures. */
export const HEADLINE_SIZE = { wide: 124, narrow: 172 } as const;

/** Pixels between a marker and its label. */
const LABEL_GAP = 5;

/** Approximate advance of one character, as a share of the font size, for label boxes. */
const CHAR_WIDTH = 0.58;

/** Label sizes in pixels. They stay this size however large the map is drawn. */
const LABEL_FONT: Record<Density, Record<MapLabelKind, number>> = {
  wide: { venue: 14, proof: 14, company: 14, district: 14, landmark: 14 },
  narrow: { venue: 13, proof: 13, company: 13, district: 13, landmark: 13 },
};

/** How far each stage's line bows, as a share of its length, so the three lines to one company never coincide. */
const STAGE_BEND: Record<FlowStage, number> = { sent: 0.09, scored: 0.17, invited: 0.25 };

/**
 * Bearings that the window would otherwise cut off: Helsinki, named over its own land next to
 * the venue, so a reader sees where Espoo ends.
 */
const WINDOW_LANDMARKS: readonly Pick<MapPlace, "name" | "lat" | "lon">[] = [{ name: "Helsinki", lat: 60.215, lon: 24.9 }];

export interface MapNode extends Circle {
  company: FlowMapCompany;
  family: CompanyFamily;
  size: Step;
  totals: FlowTotals;
}

/** One line from the venue to a company: all its work at one stage, weighted by how much. */
export interface MapLine {
  key: string;
  companyId: string;
  stage: FlowStage;
  count: number;
  /** Stroke width in pixels. */
  weight: number;
  path: string;
  from: MapPoint;
  control: MapPoint;
  to: MapPoint;
}

/** One piece of work: a dot that travels its company's line for its stage. */
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

export interface MapRegion {
  name: EspooDistrictName;
  path: string;
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
  /** The part of the outline in view, in view units, including any sea added for the figures. */
  view: Box;
  /** The land window alone: what the inset outlines. */
  land: Box;
  /** Rendered pixels per view unit. */
  scale: number;
  venue: Circle;
  regions: MapRegion[];
  nodes: MapNode[];
  /** Drawn in this order: dashed first, so the accent lines sit on top. */
  lines: MapLine[];
  flows: MapFlow[];
  labels: MapLabel[];
  leaders: MapLeader[];
  /** The inset of the whole city, in view units. Null on the compact thumbnail. */
  inset: Box | null;
  /** The headline figures' corner, in view units. Null when there are no figures to show. */
  headline: Box | null;
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
      const size = stepOf(companyTotals.sent, busiest);
      nodes.push({ ...points[i], r: radii[size] / scale, company, family: sectorFamily(company.sector), size, totals: companyTotals });
    });
  }
  const separated = separate(nodes, fixed, gap / scale);
  return nodes.map((node, i) => ({ ...node, x: separated[i].x, y: separated[i].y }));
}

/** The districts shown: the seven named ones, plus any other district a company sits in. */
function shownDistricts(companies: readonly FlowMapCompany[]): EspooDistrictName[] {
  const extra = companies.map((c) => c.district).filter((d) => !NAMED_DISTRICTS.includes(d) && ESPOO_DISTRICTS[d]);
  return [...NAMED_DISTRICTS, ...new Set(extra)];
}

function buildRegions(districts: readonly EspooDistrictName[], scale: number): MapRegion[] {
  const seeds = districts.map((name) => ({ name, point: project(ESPOO_DISTRICTS[name].lat, ESPOO_DISTRICTS[name].lon) }));
  return districtRegions(seeds, REGION_RADIUS, 3 / scale).map((region, i) => ({ name: districts[i], path: polygonPath(region.polygon) }));
}

/** One line per company and stage, weighted by its count; then one travelling dot per piece of work. */
function buildFlows(flows: readonly FlowMapFlow[], nodes: readonly MapNode[], venue: Circle, variant: FlowMapVariant) {
  const lines: MapLine[] = [];
  const trips: Omit<MapFlow, "offset">[] = [];
  const counts = nodes.flatMap((node) => STAGE_ORDER.map((stage) => flows.filter((f) => f.companyId === node.company.id && stageOf(f.state) === stage).length));
  const largest = Math.max(0, ...counts);
  for (const node of nodes) {
    const to = { x: node.x, y: node.y };
    const distance = Math.hypot(to.x - venue.x, to.y - venue.y);
    const trip = Math.min(4, 2.5 + distance / 300 + (variant === "hero" ? 0.4 : 0));
    for (const stage of STAGE_ORDER) {
      const incoming = flows.filter((f) => f.companyId === node.company.id && stageOf(f.state) === stage).sort((a, b) => a.proofLabel.localeCompare(b.proofLabel));
      if (incoming.length === 0) continue;
      const control = curveControl(venue, to, STAGE_BEND[stage] * bendSign(venue, to));
      const path = curvePath(venue, control, to);
      lines.push({ key: `${node.company.id}:${stage}`, companyId: node.company.id, stage, count: incoming.length, weight: lineWeight(incoming.length, largest), path, from: venue, control, to });
      for (const flow of incoming) trips.push({ key: `${flow.proofLabel}:${flow.companyId}`, flow, path, from: venue, control, to, trip });
    }
  }
  const schedule = dotSchedule(trips.map((f) => ({ key: f.key, seconds: f.trip })));
  return {
    lines: lines.sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage) || a.key.localeCompare(b.key)),
    flows: trips.map((f) => ({ ...f, offset: schedule.offsets.get(f.key) ?? 0 })).sort((a, b) => a.key.localeCompare(b.key)),
    period: schedule.period,
  };
}

/** Points along every line, so labels keep off the lines as well as the pins. */
function lineSamples(lines: readonly MapLine[], scale: number): Circle[] {
  return lines.flatMap((line) => {
    const steps = Math.max(2, Math.ceil((Math.hypot(line.to.x - line.from.x, line.to.y - line.from.y) * scale) / 5));
    return Array.from({ length: steps - 1 }, (_, i) => ({ ...pointOnCurve(line.from, line.control, line.to, (i + 1) / steps), r: (line.weight / 2 + 0.5) / scale }));
  });
}

/** The inset's box in view units: the lower right corner of the land window, over the sea. */
function insetBox(land: Box, scale: number, density: Density): Box {
  const { width, margin } = INSET[density];
  const w = width / scale;
  const h = (w * ESPOO_VIEW.height) / ESPOO_VIEW.width;
  return { x: land.x + land.width - w - margin / scale, y: land.y + land.height - h - margin / scale, width: w, height: h };
}

function buildLabels(
  nodes: readonly MapNode[],
  lines: readonly MapLine[],
  districts: readonly EspooDistrictName[],
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
    add("proof", highlight.flow.proofLabel, {
      id: "proof",
      anchor: middle,
      clearances: [8, 16, 28, 44].map((extra) => extra / scale),
      sides: ["above", "below", "above-left", "below-right", "above-right", "below-left", "left", "right"],
      required: true,
    });
    const node = nodes.find((n) => n.company.id === highlight.flow.companyId);
    if (node) {
      const clearances = [0, 14, 28, 44].map((extra) => node.r + gap + extra / scale);
      add("company", node.company.name, { id: `company:${node.company.id}`, anchor: node, clearances, sides: sidesFrom(ESPOO_DISTRICTS[node.company.district].labelSide), required: true });
    }
  }

  // Each district is named beside its own pins (centred on them, as they may have moved apart),
  // on its preferred side first, a little further out when the near spots are taken.
  for (const name of districts) {
    const place = ESPOO_DISTRICTS[name];
    const members = nodes.filter((n) => n.company.district === name);
    const anchor =
      members.length === 0
        ? project(place.lat, place.lon)
        : { x: members.reduce((sum, n) => sum + n.x, 0) / members.length, y: members.reduce((sum, n) => sum + n.y, 0) / members.length };
    const reach = Math.max(0, ...members.map((n) => Math.hypot(n.x - anchor.x, n.y - anchor.y) + n.r));
    const clearances = [0, 8, 18, 30, 44].map((extra) => reach + gap + extra / scale);
    const sides = members.length === 0 ? ["center" as const, ...sidesFrom(place.labelSide)] : sidesFrom(place.labelSide);
    add("district", place.name, { id: `district:${place.name}`, anchor, clearances, sides, required: true });
  }

  if (density === "wide") {
    for (const landmark of [...ESPOO_LANDMARKS.filter((l) => !WINDOW_LANDMARKS.some((w) => w.name === l.name)), ...WINDOW_LANDMARKS]) {
      add("landmark", landmark.name, { id: `landmark:${landmark.name}`, anchor: project(landmark.lat, landmark.lon), clearances: [0], sides: ["center"] });
    }
  }

  const solid = [venue, ...nodes.map((n) => ({ x: n.x, y: n.y, r: n.r + 1 / scale }))];
  const placed = placeLabels(requests, [...solid, ...lineSamples(lines, scale)], view, 3 / scale, solid, blocked);
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

/** Leaders for the venue and a named company; a district's name needs none, it sits in its own region. */
function leadersFor(labels: readonly MapLabel[], venue: Circle, nodes: readonly MapNode[], scale: number): MapLeader[] {
  return labels.flatMap((label) => {
    if (!label.leader || (label.kind !== "venue" && label.kind !== "company")) return [];
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
  /** Leave room in the sea for the headline figures. */
  withHeadline?: boolean;
}): MapLayout {
  const { variant } = input;
  const width = input.width > 0 ? input.width : DEFAULT_WIDTH[variant];
  const density = densityOf(width);
  const land = MAP_WINDOW[variant];
  const scale = width / land.width;
  const headlineHeight = HEADLINE_SIZE[density] / scale;
  const withHeadline = Boolean(input.withHeadline) && variant !== "compact";
  // The figures sit in the sea below the coast: the window grows south to hold them.
  const view = withHeadline ? { ...land, height: land.height + headlineHeight } : land;
  const headline = withHeadline ? { x: view.x, y: land.y + land.height, width: view.width, height: headlineHeight } : null;
  const companyIds = new Set(input.companies.map((c) => c.id));
  const flows = input.flows.filter((f) => companyIds.has(f.companyId));
  const venuePoint = project(EVENT_VENUE.lat, EVENT_VENUE.lon);
  const venue: Circle = { ...venuePoint, r: (variant === "compact" ? 4 : 7) / scale };
  const venueSpot = venueLabel(venue, view, scale, LABEL_FONT[density].venue);
  const keepClear = variant === "compact" ? [venue] : [venue, ...venueSpot.keepClear];
  const radii = variant === "compact" ? PIN_RADIUS.compact : PIN_RADIUS[density];
  const gap = variant === "compact" ? 3 : PIN_GAP[density];
  const nodes = placeNodes(input.companies, countByCompany(input.companies, flows), radii, keepClear, scale, gap);
  const built = buildFlows(flows, nodes, venue, variant);
  const districts = shownDistricts(input.companies);
  const inset = variant === "compact" ? null : insetBox(land, scale, density);
  const highlight = built.flows.find((f) => f.flow.proofLabel === input.highlightProof);
  const blocked = [inset, headline].filter((box): box is Box => box !== null);
  const labels = variant === "compact" ? [] : buildLabels(nodes, built.lines, districts, venue, venueSpot.text, view, scale, density, highlight, blocked);
  return {
    view,
    land,
    scale,
    venue,
    regions: buildRegions(districts, scale),
    nodes,
    lines: built.lines,
    flows: built.flows,
    labels,
    leaders: leadersFor(labels, venue, nodes, scale),
    inset,
    headline,
    dotRadius: (variant === "compact" ? 2 : 3) / scale,
    period: built.period,
  };
}
