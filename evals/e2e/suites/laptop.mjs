import { apiJson, BASE_URL, checkScreen, eventually, expect, openVisitor, settled, visible } from "../harness.mjs";
import { practiceTask } from "./practice.mjs";

/** True when two boxes sit side by side: no vertical overlap is needed, only separate columns. */
const sideBySide = (left, right) => left && right && left.x + left.width <= right.x;

/**
 * The key screens again on a laptop (1440 x 900), where they change layout: the material beside the
 * answer in a session, a challenge's top work one row per work, the work list beside the open work,
 * the city's funnel, and the comparison slider.
 */
export async function runLaptop(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);

  await suite.step("Looking for work: the greeting, the invite and the challenges in one view", async () => {
    await page.goto(`${BASE_URL}/seeker`);
    const greeting = visible(page.getByRole("heading", { level: 1 }));
    await greeting.waitFor({ timeout: 15_000 });
    const { persona } = await apiJson(page, "/api/demo/session");
    const first = persona.name.split(" ")[0];
    expect((await greeting.textContent()).includes(first), `the greeting is "${await greeting.textContent()}", not about ${first}`);
    await settled(page);
    await visible(page.locator('[data-tour="invitation"]')).waitFor();
    await visible(page.locator('[data-tour="challenge-list"]')).waitFor();
    await checkScreen(page, errors, "/seeker at 1440");
  });

  await suite.step("a Read session shows the chart beside the answer", async () => {
    const challenge = (await apiJson(page, "/api/challenges")).find((c) => c.format === "read" && c.material?.image);
    expect(challenge, "no Read challenge has a chart");
    await page.goto(`${BASE_URL}/challenges/${encodeURIComponent(challenge.id)}/work`);
    await visible(page.getByRole("button", { name: "Type instead" })).click();
    const chart = visible(page.locator(`img[src="${challenge.material.image}"]`));
    await chart.waitFor({ timeout: 15_000 });
    expect(await chart.evaluate((img) => img.complete && img.naturalWidth > 0), "the chart image did not load");
    const answer = visible(page.locator("textarea")).first();
    expect(sideBySide(await chart.boundingBox(), await answer.boundingBox()), "the chart and the answer are not side by side");
    await checkScreen(page, errors, "Read session at 1440");
  });

  await suite.step("Hiring: a challenge's top work reads one row per work, its reason in one line", async () => {
    await page.goto(`${BASE_URL}/employer`);
    await visible(page.getByRole("heading", { name: "My challenges" })).waitFor({ timeout: 15_000 });
    await visible(page.locator('a[href^="/employer/challenges/"]')).click();
    const row = visible(page.locator('[data-tour="top-work"] > li')).first();
    await row.waitFor({ timeout: 15_000 });
    const total = row.getByText(/^\d+\.\d\s*of 10$/).first();
    const skills = row.locator("ul").first();
    expect(sideBySide(await total.boundingBox(), await skills.boundingBox()), "the total and the skill points are not in one row");
    const reason = row.locator("p", { hasText: /^“/ }).first();
    const box = await reason.boundingBox();
    expect(box && box.height < 32, `the reviewer's reason takes ${box?.height}px, more than one line`);
    await checkScreen(page, errors, "leaderboard at 1440");
  });

  await suite.step("Scoring: the work list stays beside the open work", async () => {
    await page.goto(`${BASE_URL}/company/review`);
    // A laptop never shows an empty reading pane: the oldest work to score opens by itself, named in the address.
    const list = page.getByRole("complementary", { name: "Work to score" });
    const first = list.getByRole("region", { name: "Waiting for a score" }).getByRole("link").first();
    await first.waitFor({ timeout: 15_000 });
    const href = await first.getAttribute("href");
    await page.waitForURL((url) => url.pathname === href, { timeout: 15_000 });
    const score = visible(page.getByRole("region", { name: "Your score" }));
    await score.waitFor({ timeout: 15_000 });
    expect(await list.isVisible(), "the list disappears when a work opens");
    expect(sideBySide(await list.boundingBox(), await score.boundingBox()), "the open work is not beside the list");
    await checkScreen(page, errors, "scoring at 1440");
  });

  await suite.step("City: the funnel from challenge to hire", async () => {
    await page.goto(`${BASE_URL}/city`);
    const took = page.locator('[data-total="Took a challenge"]').first();
    await took.waitFor({ state: "attached", timeout: 15_000 });
    await eventually(async () => /^\d+$/.test(((await took.textContent()) ?? "").trim()), "the funnel shows no number for who took a challenge", 15_000);
    await settled(page);
    await checkScreen(page, errors, "/city at 1440");
  });

  await suite.step("practice task: the reveal compares with a slider", async () => {
    await page.goto(`${BASE_URL}/try`);
    await page.getByRole("heading", { name: "What's your dream job?" }).waitFor();
    await practiceTask(page, errors, { job: "Teacher", name: "Kerttu", screen: "/try at 1440" });
    const slider = visible(page.getByRole("slider", { name: "Compare what was written with what the company reads" }));
    await slider.waitFor();
    await slider.focus();
    await page.keyboard.press("Home");
    expect((await slider.getAttribute("aria-valuenow")) === "0", "Home does not move the slider to the company side");
  });

  await context.close();
  return suite.results;
}
