import { AI_WAIT_MS, BASE_URL, checkScreen, expect, openVisitor, switchMode, type, visible, visibleText } from "../harness.mjs";

/** A need written the way companies write them, with wishes that describe a person, not the work. */
const NEED =
  "Coordinator for our home-care visits: plans the day when carers are off sick, calm with families, clear notes for the evening shift, young native Finnish speaker from a top university, 5 years experience";

/** A need with two facts about the job, a word about the people served, and a wish about the person. */
const FACTS_NEED = "Nurse for our ward: work language English, valid nurse licence, elderly clients, native Finnish speaker";
/** The facts in the fixed forms talent reads. */
const FACTS = ["Work language: English", "Nurse licence needed"];

/** Wishes about the person, as typed. None may reach the task that talent reads. */
const BIAS = [/\bnative\b/i, /\byoung\b/i, /top university/i, /5 years/i];

/** The same wishes as the draft names them when it sets them aside: age, language, school, years. */
const SET_ASIDE = [/\bage\b/i, /native language/i, /school|university/i, /years/i];

/** The wishes that describe the work. Each is kept, in the company's own words, as a core skill. */
const KEPT = ["Plans the day when carers are off sick", "Calm with families", "Clear notes for the evening shift"];

/**
 * Suite 6: Hiring posts a task from one sentence full of bias bait. The draft keeps 3 to 5 core
 * skills and shows the person-wishes as set aside; a named person approves it; the published
 * task carries none of them, and it shows in the work seeker's list of open tasks.
 */
