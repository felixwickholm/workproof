import { describe, expect, it } from "vitest";
import { collectText, findJudgement } from "@/lib/guard/no-judgement";
import { isSkillId } from "@/lib/skills/vocabulary";
import { genericRole } from "./generic-role";
import { matchRole } from "./match-role";
import { skillsIn } from "./parse-need";
import { ROLES } from "./roles";

const lines = (body: string) => body.split("\n").length;
const words = (text: string) => text.trim().split(/\s+/).length;

describe("role library", () => {
  it("has at least 36 roles with unique ids", () => {
    expect(ROLES.length).toBeGreaterThanOrEqual(36);
    expect(new Set(ROLES.map((r) => r.id)).size).toBe(ROLES.length);
  });

  for (const role of [...ROLES, genericRole()]) {
    describe(role.id, () => {
      it("uses 4 or 5 known skills", () => {
        expect(role.skills.length).toBeGreaterThanOrEqual(4);
        expect(role.skills.length).toBeLessThanOrEqual(5);
        role.skills.forEach((id) => expect(isSkillId(id)).toBe(true));
      });

      it("has a 20-minute challenge with real material and planted flaws", () => {
        expect(lines(role.challenge.material.body)).toBeGreaterThanOrEqual(12);
        expect(lines(role.challenge.material.body)).toBeLessThanOrEqual(25);
        expect(role.challenge.flaws.length).toBeGreaterThanOrEqual(2);
        expect(role.challenge.flaws.length).toBeLessThanOrEqual(3);
        expect(words(role.challenge.brief)).toBeLessThan(120);
      });

      it("has a taster short enough for a phone", () => {
        expect(lines(role.taster.material.body)).toBeLessThanOrEqual(10);
        expect(role.taster.flaws.length).toBe(1);
        expect(role.taster.deliverable.endsWith("?")).toBe(true);
      });

      it("always accepts words when it asks for a picture, a clip or a voice answer", () => {
        for (const task of [role.challenge, role.taster]) {
          if (["photo", "video", "design", "voice"].includes(task.proofKind)) expect(task.deliverable).toMatch(/\b(?:words|write|written|describe|tell)\b/i);
        }
      });

      it("has constraints that read as an if-clause", () => {
        expect(role.constraints.length).toBeGreaterThanOrEqual(4);
        role.constraints.forEach((c) => expect(c).toMatch(/^[a-z]/));
      });

      it("contains no judgement, exclamation marks, emoji or em dashes", () => {
        // Cues are match terms and never shown; flaw labels are, so they stay in.
        const shown = (task: typeof role.challenge) => ({ ...task, flaws: task.flaws.map((f) => f.label) });
        const text = collectText({ c: shown(role.challenge), t: shown(role.taster), why: role.why, look: role.lookFor }).join("\n");
        expect(findJudgement(text)).toEqual([]);
        expect(text).not.toMatch(/[—]|\p{Extended_Pictographic}/u);
        expect(collectText([role.challenge.brief, role.taster.brief, role.challenge.deliverable]).join(" ")).not.toContain("!");
      });
    });
  }
});

describe("matchRole", () => {
  it.each([
    ["ohjelmistokehittäjä", "full-stack"],
    ["data-analyytikko Power BI", "data-analyst"],
    ["projektipäällikkö", "project-manager"],
    ["ML engineer for pick robots", "ml-engineer"],
    ["Senior backend developer, Node.js", "backend"],
    ["sairaanhoitaja", "nurse"],
    ["LLM app developer with RAG", "ai-engineer"],
    ["kotihoitaja", "home-care-coordinator"],
    ["writer for patient letters", "health-communicator"],
    ["barista", "cook"],
    ["laatoittaja", "renovation-worker"],
    ["sähköasentaja", "electrician"],
    ["asiakaspalvelija", "customer-service"],
    ["graphic designer", "graphic-designer"],
    ["siivooja", "cleaning-supervisor"],
    ["varhaiskasvatus", "childcare"],
    ["bus driver", "driver"],
    ["warehouse worker", "warehouse-worker"],
    ["myyjä", "sales-assistant"],
    ["doctor", "nurse"],
    ["football coach", "teacher"],
    ["game developer", "frontend"],
    ["founder", "product-manager"],
  ])("maps %s to %s", (text, id) => {
    expect(matchRole(text)?.id).toBe(id);
  });

  it("returns nothing for unknown roles", () => {
    expect(matchRole("beekeeper")).toBeUndefined();
  });
});

describe("skill matching", () => {
  it("matches English terms as whole words, so career never means care", () => {
    expect(skillsIn("Data analyst with no career gaps, SQL and dashboards")).not.toContain("patient-safety");
    expect(skillsIn("careful and impatient")).not.toContain("patient-safety");
    expect(skillsIn("care home")).toContain("patient-safety");
  });

  it("counts a term only once when it sits inside a longer term of another skill", () => {
    expect(skillsIn("food safety and safety at work")).toEqual(["food-safety", "work-safety"]);
    expect(skillsIn("shift planning")).toEqual(["shift-planning"]);
  });

  it("keeps matching Finnish compounds", () => {
    expect(skillsIn("potilasturvallisuus ja hoitotyö")).toContain("patient-safety");
  });
});
