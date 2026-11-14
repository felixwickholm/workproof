import { BASE_URL, checkScreen, eventually, expect, openVisitor, visible } from "../harness.mjs";

const HEADLINE = "Show your work. Get the interview.";
const SUB_LINE = "WorkProof is hiring that sees the work, not the name.";
/** The three doors: label, the one line under it, and the view each whole panel opens. */
const DOORS = [
  { label: "I'm looking for work", line: "Do a short challenge. Show how you think.", path: "/seeker" },
  { label: "I'm hiring", line: "Paste your job ad. See real work.", path: "/employer" },
  { label: "I'm the City of Espoo", line: "See who took part and what came of it.", path: "/city" },
];
const TOUR = "Watch the 1-minute tour";
const TRY = "Try a 2-minute challenge";
/** The front door (headline, sub-line, doors and the two actions) stays under this many words. */
const WORD_BUDGET = 60;
/** The v3 rule: people score the work. The page may never claim that nobody is scored or ranked. */
const SCORE_RULE = "People score the work. The AI never does.";
/** Retired lines: the old "no score" promise, the old headline, and any line about origin (the story is merit). */
const RETIRED = [/no score/i, /no rank/i, /nobody is (scored|ranked)/i, /Skip the CV/, /Kyiv/, /cleaner/i, /degree from abroad/i];

/** True when the element's box lies inside the first screen, without scrolling. */
async function inFirstScreen(page, locator) {
  const box = await locator.boundingBox();
  const view = page.viewportSize();
  return Boolean(box && box.y >= 0 && box.y + box.height <= view.height && box.x >= 0 && box.x + box.width <= view.width);
}

/** Words only: an arrow or a dot between words is not a word. */
const wordCount = (text) => text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;

/**
 * Suite 1: the landing page on one screen size. The first screen is a front door: one sentence, one
 * sub-line, three doors and the tour, under the word budget. Each door opens its view; the tour
 * starts; the theme switch sticks; /how-it-works and the judges' pages read without JavaScript.
 */
