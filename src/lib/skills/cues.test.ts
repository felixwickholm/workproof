import { describe, expect, it } from "vitest";
import { protectedNames } from "@/lib/guard/protected";
import { SKILL_CUES } from "./cues";
import { SKILL_IDS, SKILLS } from "./vocabulary";

describe("skill cues", () => {
  it("gives every skill a small set of lowercase everyday words", () => {
    for (const id of SKILL_IDS) {
      const cues: readonly string[] = SKILL_CUES[id];
      expect(cues.length, id).toBeGreaterThanOrEqual(2);
      expect(cues.length, id).toBeLessThanOrEqual(12);
      expect(cues.every((cue) => cue === cue.toLowerCase() && cue.trim() === cue), id).toBe(true);
      expect(new Set(cues).size, id).toBe(cues.length);
    }
  });

  it("adds words the synonyms do not already cover", () => {
    for (const id of SKILL_IDS) {
      const synonyms: readonly string[] = SKILLS[id].synonyms;
      expect((SKILL_CUES[id] as readonly string[]).filter((cue) => synonyms.includes(cue)), id).toEqual([]);
    }
  });

  it("never describes a person", () => {
    expect(protectedNames(Object.values(SKILL_CUES).flat().join("\n"))).toEqual([]);
  });
});
