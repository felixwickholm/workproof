import { describe, expect, it } from "vitest";
import { ESPOO_DISTRICTS, EVENT_VENUE, project } from "./espoo";
import { ESPOO_OUTLINE_PATH, ESPOO_PROJECTION, ESPOO_VIEW } from "./espoo-outline";

function outlineRings(): [number, number][][] {
  return ESPOO_OUTLINE_PATH.split("Z")
    .filter(Boolean)
    .map((ring) =>
      ring
        .slice(1)
        .split("L")
        .map((pair) => pair.split(" ").map(Number) as [number, number]),
    );
}

function insideRing(ring: [number, number][], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Even-odd, like the SVG fill: inside the outline and not inside Kauniainen. */
function onLand(x: number, y: number) {
  return outlineRings().filter((ring) => insideRing(ring, x, y)).length % 2 === 1;
}

describe("project", () => {
  it("puts the projection origin at the top left", () => {
    const origin = project(ESPOO_PROJECTION.latOrigin, ESPOO_PROJECTION.lonOrigin);
    expect(origin.x).toBeCloseTo(0, 6);
    expect(origin.y).toBeCloseTo(0, 6);
  });

  it("grows x to the east and y to the south", () => {
    const tapiola = project(60.176, 24.805);
    expect(project(60.176, 24.9).x).toBeGreaterThan(tapiola.x);
    expect(project(60.1, 24.805).y).toBeGreaterThan(tapiola.y);
  });

  it("keeps distances true at 60.2°N: a kilometre east equals a kilometre north", () => {
    const kmPerDegreeLat = 111.32;
    const kmPerDegreeLon = kmPerDegreeLat * Math.cos((60.2 * Math.PI) / 180);
    const start = project(60.2, 24.7);
    const east = project(60.2, 24.7 + 1 / kmPerDegreeLon);
    const north = project(60.2 + 1 / kmPerDegreeLat, 24.7);
    expect(east.x - start.x).toBeCloseTo(start.y - north.y, 6);
  });
});

describe("Espoo outline", () => {
  it("has the outline and the Kauniainen hole, simplified to a light path", () => {
    const rings = outlineRings();
    expect(rings).toHaveLength(2);
    expect(rings[0].length).toBeGreaterThanOrEqual(120);
    expect(rings[0].length).toBeLessThanOrEqual(200);
  });

  it("fits inside the view", () => {
    for (const [x, y] of outlineRings().flat()) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(ESPOO_VIEW.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(ESPOO_VIEW.height);
    }
  });

  it("puts every district and the venue on land", () => {
    for (const place of [...Object.values(ESPOO_DISTRICTS), EVENT_VENUE]) {
      const { x, y } = project(place.lat, place.lon);
      expect(onLand(x, y), place.name).toBe(true);
    }
  });

  it("leaves Kauniainen and the sea off the land", () => {
    const kauniainen = project(60.21, 24.729);
    const sea = project(60.12, 24.75);
    expect(onLand(kauniainen.x, kauniainen.y)).toBe(false);
    expect(onLand(sea.x, sea.y)).toBe(false);
  });
});
