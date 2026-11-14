import { describe, expect, it } from "vitest";
import { ownerLine, ownersFrom, seenLine } from "./pass-face";

const challenge = (id: string, kind: "event" | "taster" = "event") => ({ challenge: { id, title: "T", minutes: 20, format: "plan" as const, kind } });

describe("pass face", () => {
  const ownersOf = ownersFrom([
    { challenge: { id: "a" }, companies: [{ id: "co-kaari", name: "Kaari Home Care" }] },
    { challenge: { id: "pool" }, companies: [{ id: "co-kaari", name: "Kaari Home Care" }, { id: "co-otso", name: "Otso Health" }] },
  ]);

  it("names the employer, both employers of a shared task, or Practice", () => {
    expect(ownerLine(challenge("a"), ownersOf(challenge("a")))).toBe("Kaari Home Care");
    expect(ownerLine(challenge("pool"), ownersOf(challenge("pool")))).toBe("Kaari Home Care and Otso Health");
    expect(ownerLine(challenge("t", "taster"), ownersOf(challenge("t", "taster")))).toBe("Practice");
  });

  it("says who read it, in words", () => {
    expect(seenLine(0)).toBe("Not opened yet");
    expect(seenLine(1)).toBe("Read by 1 person");
    expect(seenLine(3)).toBe("Read by 3 people");
  });
});
