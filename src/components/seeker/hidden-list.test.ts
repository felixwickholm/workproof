import { describe, expect, it } from "vitest";
import { hiddenByKind } from "./hidden-list";

describe("hidden by kind", () => {
  it("lists only the kinds that were hidden, in a fixed order", () => {
    expect(hiddenByKind({ names: 1, contacts: 0, places: 3, schools: 1, employers: 1, other: 1 })).toBe(
      "1 name, 3 places, 1 school, 1 employer, 1 other detail",
    );
    expect(hiddenByKind({ names: 0, contacts: 2, places: 0, schools: 0, employers: 0, other: 0 })).toBe("2 contact details");
    expect(hiddenByKind({ names: 0, contacts: 0, places: 0, schools: 0, employers: 0, other: 0 })).toBe("");
  });
});
