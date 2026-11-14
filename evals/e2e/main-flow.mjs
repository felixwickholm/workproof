import { LAPTOP, openVisitor } from "./harness.mjs";
import { runCity } from "./suites/city.mjs";
import { runEmployer } from "./suites/employer.mjs";
import { runGuardrails } from "./suites/guardrails.mjs";
import { runEntry } from "./suites/entry.mjs";
import { runLaptop } from "./suites/laptop.mjs";
import { runPostTask } from "./suites/post-task.mjs";
import { runPractice } from "./suites/practice.mjs";
import { runSecondLook } from "./suites/second-look.mjs";
import { runSeeker } from "./suites/seeker.mjs";

/**
 * Suites 3, 4, 5 and 7 are one person's story in one browser, so one demo event: the work seeker
 * sends, the employer decides, the person accepts and the city counts it. The context has no
 * speech recognition, like headless Chromium; every flow is typed, since voice is not live.
 */
async function runJourney(browser, phone) {
  const visitor = await openVisitor(browser, phone, "3 Work seeker", { speech: false });
  const journey = { ...visitor, browser };
  try {
    return [...(await runSeeker(journey)), ...(await runEmployer(journey)), ...(await runSecondLook(journey)), ...(await runCity(journey))];
  } finally {
    await visitor.context.close();
  }
}

/** Every other suite opens its own browser context, so its own private demo event. */
const SUITES = [
  { key: "entry", run: (browser, phone) => runEntry(browser, phone, "1 Entry phone") },
  { key: "entry", run: (browser) => runEntry(browser, LAPTOP, "1 Entry laptop") },
  { key: "practice", run: (browser, phone) => runPractice(browser, phone, "2 Practice and table") },
  { key: "journey", run: runJourney },
  { key: "post", run: (browser, phone) => runPostTask(browser, phone, "6 Post a task") },
  { key: "guardrails", run: (browser, phone) => runGuardrails(browser, phone, "8 Guardrails") },
  { key: "laptop", run: (browser) => runLaptop(browser, LAPTOP, "9 Laptop key screens") },
];

/**
 * Eval 5, end to end with real clicks and typing at 390 x 844 (phone, touch), the key screens again
 * at 1440 x 900. E2E_ONLY=entry,practice,journey,post,guardrails,laptop,tour runs a subset.
 */
export async function runMainFlow(browser, phone) {
  const only = process.env.E2E_ONLY?.split(",").map((key) => key.trim());
  const rows = [];
  for (const suite of SUITES) {
    if (only && !only.includes(suite.key)) continue;
    rows.push(...(await suite.run(browser, phone)));
  }
  return rows;
}
