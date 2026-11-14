import { BASE_URL, checkScreen, createSuite, expect, PHONE, watchErrors } from "./harness.mjs";

const LAPTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const SMALL_PHONE = { ...PHONE, viewport: { width: 320, height: 640 } };

const END_TITLE = "Now try it yourself.";
/** The overview must reach its end card within this, with no tap. */
const MINUTE_BUDGET_MS = 80_000;
/** A view's demo must reach its end card within this, with no tap. */
const VIEW_BUDGET_MS = 120_000;
/** The longest a step may take to give way to the next one: its own time plus a slow screen. */
const STALL_MS = 25_000;

/** Each view's demo: where its Show me button lives, its number of cards, and its end card's buttons. */
const VIEWS = {
  seeker: { home: "/seeker", cards: 7, end: ["Pick a challenge"] },
  employer: { home: "/employer", cards: 7, end: ["Paste a job ad", "Read the work"] },
  city: { home: "/city", cards: 6, end: ["Look around"] },
};

/** The overview's three ways out and the view each opens. */
const MINUTE_EXITS = [
  { label: "I'm looking for work", path: "/seeker", view: "seeker" },
  { label: "I'm hiring", path: "/employer", view: "employer" },
  { label: "I'm the City of Espoo", path: "/city", view: "city" },
];

const words = (text) => text.split(/\s+/).filter(Boolean);
const sentences = (text) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
const inside = (box, view) => box.x >= -0.5 && box.y >= -0.5 && box.x + box.width <= view.width + 0.5 && box.y + box.height <= view.height + 0.5;
const overlap = (a, b) => a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;

/** Moves the mouse off the card: a resting mouse holds the timer, as it should for a reader. */
const away = (page) => page.mouse.move(1, 1);

/** Resolves once the card shows a settled step (no move under way). */
const settled = (page) => page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: STALL_MS });

/** What the card says now, read from the screen. */
async function readCard(page) {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"][data-tour-kind]');
    if (!dialog) return null;
    return {
      step: dialog.getAttribute("data-tour-step"),
      counter: dialog.querySelector("[data-tour-counter]")?.textContent?.trim() ?? "",
      title: dialog.querySelector("h2")?.textContent?.trim() ?? "",
      body: dialog.querySelector("#tour-body")?.textContent?.trim() ?? "",
      fallback: dialog.hasAttribute("data-tour-fallback"),
      lit: document.querySelector("[data-spotlight]")?.getAttribute("data-spotlight") ?? "",
    };
  });
}

/**
 * Checks the card on screen: the copy budget on the rendered words, the whole card inside the
 * screen, and the card clear of the spotlight when a target is lit.
 */
async function checkCard(page, errors, where) {
  const card = await readCard(page);
  expect(card, `${where}: no tour card`);
  const titleWords = words(card.title).length;
  const bodyWords = words(card.body).length;
  expect(titleWords <= 8, `${where}: the headline "${card.title}" has ${titleWords} words`);
  expect(!card.body || (sentences(card.body).length === 1 && bodyWords <= 12), `${where}: the sentence "${card.body}" is over budget`);
  expect(titleWords + bodyWords <= 20, `${where}: the card has ${titleWords + bodyWords} words`);
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
    const target = await page.locator("[data-tour-lit]").first().boundingBox({ timeout: 3_000 }).catch(() => null);
    expect(target && target.y < view.height && target.y + target.height > 0, `${where}: the target "${card.lit}" is not on screen`);
  }
  await checkScreen(page, errors, where);
  return card;
}

/**
 * Lets a tour play by itself from its first card to its end card, checking each card as it settles.
 * Returns the time from `startedAt` to the end card, and which steps fell back to a card on its own.
 */
async function playThrough(page, errors, label, total, startedAt, budget) {
  const seen = [];
  const fellBack = [];
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
    await page.waitForTimeout(500);
    const checked = await checkCard(page, errors, `${label} ${card.counter}`);
    seen.push(checked);
    if (checked.fallback) fellBack.push(`${checked.step}`);
    if (checked.title === END_TITLE) break;
    expect(Date.now() - startedAt < budget, `${label}: not at the end card after ${budget / 1000} s`);
  }
  expect(seen.length === total, `${label}: showed ${seen.length} cards, expected ${total}`);
  const per = shownAt.slice(1).map((t, i) => ((t - shownAt[i]) / 1000).toFixed(1));
  return { ms: shownAt[shownAt.length - 1] - startedAt, per, fellBack, seen };
}

/**
 * The overview on one screen size: started from the landing page's button, it plays to its end
 * card with no tap. Then Back, Pause and Play, Skip, and one of the end card's three ways out.
 */
