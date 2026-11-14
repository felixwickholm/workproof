import { BASE_URL, checkScreen, eventually, expect, openVisitor, settled, visible } from "../harness.mjs";
import { practiceTask } from "./practice.mjs";

/** True when two boxes sit side by side: no vertical overlap is needed, only separate columns. */
const sideBySide = (left, right) => left && right && left.x + left.width <= right.x;

/**
 * The key screens again on a laptop (1440 x 900), where they change layout: the work beside the
 * task, the review list beside the open proof, the comparison slider, and the three mode homes.
 */
export async function runLaptop(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);

  await suite.step("Looking for work: greeting, counts, invitation and tasks in one view", async () => {
    await page.goto(`${BASE_URL}/seeker`);
    const greeting = visible(page.getByRole("heading", { level: 1 }));
    await greeting.waitFor({ timeout: 15_000 });
    expect(/Olena/.test(await greeting.textContent()), `the greeting is "${await greeting.textContent()}"`);
    await settled(page);
    await visible(page.locator('[data-tour="invitation"]')).waitFor();
    await visible(page.locator('[data-tour="task-feed"]')).waitFor();
    await checkScreen(page, errors, "/seeker at 1440");
  });

  await suite.step("a task opens with the answer beside it", async () => {
    // Olena already sent the visit plan, so the laptop opens a written task she has not done yet.
    await visible(page.getByRole("link", { name: "View all" })).click();
    await page.waitForURL((url) => url.pathname === "/challenges");
    await visible(page.getByRole("link", { name: /Review an AI-drafted shift handover/ })).click();
    await visible(page.getByRole("link", { name: /^Start · \d+ min$/ })).click();
    await page.waitForURL(/\/work$/);
    const title = visible(page.getByRole("heading", { level: 1, name: /Review an AI-drafted shift handover/ }));
    const answer = visible(page.getByRole("textbox", { name: "Your answer" }));
    await answer.waitFor();
    expect(sideBySide(await title.boundingBox(), await answer.boundingBox()), "the task and the answer are not side by side");
    await checkScreen(page, errors, "work at 1440");
  });

  await suite.step("Hiring: the queue stays beside the open proof", async () => {
    await page.goto(`${BASE_URL}/employer`);
    const greeting = visible(page.getByRole("heading", { level: 1 }));
    await greeting.waitFor({ timeout: 15_000 });
    await eventually(async () => /^Kaari Home Care\. /.test((await greeting.textContent()) ?? ""), "the greeting never names Kaari Home Care", 15_000);
    await visible(page.getByRole("link", { name: "Open the queue" })).click();
    // A laptop never shows an empty reading pane: the oldest proof to read opens by itself, named in the address.
    const list = page.getByRole("complementary", { name: "Review queue" });
    const first = list.getByRole("region", { name: "To read" }).getByRole("link").first();
    await first.waitFor({ timeout: 15_000 });
    const href = await first.getAttribute("href");
    await page.waitForURL((url) => url.pathname === href, { timeout: 15_000 });
    expect((await first.getAttribute("aria-current")) === "page", "the opened proof is not the selected row");
    const decision = visible(page.getByRole("region", { name: "Your decision" }));
    await decision.waitFor({ timeout: 15_000 });
    expect(await list.isVisible(), "the queue disappears when a proof opens");
    expect(sideBySide(await list.boundingBox(), await decision.boundingBox()), "the open proof is not beside the queue");
    await checkScreen(page, errors, "review at 1440");
  });

  await suite.step("City: outcomes with 0 automated decisions", async () => {
    await page.goto(`${BASE_URL}/city`);
    const figure = page.locator('[data-total="Automated decisions"] [data-value]').first();
    await figure.waitFor({ state: "attached", timeout: 15_000 });
    const automated = await figure.textContent();
    expect(automated.trim() === "0", `${automated} automated decisions`);
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
