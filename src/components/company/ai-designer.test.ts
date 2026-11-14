import { describe, expect, it } from "vitest";
import { designerLine, FALLBACK_LINE, fallbackLine, PAUSED_LINE } from "./ai-designer";

describe("designerLine", () => {
  it("names the designer that wrote the draft", () => {
    expect(designerLine("scripted")).toBe("Drafted by the built-in task designer");
    expect(designerLine("claude")).toBe("Drafted by Claude");
    expect(designerLine("gemini")).toBe("Drafted by Gemini");
  });

  it("falls back to the built-in designer for anything else", () => {
    expect(designerLine(undefined)).toBe("Drafted by the built-in task designer");
    expect(designerLine("toString")).toBe("Drafted by the built-in task designer");
  });
});

describe("fallbackLine", () => {
  const live = { provider: "gemini" as const, live: true };
  const paused = { provider: "gemini" as const, live: false, pausedUntil: "2026-11-14T09:00:00.000Z" };

  it("says the model failed on this draft when it was live before the request", () => {
    expect(fallbackLine("scripted", live)).toBe(FALLBACK_LINE);
    expect(fallbackLine(undefined, { provider: "claude", live: true })).toBe(FALLBACK_LINE);
  });

  it("says the model is paused when it already was before the request", () => {
    expect(fallbackLine("scripted", paused)).toBe(PAUSED_LINE);
  });

  it("says nothing when the model wrote the draft, none is configured, or the status is unknown", () => {
    expect(fallbackLine("gemini", live)).toBeNull();
    expect(fallbackLine("scripted", { provider: "scripted", live: false })).toBeNull();
    expect(fallbackLine("scripted", null)).toBeNull();
  });
});
