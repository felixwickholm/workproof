import { AI_WAIT_MS, apiJson, BASE_URL, checkScreen, expect, LAPTOP, openVisitor, type, visible, visibleText, waitForText } from "../harness.mjs";

/** First names that also appear inside the answers, so the blind layer has something to hide. */
const PHONE_NAME = "Ilmari";

const answerWith = (name) =>
  `${name} here. I would read the allergen list first, keep the gluten-free bread on its own board and tell the guest what is in the sauce before I plate it.`;
const EXPLAIN = "A guest with coeliac disease trusts the kitchen, so one shared board would undo everything else on the plate.";

/** Two visitors at the table who write who they are into the answer itself, the way people do. */
const MIKKO = { answer: "hi im Mikko from Lahti, mikko@example.org. I would keep the gluten-free bread on its own board and wash the knife first.", secrets: ["Mikko", "Lahti", "mikko@example.org"] };
const SAIMI = {
  name: "Saimi",
  answer: "Saimi Korhonen here, call me on +358 40 123 4567 or saimi.k@example.org. I would ask the guest first and plate on a clean board.",
  secrets: ["Saimi", "Korhonen", "+358 40 123 4567", "123 4567", "saimi.k@example.org"],
};
const HOST = "Rami";
const INVITATION = "Your plan for the shared board caught my eye. I would like to hear how you check the sauce.";

/**
 * The phone practice task from the dream job to the reveal. Returns the proof the server sent back,
 * read from the response, so the caller can check what a company would get. Without a `name` the
 * person skips the name step.
 */
export async function practiceTask(page, errors, { job, name, screen, answer = answerWith(name ?? "Aino") }) {
  await type(page.getByRole("textbox", { name: "Dream job" }), job);
  await visible(page.getByRole("button", { name: "Find my task" })).click();
  const answerBox = page.getByRole("textbox", { name: "Your answer" });
  await answerBox.waitFor({ timeout: AI_WAIT_MS });
  await checkScreen(page, errors, `${screen} task`);
  await type(answerBox, answer);
  await visible(page.getByRole("button", { name: "Continue" })).click();

  const explanation = page.getByRole("textbox", { name: "Your explanation" });
  await explanation.waitFor({ timeout: AI_WAIT_MS });
  await page.getByText("One question about your answer").waitFor();
  await type(explanation, EXPLAIN);
  await visible(page.getByRole("button", { name: "Continue" })).click();

  const nameBox = page.getByRole("textbox", { name: "First name" });
  await nameBox.waitFor();
  if (name) await type(nameBox, name);
  await visible(page.getByRole("button", { name: name ? "Continue" : "Skip and continue", exact: true })).click();
  // The blind preview comes before Send: the person sees what a company would read while it can still change.
  await page.getByRole("heading", { name: "What the company will read" }).waitFor({ timeout: 15_000 });
  await waitForText(page, "Something still shows who you are? Go back and remove it.");
  const sent = page.waitForResponse((r) => r.url().endsWith("/api/submissions") && r.request().method() === "POST", { timeout: 20_000 });
  await visible(page.getByRole("button", { name: "Send", exact: true })).click();
  const response = await sent;
  expect(response.ok(), `sending the practice proof answered ${response.status()}`);
  await page.getByRole("heading", { name: "This is what a company sees." }).waitFor({ timeout: 15_000 });
  await checkScreen(page, errors, `${screen} reveal`);
  return (await response.json()).proof;
}

/** The public table's text and its JSON hold none of `secrets`. */
async function assertTableClean(table, secrets, where) {
  const text = await visibleText(table.page);
  const json = JSON.stringify(await apiJson(table.page, "/api/table/proofs"));
  for (const secret of secrets) {
    expect(!text.includes(secret), `${where}: "${secret}" is on the big screen`);
    expect(!json.includes(secret), `${where}: "${secret}" is in /api/table/proofs`);
  }
}

/** The host invites one row's author from the big screen, in two sentences. */
async function invite(table, label) {
  await visible(table.page.getByRole("button", { name: `Invite to meet: ${label}` })).click();
  const sheet = table.page.getByRole("dialog", { name: `Invite ${label} to meet` });
  await sheet.waitFor();
  await waitForText(table.page, "On this public screen the work stays hidden.");
  await type(sheet.getByRole("textbox", { name: "Your name" }), HOST);
  await type(sheet.getByRole("textbox", { name: "Write to the person: what you would like to hear more about" }), INVITATION);
  await waitForText(table.page, "2 of 2 sentences");
  await sheet.getByRole("button", { name: "Send invitation" }).click();
  await sheet.waitFor({ state: "detached" });
  await waitForText(table.page, `Invited by ${HOST} · waiting for the person`, 5_000);
}

/** The phone shows the host's invitation, in the host's own words, within a few seconds. */
async function seeInvitation(phone) {
  await waitForText(phone.page, `${HOST} at the table wants to meet you.`, 8_000);
  await waitForText(phone.page, INVITATION);
  await waitForText(phone.page, "Only your blind proof was visible. If you accept, your first name appears on the big screen.");
}

