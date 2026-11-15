import { BASE_URL, checkScreen, createSuite, eventually, expect, openVisitor, PHONE, visible } from "../harness.mjs";
import { SECRETS } from "./seeker.mjs";

/** The funnel's labels, as the city page sets them on `data-total`. */
const STEPS = ["Took a challenge", "Scored by a company", "Invited", "Said yes", "Talked at the event", "Follow-up agreed", "Hired (if known)"];
/** Names a city screen must never show: the visitor's details and the demo person's. */
const NAMES = [...SECRETS, "Mikko", "Lahtinen"];
/** A reviewer registered for the test company, so every score names a person. */
const REVIEWER = "Test Reviewer";

/** The event funnel's numbers, by label. */
async function readFunnel(page) {
  await page.locator('[data-total="Took a challenge"]').first().waitFor({ timeout: 15_000 });
  return page.evaluate((labels) => {
    const out = {};
    for (const label of labels) out[label] = Number(document.querySelector(`[data-total="${label}"]`)?.textContent?.trim());
    return out;
  }, STEPS);
}

const show = (f) => STEPS.map((label) => `${label}: ${f[label]}`).join(", ");
const same = (a, b) => STEPS.every((label) => a[label] === b[label]);

/** The visible text of a page, for the name check. */
async function noNames(page, where) {
  const text = await page.locator("body").innerText();
  for (const name of NAMES) expect(!text.includes(name), `${where} shows the name "${name}"`);
}

/** This browser's challenges with work, most work first, each with its first company. */
async function tasksWithWork(page) {
  const city = await (await page.request.get(`${BASE_URL}/api/city`)).json();
  return city.insights.impact.tasks
    .filter((t) => t.took > 0)
    .map((t) => ({ challengeId: t.challengeId, title: t.title, companyId: city.insights.companies.find((c) => c.name === t.companies[0]).id }));
}

/** A challenge with a company of the same need and, once all its work is scored, two rows that may be shared. */
async function shareableTask(page) {
  for (const task of await tasksWithWork(page)) {
    const matches = await (await page.request.get(`${BASE_URL}/api/city/tasks/${task.challengeId}/matches`)).json();
    if (matches.length === 0) continue;
    while (await scoreOne(page, task));
    const view = await (await page.request.get(`${BASE_URL}/api/city/tasks/${task.challengeId}`)).json();
    if (view.top.filter((t) => t.canShare).length >= 2) return task;
  }
  throw new Error("no challenge has a matching company and two scored rows that allow sharing");
}

/** Companies this browser already registered the test reviewer for. */
const registered = new Set();

/**
 * A change through the API. The server allows 60 changes a minute per address, which a person never
 * reaches but this suite can, right after the others; on a 429 it waits for the minute to pass.
 */
async function post(page, path, data) {
  for (let tries = 0; ; tries += 1) {
    const reply = await page.request.post(`${BASE_URL}${path}`, { data });
    if (reply.status() !== 429 || tries === 15) return reply;
    await page.waitForTimeout(5_000);
  }
}

/**
 * Scores one piece of work on the task in this browser's sandbox, as a reviewer registered for its company,
 * through the company's own routes. Returns the scored proof id, or null when no work is left to score.
 */
async function scoreOne(page, task) {
  if (!registered.has(task.companyId)) {
    await post(page, `/api/companies/${task.companyId}/reviewers`, { name: REVIEWER });
    registered.add(task.companyId);
  }
  const top = await (await page.request.get(`${BASE_URL}/api/companies/${task.companyId}/tasks/${task.challengeId}/top`)).json();
  // Older seed work may carry an answer without scores; the server refuses a second decision there.
  for (const proof of top.waiting) {
    const reply = await post(page, "/api/decisions", {
      proofId: proof.proofId,
      companyId: task.companyId,
      reviewer: REVIEWER,
      decision: "hold",
      feedback: "You found the main risk first and said why. Tell us how you would explain it to the team.",
      scores: top.challenge.coreSkills.map((skill) => ({ skillId: skill.id, points: 4 })),
    });
    if (reply.ok()) return proof.proofId;
    expect(reply.status() === 409, `scoring failed with ${reply.status()}`);
  }
  return null;
}

/**
 * Suite 7: the city. The page leads with its graphs; the city makes a challenge from a company's sample job
 * ad and gets the invitation to send. The funnel moves when a company scores work in this browser; the challenge page lists
 * the work by label and score and offers two people to another company; the export and every city screen
 * carry no name. Another browser's event is untouched, and Reset demo restores the start.
 */
