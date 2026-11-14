import { BASE_URL, loadPlaywright, PHONE } from "./harness.mjs";
import { runMainFlow } from "./main-flow.mjs";
import { runTour } from "./story.mjs";

/**
 * Eval 5: the whole product in a real browser. Every suite opens its own browser context, so its
 * own private demo event; nothing needs a reset first. Usage: BASE_URL=... npm run eval:e2e
 */
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
console.log(`Eval 5 end to end against ${BASE_URL}\n`);

const started = Date.now();
const only = process.env.E2E_ONLY?.split(",").map((key) => key.trim());
const rows = [];
let notes = [];
try {
  rows.push(...(await runMainFlow(browser, PHONE)));
  if (!only || only.includes("tour")) {
    const tour = await runTour(browser);
    rows.push(...tour.results);
    notes = tour.notes;
  }
} finally {
  await browser.close();
}

const width = Math.max(...rows.map((r) => `${r.suite}  ${r.step}`.length));
for (const r of rows) {
  const time = r.ms === undefined ? "" : `${(r.ms / 1000).toFixed(1)}s`;
  console.log(`${`${r.suite}  ${r.step}`.padEnd(width)}  ${r.status.padEnd(4)}  ${time.padStart(6)}${r.error ? `  ${r.error}` : ""}`);
}
for (const r of rows.filter((row) => row.shot)) console.log(`screenshot: ${r.shot}`);
for (const note of notes) console.log(`note: ${note}`);

const passed = rows.filter((r) => r.status === "pass").length;
console.log(`\n${passed}/${rows.length} steps passed in ${Math.round((Date.now() - started) / 1000)} s`);
process.exit(passed === rows.length && rows.length > 0 ? 0 : 1);
