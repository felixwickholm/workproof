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

/** Personal details typed into the work and into the field for how the person thinks. */
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

/** Reads a company API as this browser's demo event. */
async function companyJson(page, path) {
  const response = await page.request.get(`${BASE_URL}/api/companies/${path}`);
  expect(response.ok(), `GET /api/companies/${path} answered ${response.status()}`);
  return response.json();
}

/** Whether a challenge has a seeded work with a think-aloud, so its sample session can play. */
async function hasSample(page, c) {
  const top = await companyJson(page, `${encodeURIComponent(c.companyIds[0])}/tasks/${encodeURIComponent(c.id)}/top`);
  return [...top.scored.map((s) => s.proof), ...top.waiting].some((p) => p.thinkAloud?.transcript);
}

/**
 * The employer suite needs other work: one more to say "Not now" to, and a scored one on the same
 * challenge to rank against. Some challenges have no seeded work yet, so pick one that has both.
 */
async function hasOtherWork(page, c) {
  const company = encodeURIComponent(c.companyIds[0]);
  const [queue, top] = await Promise.all([companyJson(page, `${company}/queue`), companyJson(page, `${company}/tasks/${encodeURIComponent(c.id)}/top`)]);
  return queue.proofs.length > 0 && top.scored.length > 0;
}

/**
 * Suite 3: the home leads with the role tiles and a job-board list (logo, title, skills, Save); a saved
 * challenge stays on this device. Then a visitor starts as themself, does a Make challenge by typing (voice is planned,
 * not live, and no voice error shows anywhere), puts a name, a city and a university into both the work and the thinking,
 * sees the hidden words before sending, sends with sharing left off, and finds the work in My work.
 * One work per person per challenge; a full challenge says so. The sample session plays the seeded
 * thinking as text. `journey.planProof` is the sent work, for the next suites.
 */
