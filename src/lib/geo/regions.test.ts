import { describe, expect, it } from "vitest";
import { ESPOO_DISTRICTS, project } from "./espoo";
import { districtRegions, insidePolygon, polygonPath, smoothPolygon } from "./regions";

const seeds = Object.values(ESPOO_DISTRICTS).map((place) => ({ name: place.name, point: project(place.lat, place.lon) }));
const regions = districtRegions(seeds, 70, 4);

describe("districtRegions", () => {
  it("gives every district a region around its own point", () => {
    expect(regions.map((r) => r.name)).toEqual(seeds.map((s) => s.name));
    regions.forEach((region, i) => expect(insidePolygon(region.polygon, seeds[i].point), region.name).toBe(true));
  });

  it("never lets two regions overlap, even for districts a kilometre apart", () => {
    const xs = seeds.map((s) => s.point.x);
    const ys = seeds.map((s) => s.point.y);
    for (let x = Math.min(...xs) - 70; x <= Math.max(...xs) + 70; x += 2) {
      for (let y = Math.min(...ys) - 70; y <= Math.max(...ys) + 70; y += 2) {
        const owners = regions.filter((r) => insidePolygon(r.polygon, { x, y }));
        expect(owners.length, `${x},${y}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("keeps each region within its radius", () => {
    regions.forEach((region, i) => {
      for (const p of region.polygon) expect(Math.hypot(p.x - seeds[i].point.x, p.y - seeds[i].point.y)).toBeLessThanOrEqual(70.01);
    });
  });
});

describe("smoothPolygon", () => {
  it("rounds a square into a softer shape inside it", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const soft = smoothPolygon(square);
    expect(soft).toHaveLength(16);
    for (const p of soft) expect(p.x >= 0 && p.x <= 10 && p.y >= 0 && p.y <= 10).toBe(true);
    expect(insidePolygon(soft, { x: 0.2, y: 0.2 })).toBe(false);
  });
});

describe("polygonPath", () => {
  it("writes a closed path", () => {
    expect(
      polygonPath([
        { x: 0, y: 0 },
        { x: 1.26, y: 2 },
      ]),
    ).toBe("M0 0L1.3 2Z");
  });
});
