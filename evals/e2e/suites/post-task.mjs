import { AI_WAIT_MS, BASE_URL, checkScreen, expect, openVisitor, switchMode, type, visible, visibleText } from "../harness.mjs";

/** A need written the way companies write them, with wishes that describe a person, not the work. */
const NEED =
  "Software engineer for our payments API: API design, error handling, security, testing, 8 years of experience, young, native Finnish speaker, top university degree";

/** A need with a fact about the job and a wish about the person. */
const FACTS_NEED = "Financial analyst for our budget reviews: find errors in a budget, explain numbers to managers, work language English, native Finnish speaker";
const FACT = "Work language: English";

/** Wishes about the person, as typed. None may reach the challenge that people read. */
const BIAS = [/\bnative\b/i, /\byoung\b/i, /top university/i, /8 years/i];
/** The same wishes as the draft names them when it sets them aside: age, language, school, years. */
const SET_ASIDE = [/\bage\b/i, /native language/i, /school|university/i, /years/i];

/** A link the job ad reader must refuse: not https, and not one of this site's sample ads. */
const UNSAFE_LINK = "http://example.org/jobs/analyst";

const draftDoc = (page) => visible(page.getByRole("article", { name: "Your challenge" }));

/**
 * Suite 6: Hiring makes a new challenge. The job ad link comes first and refuses an unsafe link. A
 * sample ad becomes a draft. One sentence full of bias bait becomes a draft with 3 to 5 skills to
 * score and the wishes about the person set aside with a reason; a named person approves it in one
 * click; the published challenge carries none of them and leads the work seeker's list.
 */