export async function runSeeker(journey) {
  const { page, errors } = journey;
  const suite = createSuite("3 Work seeker", page);
  let task = null;

  await suite.step("the home: the question, the role tiles, one filter row and the challenge list, without the invite card", async () => {
    await page.goto(`${BASE_URL}/seeker`);
    await visible(page.getByRole("heading", { level: 1, name: /What work do you want\?$/ })).waitFor({ timeout: 15_000 });
    for (const id of ["seeker-roles", "challenge-filters", "challenge-table", "challenge-row"]) await visible(page.locator(`[data-tour="${id}"]`)).waitFor();
    // The demo person is an AI developer: his role is picked, its tile counts its challenges, and they come first.
    const tile = visible(page.getByRole("button", { name: "AI developer", exact: true }));
    expect((await tile.getAttribute("aria-pressed")) === "true", "the demo person's role is not picked");
    expect(/\d+ challenges?/.test(await tile.innerText()), "the role tile shows no challenge count");
    await visible(page.getByRole("heading", { name: /^AI developer challenges/ })).waitFor();
    // The invite and its score live in My work; the home only points there.
    expect((await page.locator('[data-tour="invitation"]').count()) === 0, "the invite card is still on the home");
    const filters = visible(page.getByRole("group", { name: "Filter challenges" }));
    for (const pill of ["Company", "Time", "Saved"]) await filters.getByRole("button", { name: new RegExp(`^${pill}`) }).waitFor();
    expect((await filters.getByRole("button", { name: /^(Format|Role)/ }).count()) === 0, "the format or role filter is still on the front");
    await filters.getByRole("searchbox", { name: "Search challenges" }).waitFor();
    // Each row leads with the company's logo and name, the title and the skills; no format band.
    const row = visible(page.locator('[data-tour="challenge-row"]'));
    expect((await row.locator("img").count()) >= 1, "the first row shows no company logo");
    await row.getByRole("list", { name: "Skills scored" }).waitFor();
    expect(/Published \d{1,2}\.\d{1,2}\./.test(await row.innerText()), "the first row has no published date");
    await checkScreen(page, errors, "/seeker");
  });

  await suite.step("Save keeps a challenge on this device and the Saved filter shows it", async () => {
    const row = visible(page.locator('[data-tour="challenge-row"]'));
    const save = row.getByRole("button", { name: /^Save: / });
    await save.click();
    await row.getByRole("button", { name: /^Saved: / }).waitFor();
    await page.reload();
    const filters = visible(page.getByRole("group", { name: "Filter challenges" }));
    await filters.getByRole("button", { name: /^Saved/ }).click();
    const rows = page.locator('[data-tour="challenge-table"] li[class*="border-t"]');
    await page.waitForFunction(() => document.querySelectorAll('[data-tour="challenge-table"] [aria-label="Skills scored"]').length === 1, null, { timeout: 15_000 });
    expect((await rows.count()) === 1, `the Saved filter shows ${await rows.count()} challenges, expected 1`);
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem("workproof.saved"))).length === 1, "the saved challenge was not stored");
    await visible(page.locator('[data-tour="challenge-table"]').getByRole("button", { name: /^Saved: / })).click();
    await filters.getByRole("button", { name: /^Saved/ }).click();
  });

  await suite.step("the chosen roles are remembered on this device", async () => {
    await visible(page.getByRole("button", { name: "Designer", exact: true })).click();
    await page.reload();
    const designer = visible(page.getByRole("button", { name: "Designer", exact: true }));
    await designer.waitFor({ timeout: 15_000 });
    expect((await designer.getAttribute("aria-pressed")) === "true", "the picked role was forgotten after a reload");
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem("workproof.roles"))).includes("designer"), "the roles were not saved");
    await designer.click();
  });

  await suite.step("Start as yourself", async () => {
    await visible(page.getByRole("button", { name: "Start as yourself" })).click();
    await waitForText(page, "This is your own account on this device.");
  });

  await suite.step("search, and click the row: back link, logo and title, Save and Start, About the challenge, the company", async () => {
    const words = (await challenges(page)).filter(wordsOnly);
    const ready = await Promise.all(words.map((c) => hasOtherWork(page, c)));
    task = words.find((_, i) => ready[i]);
    expect(task, "no Make challenge answered in words is open with other work to score");
    const filters = visible(page.getByRole("group", { name: "Filter challenges" }));
    await type(filters.getByRole("searchbox", { name: "Search challenges" }), task.title.split(" ").slice(0, 3).join(" "));
    await visible(page.getByRole("link", { name: new RegExp(`^${task.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`) })).click();
    await visible(page.getByRole("heading", { level: 1, name: task.title })).waitFor({ timeout: 15_000 });
    await visible(page.getByRole("link", { name: "Back to challenges" })).waitFor();
    await visible(page.getByRole("navigation", { name: "Breadcrumb" })).waitFor();
    await visible(page.getByRole("heading", { name: "About the challenge" })).waitFor();
    for (const term of ["Format", "Time", "Skills scored", "You hand in"]) await visible(page.getByText(term, { exact: true })).waitFor();
    await visible(page.getByRole("button", { name: /^Save: / })).waitFor();
    await waitForText(page, "Illustrative picture");
    await waitForText(page, /Published \d{1,2}\.\d{1,2}\./);
    await waitForText(page, /\d+ of \d+ places left/);
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const word of ["salary", "€", "per hour"]) expect(!text.includes(word), `the challenge page mentions "${word}"`);
    await checkScreen(page, errors, "challenge page");
    await visible(page.getByRole("link", { name: "Start challenge" })).click();
    await page.waitForURL(/\/work$/);
  });

  await suite.step("one screen says what the company reads: the thinking, not the face; voice is coming soon", async () => {
    await waitForText(page, "We read the thinking, not the face.");
    await waitForText(page, "No camera. Nobody sees your face.");
    await waitForText(page, "Voice coming soon");
    expect((await page.getByRole("button", { name: /voice|Type instead/i }).count()) === 0, "a voice control is still offered");
    await checkScreen(page, errors, "work start");
    await visible(page.getByRole("button", { name: "Start", exact: true })).click();
    await page.locator('[data-tour="do-challenge"]').waitFor({ timeout: 15_000 });
  });

  await suite.step("the workspace is typed: no recorder, and I'm done waits for the work", async () => {
    expect((await page.getByRole("status", { name: /Recording/ }).count()) === 0, "a recorder runs in the typed session");
    await visible(page.getByRole("timer")).waitFor();
    const done = visible(page.getByRole("button", { name: "I'm done" }));
    expect(await done.isDisabled(), "I'm done works before there is any work");
    await type(visible(page.getByRole("textbox", { name: "Your work" })), WORK);
    await type(visible(page.getByPlaceholder("How you think, in a few lines (optional)")), THOUGHTS);
    await waitForText(page, "Voice coming soon");
    await checkScreen(page, errors, "work session");
    await done.click();
    await visible(page.getByRole("heading", { name: "Two questions" })).waitFor({ timeout: AI_WAIT_MS });
  });

  await suite.step("two questions, both typed; no voice control or voice error", async () => {
    await type(visible(page.getByRole("textbox", { name: "Answer 1" })), FOLLOW_UPS[0]);
    await type(visible(page.getByRole("textbox", { name: "Answer 2" })), FOLLOW_UPS[1]);
    expect((await page.getByRole("textbox", { name: "Answer 2" }).inputValue()) === FOLLOW_UPS[1], "the typed answer did not land in question 2");
    expect((await page.getByRole("button", { name: /Say it|voice/i }).count()) === 0, "a voice button is still offered");
    const body = await page.locator("body").innerText();
    expect(!/voice service|did not answer|microphone/i.test(body), "a voice error shows on the questions step");
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
    await visible(page.getByRole("heading", { name: "How you thought while working" })).waitFor();
    // The written side marks each detail the company will not see, in the work and in the thinking.
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
    await visible(page.getByRole("heading", { name: "How I thought while working" })).waitFor();
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
    expect(await visible(page.getByRole("button", { name: "Start challenge" })).isDisabled(), "Start works on a full challenge");
    await checkScreen(page, errors, "full challenge");
  });

  await suite.step("the sample session plays on the real screen, as text", async () => {
    // The sample plays a seeded work's think-aloud; a challenge without one offers the person's own session instead.
    const options = (await challenges(page)).filter((c) => c.format === "choose" && c.options);
    const samples = await Promise.all(options.map((c) => hasSample(page, c)));
    const choose = options.find((_, i) => samples[i]);
    expect(choose, "no Choose challenge has a seeded work with a think-aloud");
    const bare = options.find((_, i) => !samples[i]);
    if (bare) {
      await page.goto(`${BASE_URL}/challenges/${bare.id}/work?demo=1`);
      await visible(page.getByRole("button", { name: "Try it yourself" })).click();
      await waitForText(page, "We read the thinking, not the face.");
    }
    await page.goto(`${BASE_URL}/challenges/${choose.id}/work?demo=1`);
    await waitForText(page, "Sample session");
    await visible(page.getByRole("button", { name: "Now try it yourself" })).waitFor({ timeout: DEMO_WAIT_MS });
    expect((await page.locator('[role="radio"][aria-checked="true"]').count()) === 1, "the sample session picked no option");
    await checkScreen(page, errors, "sample session");
  });

  return suite.results;
}
