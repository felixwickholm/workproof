import { describe, expect, it } from "vitest";
import { isFigure, materialBlocks } from "./material";

describe("materialBlocks", () => {
  it("keeps prose as one text block", () => {
    expect(materialBlocks("Two carers are off sick.\nDecide which visits stay.")).toEqual([{ kind: "text", text: "Two carers are off sick.\nDecide which visits stay." }]);
  });

  it("turns hand-aligned lines into a table with a head", () => {
    const blocks = materialBlocks("Who we want: students.\n\nVideo           Views    Shares\nStudio trailer  41 000   120\nTeam plays      9 000\n\nThis is synthetic.");
    expect(blocks).toEqual([
      { kind: "text", text: "Who we want: students." },
      { kind: "table", head: ["Video", "Views", "Shares"], rows: [["Studio trailer", "41 000", "120"], ["Team plays", "9 000", ""]] },
      { kind: "text", text: "This is synthetic." },
    ]);
  });

  it("keeps a figure under its own heading when cells to its left are blank", () => {
    const body = ["Row          Qty   Unit   Total", "Venue hire     1  2 400   2 400", "Social ads                3 000", "Subtotal                 12 910"].join("\n");
    expect(materialBlocks(body)).toEqual([
      {
        kind: "table",
        head: ["Row", "Qty", "Unit", "Total"],
        rows: [
          ["Venue hire", "1", "2 400", "2 400"],
          ["Social ads", "", "", "3 000"],
          ["Subtotal", "", "", "12 910"],
        ],
      },
    ]);
  });

  it("does not count indentation, one aligned line or a double space after a full stop as a table", () => {
    expect(materialBlocks("  - first point\n  - second point")[0].kind).toBe("text");
    expect(materialBlocks("Read the plan.  Then answer.")[0].kind).toBe("text");
    expect(materialBlocks("Week  Task\nnot a row")[0].kind).toBe("text");
  });

  it("tells figures from words", () => {
    expect(isFigure("41 000")).toBe(true);
    expect(isFigure("12 %")).toBe(true);
    expect(isFigure("all 3")).toBe(false);
    expect(isFigure("")).toBe(false);
  });
});
