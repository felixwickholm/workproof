import { BASE_URL, checkScreen, createSuite, eventually, expect, openVisitor, PHONE, readCityTotals, visible } from "../harness.mjs";
import { readCityStart, SECRETS } from "./seeker.mjs";

const COUNTED = ["Human decisions", "Meetings confirmed by both sides", "Automated decisions"];

/** The three counted figures, as "label: n" lines, for a readable failure. */
const show = (totals) => COUNTED.map((label) => `${label}: ${totals[label]}`).join(", ");
const same = (a, b) => COUNTED.every((label) => a[label] === b[label]);

/**
 * Suite 7: the city sees what the earlier suites did in this browser: three decisions by a named
 * person, one meeting both sides confirmed, no automated decision, and an audit log that names the
 * reviewer and never the candidate. Another browser's event is untouched, and Reset demo restores
 * the starting numbers.
 */
export async function runCity(journey) {
  const { page, errors, browser } = journey;
  const suite = createSuite("7 City", page);
  const start = journey.cityStart;
  // Not now on a waiting proof, Meet on the visitor's, Not now on the Second look proof.
  const decisionsMade = 3;

  await suite.step("0 automated decisions, the human decisions and confirmed meetings went up", async () => {
    expect(start && journey.secondLookProof, "needs the work seeker, employer and Second look suites");
    await page.goto(`${BASE_URL}/city`);
    await page.locator('[data-total="Human decisions"]').waitFor({ timeout: 15_000 });
    const now = await readCityTotals(page);
    expect(now["Automated decisions"] === 0, `${now["Automated decisions"]} automated decisions`);
    expect(
      now["Human decisions"] === start["Human decisions"] + decisionsMade,
      `human decisions went from ${start["Human decisions"]} to ${now["Human decisions"]}, expected +${decisionsMade}`,
    );
    expect(
      now["Meetings confirmed by both sides"] === start["Meetings confirmed by both sides"] + 1,
      `meetings confirmed by both went from ${start["Meetings confirmed by both sides"]} to ${now["Meetings confirmed by both sides"]}, expected +1`,
    );
    await checkScreen(page, errors, "/city");
  });

  await suite.step("the audit log names the reviewer and never the candidate", async () => {
    const log = page.locator("div").filter({ has: page.getByRole("heading", { name: "Audit log" }) }).filter({ has: page.locator("ol") }).last();
    await log.getByRole("button", { name: /^Show all \d+$/ }).click();
    const rows = log.locator("li");
    const meet = rows.filter({ hasText: "Anna Koivisto" }).filter({ hasText: journey.planProof.label });
    expect((await meet.count()) > 0, `no audit entry by Anna Koivisto for ${journey.planProof.label}`);
    const text = await log.innerText();
    for (const secret of SECRETS) expect(!text.includes(secret), `the audit log names the candidate: "${secret}"`);
  });

  await suite.step("another browser's demo event is untouched", async () => {
    const other = await openVisitor(browser, PHONE, "7 City");
    try {
      const fresh = await readCityStart(other.page);
      expect(same(fresh, start), `a fresh visitor sees ${show(fresh)}; expected the starting ${show(start)}`);
      await checkScreen(other.page, other.errors, "/city in a fresh browser");
    } finally {
      await other.context.close();
    }
  });

  await suite.step("Reset demo restores the starting numbers", async () => {
    await visible(page.getByRole("button", { name: "Reset demo" })).click();
    await visible(page.getByText("Demo reset. Everything is back at the start.")).waitFor({ timeout: 15_000 });
    let now = {};
    await eventually(
      async () => same((now = await readCityTotals(page)), start),
      () => `after the reset the city shows ${show(now)}; expected ${show(start)}`,
      15_000,
    );
    await checkScreen(page, errors, "/city after reset");
  });

  return suite.results;
}