/**
 * Suite 2: the 2-minute practice task on a phone, then the booth: a laptop shows /table, phones
 * join with the table code, their proofs arrive as labels only, the table invites, one person
 * accepts and only then their first name appears; the other declines and stays unnamed.
 */
export async function runPractice(browser, device, name) {
  const { context, page, suite, errors } = await openVisitor(browser, device, name);
  let proof = null;

  await suite.step("dream job, task, one follow-up, send", async () => {
    await page.goto(`${BASE_URL}/try`);
    await page.getByRole("heading", { name: "What's your dream job?" }).waitFor();
    await checkScreen(page, errors, "/try");
    await waitForText(page, "No sign-up. 2 minutes. Practice. Not sent to any company.");
    proof = await practiceTask(page, errors, { job: "chef", name: PHONE_NAME, screen: "/try" });
  });

  await suite.step("the company side hides the typed name and counts what it hid", async () => {
    const wire = [proof.work, ...proof.explain.map((e) => e.answer)].join("\n");
    expect(!wire.includes(PHONE_NAME), `the server sent the name back in the blind work: ${wire.slice(0, 120)}`);
    expect(proof.hiddenCount >= 1, `hiddenCount is ${proof.hiddenCount}, expected at least 1`);

    const companyTab = visible(page.getByRole("tab", { name: "Company reads" }));
    expect((await companyTab.getAttribute("aria-selected")) === "true", "the reveal does not open on what the company reads");
    // What a reader of the company side gets: hidden words are covered bars, announced as "[hidden]".
    const companySide = visible(page.getByRole("tabpanel"));
    const read = await companySide.ariaSnapshot();
    expect(read.includes("What a company reads"), `the open panel is not the company side: ${read.slice(0, 80)}`);
    expect(!read.includes(PHONE_NAME), `"${PHONE_NAME}" is readable on the company side`);
    expect(read.includes("[hidden]"), "the company side marks nothing as hidden");
    const footer = (await visibleText(page)).match(/(\d+) details? hidden before anyone read this/);
    expect(footer && Number(footer[1]) >= 1, "the reveal does not say how many details it hid");
    // The server keeps no identity for practice: the reveal says so, and the proof carries no name.
    await waitForText(page, "Your name was used only to hide it. It was not kept.");
    await waitForText(page, "Practice. Not sent to any company.");
  });

  await suite.step("typing during the Continue transition never changes the sent answer", async () => {
    await page.goto(`${BASE_URL}/try`);
    await type(page.getByRole("textbox", { name: "Dream job" }), "chef");
    await visible(page.getByRole("button", { name: "Find my task" })).click();
    const answerBox = page.getByRole("textbox", { name: "Your answer" });
    await answerBox.waitFor({ timeout: AI_WAIT_MS });
    const written = answerWith("Aino");
    await type(answerBox, written);
    await visible(page.getByRole("button", { name: "Continue" })).click();
    // Late keys and an autofill on the screen being left: neither may land in the answer.
    await answerBox.pressSequentially(" LATE KEYS", { delay: 10, timeout: 2_000 }).catch(() => {});
    await answerBox.fill(`${written} AUTOFILL`, { timeout: 1_000 }).catch(() => {});
    await page.getByRole("textbox", { name: "Your explanation" }).waitFor({ timeout: AI_WAIT_MS });
    const quoted = await visible(page.getByRole("figure")).innerText();
    expect(!/LATE KEYS|AUTOFILL/.test(quoted), `the answer changed after Continue: ${quoted.slice(-80)}`);
    expect(quoted.includes("tell the guest what is in the sauce"), `"You wrote" lost the answer: ${quoted.slice(0, 80)}`);
  });

  await suite.step("a refresh mid-task comes back to the same question with the same words", async () => {
    const explanation = page.getByRole("textbox", { name: "Your explanation" });
    const question = await visible(page.getByRole("heading", { level: 1 })).innerText();
    const stepLine = (await visibleText(page)).match(/Step \d+ of \d+/)?.[0];
    expect(stepLine, "the question shows no step line");
    await type(explanation, "Half an explanation");
    await page.waitForTimeout(400);
    await page.reload();
    await page.getByRole("textbox", { name: "Your explanation" }).waitFor({ timeout: 10_000 });
    expect((await page.getByRole("textbox", { name: "Your explanation" }).inputValue()) === "Half an explanation", "the explanation was lost on refresh");
    await waitForText(page, question);
    await waitForText(page, stepLine);
  });

  // The booth: a laptop on the big screen and phones that scan its code share one demo event.
  const table = await openVisitor(browser, LAPTOP, name);
  const mikko = await openVisitor(browser, device, name);
  const saimi = await openVisitor(browser, device, name);
  let code = "";
  let mikkoProof = null;
  let saimiProof = null;

  await suite.step("the big screen shows a table code and no names", async () => {
    await table.page.goto(`${BASE_URL}/table`);
    await table.page.getByRole("heading", { name: "What's your dream job?" }).waitFor();
    await waitForText(table.page, /Table code\s+[A-Z0-9]{6}/);
    const text = await visibleText(table.page);
    code = text.match(/Table code\s+([A-Z0-9]{6})/)[1];
    const shortUrl = text.match(/Or type\s+(\S+\/try\/[A-Z0-9]{6})/)?.[1] ?? "";
    expect(shortUrl.endsWith(`/try/${code}`), `the typed link "${shortUrl}" does not carry the code ${code}`);
    await waitForText(table.page, "0 proofs from this table · 0 names shown, each after the person said yes");
    await waitForText(table.page, "Waiting for the first proof");
    await checkScreen(table.page, table.errors, "/table");
  }, { shot: table.page });

  await suite.step("an unknown table code tells the phone, and the task still works", async () => {
    // A new tab, so nothing saved mid-task in the first one is restored here.
    const scan = await context.newPage();
    await scan.goto(`${BASE_URL}/try?table=ZZZZZZ&joined=ZZZZZZ`);
    await waitForText(scan, "This table code is not active. You can still try the task: your proof stays on your phone's own demo.");
    await visible(scan.getByRole("textbox", { name: "Dream job" })).waitFor();
    await scan.close();
  });

  await suite.step("a proof that names its author reaches the big screen as a label only", async () => {
    // Mikko types the short link from the screen; Saimi below scans the QR code's link.
    await mikko.page.goto(`${BASE_URL}/try/${code}`);
    await mikko.page.getByRole("heading", { name: "What's your dream job?" }).waitFor();
    await waitForText(mikko.page, "Practice. Shown blind on this table's screen: label and task only.");
    mikkoProof = await practiceTask(mikko.page, mikko.errors, { job: "chef", name: null, screen: "/try?table", answer: MIKKO.answer });
    await waitForText(mikko.page, "You gave no name.");
    await table.page.locator(`[data-proof="${mikkoProof.label}"]`).waitFor({ timeout: 5_000 });
    await waitForText(table.page, "1 proof from this table · 0 names shown", 5_000);
    const rows = await apiJson(table.page, "/api/table/proofs");
    expect(Object.keys(rows[0]).sort().join() === "label,proofId,proofKind,submittedAt,taskTitle", `a table row carries more than a label: ${Object.keys(rows[0])}`);
    await assertTableClean(table, MIKKO.secrets, "after the proof arrived");
    await checkScreen(table.page, table.errors, "/table with a proof");
  }, { shot: table.page });

  await suite.step("the table invites, the phone reads the host's words and accepts: only now the name shows", async () => {
    await invite(table, mikkoProof.label);
    await assertTableClean(table, MIKKO.secrets, "after the invitation");
    await seeInvitation(mikko);
    await assertTableClean(table, MIKKO.secrets, "while the person decides");
    await type(mikko.page.getByRole("textbox", { name: "Your first name" }), "Mikko");
    await visible(mikko.page.getByRole("button", { name: "Accept and show my name" })).click();
    await waitForText(mikko.page, "Look up.");
    await waitForText(table.page, `${mikkoProof.label} is Mikko`, 5_000);
    await waitForText(table.page, "1 name shown, after the person said yes");
    const text = await visibleText(table.page);
    for (const secret of ["Lahti", "mikko@example.org"]) expect(!text.includes(secret), `"${secret}" is on the big screen`);
    await checkScreen(mikko.page, mikko.errors, "/try accepted");
  }, { shot: table.page });

  await suite.step("a second person declines: the name, phone and email never appear", async () => {
    await saimi.page.goto(`${BASE_URL}/try?table=${code}&joined=${code}`);
    await saimi.page.getByRole("heading", { name: "What's your dream job?" }).waitFor();
    saimiProof = await practiceTask(saimi.page, saimi.errors, { job: "chef", name: SAIMI.name, screen: "/try?table second", answer: SAIMI.answer });
    await table.page.locator(`[data-proof="${saimiProof.label}"]`).waitFor({ timeout: 5_000 });
    await assertTableClean(table, SAIMI.secrets, "after the second proof arrived");
    await invite(table, saimiProof.label);
    await seeInvitation(saimi);
    expect((await saimi.page.getByRole("textbox", { name: "Your first name" }).inputValue()) === SAIMI.name, "the first name typed earlier is not prefilled");
    await visible(saimi.page.getByRole("button", { name: "Not now" })).click();
    await waitForText(saimi.page, "Fine. Your name was never shown.");
    await waitForText(table.page, "The person said not now. Name never shown.", 5_000);
    await waitForText(table.page, "2 proofs from this table · 1 name shown");
    await assertTableClean(table, SAIMI.secrets, "after the decline");
    await checkScreen(table.page, table.errors, "/table after both answers");
  }, { shot: table.page });

  await Promise.all([context.close(), table.context.close(), mikko.context.close(), saimi.context.close()]);
  return suite.results;
}
