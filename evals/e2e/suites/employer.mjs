import { assertTextLacks, BASE_URL, checkScreen, createSuite, eventually, expect, startsWithLabel, switchMode, type, visible, visibleText, waitForText } from "../harness.mjs";
import { SECRETS } from "./seeker.mjs";

/** The one line every reviewer reads under every work (src/lib/domain/guardrails.ts). */
const REVIEWER_HIDDEN_LINE = "Personal details are removed by rules before review. Some can remain.";
/** Any count of hidden details: "7 details hidden", "3 personal details hidden". */
const HIDDEN_COUNT = /\b\d+\s+(?:personal\s+)?details?\s+hidden\b/i;
/** The rule printed while a score cannot be sent. */
const SCORE_RULE = "Score every skill and write two sentences.";
/** The rule above the top work list. */
const SCORE_SOURCE_LINE = "People score the work. The AI never does. Names stay hidden until the person says yes.";
/** The server's sentence for a name that is no one, or software. */
const NAMED_PERSON_NEEDED = "A decision needs a named person.";
/** A person who is not yet registered for the company. */
const NEW_REVIEWER = "Eeva Example";
const BUTTONS = ["Not now", "Invite to the event", "Score only, decide later"];

const MEET_WORDS =
  "You picked one clear first step and said why in one plain sentence. I want to hear how you would check the first version with the team.";
const NOT_NOW_WORDS =
  "Your answer lists many ideas but does not say which one comes first. Try naming the one step you would start with on Monday.";

/** The server labels work "Proof K7"; the company's screens say "Work K7". */
export const workLabel = (label) => label.replace(/^Proof\b/, "Work");

/**
 * The scoring list's sections, read by their labels. Older names map to the new ones, so suites
 * written for the earlier queue keep working: To read, Answered, Second look.
 */
const SECTIONS = { "To read": "Waiting for a score", Answered: "Scored", "Second look": "Shared with you" };
export const queueSection = (page, label) => visible(page.getByRole("region", { name: SECTIONS[label] ?? label }));

/** Narrower than 1300px an open work covers the list; its "All work" link brings the list back. */
export async function showQueue(page) {
  const list = page.getByRole("complementary", { name: "Work to score" });
  if (await list.isVisible()) return;
  const back = page.getByRole("link", { name: "All work", exact: true });
  if (await back.isVisible()) await back.click();
  else await page.goto(`${BASE_URL}/company/review`);
  await list.waitFor({ state: "visible" });
}

/** Opens a work from the scoring list by its label, and waits for the work to show. */
export async function openProof(page, section, label) {
  await showQueue(page);
  await queueSection(page, section).getByRole("link", { name: startsWithLabel(workLabel(label)) }).click();
  await page.getByRole("heading", { level: 2, name: workLabel(label), exact: true }).waitFor({ state: "attached", timeout: 15_000 });
}

const scorePanel = (page) => visible(page.getByRole("region", { name: "Your score" }));

/** Signs the score with another name: "change name" opens the field, which then stays open. */
async function signAs(panel, name) {
  const field = panel.getByRole("textbox", { name: "Your name" });
  if (!(await field.isVisible())) await visible(panel.getByRole("button", { name: "change name" })).click();
  await type(field, name);
}

/** Gives each skill the same points, from 1 to 5, by tapping the scale. */
async function scoreEvery(panel, points, { leave = 0 } = {}) {
  const groups = panel.getByRole("radiogroup");
  const n = await groups.count();
  for (let i = 0; i < n - leave; i++) await groups.nth(i).getByRole("radio", { name: new RegExp(`^${points}:`) }).click();
  return n;
}

/**
 * Scores every skill, writes the reason and presses one of the three buttons ("Meet" is read as
 * "Invite to the event"). Returns once the page shows the score as sent.
 */
export async function decide(page, words, decision, points = 4) {
  const panel = scorePanel(page);
  await scoreEvery(panel, points);
  await type(panel.getByRole("textbox", { name: "Say why" }), words);
  const name = decision === "Meet" ? "Invite to the event" : decision;
  const button = panel.getByRole("button", { name, exact: true });
  await eventually(async () => (await button.getAttribute("aria-disabled")) !== "true", `"${name}" stays locked with every skill scored and two sentences`);
  await button.click();
  await panel.getByRole("textbox", { name: "Say why" }).waitFor({ state: "detached", timeout: 15_000 });
}

const lockedReason = async (page, button) => page.locator(`[id="${await button.getAttribute("aria-describedby")}"]`).textContent();

/**
 * Suite 4: the same browser switches to Hiring as the company whose challenge the visitor did. The home shows each challenge
 * with its numbers; the visitor's work waits under a neutral label with none of their details.
 * A score needs every skill, two sentences and a registered person: "AI bot" is refused. One work
 * gets "Not now", one "Score only", the visitor's an invitation. The top work list shows the
 * totals, highest first, the held one gets invited from there, and one is shared with consent.
 */
