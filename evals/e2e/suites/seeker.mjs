import { AI_WAIT_MS, apiJson, BASE_URL, checkScreen, createSuite, expect, type, visible, waitForText } from "../harness.mjs";

/** The visitor, as themself. None of this may reach a company before they say yes to an invite. */
export const VISITOR = {
  name: "Veera Lindqvist",
  contact: "veera.lindqvist@example.org",
  city: "Tampere",
  university: "University of Turku",
};

/** Every part of the visitor's identity a company must not read before the invite is accepted. */
export const SECRETS = ["Veera", "Lindqvist", VISITOR.contact, VISITOR.city, "Turku"];

/** Personal details typed into the work, and said (typed, here) into the think-aloud. */
const LEAK = `I am ${VISITOR.name}, I studied at the ${VISITOR.university} and I live in ${VISITOR.city}.`;
const WORK =
  `${LEAK} First I list what cannot move and do it first. Then I group the rest so nobody waits, ` +
  "and I write down who I call before eight. I say what I would check if I had one more hour.";
const THOUGHTS = `Okay, I read it twice. ${LEAK} The hard deadline goes first, everything else can move a day.`;
const FOLLOW_UPS = ["The deadline is fixed, so it goes first; the rest can wait a day.", "I would ask the team which step people skip most often."];

/** The scripted sample session on the work screen lasts about 18 seconds. */
const DEMO_WAIT_MS = 30_000;

/** The open challenges, read from the data so no id or title is fixed here. */
async function challenges(page) {
  const response = await page.request.get(`${BASE_URL}/api/challenges`);
  expect(response.ok(), `GET /api/challenges answered ${response.status()}`);
  return response.json();
}

/** A Make challenge a person answers in words alone (no picture, no clip). */
const wordsOnly = (c) => c.kind === "event" && c.format === "make" && !["photo", "design", "video"].includes(c.proofKind);

/**
 * Suite 3: a visitor starts as themself, does a Make challenge with the think-aloud typed (no
 * microphone here), puts a name, a city and a university into both the work and the think-aloud,
 * sees the hidden words before sending, sends with sharing left off, and finds the work in My work.
 * One work per person per challenge; a full challenge says so. The sample session plays without a
 * microphone. `journey.planProof` is the sent work, for the next suites.
 */
