import { describe, expect, it } from "vitest";
import { fitsRoles, isJobRole, JOB_ROLES, ROLE_LABEL, rolesOf } from "./roles";

const challenge = (title: string, need = "", roles?: Parameters<typeof rolesOf>[0]["roles"]) => ({ title, need, roles });

describe("job roles", () => {
  it("labels every role once", () => {
    expect(new Set(JOB_ROLES).size).toBe(JOB_ROLES.length);
    for (const role of JOB_ROLES) expect(ROLE_LABEL[role]).toMatch(/^[A-Z]/);
  });

  it("knows its own roles and nothing else", () => {
    expect(isJobRole("designer")).toBe(true);
    expect(isJobRole("astronaut")).toBe(false);
    expect(isJobRole(3)).toBe(false);
  });

  it("uses the saved roles in display order, dropping unknown ones", () => {
    const saved = ["designer", "ai-developer", "nope"] as unknown as Parameters<typeof rolesOf>[0]["roles"];
    expect(rolesOf(challenge("Anything", "", saved))).toEqual(["ai-developer", "designer"]);
  });

  it("reads the roles from the words when none are saved, whole words only", () => {
    expect(rolesOf(challenge("Fix the budget follow-up", "Financial analyst: bookkeeping accuracy"))).toEqual(["financial-analyst"]);
    expect(rolesOf(challenge("Plan the chip timing sign-off", "Chip verification engineer"))).toEqual(["hardware-engineer"]);
    // "ui" sits inside "build" and "maintain": neither counts.
    expect(rolesOf(challenge("Build and maintain", ""))).toEqual([]);
  });

  it("fits only when a chosen role matches; no roles chosen fits nothing", () => {
    const c = challenge("x", "", ["sales"]);
    expect(fitsRoles(c, ["sales", "legal"])).toBe(true);
    expect(fitsRoles(c, ["legal"])).toBe(false);
    expect(fitsRoles(c, [])).toBe(false);
  });
});
