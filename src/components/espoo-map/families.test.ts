import { describe, expect, it } from "vitest";
import { FAMILY_SHAPE, sectorFamily } from "./families";

describe("sectorFamily", () => {
  it.each([
    ["Energy software", "technical"],
    ["Payments software", "technical"],
    ["Robotics", "technical"],
    ["Structural engineering", "technical"],
    ["Laboratory services", "technical"],
    ["Chip design", "technical"],
    ["Food technology", "technical"],
    ["Financial services", "commercial"],
    ["Legal services", "commercial"],
    ["Marketing and communications", "commercial"],
    ["Restaurants", "commercial"],
    ["Home care", "people"],
    ["Occupational health", "people"],
    ["Design", "people"],
    ["Education", "people"],
    ["Health technology", "people"],
  ])("puts %s in %s", (sector, family) => {
    expect(sectorFamily(sector)).toBe(family);
  });

  it("counts an unknown sector as technical", () => {
    expect(sectorFamily("Something new")).toBe("technical");
  });

  it("does not read ux inside another word", () => {
    expect(sectorFamily("Deluxe hotels")).toBe("commercial");
  });

  it("gives each family its own shape", () => {
    expect(new Set(Object.values(FAMILY_SHAPE)).size).toBe(3);
  });
});
