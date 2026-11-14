import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** The product's former name, spelled in two parts so this file does not contain it. */
const FORMER_NAME = new RegExp(["try", "out"].join(""), "i");
const ROOT = join(__dirname, "../../..");
const SKIPPED = new Set(["node_modules", ".next", ".git", ".data"]);

/** A file is text when its first 8 kB hold no NUL byte. */
function isText(path: string): boolean {
  return !readFileSync(path).subarray(0, 8192).includes(0);
}

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    if (SKIPPED.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else yield path;
  }
}

describe("the product name", () => {
  it("leaves no trace of the former name in any text file of the repo", () => {
    const found = [...files(ROOT)].filter((path) => isText(path) && FORMER_NAME.test(readFileSync(path, "utf8"))).map((path) => relative(ROOT, path));
    expect(found).toEqual([]);
  });
});