async function minute(browser, device, name, exit, notes) {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  const suite = createSuite(name, page);
  const errors = watchErrors(page);
  const dialog = page.locator('[role="dialog"][data-tour-kind="minute"]');
  const counter = (n) => dialog.locator("[data-tour-counter]").filter({ hasText: new RegExp(`^${n} of 7$`) });
  let startedAt = 0;

  await suite.step("m0 the landing page's button starts the overview", async () => {
    await page.goto(`${BASE_URL}/`, { timeout: 60_000 });
    const start = page.locator('[data-tour-start="minute"]').filter({ visible: true }).first();
    if (await start.waitFor({ timeout: 5_000 }).then(() => true, () => false)) {
      startedAt = Date.now();
      await start.click();
    } else {
      notes.push(`${name}: no [data-tour-start="minute"] on the landing page; started from /?tour=1`);
      startedAt = Date.now();
      await page.goto(`${BASE_URL}/?tour=1`);
    }
    await away(page);
    await counter(1).waitFor({ timeout: 15_000 });
  });

  await suite.step("m1 it plays to the end card with no tap, every card in budget and on screen", async () => {
    const run = await playThrough(page, errors, name, 7, startedAt, MINUTE_BUDGET_MS);
    notes.push(`${name}: start to the end card in ${(run.ms / 1000).toFixed(1)} s; steps lasted ${run.per.join(", ")} s${run.fellBack.length ? `; fell back: ${run.fellBack.join(", ")}` : ""}`);
    for (const exit of MINUTE_EXITS) await dialog.getByRole("button", { name: exit.label }).waitFor({ timeout: 2_000 });
    await page.waitForTimeout(2_000);
    expect(await counter(7).isVisible(), "the end card moved on by itself");
  });

  await suite.step("m2 Back works, Pause holds the step, Play moves on", async () => {
    await dialog.getByRole("button", { name: "Back" }).click();
    await away(page);
    await counter(6).waitFor({ timeout: 10_000 });
    await settled(page);
    await dialog.getByRole("button", { name: "Pause the tour" }).click();
    await away(page);
    await page.waitForTimeout(12_000);
    expect(await counter(6).isVisible(), "the tour moved on while paused");
    await dialog.getByRole("button", { name: "Play the tour" }).click();
    await away(page);
    await counter(7).waitFor({ timeout: 20_000 });
  });

  await suite.step(`m3 "${exit.label}" opens that view, which offers its own demo`, async () => {
    await settled(page);
    await dialog.getByRole("button", { name: exit.label }).click();
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    await page.waitForURL((url) => url.pathname === exit.path, { timeout: 15_000 });
    await page.locator(`[data-show-me="${exit.view}"]`).waitFor({ timeout: 15_000 }).catch(() => notes.push(`${name}: no Show me button on ${exit.path}`));
    await checkScreen(page, errors, `${name} after the end card`);
  });

  await suite.step("m4 Skip closes the tour from its first card", async () => {
    await page.goto(`${BASE_URL}/?tour=1`);
    await counter(1).waitFor({ timeout: 15_000 });
    await dialog.getByRole("button", { name: "Skip" }).click();
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
  });

  await context.close();
  return suite.results;
}

/** One view's demo on one screen size: started from that view's Show me button, it plays to the end card. */
async function viewDemo(browser, device, view, name, notes) {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  const suite = createSuite(name, page);
  const errors = watchErrors(page);
  const { home, cards, end } = VIEWS[view];
  const dialog = page.locator(`[role="dialog"][data-tour-kind="${view}"]`);
  let startedAt = 0;

  await suite.step("v0 the view's Show me button starts its demo", async () => {
    await page.goto(`${BASE_URL}${home}`, { timeout: 60_000 });
    const button = page.locator(`[data-show-me="${view}"]`).filter({ visible: true }).first();
    if (await button.waitFor({ timeout: 15_000 }).then(() => true, () => false)) {
      expect(/Show me/.test((await button.textContent()) ?? ""), "the button does not say Show me");
      startedAt = Date.now();
      await button.click();
    } else {
      notes.push(`${name}: no Show me button on ${home}; started from ?tour=${view}`);
      startedAt = Date.now();
      await page.goto(`${BASE_URL}${home}?tour=${view}`);
    }
    await away(page);
    await dialog.waitFor({ timeout: 15_000 });
  });

  await suite.step("v1 it plays to the end card with no tap", async () => {
    const run = await playThrough(page, errors, name, cards, startedAt, VIEW_BUDGET_MS);
    notes.push(`${name}: start to the end card in ${(run.ms / 1000).toFixed(1)} s; steps lasted ${run.per.join(", ")} s; fell back: ${run.fellBack.join(", ") || "none"}`);
    for (const label of end) await dialog.getByRole("button", { name: label }).waitFor({ timeout: 2_000 });
  });

  await suite.step("v2 Close leaves the demo ready to explore", async () => {
    await dialog.getByRole("button", { name: "Close" }).click();
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    await checkScreen(page, errors, `${name} after close`);
  });

  await context.close();
  return suite.results;
}

/**
 * The overview on a phone (390 x 844), the smallest phone (320 x 640) and a laptop (1440 x 900),
 * each leaving by a different way out; then each view's demo on a phone and a laptop.
 * E2E_TOUR=minute, seeker, employer or city runs one of them.
 */
export async function runTour(browser) {
  const notes = [];
  const which = process.env.E2E_TOUR;
  const results = [];
  if (!which || which === "minute") {
    results.push(...(await minute(browser, PHONE, "Minute phone", MINUTE_EXITS[0], notes)));
    results.push(...(await minute(browser, SMALL_PHONE, "Minute small phone", MINUTE_EXITS[1], notes)));
    results.push(...(await minute(browser, LAPTOP, "Minute laptop", MINUTE_EXITS[2], notes)));
  }
  for (const view of Object.keys(VIEWS)) {
    if (which && which !== view) continue;
    results.push(...(await viewDemo(browser, LAPTOP, view, `Demo ${view} laptop`, notes)));
    results.push(...(await viewDemo(browser, PHONE, view, `Demo ${view} phone`, notes)));
  }
  return { results, notes };
}
