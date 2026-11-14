import { BASE_URL, checkScreen, createSuite, expect, PHONE, watchErrors } from "./harness.mjs";

const LAPTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

const SMALL_PHONE = { ...PHONE, viewport: { width: 320, height: 640 } };

/**
 * The nine steps as a visitor reads them: the title on the card, what it spotlights, and words the
 * lit element must hold when the page has look-alikes (two invitations: the story is Kaari's).
 */
const STORY_STEPS = [
  { title: "Meet Olena.", target: "olena-story" },
  { title: "She skips the CV.", target: "task-feed" },
  { title: "She does the work.", target: "own-work" },
  { title: "Her name stays with her.", target: "blind-proof" },
  { title: "Anna opens her queue.", target: "queue" },
  { title: "A person decides.", target: "decision" },
  { title: "Olena says yes.", target: "invitation", holds: "Kaari Home Care" },
  { title: "Espoo sees what happened.", target: "city-outcomes" },
  { title: "Work first. Names last. People decide.", target: null },
];

/** The one-minute walkthrough: five steps that move on by themselves, then the ways to try it. */
const MINUTE_STEPS = [
  { title: "Skip the CV. Do the work.", target: "hero" },
  { title: "The work, without the name.", target: "blind-proof" },
  { title: "A person decides. In writing.", target: "decision" },
  { title: "Names last.", target: "invitation", holds: "Kaari Home Care" },
  { title: "Espoo sees outcomes.", target: "city-outcomes" },
  { title: "Now try it yourself.", target: null },
];

/** Steps 1 to 5 of the one-minute walkthrough must play through by themselves within this. */
const MINUTE_BUDGET_MS = 75_000;

const inside = (box, view) => box.x >= 0 && box.y >= 0 && box.x + box.width <= view.width + 0.5 && box.y + box.height <= view.height + 0.5;

const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** The counter on the card, "1-minute walkthrough · 2 of 6", for step n of a walkthrough. */
const counter = (dialog, name, n, total) => dialog.locator("[data-tour-counter]").filter({ hasText: `${name} · ${n} of ${total}` });

/**
 * Checks one settled step: its title, its spotlight on the right part of the page and on screen,
 * the whole card and its way on inside the screen, and the card not over the spotlight.
 */
async function checkStep(page, errors, label, steps, n, onwardName) {
  const dialog = page.getByRole("dialog");
  const step = steps[n - 1];
  const title = (await dialog.locator("h2").textContent())?.trim();
  expect(title === step.title, `step ${n} shows "${title}", expected "${step.title}"`);
  const lit = await page.locator("[data-spotlight]").getAttribute("data-spotlight");
  const [card, view] = await Promise.all([dialog.boundingBox(), page.viewportSize()]);
  expect(card && inside(card, view), `step ${n}: the card runs off the ${view.width}x${view.height} screen`);
  const button = await dialog.getByRole("button", { name: onwardName }).first().boundingBox();
  expect(button && inside(button, view), `step ${n}: the card's way on is not fully on screen`);
  if (!step.target) {
    expect(lit === "", `step ${n} should have no spotlight, has "${lit}"`);
  } else {
    expect(lit === step.target, `step ${n} has no spotlight on "${step.target}" (has "${lit}")`);
    const target = page.locator("[data-tour-lit]");
    const box = await target.boundingBox();
    expect(box && box.y < view.height && box.y + box.height > 0, `step ${n}: the target is not on screen`);
    if (step.holds) {
      const text = (await target.textContent()) ?? "";
      expect(text.includes(step.holds), `step ${n}: the spotlight is not on the part that says "${step.holds}"`);
    }
    const ring = await page.locator("[data-tour-ring]").evaluate((el) => ({
      x: Number(el.getAttribute("x")),
      y: Number(el.getAttribute("y")),
      width: Number(el.getAttribute("width")),
      height: Number(el.getAttribute("height")),
    }));
    expect(!overlap(ring, card), `step ${n}: the card covers the spotlight`);
  }
  await checkScreen(page, errors, `${label} step ${n}`);
}

/** The demo's story stage, read the way the app reads it. */
const waitForStage = (page, stage) =>
  page.waitForFunction(async (want) => (await (await fetch("/api/demo/session")).json()).stage === want, stage, { timeout: 30_000, polling: 500 });

/**
 * Olena's story (nine steps), pressing only Next, on one screen size. Each step must show its
 * counter and title, spotlight its target on screen without the card on top of it, and keep the
 * whole card and its Next button on the screen.
 */