export async function runPostTask(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);
  const published = { id: "", title: "" };

  await suite.step('My challenges: "New challenge" opens the job ad link first', async () => {
    await page.goto(`${BASE_URL}/employer`);
    await visible(page.getByRole("heading", { level: 1 })).waitFor({ timeout: 15_000 });
    await visible(page.getByRole("link", { name: "New challenge" })).click();
    await page.getByRole("heading", { level: 1, name: "New challenge" }).waitFor({ timeout: 15_000 });
    const ad = visible(page.locator('[data-tour="job-ad"]'));
    await ad.getByRole("heading", { name: "Paste your job ad link" }).waitFor();
    const make = ad.getByRole("button", { name: "Make my challenge" });
    expect((await make.getAttribute("aria-disabled")) === "true", '"Make my challenge" is open before a link is pasted');
    await checkScreen(page, errors, "/company");
  });

  await suite.step("an unsafe link is refused in plain words", async () => {
    const ad = visible(page.locator('[data-tour="job-ad"]'));
    await type(ad.getByRole("textbox", { name: "Job ad link" }), UNSAFE_LINK);
    await ad.getByRole("button", { name: "Make my challenge" }).click();
    // A refusal says why: the link must be public https, or the ad could not be read.
    await visible(page.getByRole("alert").filter({ hasText: /https|could not be read/i })).waitFor({ timeout: 15_000 });
    // The refusal is a 400 the browser logs; it is the answer this step waits for, not a fault.
    errors.allow(/from-ad|status of 400/);
  });

  await suite.step("a sample ad becomes a draft with 3 to 5 skills to score", async () => {
    const sample = visible(page.locator('[data-tour="job-ad"]').getByRole("button").filter({ hasNotText: "Make my challenge" }));
    await sample.click();
    await page.getByRole("heading", { level: 1, name: "Check your challenge" }).waitFor({ timeout: AI_WAIT_MS });
    const skills = Number((await draftDoc(page).getByText(/^Skills you score \(\d\)$/).textContent()).match(/\d/)[0]);
    expect(skills >= 3 && skills <= 5, `the draft has ${skills} skills to score`);
    await page.getByText(/from your job ad/).waitFor();
    await checkScreen(page, errors, "/company draft from ad");
    await visible(page.getByRole("button", { name: "Back" })).click();
    await page.getByRole("heading", { level: 1, name: "New challenge" }).waitFor();
  });

  await suite.step("one sentence with bias bait: the wishes about the person are set aside with a reason", async () => {
    await type(page.getByRole("textbox", { name: "Your need in one sentence" }), NEED);
    await visible(page.getByRole("button", { name: "Make my challenge" }).last()).click();
    await page.getByRole("heading", { level: 1, name: "Check your challenge" }).waitFor({ timeout: AI_WAIT_MS });
    const doc = await draftDoc(page).innerText();
    const asideAt = doc.indexOf("Set aside");
    expect(asideAt > 0, "the draft shows no wishes set aside");
    const setAside = doc.slice(asideAt);
    const missing = SET_ASIDE.filter((wish) => !wish.test(setAside));
    expect(missing.length === 0, `not set aside: ${missing.join(", ")} (set aside: ${setAside.replace(/\s+/g, " ").slice(0, 400)})`);
    expect(/It describes a person, not the work\./.test(setAside), "a wish about the person is set aside without its reason");
    const kept = doc.slice(0, asideAt);
    for (const wish of BIAS) expect(!wish.test(kept), `the challenge itself still says ${wish}`);
    await checkScreen(page, errors, "/company draft");
  });

  await suite.step("a named person approves it in one click and it goes live", async () => {
    // The company's own registered reviewer stands in as the approver, read from the data.
    const approver = (await page.getByRole("textbox", { name: "Approved by" }).inputValue()).trim();
    expect(/^\p{Lu}\p{L}+ \p{Lu}\p{L}+/u.test(approver), `"Approved by" holds "${approver}", not a person's name`);
    await visible(page.getByRole("button", { name: "Approve and publish" })).click();
    await page.getByRole("heading", { name: "Your challenge is live" }).waitFor({ timeout: 15_000 });
    await page.getByText(`Approved by ${approver}.`).waitFor();
    const card = visible(page.locator('a[href^="/challenges/"]'));
    published.id = decodeURIComponent((await card.getAttribute("href")).split("/").pop());
    await checkScreen(page, errors, "/company live");
  });

  await suite.step("the challenge as people read it carries none of the wishes about the person", async () => {
    await page.goto(`${BASE_URL}/challenges/${encodeURIComponent(published.id)}`);
    const heading = visible(page.getByRole("heading", { level: 1 }));
    await heading.waitFor({ timeout: 15_000 });
    published.title = (await heading.textContent()).trim();
    const text = await visibleText(page);
    for (const wish of BIAS) expect(!wish.test(text), `the published challenge still says ${wish}`);
    await checkScreen(page, errors, "/challenges/[id] new challenge");
  });

  await suite.step("the new challenge shows on My challenges and in the work seeker's list", async () => {
    await page.goto(`${BASE_URL}/employer`);
    await visible(page.getByRole("link", { name: published.title, exact: true })).waitFor({ timeout: 15_000 });
    await switchMode(page, "Looking for work", "/seeker");
    await page.goto(`${BASE_URL}/challenges`);
    await visible(page.locator(`a[href="/challenges/${encodeURIComponent(published.id)}"]`)).waitFor({ timeout: 15_000 });
    await checkScreen(page, errors, "/challenges with the new challenge");
  });

  await suite.step("a job fact is shown to people under Good to know; a native speaker wish is set aside", async () => {
    await page.goto(`${BASE_URL}/company`);
    await type(page.getByRole("textbox", { name: "Your need in one sentence" }), FACTS_NEED);
    await visible(page.getByRole("button", { name: "Make my challenge" }).last()).click();
    await page.getByRole("heading", { level: 1, name: "Check your challenge" }).waitFor({ timeout: AI_WAIT_MS });
    const doc = await draftDoc(page).innerText();
    expect(doc.includes(FACT), `the draft does not show "${FACT}"`);
    const setAside = doc.slice(doc.indexOf("Set aside"));
    expect(setAside.includes("Ask for a language level, not a native speaker."), `the native speaker wish is not set aside with its reason: ${setAside.replace(/\s+/g, " ")}`);

    await visible(page.getByRole("button", { name: "Approve and publish" })).click();
    await page.getByRole("heading", { name: "Your challenge is live" }).waitFor({ timeout: 15_000 });
    const href = await visible(page.locator('a[href^="/challenges/"]')).getAttribute("href");
    await page.goto(`${BASE_URL}${href}`);
    const facts = page.getByRole("heading", { level: 2, name: "Good to know" }).locator("xpath=..");
    await facts.waitFor({ timeout: 15_000 });
    expect((await facts.innerText()).includes(FACT), `people do not see "${FACT}" under Good to know`);
    expect(!/native/i.test(await visibleText(page)), "the published challenge mentions a native speaker");
    await checkScreen(page, errors, "/challenges/[id] with job facts");
  });

  await context.close();
  return suite.results;
}
