import { BASE_URL, checkScreen, createSuite, expect, switchMode, visible, visibleText, waitForText } from "../harness.mjs";
import { VISITOR } from "./seeker.mjs";

/** The company whose challenge the visitor did, read from the data. */
async function ownerOf(page, challengeId) {
  return page.evaluate(async (id) => {
    const challenge = await (await fetch(`/api/challenges/${encodeURIComponent(id)}`)).json();
    const all = await (await fetch("/api/companies")).json();
    const owner = all.find((c) => c.id === challenge.companyIds[0]);
    const other = all.find((c) => !challenge.companyIds.includes(c.id));
    return { owner: { id: owner.id, name: owner.name }, other: { id: other.id, name: other.name } };
  }, challengeId);
}

/** Whether the visitor's name shows anywhere in a company's review queue. */
async function queueShowsName(page, companyId) {
  const response = await page.request.get(`${BASE_URL}/api/companies/${encodeURIComponent(companyId)}/queue`);
  expect(response.ok(), `the queue for ${companyId} answered ${response.status()}`);
  return (await response.text()).includes(VISITOR.name);
}

/**
 * Suite 5: back in Looking for work in the same browser (the same person), after the company scored
 * the work and invited. The invite shows the score a person gave and the reason; My work shows the
 * score per skill. Saying yes shows the name to that company only; then the person says "We met".
 */
export async function runSecondLook(journey) {
  const { page, errors } = journey;
  const suite = createSuite("5 Invite and say yes", page);
  const work = journey.planProof;
  let companies = null;

  await suite.step("the invite is the one focal thing: the reviewer's words, the score, two buttons", async () => {
    expect(work, "needs the work the work seeker suite sent and the employer suite invited");
    await switchMode(page, "Looking for work", "/seeker");
    companies = await ownerOf(page, work.challengeId);
    const invite = visible(page.locator('[data-tour="invitation"]'));
    await invite.waitFor({ timeout: 15_000 });
    const text = await invite.innerText();
    expect(text.includes("Your invite") && text.includes(companies.owner.name), `the invite does not name ${companies.owner.name}`);
    expect(/Your score\s+\d+\.\d\s+of 10/.test(text), "the invite shows no score out of 10");
    expect(text.includes(`Saying yes shows your name to ${companies.owner.name} only.`), "the invite does not say who sees the name");
    await invite.getByRole("button", { name: "Say yes" }).waitFor();
    await invite.getByRole("button", { name: "Not now" }).waitFor();
    await checkScreen(page, errors, "/seeker invite");
  });

  await suite.step("My work shows the score per skill, the reviewer and the reason", async () => {
    await page.goto(`${BASE_URL}/my-work/${work.proofId}`);
    const score = visible(page.locator('[data-tour="my-score"]'));
    await score.getByText("A person scored this. The AI never does.").waitFor({ timeout: 15_000 });
    const text = await score.innerText();
    expect(/\d+\.\d\s+of 10/.test(text), "My score shows no total out of 10");
    expect(/[1-5] of 5 · /.test(text), "My score shows no points per skill");
    expect(text.includes("Looks for:"), "My score does not show what the reviewer looks for");
    expect(!(await queueShowsName(page, companies.owner.id)), "the company sees the name before the person said yes");
    await checkScreen(page, errors, "/my-work score");
  });

  await suite.step("say yes: the name goes to that company only", async () => {
    await page.goto(`${BASE_URL}/seeker`);
    await visible(page.locator('[data-tour="invitation"]').getByRole("button", { name: "Say yes" })).click();
    await waitForText(page, `You said yes. ${companies.owner.name} now sees your name.`);
    expect(await queueShowsName(page, companies.owner.id), `${companies.owner.name} still does not see the name after yes`);
    expect(!(await queueShowsName(page, companies.other.id)), `${companies.other.name} sees the name too`);
    expect(!(await visibleText(page)).includes("Something went wrong"), "the home shows an error");
  });

  await suite.step('the person taps "We met"', async () => {
    await visible(page.getByRole("button", { name: "We met" })).click();
    await waitForText(page, `You said you met. ${companies.owner.name} still has to confirm.`);
    await checkScreen(page, errors, "/seeker said yes");
  });

  return suite.results;
}
