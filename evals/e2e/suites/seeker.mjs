import { AI_WAIT_MS, BASE_URL, checkScreen, createSuite, expect, makeJpeg, readCityTotals, type, visible, visibleText, waitForText } from "../harness.mjs";

/** The visitor, as themself. None of this may reach a company before they accept a meeting. */
export const VISITOR = {
  name: "Veera Lindqvist",
  contact: "veera.lindqvist@example.org",
  city: "Tampere",
  university: "University of Turku",
};

/** Every part of the visitor's identity a company must not read before the meeting is accepted. */
export const SECRETS = ["Veera", "Lindqvist", VISITOR.contact, VISITOR.city, "Turku"];

const PLAN_TASK = /Two carers are off sick/;
const PICTURE_CHECK = "I checked this picture. It shows the work only: no face, no name, no badge, no contact details.";
const PHOTO_TASK = /An allergen swab came back positive on line 2/;
/** A task with two seeded proofs, filled to its places through the API in the full-task step. */
const FILL_TASK = "ch-kivira-pm";
const AI_LINE = "AI is allowed. The two follow-up questions are about your own choices, and the meeting starts from this work.";

const PLAN_ANSWER =
  `I am ${VISITOR.name}. I trained as a nurse at the ${VISITOR.university} and planned home visits in ${VISITOR.city} for four years. ` +
  "With two carers off I keep the insulin visit, the client home from hospital on a new blood thinner and the client with dementia who lives alone. " +
  "I move the shower and shopping visits to Thursday and call the families first, so nobody waits at the door.";

const FOLLOW_UPS = [
  "The blood thinner comes first, because the first days after a dose change are when bleeding happens.",
  "I would call the daughter of the client with dementia before anyone else, so she can look in at lunch.",
];

/** City numbers in a fresh demo event, read from the city screen before anything happens. */
export async function readCityStart(page) {
  await page.goto(`${BASE_URL}/city`);
  await page.locator('[data-total="Human decisions"]').waitFor({ timeout: 15_000 });
  const totals = await readCityTotals(page);
  for (const label of ["Human decisions", "Meetings confirmed by both sides", "Automated decisions"]) {
    expect(Number.isInteger(totals[label]), `the city screen shows no number for "${label}"`);
  }
  return totals;
}

/** Opens a task from the list of open tasks and starts it. */
export async function startTask(page, errors, title) {
  await page.goto(`${BASE_URL}/challenges`);
  await visible(page.getByRole("link", { name: title })).click();
  await visible(page.getByRole("heading", { level: 1, name: title })).waitFor({ timeout: 15_000 });
  await checkScreen(page, errors, "task page");
  await visible(page.getByRole("link", { name: /^Start · \d+ min$/ })).click();
  await page.waitForURL(/\/work$/);
}

/** "I'm done", then waits for the follow-up questions a model may take a while to write. */
export async function finishWork(page) {
  await visible(page.getByRole("button", { name: "I'm done" })).click();
  await page.getByRole("heading", { name: "Explain your choices" }).waitFor({ timeout: AI_WAIT_MS });
  const questions = await page.getByRole("textbox", { name: /^Answer to question \d$/ }).count();
  expect(questions === 2, `the task asks ${questions} follow-up questions, expected 2`);
}

/** Sends from the send step and returns the proof the server answered with. */
export async function sendProof(page) {
  const sent = page.waitForResponse((r) => r.url().endsWith("/api/submissions") && r.request().method() === "POST", { timeout: 20_000 });
  await visible(page.getByRole("button", { name: "Send", exact: true })).click();
  const response = await sent;
  expect(response.ok(), `sending the proof answered ${response.status()}: ${await response.text()}`);
  await page.getByRole("heading", { name: "This is what the company reads." }).waitFor({ timeout: 15_000 });
  return (await response.json()).proof;
}

/** Turns the Second look switch on. */
export async function allowSecondLook(page) {
  const share = visible(page.getByRole("switch", { name: /^Let other employers with matching tasks see this proof/ }));
  await share.click();
  expect((await share.getAttribute("aria-checked")) === "true", "Second look did not turn on");
}

/**
 * Suite 3: a visitor starts as themself, does the home-care plan task with personal details in
 * the answer, answers one follow-up by typing and one through the voice sheet, sends with
 * Second look on and sees what the company reads. Then a photo task. `journey` carries what the
 * next suites need; the browser context stays open for them.
 */
