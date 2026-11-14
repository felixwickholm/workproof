/**
 * Builds src/lib/geo/espoo-outline.ts: the land outline of the municipality of Espoo as one
 * SVG path, plus the projection that places any coordinate on it.
 *
 * Source: OpenStreetMap, via the Overpass API. Boundary © OpenStreetMap contributors, ODbL.
 * The administrative boundary (relation 36097) reaches far into the sea, so the script keeps
 * only the part on the land side of the mainland coastline. Kauniainen, a separate town
 * inside Espoo, stays as a hole. Islands are left out: at this size they read as noise.
 *
 * Run once, and again only when the outline should change:
 *   node scripts/build-espoo-outline.mjs              fetches from Overpass (one request)
 *   node scripts/build-espoo-outline.mjs saved.json   reuses a saved Overpass response
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { removeSpikes, simplifyRingToCount } from "../src/lib/geo/simplify.ts";
import { projectWith } from "../src/lib/geo/projection.ts";

const RELATION_ID = 36097;
const COAST_BBOX = "60.05,24.45,60.37,24.95";
const REFERENCE_LAT = 60.2;
const VIEW_WIDTH = 1000;
const PADDING = 50;
/** Extra room east of the land, toward Helsinki, where the event venue's label sits. */
const PADDING_EAST = 230;
const OUTER_POINTS = 170;
const HOLE_POINTS = 24;
const MIN_CORNER_DEGREES = 20;
const OUTPUT = fileURLToPath(new URL("../src/lib/geo/espoo-outline.ts", import.meta.url));

