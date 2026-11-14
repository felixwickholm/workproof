import { createRequire } from "node:module";
import { join } from "node:path";

export const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
export const LAPTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

/** Long enough for a live AI model to draft a task or write follow-up questions. */
export const AI_WAIT_MS = 45_000;

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
    get failed() {
      return failed;
    },
    /** `shot` names the page to photograph on failure, when the step works on another one. */
    async step(label, fn, { shot: shotPage = page } = {}) {
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
        // E2E_SHOTS=<folder> keeps a screenshot of each failure for a person to look at; E2E_FULL=1 takes the whole page.
        let shot = "";
        if (process.env.E2E_SHOTS && shotPage) {
          const file = `${process.env.E2E_SHOTS}/${`${name}-${label}`.replace(/[^\w.-]+/g, "-")}.png`;
          if (await shotPage.screenshot({ path: file, fullPage: process.env.E2E_FULL === "1" }).then(() => true, () => false)) shot = file;
        }
        results.push({ suite: name, step: label, status: "FAIL", ms: Date.now() - started, error: message, ...(shot ? { shot } : {}) });
      }
    },
  };
}

/** A request that failed on the network, other than one the browser cancelled on purpose. */
const realFailure = (request) => !/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(request.failure()?.errorText ?? "");

/**
 * Fails the current step on any console error or uncaught page error. With `network: true` it also
 * fails on a request that never got an answer, and on an error status from this app's own server.
 */