export async function runEmployer(journey) {
  const { page, errors } = journey;
  const suite = createSuite("4 Employer", page);
  const visitor = journey.planProof;
  let challengeHref = "";
  /** The company whose challenge the visitor did, and its first registered reviewer, read from the data. */
  const company = { id: "", name: "", reviewer: "" };

  await suite.step("switch to Hiring from the top-left switcher", async () => {
    expect(visitor, "needs the work the work seeker suite sent");
    await page.goto(`${BASE_URL}/seeker`);
    await visible(page.getByRole("heading", { level: 1 })).waitFor();
    Object.assign(
      company,
      await page.evaluate(async (challengeId) => {
        const challenge = await (await fetch(`/api/challenges/${encodeURIComponent(challengeId)}`)).json();
        const all = await (await fetch("/api/companies")).json();
        const found = all.find((c) => c.id === challenge.companyIds[0]);
        // The Hiring screens act for the company kept in the browser.
        localStorage.setItem("workproof.companyId", found.id);
        return { id: found.id, name: found.name, reviewer: found.reviewers[0] };
      }, visitor.challengeId),
    );
    await switchMode(page, "Hiring", "/employer");
  });

  await suite.step("My challenges: the greeting names the company, each challenge shows its four numbers", async () => {
    const heading = visible(page.getByRole("heading", { level: 1 }));
    await eventually(async () => ((await heading.textContent()) ?? "").startsWith(`${company.name}. `), `the greeting never names ${company.name}`, 15_000);
    await visible(page.getByRole("heading", { name: "My challenges" })).waitFor();
    await waitForText(page, "did it");
    await waitForText(page, "said yes");
    await visible(page.getByRole("link", { name: "New challenge" })).waitFor();
    await visible(page.getByRole("region", { name: "How the event works" })).waitFor();
    await waitForText(page, "Answers you still owe:");
    await assertTextLacks(page, SECRETS, "Hiring home");
    await checkScreen(page, errors, "/employer");
  });

  await suite.step("the challenge page lists the visitor's work under a neutral label", async () => {
    challengeHref = `/employer/challenges/${encodeURIComponent(visitor.challengeId)}`;
    await visible(page.getByRole("link", { name: visitor.challengeTitle, exact: true })).click();
    await page.waitForURL((url) => url.pathname.startsWith("/employer/challenges/"));
    await waitForText(page, SCORE_SOURCE_LINE);
    await visible(page.getByRole("region", { name: "Waiting for a score" }).getByRole("link", { name: workLabel(visitor.label), exact: true })).waitFor({ timeout: 15_000 });
    expect(/^Proof [A-Z]\d+$/.test(visitor.label), `the label "${visitor.label}" is not neutral`);
    await assertTextLacks(page, SECRETS, "challenge page");
    await checkScreen(page, errors, "/employer/challenges/[id]");
  });

  await suite.step("the open work shows no name, city, university or contact", async () => {
    await visible(page.getByRole("region", { name: "Waiting for a score" }).getByRole("link", { name: workLabel(visitor.label), exact: true })).click();
    await page.getByRole("heading", { level: 2, name: workLabel(visitor.label), exact: true }).waitFor({ timeout: 15_000 });
    await waitForText(page, REVIEWER_HIDDEN_LINE);
    // The count of hidden details would say something about a person's background, so reviewers never see one.
    const count = (await visibleText(page)).match(HIDDEN_COUNT);
    expect(!count, `the reviewer sees a count of hidden details: "${count?.[0]}"`);
    await assertTextLacks(page, SECRETS, "the visitor's work");
    await checkScreen(page, errors, "/company/review/[proofId]");
  });

  await suite.step("the three buttons stay locked until every skill has a score and the reason has two sentences", async () => {
    const panel = scorePanel(page);
    await panel.getByText(SCORE_RULE).first().waitFor();
    for (const name of BUTTONS) {
      const button = panel.getByRole("button", { name, exact: true });
      expect((await button.getAttribute("aria-disabled")) === "true", `"${name}" is open before any score`);
    }
    const skills = await scoreEvery(panel, 3, { leave: 1 });
    expect(skills >= 3 && skills <= 5, `the challenge has ${skills} skills to score`);
    const invite = panel.getByRole("button", { name: "Invite to the event", exact: true });
    expect((await lockedReason(page, invite)) === "Score 1 more skill.", `with one skill left the button says "${await lockedReason(page, invite)}"`);
    // Keys 1 to 5 score the skill that has focus.
    await panel.getByRole("radiogroup").last().getByRole("radio").first().focus();
    await page.keyboard.press("5");
    expect((await panel.getByRole("radiogroup").last().getByRole("radio", { checked: true }).getAttribute("aria-label")).startsWith("5:"), "key 5 did not score the skill");
    await panel.getByText(/^\d+\.\d\s*of 10$/).waitFor();
    await type(panel.getByRole("textbox", { name: "Say why" }), "Good plan.");
    await panel.getByText("1 of 2 sentences").waitFor();
    expect((await lockedReason(page, invite)) === "Write 1 more sentence.", `with one sentence the button says "${await lockedReason(page, invite)}"`);
    // A press on a locked button sends nothing.
    await invite.click({ force: true });
    expect(await panel.getByRole("textbox", { name: "Say why" }).isVisible(), "a locked button sent a score");
  });

  await suite.step('a score signed "AI bot" is refused; a new person adds themselves, then says "Not now"', async () => {
    await showQueue(page);
    const other = queueSection(page, "To read").getByRole("link").filter({ hasNotText: startsWithLabel(workLabel(visitor.label)) }).first();
    const label = (await other.textContent()).match(/Work [A-Z]\d+/)[0];
    journey.notNowLabel = label.replace(/^Work/, "Proof");
    await openProof(page, "To read", label);
    const panel = scorePanel(page);
    await signAs(panel, "AI bot");
    await panel.getByText(NAMED_PERSON_NEEDED).waitFor();
    await scoreEvery(panel, 2);
    await type(panel.getByRole("textbox", { name: "Say why" }), NOT_NOW_WORDS);
    expect((await panel.getByRole("button", { name: "Not now", exact: true }).getAttribute("aria-disabled")) === "true", 'a score signed "AI bot" can be sent');

    await signAs(panel, NEW_REVIEWER);
    const add = visible(panel.getByRole("button", { name: `Add me as a reviewer for ${company.name}` }));
    expect((await panel.getByRole("button", { name: "Not now", exact: true }).getAttribute("aria-disabled")) === "true", "an unregistered name can score");
    await add.click();
    await add.waitFor({ state: "detached", timeout: 15_000 });
    await decide(page, NOT_NOW_WORDS, "Not now", 2);
    await scorePanel(page).getByText("Not now", { exact: true }).waitFor({ timeout: 15_000 });
    await checkScreen(page, errors, "scored: not now");
  });

  await suite.step('"Score only, decide later" on the visitor\'s work keeps it on the list to decide', async () => {
    await openProof(page, "To read", visitor.label);
    // The company's first reviewer signs the visitor's score; the city suite looks for that name.
    await signAs(scorePanel(page), company.reviewer);
    await decide(page, MEET_WORDS, "Score only, decide later", 4);
    await scorePanel(page).getByText("Scored · decide").waitFor({ timeout: 15_000 });
    await assertTextLacks(page, SECRETS, "after the score");
  });

  await suite.step("top work: totals highest first, the held work gets invited, no name before a yes", async () => {
    await page.goto(`${BASE_URL}${challengeHref}`);
    const list = visible(page.locator('[data-tour="top-work"]'));
    await list.waitFor({ timeout: 15_000 });
    const totals = (await list.innerText()).match(/\d+\.\d(?=\s*of 10)/g).map(Number);
    expect(totals.length >= 2, `the top work list shows ${totals.length} totals`);
    expect(totals.every((t, i) => i === 0 || totals[i - 1] >= t), `the totals are not highest first: ${totals.join(", ")}`);
    const label = workLabel(visitor.label);
    const held = list.locator(":scope > li").filter({ hasText: label });
    await held.getByText("Scored · decide").waitFor();
    await held.getByRole("button", { name: "Invite", exact: true }).click();
    await held.getByText("Invited · waiting for the person").waitFor({ timeout: 15_000 });
    // A name shows only on a row whose person said yes.
    expect(!(await held.innerText()).includes(`${label.replace(/^Work /, "")} is `), `a name shows on ${label} before the person said yes`);
    await assertTextLacks(page, SECRETS, "top work");
    await checkScreen(page, errors, "/employer/challenges/[id] scored");
  });

  await suite.step("the invited work says the name stays hidden and where the talk starts", async () => {
    await visible(page.locator('[data-tour="top-work"]').locator(":scope > li").filter({ hasText: workLabel(visitor.label) }).getByRole("link", { name: "Open" })).click();
    await scorePanel(page).getByText("Invited · waiting for the person").waitFor({ timeout: 15_000 });
    await waitForText(page, "The name stays hidden until the person says yes.");
    await visible(page.getByRole("heading", { name: "Start the talk here" })).waitFor();
    await assertTextLacks(page, SECRETS, "after the invitation");
    await checkScreen(page, errors, "scored: invited");
    await page.goto(`${BASE_URL}${challengeHref}`);
  });

  await suite.step("share good candidates: the sheet asks for the person's consent", async () => {
    const row = visible(page.locator('[data-tour="top-work"]')).getByRole("listitem").first();
    await row.getByRole("button", { name: /^More for / }).click();
    await visible(page.getByRole("menuitem", { name: "Share with another company" })).click();
    const sheet = visible(page.getByRole("dialog"));
    await sheet.getByText("Share good candidates. The other company sees the work, not your scores.").waitFor();
    await eventually(async () => /did not allow sharing|Same skills|No other company/.test(await sheet.innerText()), "the share sheet never loads", 15_000);
    const share = sheet.getByRole("button", { name: "Share", exact: true }).first();
    if (await share.isVisible()) {
      await share.click();
      await sheet.getByText("Shared", { exact: true }).first().waitFor({ timeout: 15_000 });
      expect(!/\d+\.\d of 10/.test(await sheet.innerText()), "the share sheet shows a score");
    }
    await page.keyboard.press("Escape");
  });

  return suite.results;
}
