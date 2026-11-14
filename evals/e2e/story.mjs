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
    await coach.getByText(new RegExp(`^${n} of 7$`)).waitFor({ timeout: 10_000 });
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
  const fillHers = async () => {
    await coach.getByRole("button", { name: "Fill in her answer" }).click();
    await page.waitForTimeout(900);
  };

  await suite.step("s1 Play the story", async () => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole("button", { name: "Play the story" }).click();
    await expectStep(1);
    await checkScreen(page, errors, "story 1");
    await coach.getByRole("button", { name: "Show me" }).click();
    await expectStep(2);
  });
  await suite.step("s2 open the Tuulos task as the hint says", async () => {
    await page.waitForURL(/\/challenges$/);
    await coach.getByText(/Tuulos Robotics task/).waitFor();
    const card = page.locator("[data-story-on]");
    expect((await card.getAttribute("data-story")) === "task-ch-tuulos-ml", "the Tuulos task is not ringed");
    await page.getByRole("link", { name: /Review an AI-written model evaluation/ }).click();
    await coach.getByText("Tap Start below.").waitFor();
    const start = page.getByRole("link", { name: /^Start · \d+ min$/ });
    await assertNotCovering(start, "Start button");
    await checkScreen(page, errors, "story 2");
    await start.click();
    await expectStep(3);
  });
  await suite.step("s3 work with Fill in her answer", async () => {
    await assertNotCovering(page.getByRole("button", { name: "I'm done" }), "I'm done button");
    await fillHers();
    await coach.getByText("Now tap I'm done.").waitFor();
    await page.getByRole("button", { name: "I'm done" }).click();
    for (let question = 0; question < 2; question++) {
      await page.getByRole("textbox", { name: "Your explanation" }).waitFor();
      await fillHers();
      await assertNotCovering(page.getByRole("button", { name: "Continue" }), "Continue button");
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await page.getByRole("heading", { name: "Your name and contact" }).waitFor();
    await fillHers();
    await assertNotCovering(page.getByRole("button", { name: "Review and submit" }), "Review and submit button");
    await page.getByRole("button", { name: "Review and submit" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Submit", exact: true }).click();
    await page.getByRole("heading", { name: "Your proof is in." }).waitFor();
    await checkScreen(page, errors, "story 3");
    await expectStep(4);
  });
  let label = "";
  await suite.step("s4 the blind proof, then Next", async () => {
    label = (await main.getByText(/^Proof [A-Z0-9]+$/).first().textContent())?.trim() ?? "";
    await coach.getByRole("button", { name: "Next" }).click();
    await expectStep(5);
    await checkScreen(page, errors, "story 4");
  });
  await suite.step("s5 Tuulos says Pass, Saarnivo says Meet", async () => {
    await page.waitForURL(/\/company\/review$/);
    await page.getByRole("radio", { name: "Tuulos Robotics" }).click();
    await coach.getByText(`Open ${label} under To review.`).waitFor();
    await page.getByRole("link", { name: new RegExp(`^${label}\\b`) }).click();
    await assertNotCovering(page.getByRole("button", { name: "Pass", exact: true }), "Pass button");
    await page.getByRole("button", { name: "Pass", exact: true }).click();
    let sheet = page.getByRole("dialog");
    await sheet.getByRole("textbox", { name: "Your name" }).fill("Anna Koivisto");
    await sheet.getByRole("button", { name: "Thank you for the work. For this role we need" }).click();
    await sheet.getByRole("textbox", { name: "Feedback for them" }).pressSequentially("someone on site this month.");
    await sheet.getByRole("button", { name: "Send feedback" }).click();
    await sheet.getByRole("button", { name: "Done" }).click();
    await coach.getByText("Switch to Saarnivo at the top.", { exact: false }).waitFor();
    await page.getByRole("radio", { name: "Saarnivo Grid" }).click();
    await coach.getByText(`Open ${label} under Second look.`).waitFor();
    const secondLook = page.locator("section", { has: page.getByText("Second look", { exact: true }) }).filter({ visible: true });
    await secondLook.getByRole("link", { name: new RegExp(`^${label}\\b`) }).click();
    await assertNotCovering(page.getByRole("button", { name: "Meet", exact: true }), "Meet button");
    await page.getByRole("button", { name: "Meet", exact: true }).click();
    sheet = page.getByRole("dialog");
    await sheet.getByRole("textbox", { name: "Your name" }).fill("Jussi Rantala");
    await sheet.getByRole("button", { name: "In your work I noticed" }).click();
    await sheet.getByRole("textbox", { name: "Why you want to meet" }).pressSequentially("the leak in the split first.");
    await sheet.getByRole("button", { name: "Send invitation" }).click();
    await sheet.getByRole("button", { name: "Done" }).click();
    await checkScreen(page, errors, "story 5");
    await expectStep(6);
  });
  await suite.step("s6 accept on her proofs", async () => {
    await coach.getByRole("link", { name: "Open her proofs" }).click();
    await coach.getByText("Tap Accept on her proof.").waitFor();
    const pass = page.locator("article", { hasText: label }).filter({ visible: true });
    await assertNotCovering(pass.getByRole("button", { name: "Accept" }), "Accept button");
    await pass.getByRole("button", { name: "Accept" }).click();
    await checkScreen(page, errors, "story 6");
    await expectStep(7);
  });
  await suite.step("s7 city, then Finish", async () => {
    await coach.getByRole("link", { name: "Open the city view" }).click();
    await page.getByText("Automated decisions", { exact: true }).waitFor();
    await coach.getByRole("button", { name: "Finish" }).click();
    await coach.getByText("That is Tryout.").waitFor();
    await checkScreen(page, errors, "story end");
  });
  await suite.step("s8 fold and unfold the bar", async () => {
    await coach.getByRole("button", { name: "Fold the story guide" }).click();
    const box = await coach.boundingBox();
    expect(box && box.height <= 48, `folded bar is ${box?.height}px tall`);
    await coach.getByRole("button", { name: /Story guide/ }).click();
    await coach.getByText("That is Tryout.").waitFor();
  });

  await context.close();
  return { results: suite.results, notes };
}
