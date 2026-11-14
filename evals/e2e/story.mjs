import { BASE_URL, checkScreen, createSuite, expect, watchErrors } from "./harness.mjs";

/**
 * The guided story, done the way a first-time visitor would: read the coach bar, do what it says.
 * Besides pass or fail, it notes every place where the bar could leave someone stuck.
 */
export async function runStory(browser, phone) {
  const notes = [];
  const context = await browser.newContext(phone);
  const page = await context.newPage();
  const suite = createSuite("Story", page);
  const errors = watchErrors(page);
  const coach = page.getByRole("region", { name: "Story guide" });
  // Next keeps recent routes mounted but hidden, so only the visible screen counts.
  const main = page.locator("main").filter({ visible: true });

  const expectStep = async (n) => {
    await coach.getByText(new RegExp(`^${n}(\\.\\d+)? of 7$`)).waitFor({ timeout: 10_000 });
  };
  /** The bar must not sit on top of the page's main action or the field being typed in. */
  const assertNotCovering = async (target, what) => {
    // The bar re-measures the page's own bars four times a second.
    await page.waitForTimeout(400);
    const [a, b] = await Promise.all([coach.boundingBox(), target.boundingBox()]);
    if (!a || !b) return;
    const overlap = a.y < b.y + b.height && b.y < a.y + a.height && a.x < b.x + b.width && b.x < a.x + a.width;
    if (overlap) notes.push(`${what} is covered by the coach bar (${Math.round(a.height)}px tall)`);
    expect(!overlap, `coach bar covers ${what}`);
  };
  /** The guide's own button, by its label. Each one is one tap for the visitor. */
  let taps = 0;
  const guide = async (name) => {
    taps++;
    const button = coach.locator("a, button").filter({ hasText: name });
    const text = (await button.textContent())?.trim() ?? "";
    await button.click();
    return text;
  };
  /** The reviewer named on each "Fill in ...'s note", one per company. */
  const reviewers = [];
  const tap = async (locator) => {
    taps++;
    await locator.click();
  };
  const started = Date.now();

  await suite.step("s1 Play the story", async () => {
    await page.goto(`${BASE_URL}/`);
    await tap(page.getByRole("button", { name: "Play the story (3 min)" }));
    await page.waitForURL(/\/challenges$/);
    await expectStep(1);
    await checkScreen(page, errors, "story 1");
  });
  await suite.step("s2 open the Tuulos task as the hint says", async () => {
    await coach.getByText(/Open the Tuulos Robotics task/).waitFor();
    const card = page.locator("[data-story-on]");
    expect((await card.getAttribute("data-story")) === "task-ch-tuulos-ml", "the Tuulos task is not ringed");
    await tap(page.getByRole("link", { name: /Review an AI-written model evaluation/ }));
    await coach.getByText("Tap Start.").waitFor();
    const start = page.getByRole("link", { name: /^Start · \d+ min$/ });
    await assertNotCovering(start, "Start button");
    // The ring follows the pill's own shape.
    const radius = await page.locator("[data-story-on]").evaluate((el) => parseFloat(getComputedStyle(el, "::after").borderTopLeftRadius));
    expect(radius > 100, `the ring around Start has a ${radius}px radius, not a pill`);
    await checkScreen(page, errors, "story 2");
    await tap(start);
    await expectStep(2);
  });
  await suite.step("s3 work, both follow-ups and details, all filled in", async () => {
    await guide("Fill in her answer");
    // Filling only fills: she reads her answer, then taps the page's own button.
    const done = page.getByRole("button", { name: "I'm done" });
    await coach.getByText("Tap I'm done.").waitFor();
    await tap(done);
    await page.getByRole("textbox", { name: "Your explanation" }).waitFor();
    for (let question = 0; question < 2; question++) {
      const heading = await main.locator("h1").first().textContent();
      await assertNotCovering(page.getByRole("button", { name: "Continue" }), "Continue button");
      await guide("Fill in her reply");
      await page.waitForFunction((before) => document.querySelector("main h1")?.textContent !== before, heading, { timeout: 10_000 }).catch(() => {});
    }
    await page.getByRole("heading", { name: "Your name and contact" }).waitFor();
    await guide("Fill in her details");
    const sheet = page.getByRole("dialog", { name: "Submit your proof" });
    await tap(sheet.getByRole("button", { name: "Submit", exact: true }));
    await page.getByRole("heading", { name: "Your proof is in." }).waitFor();
    await checkScreen(page, errors, "story 3");
    await expectStep(3);
  });
  let label = "";
  await suite.step("s4 the blind proof, two different follow-up answers", async () => {
    label = (await main.getByText(/^Proof [A-Z0-9]+$/).first().textContent())?.trim() ?? "";
    const text = await main.textContent();
    expect(
      text.includes("measures memory, not grasping") && text.includes("The threshold and the full write-up can wait"),
      "the two follow-up answers are not two different replies",
    );
    await guide("See the company side");
    await expectStep(4);
    await checkScreen(page, errors, "story 4");
  });
  await suite.step("s5 Tuulos says not now, with a reason", async () => {
    await page.waitForURL(/\/company\/review\/.+/);
    const notNow = page.getByRole("button", { name: "Not now", exact: true });
    await assertNotCovering(notNow, "Not now button");
    await tap(notNow);
    reviewers.push((await guide(/^Fill in .+'s note$/)).replace(/^Fill in (.+)'s note$/, "$1"));
    await tap(page.getByRole("dialog").getByRole("button", { name: "Send feedback" }));
    const sent = page.getByRole("dialog", { name: "Feedback sent" });
    await sent.getByText("We filled this role on Thursday.", { exact: false }).waitFor();
    await expectStep(5);
    await checkScreen(page, errors, "story 5");
  });
  await suite.step("s6 Saarnivo takes a Second look and says Meet", async () => {
    await guide("Open it at Saarnivo");
    await main.getByText("Another employer had no opening for this proof.", { exact: false }).waitFor();
    const meet = page.getByRole("button", { name: "Meet", exact: true });
    await assertNotCovering(meet, "Meet button");
    await tap(meet);
    reviewers.push((await guide(/^Fill in .+'s note$/)).replace(/^Fill in (.+)'s note$/, "$1"));
    await tap(page.getByRole("dialog").getByRole("button", { name: "Send invitation" }));
    await page.getByRole("dialog", { name: "Invitation sent" }).getByText("You checked how the test set was built", { exact: false }).waitFor();
    await expectStep(6);
    await checkScreen(page, errors, "story 6");
  });
  await suite.step("s7 accept on her proofs", async () => {
    await guide("Open her proofs");
    await coach.getByText("Tap Accept.").waitFor();
    const pass = page.locator("article", { hasText: label }).filter({ visible: true });
    await pass.getByText("We filled this role on Thursday.", { exact: false }).waitFor();
    await assertNotCovering(pass.getByRole("button", { name: "Accept" }), "Accept button");
    await tap(pass.getByRole("button", { name: "Accept" }));
    await expectStep(7);
    await checkScreen(page, errors, "story 7");
  });
  await suite.step("s8 city view, two named reviewers", async () => {
    await guide("Open the city view");
    await page.getByText("Automated decisions", { exact: true }).waitFor();
    await coach.getByRole("button", { name: "Start again" }).waitFor();
    const text = await main.textContent();
    expect(reviewers.length === 2 && reviewers[0] !== reviewers[1], `one reviewer decided at both companies: ${reviewers.join(", ")}`);
    for (const name of reviewers) expect(text.includes(name), `${name} is not named in the city's audit log`);
    await checkScreen(page, errors, "story end");
    notes.push(`story: ${taps} taps, ${((Date.now() - started) / 1000).toFixed(0)}s with a script (no reading time)`);
    expect(taps <= 20, `the story takes ${taps} taps`);
  });
  await suite.step("s9 fold and unfold the bar", async () => {
    await coach.getByRole("button", { name: "Fold the story guide" }).click();
    const box = await coach.boundingBox();
    expect(box && box.height <= 48, `folded bar is ${box?.height}px tall`);
    await coach.getByRole("button", { name: /Story guide/ }).click();
    await coach.getByText("The city sees every decision.", { exact: false }).waitFor();
  });

  await context.close();
  return { results: suite.results, notes };
}
