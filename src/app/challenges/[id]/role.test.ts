import { describe, expect, it } from "vitest";
import { roleOf } from "./role";

describe("role of a task", () => {
  it("takes the role before the colon, so the skills are not said twice", () => {
    expect(roleOf("ML engineer: Model evaluation, Data quality, Code review")).toBe("ML engineer");
  });

  it("has no role for a need without one", () => {
    expect(roleOf("Planning, Communication")).toBeNull();
    expect(roleOf(": Planning")).toBeNull();
  });
});
