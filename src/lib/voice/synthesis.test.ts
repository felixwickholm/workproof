import { describe, expect, it } from "vitest";
import { pickVoice } from "./synthesis";

const voices = [
  { name: "Alex", lang: "en-US", localService: true },
  { name: "Google UK English Female", lang: "en-GB", localService: false },
  { name: "Microsoft Aria Online (Natural)", lang: "en-US", localService: false },
  { name: "Satu", lang: "fi-FI", localService: true },
];

describe("pickVoice", () => {
  it("prefers a natural voice with the exact language", () => {
    expect(pickVoice(voices, "en-US")?.name).toBe("Microsoft Aria Online (Natural)");
  });

  it("takes a same-language voice when the region differs", () => {
    expect(pickVoice(voices, "en-AU")?.name).toBe("Google UK English Female");
  });

  it("matches the language without a region and with an underscore", () => {
    expect(pickVoice(voices, "fi")?.name).toBe("Satu");
    expect(pickVoice(voices, "fi_FI")?.name).toBe("Satu");
  });

  it("returns nothing when no voice speaks the language", () => {
    expect(pickVoice(voices, "sv-SE")).toBeUndefined();
    expect(pickVoice([], "en-US")).toBeUndefined();
  });
});
