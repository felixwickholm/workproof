import { assertTextLacks, BASE_URL, checkScreen, createSuite, eventually, expect, proofLabelIn, startsWithLabel, switchMode, type, visible, visibleText, waitForText } from "../harness.mjs";
import { SECRETS } from "./seeker.mjs";

/** The one line every reviewer reads under every proof (src/lib/domain/guardrails.ts). */
const REVIEWER_HIDDEN_LINE = "Personal details are hidden before anyone reads the work.";
/** Any count of hidden details: "7 details hidden", "3 personal details hidden". */
const HIDDEN_COUNT = /\b\d+\s+(?:personal\s+)?details?\s+hidden\b/i;

/** The server's sentence for a name that is no one, or software. */
const NAMED_PERSON_NEEDED = "A decision needs a named person.";
/** A person who is not yet registered for Kaari Home Care. */
const NEW_REVIEWER = "Eeva Example";

const FEEDBACK_FIELD = "Write to the person: what you saw in the work";
export const MEET_WORDS =
  "You kept the blood thinner visit first and said why in one plain sentence. I want to hear how you would brief the evening shift.";
const NOT_NOW_WORDS =
  "Your plan keeps every visit but does not say which one moves first when time runs short. Try naming the one visit you would never move.";

/** The review queue's sections, read by their labels. */
export const queueSection = (page, label) => visible(page.getByRole("region", { name: label }));

/** On a phone an open proof covers the list; its "Queue" link brings the list back. */
export async function showQueue(page) {
  const list = page.getByRole("complementary", { name: "Review queue" });
  if (await list.isVisible()) return;
  await visible(page.getByRole("link", { name: "Queue", exact: true })).click();
  await list.waitFor({ state: "visible" });
}

/** Opens a proof from the review list by its label, and waits for the work to show. */
export async function openProof(page, section, label) {
  await showQueue(page);
  await queueSection(page, section).getByRole("link", { name: startsWithLabel(label) }).click();
  // The page h1 stays "Review"; the open proof is named by its own heading.
  await page.getByRole("heading", { level: 2, name: label, exact: true }).waitFor({ state: "attached", timeout: 15_000 });
}

/** Signs the decision with another name: "change name" opens the field, which then stays open. */
async function signAs(panel, name) {
  const field = panel.getByRole("textbox", { name: "Your name" });
  if (!(await field.isVisible())) await visible(panel.getByRole("button", { name: "change name" })).click();
  await type(field, name);
}

/** Writes the answer and decides. Returns once the page shows the decision as sent. */
export async function decide(page, words, decision) {
  const panel = visible(page.getByRole("region", { name: "Your decision" }));
  await type(panel.getByRole("textbox", { name: FEEDBACK_FIELD }), words);
  const button = panel.getByRole("button", { name: decision, exact: true });
  await eventually(() => button.isEnabled(), `"${decision}" stays disabled with two sentences written`);
  await button.click();
  await panel.waitFor({ state: "detached", timeout: 15_000 });
}

/**
 * Suite 4: the same browser switches to Hiring as Kaari Home Care. The visitor's proof waits in the
 * queue with a neutral label and none of their details. A one-sentence answer cannot be sent;
 * two sentences can. One proof gets "Not now", the visitor's gets "Meet".
 */
