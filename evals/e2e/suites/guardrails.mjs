import { apiJson, assertNoOverflow, BASE_URL, expect, openVisitor, settled, visible, visibleText } from "../harness.mjs";
import { practiceTask } from "./practice.mjs";

/** Machine verdicts on people that no screen may show: a match percentage, stars, "top candidates". */
const VERDICT = /\bmatch\b[^.%]{0,12}%|%\s*match|top candidates?|★|☆|\bstars?\b/i;
/** Software as the one who scores, ranks or rates. People score the work; software never does. */
const MACHINE_JUDGES = /\b(?:AI|software|algorithm|model)\b[^.]*\b(?:scor(?:e|es|ed|ing)|rank(?:s|ed|ing)?|rat(?:es|ed|ing))\b/i;
/** A sentence that says it does not happen. */
const NEGATED = /\b(?:never|not|no|without)\b/i;

/**
 * The only sentences allowed to name software that judges people without a negation: each one names
 * what other tools do, in a side-by-side with what WorkProof does instead, or the law that applies.
 * Exact text, so a new sentence like it fails until a person has read it.
 */
const SAYS_NEVER = new Set(["An algorithm gives a match score", "AI interviews or ranks people", "Recruitment AI that ranks people is high-risk (Annex III, point 4)."]);

/** Sentences on the screen that show a machine verdict, or software judging people, outside the allow-list. */
function judgingSentences(text) {
  return text
    .split(/\n|\t/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => !SAYS_NEVER.has(sentence) && (VERDICT.test(sentence) || (MACHINE_JUDGES.test(sentence) && !NEGATED.test(sentence))));
}

/** Every route the other suites reach, with ids from this visitor's own demo event. */
async function routes(page) {
  const session = await apiJson(page, "/api/demo/session");
  const home = await apiJson(page, "/api/seeker/me/home", session.persona.talentId);
  // The company that invited the demo person: the story company, read from the data.
  const companies = await apiJson(page, "/api/companies");
  const company = companies.find((c) => c.name === home.invitations[0]?.companyName) ?? companies[0];
  const queue = await apiJson(page, `/api/companies/${company.id}/queue`);
  const task = home.tasks.find((t) => t.challenge.companyIds.includes(company.id))?.challenge.id ?? home.tasks[0].challenge.id;
  const own = home.passport[0]?.proof.proofId;
  const waiting = queue.proofs[0]?.proofId;
  expect(task && own && waiting, "the demo event has no task, own work or waiting work to visit");
  return [
    "/",
    "/how-it-works",
    "/try",
    "/table",
    "/for-judges",
    "/seeker",
    "/challenges",
    `/challenges/${task}`,
    `/challenges/${task}/work`,
    "/my-work",
    `/my-work/${own}`,
    "/employer",
    `/employer/challenges/${task}`,
    "/company",
    "/company/review",
    `/company/review/${waiting}`,
    "/city",
    `/city/challenges/${task}`,
    "/city/log",
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
 * Suite 8: a cheap scan of every screen the flows reach, in both themes: no match percentage, stars or
 * software that scores, ranks or rates people (people score the work, software never does), no console
 * error, no failed request, no sideways scroll on a phone, and the practice task fits a 320px phone.
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
