import { createRequire } from "node:module";
import { join } from "node:path";

export const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

/** Playwright from this project, or from the folder `npm run eval:e2e` points to. */
export async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const modules = process.env.PLAYWRIGHT_MODULES;
    if (!modules) throw new Error("Playwright is not installed. Run `npm run eval:e2e`, which fetches it with npx.");
    return createRequire(join(modules, "index.js"))("playwright");
  }
}

/**
 * Runs named steps in order and records each result. After a failed step the rest of the
 * suite is skipped, since every step builds on the one before. E2E_KEEP_GOING=1 runs them anyway.
 */
export function createSuite(name, page) {
  const results = [];
  let failed = false;
  return {
    name,
    results,
    async step(label, fn) {
      if (failed && !process.env.E2E_KEEP_GOING) {
        results.push({ suite: name, step: label, status: "skip" });
        return;
      }
      const started = Date.now();
      try {
        await fn();
        results.push({ suite: name, step: label, status: "pass", ms: Date.now() - started });
      } catch (error) {
        failed = true;
        const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
        // E2E_SHOTS=<folder> keeps a screenshot of each failure for a person to look at.
        if (process.env.E2E_SHOTS && page) {
          const file = `${process.env.E2E_SHOTS}/${name}-${label}.png`.replace(/\s+/g, "-");
          await page.screenshot({ path: file, fullPage: false }).catch(() => {});
        }
        results.push({ suite: name, step: label, status: "FAIL", ms: Date.now() - started, error: message });
      }
    },
  };
}

/** Fails the current step on any console error or uncaught page error. */
export function watchErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page error: ${error.message}`));
  return {
    assertClean(where) {
      if (errors.length) throw new Error(`${where}: ${errors.splice(0).join(" | ")}`);
    },
  };
}

/**
 * The page must not scroll sideways at the device width. A phone browser widens its layout
 * viewport when content overflows, so compare with the configured width, not innerWidth.
 */
export async function assertNoOverflow(page, screen) {
  const device = page.viewportSize()?.width ?? 0;
  const { scroll, layout } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    layout: window.innerWidth,
  }));
  const widest = Math.max(scroll, layout);
  if (widest > device) throw new Error(`${screen}: page is ${widest}px wide on a ${device}px screen`);
}

/** Every check a visited screen gets: no errors so far, no sideways scroll. */
export async function checkScreen(page, errors, screen) {
  await page.waitForLoadState("domcontentloaded");
  await assertNoOverflow(page, screen);
  errors.assertClean(screen);
}

export function expect(condition, message) {
  if (!condition) throw new Error(message);
}

export async function resetDemo() {
  const res = await fetch(`${BASE_URL}/api/demo/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`Demo reset failed with ${res.status}`);
}

/** Types like a person, one key at a time, into an emptied field (some fields are prefilled). */
export async function type(locator, text) {
  await locator.click();
  await locator.press("ControlOrMeta+a");
  await locator.press("Backspace");
  await locator.pressSequentially(text, { delay: 0 });
}

/** The numbers on the city screen, read from the tiles by their labels. */
export async function readCityTotals(page) {
  return page.evaluate(() => {
    const labels = [
      "Problem Cards live",
      "Proofs sent",
      "Human decisions",
      "Meetings invited",
      "Meetings confirmed by both sides",
      "Second look meetings",
      "Automated decisions",
    ];
    const totals = {};
    for (const label of labels) {
      const p = [...document.querySelectorAll("p")].find((el) => el.textContent?.trim() === label);
      const tile = p?.closest(".rounded-card");
      const value = tile?.querySelector(":scope > p:last-child")?.textContent?.trim();
      totals[label] = value === undefined ? null : Number(value);
    }
    return totals;
  });
}
