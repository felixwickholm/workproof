import { describe, expect, it } from "vitest";
import { markQuotes } from "./quote-marks";

describe("markQuotes", () => {
  it("returns the whole text when nothing is marked", () => {
    expect(markQuotes("One. Two.", [])).toEqual([{ text: "One. Two.", marked: false }]);
  });
  it("marks each quote where it appears", () => {
    expect(markQuotes("A 8:00 insulin. I call F's daughter first. Done.", ["I call F's daughter first."])).toEqual([
      { text: "A 8:00 insulin. ", marked: false },
      { text: "I call F's daughter first.", marked: true },
      { text: " Done.", marked: false },
    ]);
  });
  it("keeps a long quote whole when a short one sits inside it", () => {
    const runs = markQuotes("Check the dispenser and the arms.", ["the dispenser", "Check the dispenser and the arms."]);
    expect(runs).toEqual([{ text: "Check the dispenser and the arms.", marked: true }]);
  });
  it("ignores a quote that is not in the text", () => {
    expect(markQuotes("Plain text.", ["Missing."])).toEqual([{ text: "Plain text.", marked: false }]);
  });
});
