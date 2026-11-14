/**
 * Live check of the AI providers. Loads `.env` when present, then runs one draft, one taster and one
 * follow-up call per provider with a key, and prints PASS or FAIL with the time each call took.
 * Keys are passed to the test run in memory only and are never printed.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { startVitest } from "vitest/node";

const root = fileURLToPath(new URL("..", import.meta.url));
const envFile = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const KEYS = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"];
if (!KEYS.some((name) => process.env[name]?.trim())) {
  console.log("No AI key set. The scripted designer is active.");
  process.exit(0);
}

const env = { WORKPRINT_LIVE_AI: "1" };
for (const name of [...KEYS, "ANTHROPIC_MODEL", "GEMINI_MODEL"]) env[name] = process.env[name] ?? "";

let failed = 0;
const reporter = {
  onTestCaseResult(testCase) {
    const result = testCase.result();
    if (result.state === "skipped") return;
    const seconds = ((testCase.diagnostic()?.duration ?? 0) / 1000).toFixed(1);
    const call = `${testCase.parent.name.padEnd(28)} ${testCase.name.padEnd(15)} ${seconds.padStart(5)} s`;
    if (result.state === "passed") {
      console.log(`PASS  ${call}`);
      return;
    }
    failed += 1;
    console.log(`FAIL  ${call}  ${result.errors?.[0]?.message?.split("\n")[0] ?? "unknown error"}`);
  },
};

const vitest = await startVitest("test", ["evals/live-ai.eval.ts"], { root, run: true, watch: false, env, reporters: [reporter] });
await vitest?.close();
process.exitCode = failed > 0 || !vitest ? 1 : 0;
