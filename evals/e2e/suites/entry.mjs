import { BASE_URL, checkScreen, expect, openVisitor, visible } from "../harness.mjs";

/** The three views, in the switcher's order, each with the page it opens. */
const VIEWS = [
  { label: "Job seeker", home: "/" },
  { label: "Company", home: "/employer" },
  { label: "City of Espoo", home: "/city" },
];
/** Lines the app may never show again: CV copy and the retired landing page. */
const RETIRED = [/\bCVs?\b/, /Show your work\. Get the interview\./, /I'm looking for work/, /I'm hiring/, /Looking for work/];

/** The walkthrough starts by itself on a first visit; these checks are about the page under it. */
async function closeTour(page) {
  const skip = page.locator("[data-tour-skip]").filter({ visible: true }).first();
  if (await skip.waitFor({ timeout: 3_000 }).then(() => true, () => false)) {
    await skip.click();
    await page.getByRole("dialog").filter({ has: page.locator("[data-tour-skip]") }).waitFor({ state: "detached", timeout: 15_000 });
  }
}

/** The menu that holds the theme and the links around the app: the account card on a laptop, the view sheet on a phone. */
async function openAccountMenu(page) {
  const wide = page.viewportSize().width >= 900;
  if (wide) await visible(page.getByRole("button", { name: "Account and demo settings" })).click();
  else await visible(page.getByRole("button", { name: /^View: / })).click();
  return visible(page.getByRole("menu", { name: "Demo" }));
}

/**
 * Suite 1: the entry. "/" opens the job seeker home inside the app frame, with no landing page in
 * front, under "Business Espoo" and WorkProof in Business Espoo's type (Lato headings, Work Sans text).
 * /seeker shows the same page. The switcher names the three views; no CV copy anywhere on
 * the first screen. /how-it-works, /for-judges and /llms.txt stay one tap away from the shell and
 * serve their text without JavaScript.
 */
export async function runEntry(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);
  const home = async (path = "/") => {
    await page.goto(`${BASE_URL}${path}`);
    await closeTour(page);
    await visible(page.getByRole("heading", { level: 1, name: /What work do you want\?$/ })).waitFor({ timeout: 15_000 });
  };

  await suite.step('"/" opens the job seeker home in the app frame, with no landing page', async () => {
    await home();
    await visible(page.getByRole("button", { name: /^View: Job seeker, as Mikko Lahtinen/ })).waitFor();
    const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    for (const pattern of RETIRED) expect(!pattern.test(text), `"/" still says ${pattern}`);
    await checkScreen(page, errors, "/");
  });

  await suite.step("top left reads Business Espoo first, then WorkProof", async () => {
    await home();
    const brand = visible(page.getByRole("link", { name: "Business Espoo, WorkProof. Start page" }));
    await brand.waitFor();
    // The Business Espoo logo comes first, then WorkProof.
    const first = brand.locator("> *").first();
    expect((await first.getAttribute("aria-label")) === "Business Espoo", "the brand does not start with the Business Espoo logo");
    const fonts = await page.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, h1: getComputedStyle(document.querySelector("h1")).fontFamily }));
    expect(fonts.body.includes("Work Sans"), `the body is set in ${fonts.body}, not Work Sans`);
    expect(fonts.h1.includes("Lato"), `the h1 is set in ${fonts.h1}, not Lato`);
  });

  await suite.step("/seeker shows the same home", async () => {
    await home("/seeker");
    await visible(page.getByRole("button", { name: /^View: Job seeker/ })).waitFor();
    await checkScreen(page, errors, "/seeker");
  });

  await suite.step("the switcher names the three views: Job seeker, Company, City of Espoo", async () => {
    await home();
    await visible(page.getByRole("button", { name: /^View: / })).click();
    const items = page.getByRole("menuitemradio").filter({ visible: true });
    const names = await items.evaluateAll((els) => els.map((el) => el.querySelector("span span")?.textContent?.trim()));
    expect(JSON.stringify(names) === JSON.stringify(VIEWS.map((v) => v.label)), `the switcher reads ${JSON.stringify(names)}`);
    await page.keyboard.press("Escape");
  });

  for (const view of VIEWS.slice(1)) {
    await suite.step(`the switcher opens ${view.label} at ${view.home}`, async () => {
      await home();
      await visible(page.getByRole("button", { name: /^View: / })).click();
      await visible(page.getByRole("menuitemradio", { name: new RegExp(`^${view.label}`) })).click();
      await page.waitForURL((url) => url.pathname === view.home, { timeout: 15_000 });
      await visible(page.getByRole("button", { name: new RegExp(`^View: ${view.label}`) })).waitFor({ timeout: 15_000 });
      await checkScreen(page, errors, view.home);
    });
  }

  await suite.step("the account menu reaches How it works and the evidence for judges", async () => {
    await home();
    const menu = await openAccountMenu(page);
    await menu.getByRole("menuitem", { name: "How it works" }).click();
    await page.waitForURL((url) => url.pathname === "/how-it-works", { timeout: 15_000 });
    await page.getByRole("heading", { level: 1, name: "How WorkProof works" }).waitFor();
    await checkScreen(page, errors, "/how-it-works");
    await home();
    await (await openAccountMenu(page)).getByRole("menuitem", { name: "Evidence for judges" }).click();
    await page.waitForURL((url) => url.pathname === "/for-judges", { timeout: 15_000 });
    await checkScreen(page, errors, "/for-judges");
  });

  await suite.step("the theme turns dark from the account menu and stays dark after a reload", async () => {
    await home();
    const theme = () => page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect((await theme()) === "light", `the page starts in "${await theme()}", expected light`);
    await (await openAccountMenu(page)).getByRole("radio", { name: "Dark" }).click();
    await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "dark");
    await page.reload();
    await closeTour(page);
    expect((await theme()) === "dark", "the dark theme did not survive a reload");
    await (await openAccountMenu(page)).getByRole("radio", { name: "Light" }).click();
    await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "light");
    await checkScreen(page, errors, "/ theme");
  });

  await suite.step("/how-it-works serves its steps, fair questions and table without JavaScript", async () => {
    const response = await context.request.get(`${BASE_URL}/how-it-works`);
    expect(response.ok(), `/how-it-works answered ${response.status()}`);
    const html = (await response.text()).replace(/&#x27;|&#39;/g, "'");
    for (const text of ["How WorkProof works", "Is scoring people fair?", "A person scores the work and signs it", "Never gives a score."]) {
      expect(html.includes(text), `the raw HTML of /how-it-works lacks "${text}"`);
    }
    expect(!/\bCVs?\b/.test(html.replace(/<[^>]+>/g, " ")), "/how-it-works still mentions a CV");
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
    for (const line of ["# WorkProof", "/for-judges", "/how-it-works"]) expect(text.includes(line), `/llms.txt lacks "${line}"`);
  });

  await context.close();
  return suite.results;
}
