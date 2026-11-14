import { describe, expect, it } from "vitest";
import { activeNavItem, isNavRoot, MODES, modeForPath } from "./modes";

const nav = (id: string) => MODES.find((m) => m.id === id)!.nav;

describe("modeForPath", () => {
  it.each([
    ["/", "seeker"],
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

  it.each(["/try", "/how-it-works", "/table", "/for-judges", "/cityscape", "/companyx", "/trying"])("leaves %s outside the app frame", (path) => {
    expect(modeForPath(path)).toBeNull();
  });

  it("sends every mode home to a page of that same mode", () => {
    for (const mode of MODES) expect(modeForPath(mode.home)?.id).toBe(mode.id);
  });

  it("names the three views in the visitor's words", () => {
    expect(MODES.map((m) => m.label)).toEqual(["Job seeker", "Company", "City of Espoo"]);
  });

  it("keeps CVs out of every label and line", () => {
    for (const mode of MODES) expect(`${mode.label} ${mode.description}`).not.toMatch(/\bCVs?\b/);
  });

  it("keeps every nav item inside its own mode", () => {
    for (const mode of MODES) for (const item of mode.nav) expect(modeForPath(item.href)?.id).toBe(mode.id);
  });
});

describe("activeNavItem", () => {
  it("prefers the longest match, so a proof under review lights Review", () => {
    expect(activeNavItem("/company/review/p-7", nav("employer"))?.label).toBe("Score work");
    expect(activeNavItem("/company", nav("employer"))?.label).toBe("New challenge");
  });

  it("lights the section a detail page belongs to", () => {
    expect(activeNavItem("/challenges/ch-1", nav("seeker"))?.label).toBe("Challenges");
  });

  it("lights Home on /seeker, the other address of the job seeker home", () => {
    expect(activeNavItem("/seeker", nav("seeker"))?.label).toBe("Home");
    expect(activeNavItem("/", nav("seeker"))?.label).toBe("Home");
  });

  it("lights nothing on a page outside the nav", () => {
    expect(activeNavItem("/try", nav("seeker"))).toBeNull();
  });
});

describe("isNavRoot", () => {
  it("is true only on the nav pages themselves", () => {
    expect(isNavRoot("/challenges", nav("seeker"))).toBe(true);
    expect(isNavRoot("/seeker", nav("seeker"))).toBe(true);
    expect(isNavRoot("/challenges/ch-1", nav("seeker"))).toBe(false);
    expect(isNavRoot("/company/review/p-7", nav("employer"))).toBe(false);
  });
});