async function loadOverpass(savedPath) {
  if (savedPath) return JSON.parse(await readFile(savedPath, "utf8"));
  const query = `[out:json][timeout:120];rel(${RELATION_ID});out geom;way["natural"="coastline"](${COAST_BBOX});out geom;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "User-Agent": "workprint-espoo-outline/1.0 (one-off build of a static city outline)" },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) throw new Error(`Overpass answered ${response.status}`);
  return response.json();
}

const toXY = (geometry) => geometry.map(({ lon, lat }) => [lon, lat]);
const key = ([x, y]) => `${x.toFixed(7)},${y.toFixed(7)}`;

/** Joins open ways that share end points into closed rings. */
function assembleRings(lines) {
  const pending = lines.map((line) => [...line]);
  const rings = [];
  while (pending.length > 0) {
    const ring = pending.shift();
    while (key(ring[0]) !== key(ring[ring.length - 1])) {
      const tail = key(ring[ring.length - 1]);
      const next = pending.findIndex((line) => key(line[0]) === tail || key(line[line.length - 1]) === tail);
      if (next === -1) throw new Error("A boundary ring does not close");
      const [line] = pending.splice(next, 1);
      ring.push(...(key(line[0]) === tail ? line : line.reverse()).slice(1));
    }
    rings.push(ring.slice(0, -1));
  }
  return rings;
}

/** Joins coastline ways end to start by node id. Coastline ways never need reversing. */
function assembleChains(ways) {
  const byFirstNode = new Map(ways.map((way) => [way.nodes[0], way]));
  const hasPredecessor = new Set(ways.map((way) => way.nodes[way.nodes.length - 1]));
  const chains = [];
  for (const start of ways) {
    if (hasPredecessor.has(start.nodes[0])) continue;
    const chain = toXY(start.geometry);
    let way = byFirstNode.get(start.nodes[start.nodes.length - 1]);
    while (way && way !== start) {
      chain.push(...toXY(way.geometry).slice(1));
      way = byFirstNode.get(way.nodes[way.nodes.length - 1]);
    }
    chains.push(chain);
  }
  return chains;
}

function signedArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function contains(ring, [x, y]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function crossing(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]];
  const s = [d[0] - c[0], d[1] - c[1]];
  const denominator = r[0] * s[1] - r[1] * s[0];
  if (denominator === 0) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / denominator;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / denominator;
  if (t < 0 || t >= 1 || u < 0 || u >= 1) return null;
  return { t, u, point: [a[0] + t * r[0], a[1] + t * r[1]] };
}

/** Inserts crossing points into a vertex list, in order along each segment. */
function withCrossings(points, crossings, segmentOf, positionOf, closed) {
  const result = [];
  const count = closed ? points.length : points.length - 1;
  for (let i = 0; i < count; i++) {
    result.push({ point: points[i] });
    crossings
      .filter((c) => segmentOf(c) === i)
      .sort((a, b) => positionOf(a) - positionOf(b))
      .forEach((c) => result.push({ point: c.point, crossing: c.id }));
  }
  if (!closed) result.push({ point: points[points.length - 1] });
  return result;
}

/**
 * The part of a counter-clockwise ring that lies on the land side of a coastline. OSM draws
 * coastlines with land on the left, the same side as a counter-clockwise interior, so the
 * result is traced by walking the coast inside the ring and the ring on the land side, in
 * turn (Weiler-Atherton for this one case).
 */
function clipToLand(ring, coast) {
  const crossings = [];
  for (let i = 0; i < coast.length - 1; i++) {
    for (let j = 0; j < ring.length; j++) {
      const hit = crossing(coast[i], coast[i + 1], ring[j], ring[(j + 1) % ring.length]);
      if (hit) crossings.push({ id: crossings.length, coastSegment: i, coastT: hit.t, ringSegment: j, ringT: hit.u, point: hit.point });
    }
  }
  const coastPath = withCrossings(coast, crossings, (c) => c.coastSegment, (c) => c.coastT, false);
  const ringPath = withCrossings(ring, crossings, (c) => c.ringSegment, (c) => c.ringT, true);
  const coastIndex = new Map(coastPath.flatMap((v, i) => (v.crossing === undefined ? [] : [[v.crossing, i]])));
  const ringIndex = new Map(ringPath.flatMap((v, i) => (v.crossing === undefined ? [] : [[v.crossing, i]])));
  const entering = (id) => {
    const here = coastPath[coastIndex.get(id)].point;
    const next = coastPath[coastIndex.get(id) + 1].point;
    return contains(ring, [(here[0] + next[0]) / 2, (here[1] + next[1]) / 2]);
  };

  const pieces = [];
  const visited = new Set();
  for (const start of crossings.filter((c) => entering(c.id))) {
    if (visited.has(start.id)) continue;
    const piece = [];
    let current = start.id;
    do {
      visited.add(current);
      let i = coastIndex.get(current);
      do piece.push(coastPath[i++].point);
      while (coastPath[i].crossing === undefined);
      const exit = coastPath[i].crossing;
      visited.add(exit);
      let j = ringIndex.get(exit);
      do {
        piece.push(ringPath[j].point);
        j = (j + 1) % ringPath.length;
      } while (ringPath[j].crossing === undefined);
      current = ringPath[j].crossing;
      if (!entering(current)) throw new Error("The coastline and the boundary cross in an unexpected order");
    } while (current !== start.id);
    pieces.push(piece);
  }
  return pieces;
}

const round = (value) => Math.round(value * 10) / 10;

function toPath(ring) {
  return `M${ring.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}Z`;
}

async function main() {
  const data = await loadOverpass(process.argv[2]);
  const relation = data.elements.find((e) => e.type === "relation" && e.id === RELATION_ID);
  const members = (role) => relation.members.filter((m) => m.type === "way" && m.role === role).map((m) => toXY(m.geometry));
  const [boundary] = assembleRings(members("outer"));
  const holes = assembleRings(members("inner"));
  if (signedArea(boundary) < 0) boundary.reverse();

  const coastWays = data.elements.filter((e) => e.type === "way" && e.tags?.natural === "coastline");
  const mainland = assembleChains(coastWays).sort((a, b) => b.length - a.length)[0];
  const land = clipToLand(boundary, mainland).sort((a, b) => Math.abs(signedArea(b)) - Math.abs(signedArea(a)))[0];

  // Scale so the land fits VIEW_WIDTH with its padding; the height follows.
  const lonFactor = Math.cos((REFERENCE_LAT * Math.PI) / 180);
  const lons = land.map(([lon]) => lon);
  const lats = land.map(([, lat]) => lat);
  const unitsPerDegree = (VIEW_WIDTH - PADDING - PADDING_EAST) / ((Math.max(...lons) - Math.min(...lons)) * lonFactor);
  const projection = {
    lonOrigin: Math.min(...lons) - PADDING / (unitsPerDegree * lonFactor),
    latOrigin: Math.max(...lats) + PADDING / unitsPerDegree,
    referenceLat: REFERENCE_LAT,
    unitsPerDegree,
  };
  const viewHeight = Math.ceil((Math.max(...lats) - Math.min(...lats)) * unitsPerDegree + 2 * PADDING);
  const project = (ring) => ring.map(([lon, lat]) => projectWith(projection, lat, lon));

  const outline = removeSpikes(simplifyRingToCount(project(land), OUTER_POINTS), MIN_CORNER_DEGREES);
  const enclaves = holes.map((hole) => simplifyRingToCount(project(hole), HOLE_POINTS));
  const path = [outline, ...enclaves].map(toPath).join("");
  const pointCount = outline.length + enclaves.reduce((sum, hole) => sum + hole.length, 0);

  const source = `/**
 * The land outline of the municipality of Espoo, generated by scripts/build-espoo-outline.mjs.
 * Do not edit by hand; run the script again.
 *
 * Boundary © OpenStreetMap contributors, ODbL (https://www.openstreetmap.org/copyright).
 * Relation ${RELATION_ID}, clipped to the mainland coastline; the hole is Kauniainen.
 * ${outline.length} outline points and ${pointCount - outline.length} hole points after Douglas-Peucker simplification.
 */
import type { Projection } from "./projection";

export const ESPOO_PROJECTION: Projection = {
  lonOrigin: ${projection.lonOrigin.toFixed(6)},
  latOrigin: ${projection.latOrigin.toFixed(6)},
  referenceLat: ${REFERENCE_LAT},
  unitsPerDegree: ${unitsPerDegree.toFixed(3)},
};

export const ESPOO_VIEW = { width: ${VIEW_WIDTH}, height: ${viewHeight} } as const;

/** Draw with fill-rule evenodd so Kauniainen stays open. */
export const ESPOO_OUTLINE_PATH =
  "${path}";
`;
  await writeFile(OUTPUT, source);
  process.stdout.write(`Wrote ${OUTPUT}: ${pointCount} points, view ${VIEW_WIDTH} x ${viewHeight}\n`);
}

await main();