export async function runPostTask(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);
  const published = { id: "", title: "" };

  await suite.step('Hiring home: "Post a task"', async () => {
    await page.goto(`${BASE_URL}/employer`);
    await visible(page.getByRole("heading", { level: 1 })).waitFor({ timeout: 15_000 });
    await visible(page.getByRole("link", { name: "Post a task" })).click();
    await page.getByRole("heading", { name: "What do you need this person to do?" }).waitFor({ timeout: 15_000 });
    await checkScreen(page, errors, "/company");
  });

  await suite.step("a need with bias bait becomes a draft with 3 to 5 core skills", async () => {
    const draftButton = visible(page.getByRole("button", { name: "Draft the task" }));
    expect((await draftButton.getAttribute("aria-disabled")) === "true", '"Draft the task" is open before a need is written');
    await type(page.getByRole("textbox", { name: "Your need" }), NEED);
    await draftButton.click();
    const kept = page.getByText(/^Kept as core skills · \d+$/);
    await kept.waitFor({ timeout: AI_WAIT_MS });
    const count = Number((await kept.textContent()).match(/\d+/)[0]);
    expect(count >= 3 && count <= 5, `the draft keeps ${count} core skills`);
    await checkScreen(page, errors, "/company draft");
  });

  await suite.step("the work wishes are kept as core skills and the wishes about the person are set aside", async () => {
    const heading = page.getByText(/^Set aside · \d+$/);
    await heading.waitFor();
    const aside = await page.getByRole("region", { name: "Wishes and skills" }).innerText();
    const setAside = aside.slice(aside.indexOf("Set aside"));
    const missing = SET_ASIDE.filter((wish) => !wish.test(setAside));
    expect(missing.length === 0, `not set aside: ${missing.join(", ")} (set aside: ${setAside.replace(/\s+/g, " ").slice(0, 400)})`);
    const keptPile = aside.slice(0, aside.indexOf("Set aside"));
    const lost = KEPT.filter((wish) => !keptPile.includes(wish));
    expect(lost.length === 0, `work wishes not kept as core skills: ${lost.join(", ")}`);
    expect(!/\byoung\b|native Finnish|top university/i.test(aside), "a wish about the person is repeated in the company's words");
  });

  await suite.step("a named person approves it and it goes live", async () => {
    const approver = page.getByRole("textbox", { name: "Approved by" });
    expect((await approver.inputValue()) === "Anna Koivisto", `"Approved by" holds "${await approver.inputValue()}"`);
    await visible(page.getByRole("button", { name: "Approve and publish" })).click();
    await page.getByRole("heading", { name: "Live. Talent can start now." }).waitFor({ timeout: 15_000 });
    await page.getByText("Approved by Anna Koivisto").waitFor();
    const card = visible(page.locator('a[href^="/challenges/"]'));
    published.id = decodeURIComponent((await card.getAttribute("href")).split("/").pop());
    await checkScreen(page, errors, "/company live");
  });

  await suite.step("the task as talent reads it carries none of the wishes about the person", async () => {
    await page.goto(`${BASE_URL}/challenges/${encodeURIComponent(published.id)}`);
    const heading = visible(page.getByRole("heading", { level: 1 }));
    await heading.waitFor({ timeout: 15_000 });
    published.title = (await heading.textContent()).trim();
    // The brief opens with the role it is for, or "What the company needs" when the need names none.
    await page.getByRole("heading", { level: 2, name: /^(The role: .+|What the company needs)$/ }).first().waitFor();
    const text = await visibleText(page);
    for (const wish of BIAS) expect(!wish.test(text), `the published task still says ${wish}`);
    await checkScreen(page, errors, "/challenges/[id] new task");
  });

  await suite.step("the new task leads the work seeker's list of open tasks", async () => {
    await page.goto(`${BASE_URL}/employer`);
    await visible(page.getByRole("heading", { level: 1 })).waitFor({ timeout: 15_000 });
    await switchMode(page, "Looking for work", "/seeker");
    const feed = visible(page.locator('[data-tour="task-feed"]'));
    const first = feed.locator('a[href^="/challenges/"]').first();
    await first.waitFor({ timeout: 15_000 });
    expect((await first.getAttribute("href")) === `/challenges/${published.id}`, `the newest task in the feed is ${await first.getAttribute("href")}`);
    expect((await first.innerText()).includes(published.title), `the feed row does not show "${published.title}"`);
    await checkScreen(page, errors, "/seeker with the new task");
  });

  await suite.step("job facts are shown to talent under Good to know; a native speaker wish is set aside", async () => {
    await page.goto(`${BASE_URL}/company`);
    await page.getByRole("heading", { name: "What do you need this person to do?" }).waitFor({ timeout: 15_000 });
    await type(page.getByRole("textbox", { name: "Your need" }), FACTS_NEED);
    await visible(page.getByRole("button", { name: "Draft the task" })).click();
    await page.getByText(/^Good to know · 2$/).waitFor({ timeout: AI_WAIT_MS });
    const sort = await page.getByRole("region", { name: "Wishes and skills" }).innerText();
    expect(/2 are facts about the job/.test(sort), `the count line does not name the facts: ${sort.split("\n")[0]}`);
    const setAside = sort.slice(sort.indexOf("Set aside"));
    expect(!/elderly clients/i.test(setAside), '"elderly clients" is set aside, but it describes the work');
    expect(/native/i.test(setAside) && setAside.includes("Ask for a language level, not a native speaker."), `the native speaker wish is not set aside with its reason: ${setAside.replace(/\s+/g, " ")}`);

    await visible(page.getByRole("button", { name: "Approve and publish" })).click();
    await page.getByRole("heading", { name: "Live. Talent can start now." }).waitFor({ timeout: 15_000 });
    const href = await visible(page.locator('a[href^="/challenges/"]')).getAttribute("href");
    await page.goto(`${BASE_URL}${href}`);
    const facts = page.getByRole("heading", { level: 2, name: "Good to know" }).locator("xpath=..");
    await facts.waitFor({ timeout: 15_000 });
    const shown = await facts.innerText();
    for (const fact of FACTS) expect(shown.includes(fact), `talent does not see "${fact}" under Good to know`);
    expect(!/native/i.test(await visibleText(page)), "the published task mentions a native speaker");
    await checkScreen(page, errors, "/challenges/[id] with job facts");
  });

  await context.close();
  return suite.results;
}