async function walk(browser, device, name) {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  const suite = createSuite(name, page);
  const errors = watchErrors(page);
  const dialog = page.getByRole("dialog");
  const next = dialog.getByRole("button", { name: "Next" });
  const STEPS = STORY_STEPS;

  /** Waits until step n is on the card and settled (Next no longer busy). */
  const settle = async (n) => {
    await counter(dialog, "Olena's story", n, 9).waitFor({ timeout: 15_000 });
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: 15_000 });
    // The spotlight and card travel for about 400 ms; a smooth scroll can take a little longer.
    await page.waitForTimeout(900);
  };

  const assertStep = async (n) => {
    await settle(n);
    await checkStep(page, errors, name, STEPS, n, n < STEPS.length ? "Next" : "Explore on your own");
  };

  await suite.step("t0 a ?tour=story link opens Olena's story", async () => {
    await page.goto(`${BASE_URL}/?tour=story`);
    await dialog.waitFor({ timeout: 10_000 });
    await page.waitForURL((url) => !url.searchParams.has("tour"));
  });

  for (let n = 1; n <= STEPS.length; n++) {
    await suite.step(`t${n} ${STEPS[n - 1].title}`, async () => {
      try {
        await assertStep(n);
        if (n === 4) {
          await dialog.getByRole("button", { name: "Back" }).click();
          await assertStep(3);
          await next.click();
          await assertStep(4);
        }
      } finally {
        // Move on even after a failed check, so E2E_KEEP_GOING reports every step on its own.
        if (n < STEPS.length) await next.click({ timeout: 5_000 }).catch(() => {});
        // A second tap while the step loads must not skip a step: the next check expects step 2.
        if (n === 1) await next.click({ timeout: 5_000, force: true }).catch(() => {});
      }
    });
  }

  await suite.step("t10 the close offers both ways on", async () => {
    await dialog.getByRole("button", { name: "Explore on your own" }).waitFor();
    await dialog.getByRole("button", { name: "Do a 2-minute task" }).waitFor();
  });

  await suite.step("t11 Esc closes and leaves the demo ready to explore", async () => {
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    await waitForStage(page, "invited");
    await checkScreen(page, errors, `${name} after close`);
  });

  await suite.step("t12 a ?tour=1 link opens the one-minute walkthrough", async () => {
    await page.goto(`${BASE_URL}/?tour=1`);
    await counter(dialog, "1-minute walkthrough", 1, 6).waitFor({ timeout: 10_000 });
    await page.waitForURL((url) => !url.searchParams.has("tour"));
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
  });

  await context.close();
  return suite.results;
}

/**
 * The one-minute walkthrough on one screen size: started from the landing page's Start button, it
 * plays steps 1 to 5 without a tap, each step checked as it shows; then Back, Pause and Play, and
 * one of the last step's three ways on (`exit`: "explore", "try" or "story").
 */