export async function runCity(journey) {
  const { page, errors, browser } = journey;
  const suite = createSuite("7 City", page);
  let start = {};
  let task = null;
  let fresh = {};

  await suite.step("the city page leads with its graphs and keeps the map", async () => {
    await page.goto(`${BASE_URL}/city`);
    start = await readFunnel(page);
    for (const label of STEPS) expect(Number.isInteger(start[label]), `the funnel shows no number for "${label}"`);
    for (const name of ["From challenge to hire", "Scored or waiting", "Challenges and work over time", "Roles in demand", "Companies hiring right now", "Where the work goes"]) {
      await visible(page.getByRole("heading", { name })).waitFor();
    }
    for (const id of ["city-charts", "city-funnel", "city-map", "city-hiring-now", "city-make-challenge"]) {
      expect((await page.locator(`[data-tour="${id}"]`).count()) === 1, `the walkthrough target "${id}" is not on the page once`);
    }
    await visible(page.getByText(/follow-up talks? (came out of this event|is agreed yet)/)).waitFor();
    await noNames(page, "/city");
    await checkScreen(page, errors, "/city");
  });

  await suite.step("the city picks a company hiring now, makes a challenge from its sample ad and gets the invitation", async () => {
    // The walkthrough target is the card's heading; the ads list sits in the same card.
    const hiring = page.locator('[data-tour="city-hiring-now"]').locator("xpath=..");
    await visible(hiring.getByText("Sample ads")).waitFor();
    const row = hiring.locator("li").filter({ has: page.getByRole("button", { name: "Make a challenge" }) }).first();
    const company = (await row.locator("p").first().innerText()).trim();
    await row.getByRole("button", { name: "Make a challenge" }).click();
    const draft = page.getByRole("dialog");
    await visible(draft.getByText("The company scores")).waitFor({ timeout: 30_000 });
    await draft.getByRole("button", { name: "Publish and invite" }).click();
    const invite = page.getByRole("dialog").filter({ hasText: `Invite ${company}` });
    await visible(invite.getByText("The challenge is live. Send this invitation to the company.")).waitFor({ timeout: 15_000 });
    expect((await invite.locator("textarea").inputValue()).includes("/employer/challenges/"), "the invitation has no link to the challenge");
    await invite.getByRole("button", { name: "Close" }).click();
    await eventually(
      async () => (await hiring.locator("li").filter({ hasText: company }).getByRole("link", { name: "Challenge made" }).count()) === 1,
      () => `the row for ${company} does not say "Challenge made"`,
      15_000,
    );
    await checkScreen(page, errors, "/city after making a challenge");
  });

  await suite.step("scoring work raises the funnel in this browser", async () => {
    const scorable = [];
    for (const t of await tasksWithWork(page)) if (await scoreOne(page, t)) scorable.push(t);
    expect(scorable.length > 0, "no challenge has work left to score");
    let now = {};
    await eventually(
      // Work on a shared challenge may already carry the other company's score, so it counts once.
      async () => {
        now = await readFunnel(page);
        return now["Scored by a company"] > start["Scored by a company"] && now["Scored by a company"] <= start["Scored by a company"] + scorable.length;
      },
      () => `after ${scorable.length} scores the city shows ${show(now)}; expected "Scored by a company" above ${start["Scored by a company"]}, at most +${scorable.length}`,
      15_000,
    );
    expect(now["Took a challenge"] === start["Took a challenge"], "scoring changed the number who took a challenge");
  });

  await suite.step("a challenge's page lists top work by label and score and offers two people", async () => {
    // Not every person allows sharing, so score enough work for two rows that do.
    task = await shareableTask(page);
    await page.getByRole("link", { name: task.title }).first().click();
    await page.waitForURL((url) => url.pathname === `/city/challenges/${task.challengeId}`);
    await visible(page.getByText(/^Work \S+ · \d+\.\d of 10$/).first()).waitFor({ timeout: 15_000 });
    await noNames(page, "the challenge page");
    const boxes = page.locator("label:has(input[type=checkbox])");
    await eventually(async () => (await boxes.count()) >= 2, () => "fewer than two scored rows allow sharing", 15_000);
    await boxes.nth(0).click();
    await boxes.nth(1).click();
    const company = page.getByRole("radio").first();
    const name = (await company.locator("span span").first().innerText()).trim();
    await company.click();
    await page.getByRole("button", { name: `Offer 2 people to ${name}` }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Offer", exact: true }).click();
    await eventually(
      async () => (await page.locator("li").filter({ hasText: `Offered to ${name}` }).count()) >= 2,
      () => `the two rows do not say "Offered to ${name}"`,
      15_000,
    );
    await checkScreen(page, errors, "/city/challenges/[id]");
  });

  await suite.step("the talks export and the log carry no name", async () => {
    const csv = await (await page.request.get(`${BASE_URL}/api/city/meetings.csv`)).text();
    expect(csv.startsWith("Proof,Employer,Proposed time,Table,Status"), "the export has an unexpected header");
    for (const name of NAMES) expect(!csv.includes(name), `the export names "${name}"`);
    await page.goto(`${BASE_URL}/city/log`);
    await visible(page.getByRole("heading", { name: "The log" })).waitFor();
    await page.locator("tbody tr").first().waitFor({ timeout: 15_000 });
    await noNames(page, "/city/log");
    await checkScreen(page, errors, "/city/log");
  });

  await suite.step("another browser's demo event is untouched", async () => {
    await page.goto(`${BASE_URL}/city`);
    const other = await openVisitor(browser, PHONE, "7 City");
    try {
      await other.page.goto(`${BASE_URL}/city`);
      fresh = await readFunnel(other.page);
      const mine = await readFunnel(page);
      // This browser scored work; a fresh visitor's event has neither score.
      expect(fresh["Scored by a company"] < mine["Scored by a company"], `a fresh visitor sees ${show(fresh)}; this browser sees ${show(mine)}`);
      await checkScreen(other.page, other.errors, "/city in a fresh browser");
    } finally {
      await other.context.close();
    }
  });

  await suite.step("Reset demo restores the starting numbers", async () => {
    await page.goto(`${BASE_URL}/city`);
    await visible(page.getByRole("button", { name: "Reset demo" })).click();
    await visible(page.getByText("Demo reset. Everything is back at the start.")).waitFor({ timeout: 15_000 });
    let now = {};
    await eventually(
      async () => same((now = await readFunnel(page)), fresh),
      () => `after the reset the city shows ${show(now)}; a fresh visitor sees ${show(fresh)}`,
      15_000,
    );
    await checkScreen(page, errors, "/city after reset");
  });

  return suite.results;
}
