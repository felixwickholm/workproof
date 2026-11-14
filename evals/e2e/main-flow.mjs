import { BASE_URL, checkScreen, createSuite, expect, readCityTotals, type, watchErrors } from "./harness.mjs";

/** The talent's identity. It may appear on the company side only after they accept a meeting. */
const TALENT = { name: "Aino Kallio-Virtanen", contact: "aino.kallio@example.net" };

const ANSWER =
  "The 97% is not trustworthy yet. The split shuffles frames, so frames from one grasp land in both train and test. The threshold is also tuned on the test set. I would split by grasp attempt, pick the threshold on a validation set and report how many dropped grasps it catches.";

/**
 * Eval 5, end to end at 390x844 with real clicks and typing:
 * (a) taster, (b) challenge and passport, (c) company intake, (d) blind review, Second look,
 * acceptance, confirmed meeting and city totals.
 */
export async function runMainFlow(browser, phone) {
  const context = await browser.newContext(phone);
  const page = await context.newPage();
  const suite = createSuite("Main flow", page);
  const errors = watchErrors(page);
  const queueBodies = [];
  page.on("response", async (response) => {
    if (/\/api\/companies\/[^/]+\/queue/.test(response.url())) queueBodies.push(await response.text().catch(() => ""));
  });
  // Next keeps recent routes mounted but hidden, so only the visible screen counts.
  const main = page.locator("main").filter({ visible: true });
  // On a phone the review queue is the aside; the proof opens in main.
  const queue = page.locator("aside").filter({ visible: true });
  let baseline = {};
  let label = "";

  const assertIdentityHidden = async (where) => {
    const html = await page.content();
    for (const secret of [TALENT.name, TALENT.contact, "Kallio"]) {
      expect(!html.includes(secret), `${where}: "${secret}" is in the page before the meeting was accepted`);
    }
    for (const body of queueBodies.splice(0)) {
      expect(!body.includes(TALENT.contact) && !body.includes("Kallio"), `${where}: identity in a queue response`);
    }
  };

  await suite.step("setup: city baseline", async () => {
    await page.goto(`${BASE_URL}/city`);
    await page.getByText("Automated decisions", { exact: true }).waitFor();
    await checkScreen(page, errors, "/city");
    baseline = await readCityTotals(page);
  });

  // (a) First screen to a blind taster proof.
  await suite.step("a1 first screen", async () => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole("heading", { name: /Skip the CV/ }).waitFor();
    await checkScreen(page, errors, "/");
  });
  await suite.step("a2 tap Try a 2-minute task", async () => {
    await page.getByRole("link", { name: "Try a 2-minute task" }).click();
    await page.getByRole("heading", { name: "What's your dream job?" }).waitFor();
    await checkScreen(page, errors, "/try job");
  });
  await suite.step("a3 dream job", async () => {
    await type(page.getByRole("textbox", { name: "Dream job" }), "ML engineer");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("textbox", { name: "Your answer" }).waitFor();
    await checkScreen(page, errors, "/try task");
  });
  await suite.step("a4 taster answer", async () => {
    await type(page.getByRole("textbox", { name: "Your answer" }), "Check how the test set was built before trusting the number.");
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await page.getByRole("textbox", { name: "Your explanation" }).waitFor();
    await checkScreen(page, errors, "/try explain");
  });
  await suite.step("a5 explain", async () => {
    await type(page.getByRole("textbox", { name: "Your explanation" }), "A leak between train and test makes every other number look better.");
    await page.getByRole("button", { name: "Continue" }).click();
    await type(page.getByRole("textbox", { name: "First name" }), "Aino");
    await checkScreen(page, errors, "/try name");
    await page.getByRole("button", { name: "Show my proof" }).click();
  });
  await suite.step("a6 blind proof result", async () => {
    await page.getByRole("heading", { name: "This is what a company would see." }).waitFor();
    await main.getByText("Hidden from the reviewer").waitFor();
    expect(!(await main.textContent()).includes("Aino"), "the first name shows on the blind proof");
    await checkScreen(page, errors, "/try result");
  });

  // (b) A real challenge, two follow-ups, identity, submit, passport.
  await suite.step("b1 challenges", async () => {
    await page.getByRole("link", { name: "See real tasks" }).click();
    await page.getByRole("heading", { name: "Tasks" }).waitFor();
    await checkScreen(page, errors, "/challenges");
  });
  await suite.step("b2 open the ML challenge", async () => {
    await page.getByRole("link", { name: /Review an AI-written model evaluation/ }).click();
    await page.getByRole("link", { name: /^Start · \d+ min$/ }).waitFor();
    await checkScreen(page, errors, "/challenges/[id]");
  });
  await suite.step("b3 work", async () => {
    await page.getByRole("link", { name: /^Start · \d+ min$/ }).click();
    await type(page.getByRole("textbox", { name: "Your answer" }), ANSWER);
    await checkScreen(page, errors, "work");
    await page.getByRole("button", { name: "I'm done" }).click();
    await page.getByRole("textbox", { name: "Your explanation" }).waitFor();
  });
  await suite.step("b4 two follow-up questions", async () => {
    await type(page.getByRole("textbox", { name: "Your explanation" }), "The leak inflates every other number, so it comes first.");
    await checkScreen(page, errors, "follow-up 1");
    await page.getByRole("button", { name: "Continue" }).click();
    await type(page.getByRole("textbox", { name: "Your explanation" }), "I would label dropped grasps first, since they are rare.");
    await checkScreen(page, errors, "follow-up 2");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("heading", { name: "Your name and contact" }).waitFor();
  });
  await suite.step("b5 name and contact, submit", async () => {
    await type(page.getByRole("textbox", { name: "Name", exact: true }), TALENT.name);
    await type(page.getByRole("textbox", { name: "Email or phone" }), TALENT.contact);
    // Second look is opt-in: the person turns it on, or no other employer sees the proof.
    const consent = main.getByRole("switch");
    expect((await consent.getAttribute("aria-checked")) === "false", "Second look consent is on before the person chose it");
    await consent.click();
    await checkScreen(page, errors, "identity");
    await page.getByRole("button", { name: "Review and submit" }).click();
    const sheet = page.getByRole("dialog", { name: "Submit your proof" });
    await sheet.getByRole("button", { name: "Submit", exact: true }).click();
    await page.getByRole("heading", { name: "Your proof is in." }).waitFor();
    label = (await main.getByText(/^Proof [A-Z0-9]+$/).first().textContent())?.trim() ?? "";
    expect(label, "no proof label on the result screen");
    expect(!(await main.textContent()).includes(TALENT.contact), "contact shows on the blind proof");
    await checkScreen(page, errors, "work result");
  });
  await suite.step("b6 passport shows the proof", async () => {
    await page.getByRole("link", { name: "See my proofs" }).click();
    const pass = page.locator("article", { hasText: label }).filter({ visible: true });
    await pass.getByText("Waiting for a human review").waitFor();
    await checkScreen(page, errors, "/passport");
  });

  // (c) Company: need, draft, approve, live.
  await suite.step("c1 company need", async () => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole("link", { name: "I'm hiring" }).click();
    await page.getByRole("heading", { name: "What do you need?" }).waitFor();
    await page.getByRole("button", { name: "Backend (long wish list)" }).click();
    await checkScreen(page, errors, "/company need");
    await page.getByRole("button", { name: "Draft the task" }).click();
  });
  await suite.step("c2 draft with the trim", async () => {
    await main.getByText(/You listed 10 wishes/).waitFor();
    await main.getByText(/Not used:/).waitFor();
    await checkScreen(page, errors, "/company draft");
  });
  await suite.step("c3 approve and go live", async () => {
    await page.getByRole("button", { name: "Approve as…" }).click();
    await type(page.getByRole("dialog").getByRole("textbox", { name: "Approved by" }), "Tomas Berg");
    await page.getByRole("dialog").getByRole("button", { name: "Approve and publish" }).click();
    await page.getByRole("heading", { name: "Live. Talent can start now." }).waitFor();
    await checkScreen(page, errors, "/company live");
  });

  // (d) Blind review, Second look, acceptance, meeting, city.
  await suite.step("d1 Tuulos queue is blind", async () => {
    await page.getByRole("link", { name: "Review queue" }).click();
    await page.getByRole("radio", { name: "Tuulos Robotics" }).click();
    await page.getByRole("heading", { name: "Tuulos Robotics" }).waitFor();
    await page.getByRole("link", { name: new RegExp(`^${label}\\b`) }).waitFor();
    await checkScreen(page, errors, "/company/review");
    await assertIdentityHidden("Tuulos queue");
  });
  await suite.step("d2 Tuulos says not now, with feedback", async () => {
    await page.getByRole("link", { name: new RegExp(`^${label}\\b`) }).click();
    await page.getByRole("button", { name: "Not now", exact: true }).waitFor();
    await assertIdentityHidden("Tuulos proof");
    await checkScreen(page, errors, "/company/review/[proof]");
    await page.getByRole("button", { name: "Not now", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await type(sheet.getByRole("textbox", { name: "Your name" }), "Anna Koivisto");
    await type(sheet.getByRole("textbox", { name: "Feedback for them" }), "Clear reading of the split. We need someone on site this month.");
    await sheet.getByRole("button", { name: "Send feedback" }).click();
    await sheet.getByRole("heading", { name: "Feedback sent" }).waitFor();
    await sheet.getByRole("button", { name: "Done" }).click();
  });
  await suite.step("d3 Saarnivo sees it under Second look", async () => {
    await page.getByRole("radio", { name: "Saarnivo Grid" }).click();
    await page.getByRole("heading", { name: "Saarnivo Grid" }).waitFor();
    const secondLook = page.locator("section", { has: page.getByText("Second look", { exact: true }) }).filter({ visible: true });
    await secondLook.getByRole("link", { name: new RegExp(`^${label}\\b`) }).waitFor();
    await assertIdentityHidden("Saarnivo queue");
    await secondLook.getByRole("link", { name: new RegExp(`^${label}\\b`) }).click();
    await main.getByText("Another employer had no opening for this proof. The skills match your task.").waitFor();
    await assertIdentityHidden("Saarnivo proof");
    await checkScreen(page, errors, "Second look proof");
  });
  await suite.step("d4 Saarnivo says Meet with feedback", async () => {
    await page.getByRole("button", { name: "Meet", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await type(sheet.getByRole("textbox", { name: "Your name" }), "Jussi Rantala");
    await type(sheet.getByRole("textbox", { name: "Why you want to meet" }), "Your point about the threshold matches our forecasting work.");
    await sheet.getByRole("button", { name: "Send invitation" }).click();
    await sheet.getByRole("heading", { name: "Invitation sent" }).waitFor();
    await sheet.getByRole("button", { name: "Done" }).click();
    await queue.getByText("Name appears when they accept").first().waitFor();
    await assertIdentityHidden("after Meet, before acceptance");
  });

  const talent = await context.newPage();
  const talentErrors = watchErrors(talent);
  await suite.step("d5 talent accepts on the passport", async () => {
    await talent.bringToFront();
    await talent.goto(`${BASE_URL}/passport`);
    const pass = talent.locator("article", { hasText: label }).filter({ visible: true });
    await pass.getByText("Wants to meet").waitFor();
    await checkScreen(talent, talentErrors, "/passport invite");
    await pass.getByRole("button", { name: "Accept" }).click();
    await pass.getByText("Your name is now visible to them.").waitFor();
  });
  await suite.step("d6 company screen shows the name", async () => {
    // Two tabs stand in for two devices; the company screen is the one being looked at now.
    await page.bringToFront();
    await queue.getByText(TALENT.name).first().waitFor({ timeout: 10_000 });
    await queue.getByText(TALENT.contact).first().waitFor();
    await checkScreen(page, errors, "review after acceptance");
  });
  await suite.step("d7 both sides confirm We met", async () => {
    await queue.getByRole("button", { name: "We met" }).first().click();
    await queue.getByText("You confirmed. Waiting for them to confirm too.").first().waitFor();
    await talent.bringToFront();
    const pass = talent.locator("article", { hasText: label }).filter({ visible: true });
    await pass.getByRole("button", { name: "We met" }).click();
    await pass.getByText("Both sides confirmed the meeting.").waitFor();
    await page.bringToFront();
    await queue.getByText("Met, confirmed by both").first().waitFor({ timeout: 10_000 });
    talentErrors.assertClean("/passport");
  });
  await suite.step("d8 city totals moved", async () => {
    await page.goto(`${BASE_URL}/city`);
    await page.getByText("Automated decisions", { exact: true }).waitFor();
    await checkScreen(page, errors, "/city after");
    const after = await readCityTotals(page);
    const moved = (key, by) => expect(after[key] === baseline[key] + by, `${key}: ${baseline[key]} -> ${after[key]}, expected +${by}`);
    moved("Meetings confirmed by both sides", 1);
    moved("Second look meetings", 1);
    moved("Human decisions", 2);
    moved("Tasks live", 1);
    expect(after["Automated decisions"] === 0, `Automated decisions is ${after["Automated decisions"]}`);
  });

  await context.close();
  return suite.results;
}
