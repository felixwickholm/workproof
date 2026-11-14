import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    /** Where this run's eval files append their summary rows. One file per run, so overlapping runs never mix. */
    evalResultsFile: string;
  }
}

interface Row {
  evalName: string;
  check: string;
  result: string;
  pass: boolean;
}

/** Prints one line per recorded check after all eval files have run. */
function printSummary(file: string): void {
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return;
  }
  const rows = text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Row)
    .sort((a, b) => a.evalName.localeCompare(b.evalName));
  if (rows.length === 0) return;

  const width = (key: keyof Row) => Math.max(...rows.map((r) => String(r[key]).length), key.length);
  const [w1, w2, w3] = [width("evalName"), width("check"), width("result")];
  const line = (a: string, b: string, c: string, d: string) => `${a.padEnd(w1)}  ${b.padEnd(w2)}  ${c.padEnd(w3)}  ${d}`;
  console.log(`\n${line("Eval", "Check", "Result", "Status")}`);
  for (const row of rows) console.log(line(row.evalName, row.check, row.result, row.pass ? "pass" : "FAIL"));
  console.log("");
}

/** Gives this run its own results file in a fresh temporary folder, and prints and removes it at the end. */
export default function setup(project: TestProject): () => void {
  const dir = mkdtempSync(join(tmpdir(), "workproof-evals-"));
  const file = join(dir, "results.jsonl");
  project.provide("evalResultsFile", file);
  return () => {
    printSummary(file);
    rmSync(dir, { recursive: true, force: true });
  };
}
