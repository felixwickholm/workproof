import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const RESULTS_FILE = join(tmpdir(), "tryout-eval-results.jsonl");

interface Row {
  evalName: string;
  check: string;
  result: string;
  pass: boolean;
}

export function setup(): void {
  rmSync(RESULTS_FILE, { force: true });
}

/** Prints one line per recorded check after all eval files have run. */
export function teardown(): void {
  if (!existsSync(RESULTS_FILE)) return;
  const rows = readFileSync(RESULTS_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Row)
    .sort((a, b) => a.evalName.localeCompare(b.evalName));
  rmSync(RESULTS_FILE, { force: true });
  if (rows.length === 0) return;

  const width = (key: keyof Row) => Math.max(...rows.map((r) => String(r[key]).length), key.length);
  const [w1, w2, w3] = [width("evalName"), width("check"), width("result")];
  const line = (a: string, b: string, c: string, d: string) => `${a.padEnd(w1)}  ${b.padEnd(w2)}  ${c.padEnd(w3)}  ${d}`;
  console.log(`\n${line("Eval", "Check", "Result", "Status")}`);
  for (const row of rows) console.log(line(row.evalName, row.check, row.result, row.pass ? "pass" : "FAIL"));
  console.log("");
}
