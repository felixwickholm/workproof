import { BASE_URL, checkScreen, createSuite, expect, LAPTOP, PHONE, watchErrors } from "./harness.mjs";

/** The story's cards, its last card, and the ways out of it. Kept in step with src/components/tour/steps.ts. */
const CARDS = 17;
const END_TITLE = "People get jobs for the work they can do.";
const END_LABELS = ["Try it as Mikko", "Try it as Laura", "See the city view"];
/** Where each view's Show me button starts the story: its chapter's first card. */
const CHAPTER = { seeker: 1, employer: 6, city: 11 };
/** The whole story must reach its end card within this, with no tap. */
const STORY_BUDGET_MS = 220_000;
/** The longest a step may take to give way to the next one: its own time plus a slow screen. */
const STALL_MS = 25_000;
/** A move between two cards slower than this is reported as one a visitor would feel. */
const SLOW_MOVE_MS = 1_200;

const words = (text) => text.split(/\s+/).filter(Boolean);
const sentences = (text) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
const inside = (box, view) => box.x >= -0.5 && box.y >= -0.5 && box.x + box.width <= view.width + 0.5 && box.y + box.height <= view.height + 0.5;
const overlap = (a, b) => a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;

/** Moves the mouse off the card: a resting mouse holds the timer, as it should for a reader. */
const away = (page) => page.mouse.move(1, 1);

/** Resolves once the card shows a settled step (no move under way). */
const settled = (page) => page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: STALL_MS });

/**
 * A browser a person would use: the app starts the story by itself only for a person, not for a
 * test browser, so this context says it is not driven. It also records, in the page, every move the
 * card makes (when Next went quiet and when the next card settled) and any loading words on screen.
 */
async function openPerson(browser, device) {
  const context = await browser.newContext(device);
  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false, configurable: true });
    const log = { moves: [], loading: [] };
    window.__tourLog = log;
    let movingSince = 0;
    const look = () => {
      const dialog = document.querySelector('[role="dialog"][data-tour-kind]');
      const busy = Boolean(dialog?.querySelector('[aria-disabled="true"]'));
      const now = performance.now();
      if (busy && !movingSince) movingSince = now;
      if (!busy && movingSince) {
        log.moves.push({ to: dialog?.getAttribute("data-tour-step") ?? "", ms: Math.round(now - movingSince) });
        movingSince = 0;
      }
      if (dialog && /\bloading\b/i.test(document.body.innerText)) {
        const step = dialog.getAttribute("data-tour-step") ?? "";
        if (!log.loading.includes(step)) log.loading.push(step);
      }
      requestAnimationFrame(look);
    };
    requestAnimationFrame(look);
  });
  const page = await context.newPage();
  return { context, page };
}

/** What the card says now, read from the screen. */
async function readCard(page) {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"][data-tour-kind]');
    if (!dialog) return null;
    return {
      step: dialog.getAttribute("data-tour-step"),
      counter: dialog.querySelector("[data-tour-counter]")?.textContent?.trim() ?? "",
      chapter: dialog.querySelector('[data-tour-chapters] [aria-current="step"]')?.textContent?.trim() ?? "",
      title: dialog.querySelector("h2")?.textContent?.trim() ?? "",
      body: dialog.querySelector("#tour-body")?.textContent?.trim() ?? "",
      text: dialog.textContent ?? "",
      fallback: dialog.hasAttribute("data-tour-fallback"),
      lit: document.querySelector("[data-spotlight]")?.getAttribute("data-spotlight") ?? "",
    };
  });
}

/**
 * Checks the card on screen: the copy budget on the rendered words, no loading words on it, the
 * whole card inside the screen, and the card clear of the spotlight when a target is lit.
 */
async function checkCard(page, errors, where) {
  const card = await readCard(page);
  expect(card, `${where}: no tour card`);
  const titleWords = words(card.title).length;
  const bodyWords = words(card.body).length;
  expect(titleWords <= 9, `${where}: the headline "${card.title}" has ${titleWords} words`);
  expect(!card.body || (sentences(card.body).length <= 2 && bodyWords <= 13), `${where}: the sentences "${card.body}" are over budget`);
  expect(!/loading|please wait/i.test(card.text), `${where}: the card says it is loading`);
  expect(card.chapter, `${where}: no chapter is lit on the card`);
  const dialog = page.locator('[role="dialog"][data-tour-kind]');
  const [box, view] = await Promise.all([dialog.boundingBox(), page.viewportSize()]);
  expect(box && inside(box, view), `${where}: the card runs off the ${view.width}x${view.height} screen`);
  if (card.lit) {
    const ring = await page.locator("[data-tour-ring]").evaluate((el) => ({
      x: Number(el.getAttribute("x")),
      y: Number(el.getAttribute("y")),
      width: Number(el.getAttribute("width")),
      height: Number(el.getAttribute("height")),
      opacity: Number(el.getAttribute("opacity")),
    }));
    if (ring.width > 0 && ring.opacity > 0.5) expect(!overlap(ring, box), `${where}: the card covers its target "${card.lit}"`);
    // A page that is still drawing its data can push the target away; the tour brings it back.
    const shown = await page
      .waitForFunction(() => {
        const r = document.querySelector("[data-tour-lit]")?.getBoundingClientRect();
        return Boolean(r && r.top < window.innerHeight && r.bottom > 0);
      }, null, { timeout: 3_000 })
      .then(() => true, () => false);
    expect(shown, `${where}: the target "${card.lit}" is not on screen`);
  }
  await checkScreen(page, errors, where);
  return card;
}

