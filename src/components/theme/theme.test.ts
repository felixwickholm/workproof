import { describe, expect, it } from "vitest";
import { parseTheme, themeScript, THEME_STORAGE_KEY } from "./theme";

describe("parseTheme", () => {
  it("defaults to light for a missing or unknown value", () => {
    expect(parseTheme(null)).toBe("light");
    expect(parseTheme(undefined)).toBe("light");
    expect(parseTheme("sepia")).toBe("light");
  });

  it("keeps a stored dark choice", () => {
    expect(parseTheme("dark")).toBe("dark");
  });
});

describe("themeScript", () => {
  it("reads the same storage key the toggle writes", () => {
    expect(themeScript).toContain(JSON.stringify(THEME_STORAGE_KEY));
  });

  it("is valid JavaScript", () => {
    expect(() => new Function(themeScript)).not.toThrow();
  });
});