export async function runSeeker(journey) {
  const { page, errors } = journey;
  const suite = createSuite("3 Work seeker", page);

  await suite.step("city numbers before anything happens", async () => {
    journey.cityStart = await readCityStart(page);
  });

  await suite.step("the home puts the counts in one line under the greeting", async () => {
    await page.goto(`${BASE_URL}/seeker`);
    await waitForText(page, /\d+ proofs? handed in · \d+ read by a person · \d+ written reasons? · \d+ invitations?/);
    await waitForText(page, "Each task takes a limited number of answers, so every one can be read.");
  });

  await suite.step("Start as yourself", async () => {
    await visible(page.getByRole("button", { name: "Start as yourself" })).click();
    await waitForText(page, "This is your own account on this device.");
    await checkScreen(page, errors, "/seeker as myself");
  });

  await suite.step("open the plan task and write an answer with a name, a city and a university", async () => {
    await visible(page.getByRole("link", { name: PLAN_TASK })).click();
    await visible(page.getByRole("heading", { level: 1, name: PLAN_TASK })).waitFor({ timeout: 15_000 });
    // Where the person decides to start: how many places are left, and what AI may and may not do.
    await waitForText(page, /\d+ of \d+ places left/);
    await waitForText(page, AI_LINE);
    await visible(page.getByRole("link", { name: /^Start · \d+ min$/ })).click();
    await page.waitForURL(/\/challenges\/[^/]+\/work$/);
    await waitForText(page, "Step 1 of 4");
    // Locked until there is an answer, and the screen says why.
    expect(await visible(page.getByRole("button", { name: "I'm done" })).isDisabled(), "I'm done works before there is an answer");
    await waitForText(page, "Write your answer to continue.");
    await type(visible(page.getByRole("textbox", { name: "Your answer" })), PLAN_ANSWER);
    await checkScreen(page, errors, "work: answer");
    await finishWork(page);
  });

  await suite.step("answer one follow-up by typing", async () => {
    await type(page.getByRole("textbox", { name: "Answer to question 1" }), FOLLOW_UPS[0]);
  });

  await suite.step("answer the other through the voice sheet's typed fallback", async () => {
    await visible(page.getByRole("button", { name: "Say it instead" }).nth(1)).click();
    const sheet = page.getByRole("dialog", { name: "Explain your choices" });
    await sheet.waitFor();
    // Without speech recognition the same sheet asks for typing instead of the microphone.
    await sheet.getByText("This browser cannot listen here, so type your answer.").waitFor({ timeout: 10_000 });
    await type(sheet.getByRole("textbox", { name: "Your answer" }), FOLLOW_UPS[1]);
    await sheet.getByRole("button", { name: "Use this answer" }).click();
    await sheet.waitFor({ state: "hidden" });
    expect((await page.getByRole("textbox", { name: "Answer to question 2" }).inputValue()) === FOLLOW_UPS[1], "the typed voice answer did not land in question 2");
    await visible(page.getByText("Spoken answer, shown as text")).waitFor();
    await checkScreen(page, errors, "work: follow-ups");
  });

  await suite.step("give a name and contact, turn Second look on, send", async () => {
    await visible(page.getByRole("button", { name: "Continue" })).click();
    await page.getByRole("heading", { name: "Send your proof" }).waitFor();
    await waitForText(page, AI_LINE);
    await type(page.getByRole("textbox", { name: "Name" }), VISITOR.name);
    await type(page.getByRole("textbox", { name: "Email or phone" }), VISITOR.contact);
    await allowSecondLook(page);
    journey.planProof = await sendProof(page);
    expect(journey.planProof.explain.some((e) => e.spoken), "the proof does not mark the spoken follow-up");
  });

  await suite.step("the reveal shows the hidden details", async () => {
    const proof = journey.planProof;
    expect(proof.hiddenCount >= 3, `only ${proof.hiddenCount} details hidden; the name, the city and the university are three`);
    await waitForText(page, `${proof.hiddenCount} details hidden before anyone read this`);
    await visible(page.getByRole("tab", { name: "Company reads" })).click();
    const read = await visible(page.getByRole("tabpanel")).ariaSnapshot();
    expect(read.includes("What the company reads"), "the company side did not open");
    for (const secret of SECRETS) expect(!read.includes(secret), `"${secret}" is readable on the company side`);
    const wire = [proof.work, ...proof.explain.map((e) => e.answer)].join("\n");
    for (const secret of SECRETS) expect(!wire.includes(secret), `the blind proof from the server still holds "${secret}"`);
    await checkScreen(page, errors, "work: sent");
  });

  await suite.step("the passport lists the proof as waiting", async () => {
    await visible(page.getByRole("link", { name: "Open my passport" })).click();
    await page.waitForURL((url) => url.pathname === `/passport/${journey.planProof.proofId}`);
    await visible(page.getByRole("heading", { level: 1 })).waitFor();
    await checkScreen(page, errors, "/passport/[proofId]");
    await page.goto(`${BASE_URL}/passport`);
    await waitForText(page, journey.planProof.label);
    // The pass that carries this proof's label also carries its state.
    const pass = page.locator(":is(a, button, li, article)").filter({ hasText: journey.planProof.label }).filter({ hasText: "Waiting for a reader" });
    expect((await pass.count()) > 0, `no pass shows ${journey.planProof.label} as "Waiting for a reader"`);
    await checkScreen(page, errors, "/passport");
  });

  await suite.step("a photo task with a picture and a caption", async () => {
    await startTask(page, errors, PHOTO_TASK);
    await page.locator('input[type="file"]').setInputFiles({ name: "swab-plan.jpg", mimeType: "image/jpeg", buffer: await makeJpeg(page) });
    await waitForText(page, "no location or camera data");
    await type(visible(page.getByRole("textbox", { name: "What does it show?" })), "The re-test plan on the whiteboard: swab points on line 2, the clean-down first, then the hold on the batch.");
    await finishWork(page);
    await type(page.getByRole("textbox", { name: "Answer to question 1" }), "The batch stays on hold until the second swab is clean, because a positive can come from the belt, not the product.");
    await type(page.getByRole("textbox", { name: "Answer to question 2" }), "I would tell production first, so nobody restarts line 2 before the result.");
    await visible(page.getByRole("button", { name: "Continue" })).click();
    await page.getByRole("heading", { name: "Send your proof" }).waitFor();
    expect((await page.getByRole("textbox", { name: "Name" }).inputValue()) === VISITOR.name, "the name from the first proof was not kept");
    // The picture is shown again, and nothing is sent until the person has checked it shows the work only.
    await visible(page.getByRole("img", { name: "Your picture of the work" })).waitFor();
    const send = page.getByRole("button", { name: "Send", exact: true });
    expect(await send.isDisabled(), "Send works before the person checked the picture");
    await waitForText(page, "Check the picture to send.");
    await visible(page.getByRole("checkbox", { name: PICTURE_CHECK })).check();
    expect(await send.isEnabled(), "Send stays off after the picture check");
    journey.photoProof = await sendProof(page);
    const { attachment } = journey.photoProof;
    expect(attachment?.src?.startsWith("data:image/jpeg;base64,"), "the proof came back without its picture");
    expect(!(await visibleText(page)).includes("Something went wrong"), "the sent screen shows an error");
    await checkScreen(page, errors, "photo task sent");
  });

  await suite.step("a task with all its answers says Full and keeps Start off, with the reason", async () => {
    const answer = {
      challengeId: FILL_TASK,
      answer: "I would agree the scope with the client first, then plan the work in two-week steps with one owner per step.",
      explain: [
        { question: "Why the scope first?", answer: "Every later date depends on it." },
        { question: "What would you check next?", answer: "Who signs off each step, so nothing waits." },
      ],
      shareWithSimilar: false,
    };
    let refusal = null;
    for (let i = 0; i < 40 && !refusal; i++) {
      const response = await page.request.post(`${BASE_URL}/api/submissions`, {
        data: { ...answer, talent: { id: `t_fill_${i}`, name: `Person ${i} Example`, contact: `person${i}@example.org` } },
      });
      if (response.status() !== 200) refusal = { status: response.status(), error: (await response.json()).error };
    }
    expect(refusal?.status === 409, `filling the task ended with ${JSON.stringify(refusal)}, expected 409`);
    expect(/^This task has all its \d+ answers\. Choose another task\.$/.test(refusal.error), `the refusal says "${refusal.error}"`);
    await page.goto(`${BASE_URL}/challenges/${FILL_TASK}`);
    await waitForText(page, /This task has all its \d+ answers, so every one can be read\. Choose another task\./);
    expect(await visible(page.getByRole("button", { name: /^Start · \d+ min$/ })).isDisabled(), "Start works on a full task");
    await checkScreen(page, errors, "full task");
    await page.goto(`${BASE_URL}/challenges`);
    const card = visible(page.getByRole("link").filter({ hasText: "Full" }));
    await card.waitFor({ timeout: 15_000 });
    await checkScreen(page, errors, "/challenges with a full task");
  });

  return suite.results;
}