/**
 * Lets the story play by itself from the card on screen to its end card, checking each card as it
 * settles. Returns the time from `startedAt` to the end card, each card's time, and which steps fell
 * back to a card on its own because their target was missing.
 */
async function playThrough(page, errors, label, startedAt) {
  const seen = [];
  const shownAt = [];
  let last = null;
  while (true) {
    const deadline = Date.now() + STALL_MS;
    let card = await readCard(page);
    while ((!card || card.counter === last) && Date.now() < deadline) {
      await page.waitForTimeout(100);
      card = await readCard(page);
    }
    expect(card && card.counter !== last, `${label}: stalled on "${last}" for ${STALL_MS / 1000} s`);
    shownAt.push(Date.now());
    last = card.counter;
    await settled(page);
    await page.waitForTimeout(400);
    // Read again once settled: the card it moved from can still be fading out at the first read.
    const checked = await checkCard(page, errors, `${label} ${card.counter} ${card.step}`);
    seen.push(checked);
    if (checked.title === END_TITLE) break;
    expect(Date.now() - startedAt < STORY_BUDGET_MS, `${label}: not at the end card after ${STORY_BUDGET_MS / 1000} s`);
  }
  const per = shownAt.slice(1).map((t, i) => ((t - shownAt[i]) / 1000).toFixed(1));
  const log = await page.evaluate(() => window.__tourLog);
  return { ms: shownAt[shownAt.length - 1] - startedAt, per, seen, fellBack: seen.filter((c) => c.fallback).map((c) => c.step), log };
}

/** The moves a visitor would feel, and the slowest one, as a short line. */
function moveLine(moves) {
  if (!moves.length) return "no moves recorded";
  const slow = moves.filter((m) => m.ms > SLOW_MOVE_MS).map((m) => `${m.to} ${(m.ms / 1000).toFixed(1)} s`);
  const median = [...moves].sort((a, b) => a.ms - b.ms)[Math.floor(moves.length / 2)].ms;
  return `moves: median ${median} ms, slowest ${Math.max(...moves.map((m) => m.ms))} ms${slow.length ? `; over ${SLOW_MOVE_MS} ms: ${slow.join(", ")}` : ""}`;
}

/**
 * The first visit on one screen size: the app opens on "/" and the story starts by itself, plays
 * through Job seeker, Company and City of Espoo to the end goal with no tap, then a way out of the
 * end card. A second visit does not start it again.
 */
