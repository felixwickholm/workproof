/**
 * Refreshes the measured evidence in one go: runs `npm test` and `npm run eval`, rewrites the
 * measured block of src/app/for-judges/evidence.ts, then writes the same figures between the
 * evidence markers in README.md and docs/evals.md. Writes nothing when any check fails, so every
 * figure in the repository comes from a green run. The one exception is the test that compares
 * these documents with evidence.ts: it fails until this script has written them.
 *
 * `--render-only` skips the runs and rewrites the README and docs/evals.md blocks from evidence.ts.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const EVIDENCE = join(root, "src/app/for-judges/evidence.ts");
const DOCS = { readme: join(root, "README.md"), evals: join(root, "docs/evals.md") };
const SEP = " › ";
/** The check that this script itself makes pass, so its failure never blocks a refresh. */
const SELF_CHECK = "is quoted with the same figures in README.md and docs/evals.md";

/** Runs one vitest suite with its own temp folder, so a parallel run cannot mix up the eval rows. */
function run(target) {
  const temp = mkdtempSync(join(tmpdir(), "workprint-evidence-"));
  const report = join(temp, "report.json");
  const result = spawnSync("npx", ["vitest", "run", target, "--reporter=json", `--outputFile=${report}`], {
    cwd: root,
    env: { ...process.env, TMPDIR: temp, FORCE_COLOR: "0" },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  try {
    const json = JSON.parse(readFileSync(report, "utf8"));
    const tests = json.testResults.flatMap((file) => file.assertionResults);
    const files = json.testResults.filter((file) => file.assertionResults.some((test) => test.status === "passed" || test.title === SELF_CHECK)).length;
    const failed = tests.filter((test) => test.status === "failed" && test.title !== SELF_CHECK);
    const counted = tests.filter((test) => test.status === "passed" || test.status === "failed").length;
    // The self-check passes once the figures are written, so it counts as passed.
    return { files, tests: counted, passed: counted - failed.length, failed: failed.map((test) => test.fullName), stdout: result.stdout };
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

/** The eval table printed after `npm run eval`, as "eval › check" to result. */
function parseTable(stdout) {
  const lines = stdout.split("\n");
  const start = lines.findIndex((line) => /^Eval\s+Check\s+Result\s+Status/.test(line));
  if (start === -1) throw new Error("npm run eval printed no result table");
  const header = lines[start];
  const [check, result, status] = ["Check", "Result", "Status"].map((name) => header.indexOf(name));
  const rows = {};
  for (const line of lines.slice(start + 1)) {
    if (!line.trim()) break;
    const key = `${line.slice(0, check).trim()}${SEP}${line.slice(check, result).trim()}`;
    if (line.slice(status).trim() !== "pass") throw new Error(`Eval row failed: ${key}`);
    rows[key] = line.slice(result, status).trim();
  }
  return rows;
}

const checkRun = (command, r) => `{ command: "${command}", files: ${r.files}, tests: ${r.tests}, passed: ${r.passed} }`;

function measuredBlock(date, unit, evals, rows) {
  const entries = Object.entries(rows).map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`);
  return [
    "// measured:start, written by scripts/refresh-evidence.mjs",
    `export const VERIFIED_ON = "${date}";`,
    "",
    "/** `npm test`: unit tests next to the code under src/. */",
    `export const UNIT_TESTS: CheckRun = ${checkRun("npm test", unit)};`,
    "",
    "/** `npm run eval`: the eval suites under evals/ (the live-AI suite is skipped without a key). */",
    `export const EVAL_TESTS: CheckRun = ${checkRun("npm run eval", evals)};`,
    "",
    '/** The Result column of the table `npm run eval` prints, keyed by "eval › check". */',
    "export const PRINTED: Readonly<Record<string, string>> = {",
    ...entries,
    "};",
    "// measured:end",
  ].join("\n");
}

/** Replaces the text between two markers, keeping the markers. */
function replaceBetween(text, open, close, body, file) {
  const from = text.indexOf(open);
  const to = text.indexOf(close);
  if (from === -1 || to < from) throw new Error(`${file} has no ${open} ... ${close} markers`);
  return `${text.slice(0, from + open.length)}${body}${text.slice(to)}`;
}

const cell = (text) => String(text).replaceAll("|", "\\|");

function totalsLine(e) {
  return [
    `Measured on ${e.VERIFIED_ON} with \`npm run evidence\`, which runs both commands and copies their totals here:`,
    "",
    `- \`${e.UNIT_TESTS.command}\`: ${e.UNIT_TESTS.passed} of ${e.UNIT_TESTS.tests} unit tests pass, in ${e.UNIT_TESTS.files} files.`,
    `- \`${e.EVAL_TESTS.command}\`: ${e.EVAL_TESTS.passed} of ${e.EVAL_TESTS.tests} eval tests pass, in ${e.EVAL_TESTS.files} files. The live-AI file is skipped without a key.`,
  ];
}

function readmeBlock(e) {
  return [
    "",
    ...totalsLine(e),
    "",
    "| Suite | What is counted | Result | File |",
    "|---|---|---|---|",
    ...e.EVAL_RESULTS.map((r) => `| ${cell(r.suite)} | ${cell(r.check)} | ${cell(r.result)} | \`${r.file}\` |`),
    "",
  ].join("\n");
}

/** The one dated line on README's first screen: the totals and the two numbers a reader checks first. */
function checksLine(e) {
  // Only the count out of a total, since the sentence names what is counted.
  const at = (key) => /^(\d+)(?:\/| of )(\d+)/.exec(e.PRINTED[key] ?? "")?.slice(1, 3).join(" of ") ?? "not printed";
  const planted = at("2 Blind review › planted strings in reviewer payload");
  const judging = at("3 No automated decisions › (a) guard: judging rejected");
  return [
    "",
    `Checked on ${e.VERIFIED_ON} with \`npm run evidence\`: ${e.UNIT_TESTS.passed} of ${e.UNIT_TESTS.tests} unit tests and ${e.EVAL_TESTS.passed} of ${e.EVAL_TESTS.tests} eval tests pass; ${planted} planted identity details reached a reviewer; ${judging} planted judging phrases rejected by the guard.`,
    "",
  ].join("\n");
}

function evalsBlock(e) {
  return [
    "",
    ...totalsLine(e),
    "",
    "The full table `npm run eval` printed in that run:",
    "",
    "| Eval | Check | Result |",
    "|---|---|---|",
    ...Object.entries(e.PRINTED).map(([key, value]) => {
      const [name, check] = key.split(SEP);
      return `| ${cell(name)} | ${cell(check)} | ${cell(value)} |`;
    }),
    "",
  ].join("\n");
}

const renderOnly = process.argv.includes("--render-only");
let summary = "Rendered README.md and docs/evals.md from evidence.ts.";
if (!renderOnly) {
  const unit = run("src");
  const evals = run("evals");
  const failed = [...unit.failed, ...evals.failed];
  if (failed.length > 0) {
    console.error(`Not written. Failing checks:\n- ${failed.join("\n- ")}`);
    process.exit(1);
  }
  const rows = parseTable(evals.stdout);
  const date = new Date().toISOString().slice(0, 10);
  const source = readFileSync(EVIDENCE, "utf8");
  const from = source.indexOf("// measured:start");
  const to = source.indexOf("// measured:end") + "// measured:end".length;
  if (from === -1 || to < from) throw new Error("evidence.ts has no measured markers");
  writeFileSync(EVIDENCE, `${source.slice(0, from)}${measuredBlock(date, unit, evals, rows)}${source.slice(to)}`);
  summary = `Evidence written for ${date}: npm test ${unit.passed}/${unit.tests} in ${unit.files} files; npm run eval ${evals.passed}/${evals.tests} in ${evals.files} files; ${Object.keys(rows).length} eval rows.`;
}

// Node strips the types of evidence.ts; it has no imports, so it loads on its own.
const evidence = await import(`${pathToFileURL(EVIDENCE).href}?at=${Date.now()}`);
const open = "<!-- evidence:start -->";
const close = "<!-- evidence:end -->";
const readme = replaceBetween(readFileSync(DOCS.readme, "utf8"), open, close, readmeBlock(evidence), "README.md");
writeFileSync(DOCS.readme, replaceBetween(readme, "<!-- checks:start -->", "<!-- checks:end -->", checksLine(evidence), "README.md"));
writeFileSync(DOCS.evals, replaceBetween(readFileSync(DOCS.evals, "utf8"), open, close, evalsBlock(evidence), "docs/evals.md"));

console.log(summary);
