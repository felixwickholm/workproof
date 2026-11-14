import { apiJson, assertNoOverflow, BASE_URL, expect, openVisitor, settled, visible, visibleText } from "../harness.mjs";
import { practiceTask } from "./practice.mjs";

/** Words that score, rank or rate a person. */
const JUDGING = /\bmatch\b[^.%]{0,12}%|%\s*match|\bscor(?:e|es|ed|ing)\b|\brank(?:s|ed|ing|ings)?\b|\brat(?:ed|ing|ings)\b|top candidates?|★|☆|\bstars?\b/i;

/**
 * The only sentences allowed to use those words: each one says Workprint never does it, or names
 * what other tools do in a side-by-side with what Workprint does instead. Exact text, so a new
 * sentence with a score in it fails until a person has read it.
 */
const SAYS_NEVER = new Set([
  // Landing page.
  "No names, no photos, no scores.",
  "No score.",
  "No rank.",
  "An algorithm gives a match score",
  "AI interviews or ranks people",
  // Task lists and the Hiring home.
  "The same list for everyone: no profile, no match score.",
  "No names, no photos of people, no scores.",
  // City compliance card: the law it follows, and what the AI never does.
  "Recruitment AI that ranks people is high-risk (Annex III, point 4).",
  "Scores or rates a person",
  "Ranks or shortlists people",
  // For judges.
  "AI drafts tasks; it never scores or ranks a person.",
  "AI drafts tasks and follow-up questions; it never scores, ranks or recommends a person.",
  "AI never scores or ranks people: a guard checks every AI output; identity is removed before review; every decision needs a named reviewer and written feedback; runs with no keys; request limits; Docker build.",
  "A person decides Meet or Not now with a written reason; a guard blocks scores and ranks in AI output; every decision is in the audit log.",
  "Scores, ranks, rates or recommends a person.",
]);

/** Sentences on the screen that use judging words outside the allow-list. */
function judgingSentences(text) {
  return text
    .split(/\n|\t/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => JUDGING.test(sentence) && !SAYS_NEVER.has(sentence));
}

/** Every route the other suites reach, with ids from this visitor's own demo event. */
async function routes(page) {
  const session = await apiJson(page, "/api/demo/session");
  const home = await apiJson(page, "/api/seeker/me/home", session.persona.talentId);
  const queue = await apiJson(page, "/api/companies/co-kaari/queue");
  const task = home.tasks.find((t) => t.challenge.companyIds.includes("co-kaari"))?.challenge.id ?? home.tasks[0].challenge.id;
  const own = home.passport[0]?.proof.proofId;
  const waiting = queue.proofs[0]?.proofId;
  expect(task && own && waiting, "the demo event has no task, passport proof or waiting proof to visit");
  return [
    "/",
    "/try",
    "/table",
    "/for-judges",
    "/seeker",
    "/challenges",
    `/challenges/${task}`,
    `/challenges/${task}/work`,
    "/passport",
    `/passport/${own}`,
    "/employer",
    "/company",
    "/company/review",
    `/company/review/${waiting}`,
    "/city",
  ];
}

/**
 * Opens a route and waits until it has its h1 and a heading a person can see, and nothing is still
 * loading. On a phone an open proof keeps the page's h1 for screen readers and shows its own heading.
 */
async function visit(page, path) {
  await page.goto(`${BASE_URL}${path}`);
  await page.locator("h1").first().waitFor({ state: "attached", timeout: 15_000 });
  await visible(page.getByRole("heading")).waitFor({ timeout: 15_000 });
  await settled(page);
}

/** One theme on a phone: every route, its words, its width and its errors. */
async function crawl(browser, device, theme, suiteName) {
  const { context, page, suite, errors } = await openVisitor(browser, device, suiteName, { theme });
  let paths = [];
  await suite.step(`${theme}: list the routes`, async () => {
    await page.goto(`${BASE_URL}/`);
    paths = await routes(page);
  });
  for (const path of paths) {
    await suite.step(`${theme} ${path}`, async () => {
      await visit(page, path);
      const shown = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      expect(shown === theme, `${path} renders "${shown}", expected ${theme}`);
      const judging = judgingSentences(await visibleText(page));
      expect(judging.length === 0, `${path} judges people: ${judging.map((s) => `"${s}"`).join(" | ")}`);
      await assertNoOverflow(page, path);
      errors.assertClean(path);
    });
  }
  await context.close();
  return suite.results;
}

/**
 * Suite 8: a cheap scan of every screen the flows reach, in both themes: no score, rank or rating
 * words about people outside the sentences that promise there are none, no console error, no
 * failed request, no sideways scroll on a phone, and the practice task fits a 320px phone.
 */
export async function runGuardrails(browser, device, suiteName) {
  const results = [...(await crawl(browser, device, "light", suiteName)), ...(await crawl(browser, device, "dark", suiteName))];

  const small = { ...device, viewport: { width: 320, height: 640 } };
  const { context, page, suite, errors } = await openVisitor(browser, small, suiteName);
  await suite.step("/try fits a 320px phone from the first question to the reveal", async () => {
    await visit(page, "/try");
    await assertNoOverflow(page, "/try at 320px");
    // Checks the width and the errors on the task and on the reveal.
    await practiceTask(page, errors, { job: "Electrician", name: "Aune", screen: "/try at 320px" });
  });
  await context.close();
  return [...results, ...suite.results];
}
