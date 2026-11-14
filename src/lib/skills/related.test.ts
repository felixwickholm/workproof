import { describe, expect, it } from "vitest";
import { findJudgement } from "@/lib/guard/no-judgement";
import { SKILL_CUES, WORK_CUES } from "./cues";
import { relatedParts } from "./related";
import { isSkillId, SKILLS } from "./vocabulary";

const skill = (id: keyof typeof SKILLS) => ({ id, label: SKILLS[id].label });

describe("related parts", () => {
  const work = [
    "The insulin visit stays at 8:00, it cannot wait.",
    "I call the daughter of client F before seven.",
    "The shower moves to Thursday.",
  ].join("\n");

  it("marks the sentences where each skill shows up, in the order of the skills", () => {
    const parts = relatedParts(work, [skill("patient-safety"), skill("calm-on-the-phone")]);
    expect(parts.map((p) => p.skillId)).toEqual(["patient-safety", "calm-on-the-phone"]);
    expect(parts[0].quotes).toEqual(["The insulin visit stays at 8:00, it cannot wait."]);
    expect(parts[1].quotes).toEqual(["I call the daughter of client F before seven."]);
  });

  it("returns a skill with no quotes when its words do not appear, and never a number", () => {
    const [part] = relatedParts(work, [skill("timing-analysis")]);
    expect(part.quotes).toEqual([]);
    expect(Object.keys(part).sort()).toEqual(["label", "quotes", "skillId"]);
  });

  it("keeps at most three quotes per skill", () => {
    const long = Array.from({ length: 6 }, (_, i) => `Step ${i}: the beam load goes to the wall.`).join(" ");
    expect(relatedParts(long, [skill("structural-design")])[0].quotes).toHaveLength(3);
  });

  it("uses lowercase, judgement-free work cues for known skills only", () => {
    for (const [id, cues] of Object.entries(WORK_CUES)) {
      expect(isSkillId(id), id).toBe(true);
      expect(cues.every((cue) => cue === cue.toLowerCase() && cue.trim() === cue), id).toBe(true);
      expect(findJudgement(cues.join("\n")), id).toEqual([]);
    }
    expect(Object.keys(SKILL_CUES)).toEqual(expect.arrayContaining(Object.keys(WORK_CUES)));
  });
});
