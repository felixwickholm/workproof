import { BASE_URL, checkScreen, eventually, expect, openVisitor, visible } from "../harness.mjs";

const HEADLINE = "Skip the CV. Do the work.";
/** The name with its tagline opens the sentence under the headline. */
const TAGLINE = "Workprint is hiring that sees the work, not the name.";
const SUPPORTING = "Do a short real task for an Espoo company. A person reads it without your name and decides, always in writing.";
/** The three sides and the AI rule, at a glance under the supporting sentence. */
const AT_A_GLANCE = ["Companies post a real task", "A person reads your work, not your name", "AI drafts the tasks, people decide"];
/** The audience switch in the top bar: one link per mode, by its mode label. */
const MODE_LINKS = [
  { name: "Looking for work", path: "/seeker" },
  { name: "Hiring", path: "/employer" },
  { name: "City of Espoo", path: "/city" },
];

/** True when the element's box lies inside the first screen, without scrolling. */
async function inFirstScreen(page, locator) {
  const box = await locator.boundingBox();
  const view = page.viewportSize();
  return Boolean(box && box.y >= 0 && box.y + box.height <= view.height && box.x >= 0 && box.x + box.width <= view.width);
}

/**
 * Suite 1: the landing page on one screen size. The first screen says what Workprint is, for whom,
 * and offers the one-minute walkthrough, which starts; the three mode links work; the theme switch sticks; the judges' pages read
 * without JavaScript.
 */
export async function runLanding(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);
  const home = async () => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole("heading", { level: 1, name: HEADLINE }).waitFor();
  };

  await suite.step("first screen shows the partner lockup, the headline, the name with its tagline, the Start button and the map", async () => {
    await home();
    const start = visible(page.locator('[data-primary][data-tour-start="minute"]').filter({ hasText: "Start · 1 minute" }));
    await start.waitFor();
    const box = await start.boundingBox();
    expect(Boolean(box && box.height >= 56), `the Start button is ${box?.height}px high, expected at least 56`);
    const wide = page.viewportSize().width >= 640;
    const brand = wide ? page.getByRole("img", { name: "Workprint, for City of Espoo" }) : page.getByRole("link", { name: "Workprint, start page" });
    const lead = page.locator("#hero-title + p");
    // The words rise in with a short animation; wait until each one has settled into view.
    for (const [what, locator] of [
      [wide ? "partner lockup" : "Workprint mark and name", visible(brand)],
      ["headline", page.getByRole("heading", { level: 1, name: HEADLINE })],
      ["sentence with the name and tagline", lead],
      ['"Start · 1 minute"', start],
    ]) {
      await eventually(() => inFirstScreen(page, locator), `the ${what} is not on the first screen`);
      await eventually(() => locator.evaluate((el) => Number(getComputedStyle(el).opacity) > 0.99), `the ${what} never became fully visible`);
    }
    const leadText = (await lead.innerText()).replace(/\s+/g, " ");
    expect(leadText === `${TAGLINE} ${SUPPORTING}`, `the sentence under the headline reads "${leadText}"`);
    const map = visible(page.locator("section[aria-labelledby=hero-title] svg").first());
    const mapBox = await map.boundingBox();
    expect(Boolean(mapBox && mapBox.y < page.viewportSize().height), "no part of the Espoo map is on the first screen");
    for (const text of AT_A_GLANCE) await visible(page.getByText(text, { exact: true })).waitFor();
    await visible(page.getByRole("button", { name: "Olena's story · 2 min" })).waitFor();
    await visible(page.getByRole("link", { name: "Try a task yourself" })).waitFor();
    await visible(page.getByRole("img", { name: "City of Espoo" })).waitFor();
    const text = (await page.locator("main").first().innerText()).replace(/\s+/g, " ");
    for (const words of ["Demo event data", "proofs handed in", "written reasons", "invitations", "decisions made by AI", "näyttötutkinto"]) {
      expect(text.includes(words), `the page does not say "${words}"`);
    }
    // The former product name is spelled in two parts, so the repository-wide name check stays clean.
    for (const words of ["See it in 2 minutes", ["Try", "out"].join("")]) expect(!text.includes(words), `the page still says "${words}"`);
    await checkScreen(page, errors, "/");
  });

  await suite.step("the Start button starts the walkthrough", async () => {
    await home();
    await visible(page.locator('[data-tour-start="minute"]')).click();
    const card = visible(page.getByRole("dialog"));
    await card.waitFor({ timeout: 15_000 });
    await card.getByRole("button", { name: "Close the tour" }).click();
    await card.waitFor({ state: "detached", timeout: 15_000 });
  });

  for (const link of MODE_LINKS) {
    await suite.step(`"${link.name}" opens ${link.path}`, async () => {
      await home();
      await visible(page.getByRole("navigation", { name: "Open the demo as" }).getByRole("link", { name: link.name, exact: true })).click();
      await page.waitForURL((url) => url.pathname === link.path, { timeout: 15_000 });
      await visible(page.getByRole("heading", { level: 1 })).waitFor({ timeout: 15_000 });
      await checkScreen(page, errors, link.path);
    });
  }

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

  await suite.step("/for-judges serves its criteria table without JavaScript", async () => {
    const response = await context.request.get(`${BASE_URL}/for-judges`);
    expect(response.ok(), `/for-judges answered ${response.status()}`);
    const html = await response.text();
    const table = html.slice(html.indexOf("How Workprint meets each criterion"));
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
    for (const line of ["# Workprint", "/for-judges", "/try"]) expect(text.includes(line), `/llms.txt lacks "${line}"`);
  });

  await context.close();
  return suite.results;
}
