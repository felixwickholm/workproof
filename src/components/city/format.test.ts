import { describe, expect, it } from "vitest";
import { formatClock, formatDayLabel, formatDays, formatEventDate, formatHours, plural } from "./format";

describe("formatHours", () => {
  it("writes short durations people read at a glance", () => {
    expect(formatHours(3)).toBe("3 h");
    expect(formatHours(2.54)).toBe("2.5 h");
    expect(formatHours(0.4)).toBe("24 min");
    expect(formatHours(0)).toBe("1 min");
    expect(formatHours(72)).toBe("3 days");
  });
  it("says Not yet before the first answer", () => {
    expect(formatHours(null)).toBe("Not yet");
  });
});

describe("dates and times", () => {
  it("writes the event date in full", () => {
    expect(formatEventDate("2026-11-14")).toBe("Saturday 14 November 2026");
  });
  it("writes a short day label for an axis", () => {
    expect(formatDayLabel("2026-11-07")).toBe("Sat 7");
    expect(formatDayLabel("2026-11-13")).toBe("Fri 13");
  });
  it("shows a timestamp as Espoo wall-clock time", () => {
    expect(formatClock("2026-11-14T06:51:30.395Z")).toBe("08:51");
  });
  it("keeps a bad input readable instead of throwing", () => {
    expect(formatEventDate("soon")).toBe("soon");
    expect(formatClock("soon")).toBe("");
  });
});

describe("counts in words", () => {
  it("uses the singular for one", () => {
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(4)).toBe("4 days");
    expect(plural(1, "proof")).toBe("1 proof");
    expect(plural(3, "person", "people")).toBe("3 people");
  });
});