export function watchErrors(page, { network = false } = {}) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page error: ${error.message}`));
  if (network) {
    page.on("requestfailed", (request) => {
      if (realFailure(request)) errors.push(`request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText})`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().startsWith(BASE_URL)) errors.push(`HTTP ${response.status()}: ${response.request().method()} ${response.url()}`);
    });
  }
  return {
    assertClean(where) {
      if (errors.length) throw new Error(`${where}: ${errors.splice(0).join(" | ")}`);
    },
    /** Drops the errors a step caused on purpose, such as a refusal it waits for. Returns how many. */
    allow(pattern) {
      const kept = errors.filter((error) => !pattern.test(error));
      const dropped = errors.length - kept.length;
      errors.splice(0, errors.length, ...kept);
      return dropped;
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

/** Types like a person, one key at a time, into an emptied field (some fields are prefilled). */
export async function type(locator, text) {
  await locator.click();
  await locator.press("ControlOrMeta+a");
  await locator.press("Backspace");
  await locator.pressSequentially(text, { delay: 0 });
}

/** The numbers on the city screen, read from each tile by its label. */
export async function readCityTotals(page) {
  return page.evaluate(() => {
    const labels = [
      "Tasks live",
      "Proofs sent",
      "Human decisions",
      "People invited to meet",
      "Meetings confirmed by both sides",
      "Second look meetings",
      "Feedback owed",
      "Automated decisions",
    ];
    const totals = {};
    for (const label of labels) {
      const value = document.querySelector(`[data-total="${label}"] [data-value]`)?.textContent?.trim();
      totals[label] = value === undefined ? null : Number(value);
    }
    return totals;
  });
}

/**
 * One visitor: a fresh browser context (so a private demo event of its own), one page and a suite.
 * `theme` stores a theme before the first paint; `speech: false` takes speech recognition away,
 * as on a browser that cannot listen. Voice is not live, so every flow is typed either way.
 */
export async function openVisitor(browser, device, suiteName, { theme, speech = true } = {}) {
  const context = await browser.newContext(device);
  if (theme) await context.addInitScript((value) => localStorage.setItem("workproof.theme", value), theme);
  if (!speech) {
    await context.addInitScript(() => {
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
    });
  }
  const page = await context.newPage();
  return { context, page, suite: createSuite(suiteName, page), errors: watchErrors(page, { network: true }) };
}

/**
 * The text a person can read on the screen right now. Next keeps recent routes mounted but hidden,
 * and innerText leaves out anything not displayed, so earlier screens never count.
 */
export function visibleText(page) {
  return page.evaluate(() => document.body.innerText);
}

/** Waits until the screen shows `text` (a string or a RegExp) somewhere a person can read it. */
export async function waitForText(page, text, timeout = 15_000) {
  const source = text instanceof RegExp ? text.source : null;
  const flags = text instanceof RegExp ? text.flags : "";
  await page
    .waitForFunction(
      ([plain, src, fl]) => (src ? new RegExp(src, fl).test(document.body.innerText) : document.body.innerText.includes(plain)),
      [typeof text === "string" ? text : null, source, flags],
      { timeout, polling: 100 },
    )
    .catch(() => {
      throw new Error(`the screen never showed ${text instanceof RegExp ? text : `"${text}"`} (${timeout / 1000}s)`);
    });
}

/** Fails when the readable screen contains any of `secrets`. */
export async function assertTextLacks(page, secrets, where) {
  const text = await visibleText(page);
  for (const secret of secrets) expect(!text.includes(secret), `${where}: "${secret}" is on the screen`);
}

/** The visible element among the ones a locator matches (hidden copies of a route stay in the DOM). */
export const visible = (locator) => locator.filter({ visible: true }).first();

/**
 * JSON from this app's API with the visitor's own cookie, so it reads the visitor's private event.
 * `talentId` goes in the private-key header, the way the app sends it, never in the path.
 */
export async function apiJson(page, path, talentId) {
  const response = await page.request.get(`${BASE_URL}${path}`, talentId ? { headers: { "x-workproof-key": talentId } } : undefined);
  expect(response.ok(), `GET ${path} answered ${response.status()}`);
  return response.json();
}

/** Switches view with the top-left switcher, as a person does, and waits for the new home. */
export async function switchMode(page, label, home) {
  await visible(page.getByRole("button", { name: /^View: / })).click();
  await visible(page.getByRole("menuitemradio", { name: new RegExp(`^${label}`) })).click();
  await page.waitForURL((url) => url.pathname === home, { timeout: 15_000 });
  await visible(page.getByRole("heading", { level: 1 })).waitFor({ timeout: 15_000 });
}

/** Waits until no skeleton or busy region is left on the screen. */
export async function settled(page, timeout = 15_000) {
  await page.waitForFunction(() => ![...document.querySelectorAll("[aria-busy='true'], [aria-busy='']")].some((el) => el.offsetParent !== null), null, {
    timeout,
    polling: 100,
  });
}

/**
 * A small photo of "the work", drawn on a canvas in the page and saved as JPEG. A canvas keeps only
 * pixels, so the file has no EXIF block; the check below makes sure of it.
 */
export async function makeJpeg(page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const g = canvas.getContext("2d");
    g.fillStyle = "#f1e6cf";
    g.fillRect(0, 0, 320, 240);
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(160, 120, 96, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#8a5a2b";
    g.fillRect(110, 90, 100, 60);
    return canvas.toDataURL("image/jpeg", 0.8);
  });
  const buffer = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  expect(buffer[0] === 0xff && buffer[1] === 0xd8, "the test picture is not a JPEG");
  expect(!jpegSegments(buffer).includes(0xe1), "the test picture carries an EXIF block");
  return buffer;
}

/** The marker of each header segment of a JPEG, up to the image data. APP1 (0xe1) holds EXIF and XMP. */
function jpegSegments(buffer) {
  const markers = [];
  let at = 2;
  while (at + 4 <= buffer.length && buffer[at] === 0xff) {
    const marker = buffer[at + 1];
    markers.push(marker);
    if (marker === 0xda) break;
    at += 2 + buffer.readUInt16BE(at + 2);
  }
  return markers;
}

/**
 * Polls a check until it holds, for a state that settles after an animation or a poll. `message`
 * may be a function, so the failure can describe the last state seen.
 */
export async function eventually(check, message, timeout = 5_000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(typeof message === "function" ? message() : message);
}

/** Matches text that starts with a proof label, so "Proof K7" never matches "Proof K71". */
export const startsWithLabel = (label) => new RegExp(`^${label}(?!\\d)`);

/** The first proof label ("Proof K7") in a text. */
export const proofLabelIn = (text) => text.match(/Proof [A-Z]\d+/)?.[0] ?? null;
