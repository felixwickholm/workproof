import { describe, expect, it } from "vitest";
import { JOB_ROLES } from "@/lib/domain/roles";
import { draftProblems } from "@/lib/guard/check-draft";
import { COMPANY_ROLES, handDraft, roleById, roleNeed } from "./roles";

describe("company roles", () => {
  it("has one chip per role, each with a unique id", () => {
    expect(new Set(COMPANY_ROLES.map((r) => r.id)).size).toBe(COMPANY_ROLES.length);
    expect(COMPANY_ROLES.map((r) => r.id)).toEqual([...JOB_ROLES]);
    expect(COMPANY_ROLES.map((r) => r.label)).toContain("Financial analyst");
  });

  it("puts the role first and adds the company's words after it", () => {
    const role = roleById("data-analyst");
    expect(role).toBeDefined();
    expect(roleNeed(role!, "  ")).toBe(role!.need);
    expect(roleNeed(role!, " our  churn report ")).toBe(`${role!.need}. our churn report`);
  });

  it("gives a hand-written challenge three skills from the shared list with a note for each", () => {
    for (const role of COMPANY_ROLES) {
      const draft = { ...handDraft(role), title: "A real task", brief: "Read the numbers and say what you see.", deliverable: "A short note" };
      expect(draftProblems(draft)).toEqual([]);
      expect(draft.roles).toEqual([role.id]);
    }
  });
});
