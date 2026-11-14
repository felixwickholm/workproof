import { BASE_URL, loadPlaywright, PHONE, resetDemo } from "./harness.mjs";
import { runMainFlow } from "./main-flow.mjs";
import { runStory } from "./story.mjs";

/** Eval 5: the whole product in a phone-sized browser. Usage: BASE_URL=... npm run eval:e2e */
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
console.log(`Eval 5 end to end against ${BASE_URL}\n`);

const rows = [];
let notes = [];
try {
  await resetDemo();
  rows.push(...(await runMainFlow(browser, PHONE)));
  await resetDemo();
  const story = await runStory(browser, PHONE);
  rows.push(...story.results);
  notes = story.notes;
} finally {
  await browser.close();
}

const width = Math.max(...rows.map((r) => `${r.suite}  ${r.step}`.length));
for (const r of rows) {
  const time = r.ms === undefined ? "" : `${(r.ms / 1000).toFixed(1)}s`;
  console.log(`${`${r.suite}  ${r.step}`.padEnd(width)}  ${r.status.padEnd(4)}  ${time.padStart(6)}${r.error ? `  ${r.error}` : ""}`);
}
for (const note of notes) console.log(`note: ${note}`);

const passed = rows.filter((r) => r.status === "pass").length;
console.log(`\n${passed}/${rows.length} steps passed`);
process.exit(passed === rows.length ? 0 : 1);