async function minute(browser, device, name, exit, notes) {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  const suite = createSuite(name, page);
  const errors = watchErrors(page);
  const dialog = page.getByRole("dialog");
  const at = (n) => counter(dialog, "1-minute walkthrough", n, 6);
  /** Moves the mouse off the card: a resting mouse holds the timer, as it should for a reader. */
  const away = () => page.mouse.move(1, 1);
  const shownAt = [];
  let started = 0;

  await suite.step("m0 the Start button opens the one-minute walkthrough", async () => {
    await page.goto(`${BASE_URL}/`, { timeout: 60_000 });
    const start = page.locator('[data-tour-start="minute"]').filter({ visible: true }).first();
    if (await start.waitFor({ timeout: 5_000 }).then(() => true, () => false)) {
      const label = (await start.textContent()) ?? "";
      expect(/start/i.test(label) || /start/i.test((await start.getAttribute("aria-label")) ?? ""), `the Start button reads "${label.trim()}"`);
      started = Date.now();
      await start.click();
    } else {
      notes.push(`${name}: no [data-tour-start="minute"] on the landing page yet; started from /?tour=1`);
      started = Date.now();
      await page.goto(`${BASE_URL}/?tour=1`);
    }
    await away();
    await at(1).waitFor({ timeout: 10_000 });
  });

  for (let n = 1; n <= 5; n++) {
    await suite.step(`m${n} ${MINUTE_STEPS[n - 1].title} (no tap)`, async () => {
      // A step's time plus its move: a loaded server may take a few seconds to build the next stage.
      await at(n).waitFor({ timeout: 30_000 });
      shownAt[n] = Date.now();
      await page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: 15_000 });
      await page.waitForTimeout(900);
      await checkStep(page, errors, name, MINUTE_STEPS, n, "Next");
      const line = await dialog.locator("[data-tour-progress]").count();
      expect(line === 1, `step ${n}: no progress line on the card`);
    });
  }

  await suite.step("m6 steps 1 to 5 play through by themselves", async () => {
    await at(6).waitFor({ timeout: 30_000 });
    shownAt[6] = Date.now();
    const total = shownAt[6] - started;
    const per = shownAt.slice(2).map((t, i) => ((t - shownAt[i + 1]) / 1000).toFixed(1));
    notes.push(`${name}: start to step 6 in ${(total / 1000).toFixed(1)} s; steps 1-5 lasted ${per.join(", ")} s`);
    expect(total < MINUTE_BUDGET_MS, `the walkthrough took ${Math.round(total / 1000)} s to reach its last step`);
    await page.waitForTimeout(600);
    await checkStep(page, errors, name, MINUTE_STEPS, 6, "Do a 2-minute task");
    for (const label of ["Do a 2-minute task", "Explore the demo", "Olena's story · 2 min"]) {
      await dialog.getByRole("button", { name: label }).waitFor({ timeout: 2_000 });
    }
    // The last step waits for the visitor.
    await page.waitForTimeout(2_000);
    expect(await at(6).isVisible(), "the last step moved on by itself");
  });

  await suite.step("m7 Back works, Pause holds the step, Play moves on", async () => {
    await dialog.getByRole("button", { name: "Back" }).click();
    await away();
    await at(5).waitFor({ timeout: 10_000 });
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: 15_000 });
    const pause = dialog.getByRole("button", { name: "Pause the walkthrough" });
    await pause.click();
    await away();
    await page.waitForTimeout(12_000);
    expect(await at(5).isVisible(), "the walkthrough moved on while paused");
    await dialog.getByRole("button", { name: "Play the walkthrough" }).click();
    await away();
    await at(6).waitFor({ timeout: 25_000 });
  });

  await suite.step(`m8 the last step's "${exit}" does what it says`, async () => {
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: 15_000 });
    if (exit === "explore") {
      await dialog.getByRole("button", { name: "Explore the demo" }).click();
      await dialog.waitFor({ state: "detached", timeout: 5_000 });
      await page.waitForURL((url) => url.pathname === "/seeker", { timeout: 10_000 });
      await waitForStage(page, "invited");
    } else if (exit === "try") {
      await dialog.getByRole("button", { name: "Do a 2-minute task" }).click();
      await dialog.waitFor({ state: "detached", timeout: 5_000 });
      await page.waitForURL((url) => url.pathname === "/try", { timeout: 10_000 });
    } else {
      await dialog.getByRole("button", { name: "Olena's story · 2 min" }).click();
      await counter(dialog, "Olena's story", 1, 9).waitFor({ timeout: 10_000 });
      await page.waitForFunction(() => !document.querySelector('[role="dialog"] [aria-disabled="true"]'), null, { timeout: 15_000 });
      await page.waitForTimeout(900);
      await checkStep(page, errors, name, STORY_STEPS, 1, "Next");
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "detached", timeout: 5_000 });
      await waitForStage(page, "invited");
    }
    await checkScreen(page, errors, `${name} after the last step`);
  });

  await suite.step("m9 Esc closes and leaves the demo at the invited stage", async () => {
    await page.goto(`${BASE_URL}/?tour=1`);
    await at(1).waitFor({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    await waitForStage(page, "invited");
  });

  await context.close();
  return suite.results;
}

/**
 * The one-minute walkthrough and Olena's story on a phone (390 x 844), the smallest phone
 * (320 x 640) and a laptop (1440 x 900). E2E_TOUR=minute or story runs one of them.
 */
export async function runTour(browser) {
  const notes = [];
  const which = process.env.E2E_TOUR;
  const results = [];
  if (which !== "story") {
    results.push(...(await minute(browser, PHONE, "Minute phone", "explore", notes)));
    results.push(...(await minute(browser, SMALL_PHONE, "Minute small phone", "try", notes)));
    results.push(...(await minute(browser, LAPTOP, "Minute laptop", "story", notes)));
  }
  if (which !== "minute") {
    results.push(...(await walk(browser, PHONE, "Story phone")));
    results.push(...(await walk(browser, SMALL_PHONE, "Story small phone")));
    results.push(...(await walk(browser, LAPTOP, "Story laptop")));
  }
  return { results, notes };
}
