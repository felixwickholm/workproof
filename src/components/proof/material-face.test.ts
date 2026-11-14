import { describe, expect, it } from "vitest";
import { needsFixedWidth } from "./material-face";

describe("needsFixedWidth", () => {
  it("keeps prose in the sans face", () => {
    expect(needsFixedWidth("Two carers are off sick. Nine visits, six slots.\nDecide which visits stay.")).toBe(false);
  });

  it("uses the fixed face for a table lined up with tabs", () => {
    expect(needsFixedWidth("Week\tTask\tOwner\n1\tKick-off\tTomas")).toBe(true);
  });

  it("uses the fixed face for columns lined up with spaces", () => {
    expect(needsFixedWidth("Week  Task       Owner\n1     Kick-off   Tomas")).toBe(true);
  });

  it("does not count indentation or a double space after a full stop as columns", () => {
    expect(needsFixedWidth("  - first point\n  - second point")).toBe(false);
    expect(needsFixedWidth("Read the plan.  Then answer.")).toBe(false);
  });
});
