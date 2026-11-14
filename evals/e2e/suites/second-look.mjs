import { assertTextLacks, checkScreen, createSuite, expect, startsWithLabel, switchMode, type, visible, visibleText, waitForText } from "../harness.mjs";
import { decide, MEET_WORDS, openProof, queueSection, showQueue } from "./employer.mjs";
import { allowSecondLook, finishWork, SECRETS, sendProof, startTask, VISITOR } from "./seeker.mjs";

const SHORT_PLAN =
  "I keep the insulin visit and the client on a new blood thinner, then move the shower visits to the afternoon. I call each family before nine.";
/** "Meet at Table 2", or "Meet" while the time is still to be agreed. */
const MEET_BUTTON = /^Meet( at Table \d+)?$/;
const NOT_NOW_WORDS =
  "You kept the medical visits, which is right. We need someone who also plans the evening shift, so this one is not now.";

/** Opens the review queue from the Hiring home. */
async function openQueue(page) {
  await visible(page.getByRole("link", { name: "Open the queue" })).click();
  await page.waitForURL((url) => url.pathname === "/company/review");
  await visible(page.getByRole("region", { name: "To read" })).waitFor({ timeout: 15_000 });
}

/**
 * Suite 5: back in Looking for work in the same browser (the same person), the invitation leads
 * with the reviewer's words; accepting shows the name to that company only, and both sides confirm
 * the meeting. Then a proof with Second look on gets "Not now" and reaches another employer.
 */
export async function runSecondLook(journey) {
  const { page, errors } = journey;
  const suite = createSuite("5 Second look and acceptance", page);
  const visitor = journey.planProof;

  await suite.step("the invitation shows the reviewer's words first", async () => {
    expect(visitor && journey.notNowLabel, "needs the decisions the employer suite made");
    await switchMode(page, "Looking for work", "/seeker");
    await waitForText(page, "This is your own account on this device.");
    const card = visible(page.locator("article").filter({ has: page.getByRole("button", { name: MEET_BUTTON }) }));
    await card.waitFor({ timeout: 15_000 });
    const text = await card.innerText();
    const words = text.indexOf(MEET_WORDS.split(". ")[0]);
    expect(words >= 0, `the invitation does not quote the reviewer: ${text.slice(0, 120)}`);
    const meet = (await card.getByRole("button", { name: MEET_BUTTON }).innerText()).trim();
    for (const later of ["Kaari Home Care", meet]) {
      expect(words < text.indexOf(later), `"${later}" comes before the reviewer's words`);
    }
    expect(text.includes("Accepting shows your name to Kaari Home Care only."), "the card does not say who sees the name");
    await checkScreen(page, errors, "/seeker invitation");
  });

  await suite.step("meet: the card says the company now sees the name, and what the meeting asks", async () => {
    const card = page.locator("article").filter({ hasText: MEET_WORDS.split(". ")[0] });
    await visible(card.getByRole("button", { name: MEET_BUTTON })).click();
    await waitForText(page, "Kaari Home Care now sees your name.");
    await waitForText(page, VISITOR.name);
    await waitForText(page, /Bring your thinking, not a script: .+ will ask you to walk through one choice and change one constraint\./);
  });

  await suite.step('the person taps "We met"', async () => {
    await visible(page.getByRole("button", { name: "We met" })).click();
    await waitForText(page, "You said you met. Waiting for Kaari Home Care to confirm.");
    await checkScreen(page, errors, "/seeker accepted");
  });

  await suite.step("the employer side shows the name because the person accepted", async () => {
    await switchMode(page, "Hiring", "/employer");
    await openQueue(page);
    const row = queueSection(page, "Answered").getByRole("link", { name: startsWithLabel(visitor.label) });
    await row.getByText(VISITOR.name).waitFor({ timeout: 15_000 });
    await row.getByText("Name shown because the person accepted").waitFor();
    await openProof(page, "Answered", visitor.label);
    // The faded "name hidden" stays in the DOM under the name (hidden from screen readers).
    await waitForText(page, new RegExp(`${visitor.label} is\\s+(name hidden\\s*)?${VISITOR.name}`));
    await waitForText(page, VISITOR.contact);
    await visible(page.getByText("Name shown because the person accepted.")).waitFor();
    await checkScreen(page, errors, "review: name shown");
  });

  await suite.step('the employer taps "We met": confirmed by both', async () => {
    await visible(page.getByRole("button", { name: "We met" })).click();
    await visible(page.getByText("Met, confirmed by both")).waitFor({ timeout: 15_000 });
  });

  await suite.step("the person sends another plan with Second look on", async () => {
    await switchMode(page, "Looking for work", "/seeker");
    await startTask(page, errors, /Two carers are off sick/);
    await type(visible(page.getByRole("textbox", { name: "Your answer" })), SHORT_PLAN);
    await finishWork(page);
    await type(page.getByRole("textbox", { name: "Answer to question 1" }), "The blood thinner visit cannot wait, the first days after a change matter most.");
    await type(page.getByRole("textbox", { name: "Answer to question 2" }), "Families hear it from me first, so nobody waits at a locked door.");
    await visible(page.getByRole("button", { name: "Continue" })).click();
    await page.getByRole("heading", { name: "Send your proof" }).waitFor();
    await allowSecondLook(page);
    journey.secondLookProof = await sendProof(page);
  });

  await suite.step('Kaari answers it "Not now"', async () => {
    await switchMode(page, "Hiring", "/employer");
    await openQueue(page);
    await openProof(page, "To read", journey.secondLookProof.label);
    await decide(page, NOT_NOW_WORDS, "Not now");
    await visible(page.getByText("Not now · written answer sent")).waitFor({ timeout: 15_000 });
  });

  await suite.step("another employer finds it in its Second look list, still blind", async () => {
    const { label } = journey.secondLookProof;
    await showQueue(page);
    await visible(page.getByRole("button", { name: /^Change company, now Kaari Home Care/ })).click();
    const sheet = page.getByRole("dialog", { name: "Reviewing as" });
    await sheet.getByRole("radio", { name: /^Otso Health/ }).click();
    await sheet.waitFor({ state: "hidden" });
    await visible(page.getByRole("button", { name: /^Change company, now Otso Health/ })).waitFor();
    await queueSection(page, "Second look").getByRole("link", { name: startsWithLabel(label) }).waitFor({ timeout: 15_000 });
    await openProof(page, "Second look", label);
    await visible(page.getByRole("heading", { level: 2, name: "Second look" })).waitFor();
    await assertTextLacks(page, SECRETS, "Second look proof");
    expect(!(await visibleText(page)).includes(VISITOR.name), "the name shows at the second employer");
    await checkScreen(page, errors, "Second look at Otso Health");
  });

  return suite.results;
}
