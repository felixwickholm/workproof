import { describe, expect, it } from "vitest";
import { fixUnits, markedText, unitRows } from "./fix-units";

describe("fix units", () => {
  it("splits code by line and skips blank lines", () => {
    const units = fixUnits({ kind: "code", body: "a = 1\n\nb = 2" });
    expect(units.map((u) => [u.text, u.row, u.shape])).toEqual([
      ["a = 1", 0, "line"],
      ["b = 2", 2, "line"],
    ]);
  });

  it("splits a table by cell and names a cell by its row", () => {
    const units = fixUnits({ kind: "text", body: "Item    Jan    Feb\nTravel  12 000  42 000\nFood    3 000  3 000" });
    expect(units.every((u) => u.shape === "cell")).toBe(true);
    expect(unitRows(units).map((r) => r.length)).toEqual([3, 3, 3]);
    const wrong = units.find((u) => u.text === "42 000")!;
    expect(markedText(units, wrong)).toBe("Travel: 42 000");
    expect(markedText(units, units.find((u) => u.text === "Travel")!)).toBe("Travel");
  });

  it("keeps each cell's column, so a row with blank cells lines up", () => {
    const units = fixUnits({ kind: "text", body: "Item      Qty   Total\nVenue       1   2 400\nSocial ads      3 000" });
    expect(units.filter((u) => u.row === 2).map((u) => [u.text, u.column])).toEqual([
      ["Social ads", 0],
      ["3 000", 2],
    ]);
  });

  it("splits prose by sentence", () => {
    const units = fixUnits({ kind: "text", body: "The tenant pays rent. The landlord may enter at any time!\nNotice is 2 weeks." });
    expect(units.map((u) => u.text)).toEqual(["The tenant pays rent.", "The landlord may enter at any time!", "Notice is 2 weeks."]);
    expect(units.map((u) => u.index)).toEqual([0, 1, 2]);
    expect(markedText(units, units[1])).toBe("The landlord may enter at any time!");
  });
});