export async function runEmployer(journey) {
  const { page, errors } = journey;
  const suite = createSuite("4 Employer", page);
  const visitor = journey.planProof;

  await suite.step("switch to Hiring from the top-left switcher", async () => {
    expect(visitor, "needs the proof the work seeker suite sent");
    await page.goto(`${BASE_URL}/seeker`);
    await visible(page.getByRole("heading", { level: 1 })).waitFor();
    await switchMode(page, "Hiring", "/employer");
  });

  await suite.step("the greeting names the company", async () => {
    await waitForText(page, "You are Anna Koivisto, who hires here.");
    // The h1 holds a skeleton until the home's data arrives, then the greeting.
    const heading = visible(page.getByRole("heading", { level: 1 }));
    await eventually(async () => /^Kaari Home Care\. /.test((await heading.textContent()) ?? ""), "the greeting never names Kaari Home Care", 15_000);
    await checkScreen(page, errors, "/employer");
  });

  await suite.step("open the queue: the visitor's proof waits under a neutral label", async () => {
    await visible(page.getByRole("link", { name: "Open the queue" })).click();
    await page.waitForURL((url) => url.pathname === "/company/review");
    await queueSection(page, "To read").getByRole("link", { name: startsWithLabel(visitor.label) }).waitFor({ timeout: 15_000 });
    expect(/^Proof [A-Z]\d+$/.test(visitor.label), `the label "${visitor.label}" is not neutral`);
    await assertTextLacks(page, SECRETS, "review queue");
    await checkScreen(page, errors, "/company/review");
  });

  await suite.step("the open proof shows no name, city, university or contact", async () => {
    await openProof(page, "To read", visitor.label);
    await waitForText(page, REVIEWER_HIDDEN_LINE);
    // The count of hidden details would say something about a person's background, so reviewers never see one.
    const count = (await visibleText(page)).match(HIDDEN_COUNT);
    expect(!count, `the reviewer sees a count of hidden details: "${count?.[0]}"`);
    await assertTextLacks(page, SECRETS, "the visitor's proof");
    await checkScreen(page, errors, "/company/review/[proofId]");
  });

  await suite.step("one sentence keeps both decisions locked and says why", async () => {
    const panel = visible(page.getByRole("region", { name: "Your decision" }));
    await type(panel.getByRole("textbox", { name: FEEDBACK_FIELD }), "Good plan.");
    await panel.getByText("1 of 2 sentences").waitFor();
    await panel.getByText("Write two sentences to the person. Then choose.").waitFor();
    for (const name of ["Not now", "Meet"]) {
      const button = panel.getByRole("button", { name, exact: true });
      expect(await button.isDisabled(), `"${name}" can be pressed with one sentence`);
      expect((await button.getAttribute("aria-disabled")) === "true", `"${name}" is not marked aria-disabled`);
      const reason = await page.locator(`[id="${await button.getAttribute("aria-describedby")}"]`).textContent();
      expect(reason === "Write 1 more sentence.", `"${name}" is described as "${reason}"`);
    }
    // A press on a locked button sends nothing.
    await panel.getByRole("button", { name: "Meet", exact: true }).click({ force: true });
    expect(await panel.isVisible(), "a locked Meet sent a decision");
  });

  await suite.step('a decision signed "AI bot" is refused; a new person adds themselves, then decides "Not now"', async () => {
    await showQueue(page);
    const other = queueSection(page, "To read")
      .getByRole("link")
      .filter({ hasNotText: startsWithLabel(visitor.label) })
      .first();
    const label = proofLabelIn(await other.textContent());
    journey.notNowLabel = label;
    await openProof(page, "To read", label);
    const panel = visible(page.getByRole("region", { name: "Your decision" }));
    await type(panel.getByRole("textbox", { name: FEEDBACK_FIELD }), NOT_NOW_WORDS);
    await signAs(panel, "AI bot");
    await panel.getByRole("alert").filter({ hasText: NAMED_PERSON_NEEDED }).waitFor();
    expect((await panel.getByRole("button", { name: "Not now", exact: true }).getAttribute("aria-disabled")) === "true", 'a decision signed "AI bot" can be sent');

    await signAs(panel, NEW_REVIEWER);
    const add = visible(panel.getByRole("button", { name: "Add me as a reviewer for Kaari Home Care" }));
    expect((await panel.getByRole("button", { name: "Not now", exact: true }).getAttribute("aria-disabled")) === "true", "an unregistered name can decide");
    await add.click();
    await add.waitFor({ state: "detached", timeout: 15_000 });
    await decide(page, NOT_NOW_WORDS, "Not now");
    await visible(page.getByText("Not now · written answer sent")).waitFor({ timeout: 15_000 });
    await checkScreen(page, errors, "decided: not now");
  });

  await suite.step('"Meet" with two sentences on the visitor\'s proof', async () => {
    await openProof(page, "To read", visitor.label);
    // Anna, the company's first reviewer, signs the visitor's invitation; the city suite looks for her name.
    await signAs(visible(page.getByRole("region", { name: "Your decision" })), "Anna Koivisto");
    await decide(page, MEET_WORDS, "Meet");
    await visible(page.getByText("The name stays hidden until the person accepts.")).waitFor({ timeout: 15_000 });
    await visible(page.getByText("Sent to the person: your reason and your decision.")).waitFor();
    await visible(page.getByRole("heading", { name: "Start the meeting here" })).waitFor();
    await assertTextLacks(page, SECRETS, "after Meet");
    await checkScreen(page, errors, "decided: meet");
  });

  await suite.step("the answered list shows both decisions, the name still hidden", async () => {
    await showQueue(page);
    const answered = queueSection(page, "Answered");
    const row = (label) => answered.getByRole("link", { name: startsWithLabel(label) });
    await row(visitor.label).getByText("Meet · invited, name hidden").waitFor({ timeout: 15_000 });
    await row(journey.notNowLabel).getByText("Not now · written answer sent").waitFor();
    expect(!(await visibleText(page)).includes("Name shown because the person accepted"), "a name shows before anyone accepted");
  });

  return suite.results;
}
