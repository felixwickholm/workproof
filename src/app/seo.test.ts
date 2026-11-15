import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import robots, { AI_CRAWLERS } from "./robots";
import sitemap, { EXTRA_PATHS } from "./sitemap";
import { LIVE_SITE, repoUrl, siteUrl } from "./for-judges/site";

afterEach(() => vi.unstubAllEnvs());

describe("site address", () => {
  it("uses SITE_URL when set, the live demo in a production build, and localhost in development", () => {
    vi.stubEnv("SITE_URL", "https://other.example.org/");
    expect(siteUrl()).toBe("https://other.example.org");
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(siteUrl()).toBe(LIVE_SITE);
    vi.stubEnv("NODE_ENV", "development");
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("links the public repository unless REPO_URL says otherwise", () => {
    vi.stubEnv("REPO_URL", "");
    expect(repoUrl()).toBe("https://github.com/felixwickholm/workproof");
    vi.stubEnv("REPO_URL", "https://git.example.org/x/");
    expect(repoUrl()).toBe("https://git.example.org/x");
  });
});

describe("robots", () => {
  it("allows every crawler, the AI crawlers by name, and points at the sitemap", () => {
    vi.stubEnv("SITE_URL", "https://workproof.example.org");
    const result = robots();
    const rules = [result.rules].flat();
    expect(rules.every((r) => r.allow === "/" && r.disallow === undefined)).toBe(true);
    const named = rules.flatMap((r) => [r.userAgent].flat());
    for (const bot of ["*", "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) expect(named).toContain(bot);
    expect(AI_CRAWLERS.length).toBeGreaterThan(4);
    expect(result.sitemap).toBe("https://workproof.example.org/sitemap.xml");
  });
});

describe("sitemap", () => {
  it("lists the start page, the evidence page and both text maps on the site address", () => {
    vi.stubEnv("SITE_URL", "https://workproof.example.org");
    const urls = sitemap().map((entry) => entry.url);
    for (const url of ["", "/for-judges", "/llms.txt", "/llms-full.txt", "/submission.json", "/how-it-works"]) expect(urls).toContain(`https://workproof.example.org${url}`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("lists only extra pages and text maps that exist", () => {
    const missing = EXTRA_PATHS.filter((path) => !path.startsWith("/ads/")).filter((path) => {
      const dir = join(process.cwd(), "src/app", path);
      return !existsSync(join(dir, "page.tsx")) && !existsSync(join(dir, "route.ts"));
    });
    expect(missing).toEqual([]);
  });
});