export async function runLanding(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);
  const home = async () => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole("heading", { level: 1, name: HEADLINE }).waitFor();
  };
  const doorNav = () => page.getByRole("navigation", { name: "Choose who you are" });

  await suite.step("first screen shows the brand, the headline, the sub-line, three big doors and the tour button, under the word budget", async () => {
    await home();
    const wide = page.viewportSize().width >= 640;
    const brand = wide ? page.getByRole("img", { name: "WorkProof, for City of Espoo" }) : page.getByRole("link", { name: "WorkProof, start page" });
    const tour = visible(page.locator('[data-primary][data-tour-start="minute"]').filter({ hasText: TOUR }));
    const sub = page.locator("#hero-title + p");
    const parts = [
      [wide ? "partner lockup" : "WorkProof mark and name", visible(brand)],
      ["headline", page.getByRole("heading", { level: 1, name: HEADLINE })],
      ["sub-line", sub],
      ...DOORS.map((d) => [`door "${d.label}"`, doorNav().getByRole("link", { name: new RegExp(`^${d.label}`) })]),
      [`"${TOUR}"`, tour],
      [`"${TRY}"`, visible(page.getByRole("link", { name: TRY }))],
    ];
    // The parts rise in with a short animation; wait until each one has settled into view.
    for (const [what, locator] of parts) {
      await eventually(() => inFirstScreen(page, locator), `the ${what} is not on the first screen`);
      await eventually(() => locator.evaluate((el) => Number(getComputedStyle(el).opacity) > 0.99), `the ${what} never became fully visible`);
    }
    expect((await sub.innerText()).trim() === SUB_LINE, `the sub-line reads "${await sub.innerText()}"`);
    const headlineBox = await page.locator("#hero-title").boundingBox();
    const headlineSize = await page.locator("#hero-title").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(headlineSize >= (wide ? 64 : 38), `the headline is ${headlineSize}px`);
    expect(Boolean(headlineBox && headlineBox.height <= headlineSize * 2.2), "the headline runs past two lines");

    const minDoor = page.viewportSize().width >= 768 ? 200 : 96;
    for (const door of DOORS) {
      const link = doorNav().getByRole("link", { name: new RegExp(`^${door.label}`) });
      const box = await link.boundingBox();
      expect(Boolean(box && box.height >= minDoor), `the door "${door.label}" is ${box?.height}px tall, expected at least ${minDoor}`);
      expect((await link.innerText()).replace(/\s+/g, " ").includes(door.line), `the door "${door.label}" lacks its line`);
    }
    const tourBox = await tour.boundingBox();
    expect(Boolean(tourBox && tourBox.height >= 52), `the tour button is ${tourBox?.height}px high, expected at least 52`);

    const front = [
      await page.locator("#hero-title").innerText(),
      await sub.innerText(),
      await doorNav().innerText(),
      await tour.innerText(),
      await visible(page.getByRole("link", { name: TRY })).innerText(),
    ].join(" ");
    const words = wordCount(front);
    expect(words < WORD_BUDGET, `the front door has ${words} words, the budget is under ${WORD_BUDGET}`);

    const text = (await page.locator("main").first().innerText()).replace(/\s+/g, " ");
    for (const words of ["Demo data", "Made for Espoo's talent events for business and tech people.", SCORE_RULE, "decisions made by AI"]) {
      expect(text.includes(words), `the page does not say "${words}"`);
    }
    for (const pattern of RETIRED) expect(!pattern.test(text), `the page still says ${pattern}`);
    await visible(page.getByRole("img", { name: "City of Espoo" })).waitFor();
    await checkScreen(page, errors, "/");
  });

  await suite.step("the tour button starts the tour", async () => {
    await home();
    // The tour moves to another screen at once, so the click does not wait for that navigation.
    await visible(page.locator('[data-tour-start="minute"]')).click({ noWaitAfter: true });
    const card = visible(page.getByRole("dialog"));
    await card.waitFor({ timeout: 15_000 });
    // The tour card's own skip button, by its stable hook rather than its words.
    await card.locator("[data-tour-skip]").click();
    await card.waitFor({ state: "detached", timeout: 15_000 });
  });

  for (const door of DOORS) {
    await suite.step(`the door "${door.label}" opens ${door.path}`, async () => {
      await home();
      await doorNav().getByRole("link", { name: new RegExp(`^${door.label}`) }).click();
      await page.waitForURL((url) => url.pathname === door.path, { timeout: 15_000 });
      await visible(page.getByRole("heading", { level: 1 })).waitFor({ timeout: 15_000 });
      await checkScreen(page, errors, door.path);
    });
  }

  await suite.step('"How it works" opens the six steps', async () => {
    await home();
    await visible(page.getByRole("navigation", { name: "Page" }).getByRole("link", { name: "How it works" })).click();
    await page.waitForURL((url) => url.pathname === "/how-it-works", { timeout: 15_000 });
    await page.getByRole("heading", { level: 1, name: "How WorkProof works" }).waitFor();
    expect((await page.locator("main ol > li h3").count()) === 6, "the page does not show six steps");
    await checkScreen(page, errors, "/how-it-works");
  });

  await suite.step("the theme switch turns dark and stays dark after a reload", async () => {
    await home();
    const toggle = visible(page.getByRole("button", { name: "Dark theme" }));
    const theme = () => page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect((await theme()) === "light", `the page starts in "${await theme()}", expected light`);
    await toggle.click();
    await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "dark");
    expect((await toggle.getAttribute("aria-pressed")) === "true", "the switch does not say it is on");
    await page.reload();
    await page.getByRole("heading", { level: 1, name: HEADLINE }).waitFor();
    expect((await theme()) === "dark", "the dark theme did not survive a reload");
    await visible(page.getByRole("button", { name: "Dark theme" })).click();
    await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "light");
    await page.reload();
    expect((await theme()) === "light", "the light theme did not survive a reload");
    await checkScreen(page, errors, "/ theme");
  });

  await suite.step("/how-it-works serves its steps, fair questions and table without JavaScript", async () => {
    const response = await context.request.get(`${BASE_URL}/how-it-works`);
    expect(response.ok(), `/how-it-works answered ${response.status()}`);
    const html = (await response.text()).replace(/&#x27;|&#39;/g, "'");
    for (const text of ["How WorkProof works", "Companies see how well people do the real work before they meet them.", "The company scores the work, not the name.", "Is scoring people fair?", "A person scores the work and signs it", "Never gives a score.", "näyttötutkinto"]) {
      expect(html.includes(text), `the raw HTML of /how-it-works lacks "${text}"`);
    }
    for (const pattern of RETIRED) expect(!pattern.test(html), `/how-it-works still says ${pattern}`);
  });

  await suite.step("/for-judges serves its criteria table without JavaScript", async () => {
    const response = await context.request.get(`${BASE_URL}/for-judges`);
    expect(response.ok(), `/for-judges answered ${response.status()}`);
    const html = await response.text();
    const table = html.slice(html.indexOf("How WorkProof meets each criterion"));
    expect(table.length < html.length, "the criteria heading is not in the HTML");
    for (const text of ["<table", "Criterion", "Impact &amp; Relevance", "Innovation &amp; User Experience", "Responsible &amp; Feasible Execution"]) {
      expect(table.includes(text), `the raw HTML of /for-judges lacks "${text}" in the criteria table`);
    }
  });

  await suite.step("/llms.txt serves plain text for AI readers", async () => {
    const response = await context.request.get(`${BASE_URL}/llms.txt`);
    expect(response.ok(), `/llms.txt answered ${response.status()}`);
    expect((response.headers()["content-type"] ?? "").startsWith("text/plain"), `/llms.txt is ${response.headers()["content-type"]}`);
    const text = await response.text();
    for (const line of ["# WorkProof", "/for-judges", "/how-it-works", "/try"]) expect(text.includes(line), `/llms.txt lacks "${line}"`);
  });

  await context.close();
  return suite.results;
}
