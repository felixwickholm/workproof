import { describe, expect, it } from "vitest";
import { rolesOf } from "@/lib/domain/roles";
import { buildSeed } from ".";
import { PERSONA_ROLES } from "./roles";
import { STORY_CHALLENGE_ID } from "./story";

describe("seeded challenge roles", () => {
  const data = buildSeed(new Date("2026-11-14T12:00:00.000Z"));

  it("gives every seeded challenge at least one role", () => {
    for (const c of data.challenges) expect(c.roles?.length, c.id).toBeGreaterThan(0);
  });

  it("puts the story challenge under the demo person's role", () => {
    const story = data.challenges.find((c) => c.id === STORY_CHALLENGE_ID);
    expect(story && rolesOf(story).some((r) => PERSONA_ROLES.includes(r))).toBe(true);
  });

  it("covers more than one role, so the chips change the list", () => {
    expect(new Set(data.challenges.flatMap((c) => c.roles ?? [])).size).toBeGreaterThan(5);
  });
});
