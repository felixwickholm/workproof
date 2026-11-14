import { describe, expect, it } from "vitest";
import { activeNavItem, isNavRoot, MODES, modeForPath } from "./modes";

const nav = (id: string) => MODES.find((m) => m.id === id)!.nav;

describe("modeForPath", () => {
  it.each([
    ["/seeker", "seeker"],
    ["/challenges", "seeker"],
    ["/challenges/ch-1/work", "seeker"],
    ["/passport", "seeker"],
    ["/employer", "employer"],
    ["/company", "employer"],
    ["/company/review/p-7", "employer"],
    ["/city", "city"],
    ["/city/audit", "city"],
  ])("puts %s in the %s mode", (path, mode) => {
    expect(modeForPath(path)?.id).toBe(mode);
  });

  it.each(["/", "/try", "/table", "/for-judges", "/cityscape", "/companyx", "/trying"])("leaves %s outside the app frame", (path) => {
    expect(modeForPath(path)).toBeNull();
  });

  it("sends every mode home to a page of that same mode", () => {
    for (const mode of MODES) expect(modeForPath(mode.home)?.id).toBe(mode.id);
  });

  it("keeps every nav item inside its own mode", () => {
    for (const mode of MODES) for (const item of mode.nav) expect(modeForPath(item.href)?.id).toBe(mode.id);
  });
});

describe("activeNavItem", () => {
  it("prefers the longest match, so a proof under review lights Review", () => {
    expect(activeNavItem("/company/review/p-7", nav("employer"))?.label).toBe("Review");
    expect(activeNavItem("/company", nav("employer"))?.label).toBe("Post a task");
  });

  it("lights the section a detail page belongs to", () => {
    expect(activeNavItem("/challenges/ch-1", nav("seeker"))?.label).toBe("Tasks");
  });

  it("lights nothing on a page outside the nav", () => {
    expect(activeNavItem("/try", nav("seeker"))).toBeNull();
  });
});

describe("isNavRoot", () => {
  it("is true only on the nav pages themselves", () => {
    expect(isNavRoot("/challenges", nav("seeker"))).toBe(true);
    expect(isNavRoot("/challenges/ch-1", nav("seeker"))).toBe(false);
    expect(isNavRoot("/company/review/p-7", nav("employer"))).toBe(false);
  });
});