export async function runSeeker(journey) {
  const { page, errors } = journey;
  const suite = createSuite("3 Work seeker", page);
  let task = null;

  await suite.step("the home: a greeting from the data, then every challenge by format", async () => {
    await page.goto(`${BASE_URL}/seeker`);
    await visible(page.getByRole("heading", { level: 1, name: /^Good (morning|afternoon|evening)/ })).waitFor({ timeout: 15_000 });
    await visible(page.getByRole("heading", { name: "Challenges for you" })).waitFor();
    await waitForText(page, "Newest first. No profile. No match score.");
    const filter = visible(page.getByRole("radiogroup", { name: "Show challenges by format" }));
    for (const word of ["All", "Choose", "Make", "Fix", "Read"]) await filter.getByRole("radio", { name: word }).waitFor();
    await checkScreen(page, errors, "/seeker");
  });

  await suite.step("Start as yourself", async () => {
    await visible(page.getByRole("button", { name: "Start as yourself" })).click();
    await waitForText(page, "This is your own account on this device.");
  });

  await suite.step("filter by Make and open a challenge: the task, the company, what you hand in, Start", async () => {
    task = (await challenges(page)).find(wordsOnly);
    expect(task, "no Make challenge answered in words is open");
    await visible(page.getByRole("radiogroup", { name: "Show challenges by format" }).getByRole("radio", { name: "Make" })).click();
    await visible(page.getByRole("link", { name: new RegExp(task.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).click();
    await visible(page.getByRole("heading", { level: 1, name: task.title })).waitFor({ timeout: 15_000 });
    await visible(page.getByRole("heading", { name: "You hand in" })).waitFor();
    await waitForText(page, /\d+ of \d+ places left/);
    await checkScreen(page, errors, "challenge page");
    await visible(page.getByRole("link", { name: /^Start · \d+ min$/ })).click();
    await page.waitForURL(/\/work$/);
  });

  await suite.step("one screen says what is recorded: the thinking, not the face", async () => {
    await waitForText(page, "We capture the thinking, not the face.");
    await waitForText(page, "No camera. Nobody sees your face.");
    await waitForText(page, "The recording stays on this device. The company gets the words as text.");
    await checkScreen(page, errors, "think-aloud start");
    // This browser has no microphone to offer, so the person types what they would say.
    await visible(page.getByRole("button", { name: "Type instead" })).click();
    await page.locator('[data-tour="do-challenge"]').waitFor({ timeout: 15_000 });
  });

  await suite.step("the workspace: the recorder pill runs, and I'm done waits for the work", async () => {
    await visible(page.getByRole("status", { name: /Recording your thinking/ })).waitFor();
    await visible(page.getByRole("timer")).waitFor();
    const done = visible(page.getByRole("button", { name: "I'm done" }));
    expect(await done.isDisabled(), "I'm done works before there is any work");
    await type(visible(page.getByRole("textbox", { name: "Your work" })), WORK);
    await type(visible(page.getByPlaceholder("Type what you would say while you work")), THOUGHTS);
    await checkScreen(page, errors, "work session");
    await done.click();
    await visible(page.getByRole("heading", { name: "Two questions" })).waitFor({ timeout: AI_WAIT_MS });
  });

  await suite.step("two questions: one typed, one through the voice sheet's typed fallback", async () => {
    await type(visible(page.getByRole("textbox", { name: "Answer 1" })), FOLLOW_UPS[0]);
    await visible(page.getByRole("button", { name: "Say it" }).nth(1)).click();
    const sheet = page.getByRole("dialog", { name: "Your answer" });
    await sheet.waitFor();
    await type(sheet.getByRole("textbox", { name: "Your answer" }), FOLLOW_UPS[1]);
    await sheet.getByRole("button", { name: "Use this answer" }).click();
    await sheet.waitFor({ state: "hidden" });
    expect((await page.getByRole("textbox", { name: "Answer 2" }).inputValue()) === FOLLOW_UPS[1], "the typed voice answer did not land in question 2");
    await visible(page.getByRole("button", { name: "Continue" })).click();
  });

  await suite.step("name and contact; sharing with other companies is off until the person turns it on", async () => {
    await visible(page.getByRole("heading", { name: "Who you are" })).waitFor();
    await type(visible(page.getByRole("textbox", { name: "Name" })), VISITOR.name);
    await type(visible(page.getByRole("textbox", { name: "Email or phone" })), VISITOR.contact);
    const share = visible(page.getByRole("switch", { name: /^Let other companies with the same need see this work/ }));
    expect((await share.getAttribute("aria-checked")) === "false", "sharing is on before the person chose it");
  });

  await suite.step("the preview shows the hidden words before anything is sent", async () => {
    let submitted = false;
    const watch = (r) => {
      if (r.url().endsWith("/api/submissions") && r.request().method() === "POST") submitted = true;
    };
    page.on("request", watch);
    await visible(page.getByRole("button", { name: /^See what .+ will read$/ })).click();
    await visible(page.getByRole("heading", { name: "This is what the company will read" })).waitFor({ timeout: 15_000 });
    await waitForText(page, "Something still shows who you are? Go back and remove it.");
    await visible(page.getByRole("heading", { name: "What you said while working" })).waitFor();
    // The written side marks each detail the company will not see, in the work and in the think-aloud.
    const marked = await page.locator("main mark").allInnerTexts();
    for (const secret of ["Lindqvist", VISITOR.city]) expect(marked.some((m) => m.includes(secret)), `"${secret}" is not marked as hidden in the preview`);
    page.off("request", watch);
    expect(!submitted, "the work was sent before the person saw the preview");
    await checkScreen(page, errors, "preview");
  });

  await suite.step("send: the name, city and university never reach the company's copy", async () => {
    const sent = page.waitForResponse((r) => r.url().endsWith("/api/submissions") && r.request().method() === "POST", { timeout: 20_000 });
    await visible(page.getByRole("button", { name: "Send", exact: true })).click();
    const response = await sent;
    expect(response.ok(), `sending answered ${response.status()}: ${await response.text()}`);
    const { proof } = await response.json();
    journey.planProof = proof;
    expect(proof.thinkAloud?.transcript, "the work came back without its think-aloud");
    const wire = [proof.work, proof.thinkAloud.transcript, ...proof.explain.map((e) => e.answer)].join("\n");
    for (const secret of SECRETS) expect(!wire.includes(secret), `the blind work from the server still holds "${secret}"`);
    expect(!("screen" in proof.thinkAloud), "a screen recording left the browser");
    await visible(page.getByRole("heading", { level: 1, name: /^Done\. A person at .+ will score it\.$/ })).waitFor({ timeout: 15_000 });
  });

  await suite.step("My work: the work waits for an answer in the portfolio, and the old passport address leads there", async () => {
    await visible(page.getByRole("link", { name: "See my work" })).click();
    await page.waitForURL((url) => url.pathname === `/my-work/${journey.planProof.proofId}`);
    await visible(page.locator('[data-tour="my-score"]')).waitFor();
    await waitForText(page, /A person at .+ will score it\. You will see the score and the reason here\./);
    await visible(page.getByRole("heading", { name: "What I said while working" })).waitFor();
    await checkScreen(page, errors, "/my-work/[proofId]");
    await page.goto(`${BASE_URL}/passport`);
    await page.waitForURL((url) => url.pathname === "/my-work");
    const card = page.getByRole("article", { name: task.title });
    await visible(card).waitFor();
    await visible(card.getByText(/^Waiting for a written answer from /)).waitFor();
    await checkScreen(page, errors, "/my-work");
  });

  await suite.step("one work per person per challenge", async () => {
    await page.goto(`${BASE_URL}/challenges/${task.id}`);
    await visible(page.getByRole("link", { name: "See my work" })).waitFor({ timeout: 15_000 });
    const again = await page.request.post(`${BASE_URL}/api/submissions`, {
      data: { challengeId: task.id, talent: { id: await page.evaluate(() => localStorage.getItem("workproof.talentId")), name: VISITOR.name, contact: VISITOR.contact }, answer: "Again.", explain: [], shareWithSimilar: false },
    });
    expect(again.status() === 409 || again.status() === 400, `a second work for the same challenge answered ${again.status()}`);
  });

  await suite.step("a challenge with all its places says Full and keeps Start off, with the reason", async () => {
    // The challenge with the fewest places left, from another company: filling it takes two changes per place,
    // and the server allows a visitor 60 changes a minute, so a 30-place challenge would hit that limit.
    const talentId = await page.evaluate(() => localStorage.getItem("workproof.talentId"));
    const { tasks } = await apiJson(page, "/api/seeker/me/home", talentId);
    const fill = tasks
      .filter(({ challenge: c }) => c.kind === "event" && c.format !== "choose" && !c.companyIds.some((id) => task.companyIds.includes(id)))
      .sort((a, b) => a.placesLeft - b.placesLeft)[0]?.challenge;
    expect(fill, "no other company's challenge has places to fill");
    let refusal = null;
    for (let i = 0; i < 40 && !refusal; i++) {
      const talent = { id: `t_fill_${i}`, name: `Person ${i} Example`, contact: `person${i}@example.org` };
      const answer = "I would agree the scope first, then plan the work in two-week steps with one owner per step.";
      const issued = await page.request.post(`${BASE_URL}/api/followups`, { data: { challengeId: fill.id, answer } });
      if (!issued.ok()) {
        refusal = { status: issued.status() };
        break;
      }
      const { issueId, questions } = await issued.json();
      const response = await page.request.post(`${BASE_URL}/api/submissions`, {
        data: { challengeId: fill.id, talent, answer, issueId, explain: questions.map(() => ({ answer: "Every later date depends on it." })), shareWithSimilar: false },
      });
      if (response.status() !== 200) refusal = { status: response.status(), error: (await response.json()).error };
    }
    expect(refusal?.status === 409, `filling the challenge ended with ${JSON.stringify(refusal)}, expected 409`);
    await page.goto(`${BASE_URL}/challenges/${fill.id}`);
    await waitForText(page, /This challenge has all its \d+ answers, so an employer can read them all\. Pick another challenge\./);
    expect(await visible(page.getByRole("button", { name: "Start" })).isDisabled(), "Start works on a full challenge");
    await checkScreen(page, errors, "full challenge");
  });

  await suite.step("the sample session plays on the real screen, without a microphone", async () => {
    const choose = (await challenges(page)).find((c) => c.format === "choose" && c.options);
    expect(choose, "no Choose challenge is open");
    await page.goto(`${BASE_URL}/challenges/${choose.id}/work?demo=1`);
    await waitForText(page, "Sample session");
    await visible(page.getByRole("button", { name: "Now try it yourself" })).waitFor({ timeout: DEMO_WAIT_MS });
    expect((await page.locator('[role="radio"][aria-checked="true"]').count()) === 1, "the sample session picked no option");
    await checkScreen(page, errors, "sample session");
  });

  return suite.results;
}
