import { describe, expect, it } from "vitest";
import { endSentence } from "./sentence";

describe("endSentence", () => {
  it("adds a full stop only when the title has no closing mark", () => {
    expect(endSentence("Fix one wrong number")).toBe("Fix one wrong number.");
    expect(endSentence("Which path fails in this timing report?")).toBe("Which path fails in this timing report?");
    expect(endSentence("Find it. ")).toBe("Find it.");
  });
});