async function firstVisit(browser, device, name, exit, notes) {
  const { context, page } = await openPerson(browser, device);
  const suite = createSuite(name, page);
  const errors = watchErrors(page);
  const dialog = page.locator('[role="dialog"][data-tour-kind="story"]');
  let startedAt = 0;
  let run = null;

  await suite.step("t0 opening / starts the story by itself on its first card", async () => {
    startedAt = Date.now();
    await page.goto(`${BASE_URL}/`, { timeout: 60_000 });
    await away(page);
    await dialog.locator("[data-tour-counter]").filter({ hasText: new RegExp(`^1 of ${CARDS}$`) }).waitFor({ timeout: 15_000 });
    notes.push(`${name}: the first card showed ${((Date.now() - startedAt) / 1000).toFixed(1)} s after the page was asked for`);
  });

  await suite.step("t1 it plays to the end goal with no tap, every card in budget and on screen", async () => {
    run = await playThrough(page, errors, name, startedAt);
    expect(run.seen.length === CARDS, `${name}: showed ${run.seen.length} cards, expected ${CARDS}`);
    const chapters = run.seen.map((c) => c.chapter).filter((c, i, all) => c !== all[i - 1]);
    expect(chapters.join(" > ") === "Job seeker > Company > City of Espoo > The goal", `${name}: the chapters ran ${chapters.join(" > ")}`);
    for (const label of END_LABELS) await dialog.getByRole("button", { name: label }).waitFor({ timeout: 2_000 });
    notes.push(`${name}: start to the end card in ${(run.ms / 1000).toFixed(1)} s; cards lasted ${run.per.join(", ")} s`);
    notes.push(`${name}: ${moveLine(run.log.moves)}`);
    notes.push(`${name}: missing targets (card shown in the middle): ${run.fellBack.join(", ") || "none"}`);
    if (run.log.loading.length) notes.push(`${name}: a page under the card said "loading" during: ${run.log.loading.join(", ")}`);
  });

  await suite.step("t2 the end card waits; Back works, Pause holds the step, Play moves on", async () => {
    await page.waitForTimeout(2_000);
    expect((await readCard(page))?.title === END_TITLE, "the end card moved on by itself");
    await dialog.getByRole("button", { name: "Back" }).click();
    await away(page);
    await dialog.locator("[data-tour-counter]").filter({ hasText: new RegExp(`^${CARDS - 1} of ${CARDS}$`) }).waitFor({ timeout: 10_000 });
    await settled(page);
    await dialog.getByRole("button", { name: "Pause the tour" }).click();
    await away(page);
    await page.waitForTimeout(12_000);
    expect((await readCard(page))?.counter === `${CARDS - 1} of ${CARDS}`, "the tour moved on while paused");
    await dialog.getByRole("button", { name: "Play the tour" }).click();
    await away(page);
    await dialog.locator("[data-tour-counter]").filter({ hasText: new RegExp(`^${CARDS} of ${CARDS}$`) }).waitFor({ timeout: 20_000 });
  });

  await suite.step(`t3 "${exit.label}" closes the story and opens ${exit.path}`, async () => {
    await settled(page);
    await dialog.getByRole("button", { name: exit.label }).click();
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    await page.waitForURL((url) => url.pathname === exit.path, { timeout: 15_000 });
    await checkScreen(page, errors, `${name} after the end card`);
  });

  await suite.step("t4 a second visit to / does not start the story again", async () => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(3_000);
    expect((await dialog.count()) === 0, "the story started again on a second visit");
  });

  await context.close();
  return suite.results;
}

/** Show me in each view starts the story at that view's chapter; ?tour= links and Skip work. */
async function showMe(browser, device, name, notes) {
  const { context, page } = await openPerson(browser, device);
  const suite = createSuite(name, page);
  const errors = watchErrors(page);
  const dialog = page.locator('[role="dialog"][data-tour-kind="story"]');
  const at = (n) => dialog.locator("[data-tour-counter]").filter({ hasText: new RegExp(`^${n} of ${CARDS}$`) });

  await suite.step("s0 ?tour=0 opens / without the story", async () => {
    await page.goto(`${BASE_URL}/?tour=0`, { timeout: 60_000 });
    await page.waitForTimeout(3_000);
    expect((await dialog.count()) === 0, "the story started with ?tour=0");
  });

  for (const [view, home] of [
    ["seeker", "/"],
    ["employer", "/employer"],
    ["city", "/city"],
  ]) {
    await suite.step(`s-${view} Show me on ${home} starts at card ${CHAPTER[view]}, and Skip closes it`, async () => {
      await page.goto(`${BASE_URL}${home}`);
      const button = page.locator(`[data-show-me="${view}"]`).filter({ visible: true }).first();
      if (await button.waitFor({ timeout: 10_000 }).then(() => true, () => false)) {
        await button.click();
      } else {
        notes.push(`${name}: no Show me button on ${home}; started from ?tour=${view}`);
        await page.goto(`${BASE_URL}${home}?tour=${view}`);
      }
      await away(page);
      await at(CHAPTER[view]).waitFor({ timeout: 15_000 });
      await settled(page);
      await checkCard(page, errors, `${name} ${view}`);
      await dialog.locator("[data-tour-skip]").click();
      await dialog.waitFor({ state: "detached", timeout: 5_000 });
    });
  }

  await suite.step("s1 ?tour=1 starts the story from its first card on any page", async () => {
    await page.goto(`${BASE_URL}/city?tour=1`);
    await away(page);
    await at(1).waitFor({ timeout: 15_000 });
    await dialog.locator("[data-tour-skip]").click();
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
  });

  await context.close();
  return suite.results;
}

/**
 * The walkthrough end to end: the first visit on a laptop (1440 x 900) and a phone (390 x 844), each
 * leaving by a different way out, then each view's Show me on both. E2E_TOUR=first or showme runs one.
 */
export async function runTour(browser) {
  const notes = [];
  const which = process.env.E2E_TOUR;
  const results = [];
  if (!which || which === "first") {
    results.push(...(await firstVisit(browser, LAPTOP, "Story laptop", { label: "Try it as Laura", path: "/company" }, notes)));
    results.push(...(await firstVisit(browser, PHONE, "Story phone", { label: "Try it as Mikko", path: "/" }, notes)));
  }
  if (!which || which === "showme") {
    results.push(...(await showMe(browser, LAPTOP, "Show me laptop", notes)));
    results.push(...(await showMe(browser, PHONE, "Show me phone", notes)));
  }
  return { results, notes };
}
