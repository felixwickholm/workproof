import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "evals/**/*.eval.ts"],
    environment: "node",
    globalSetup: ["./evals/summary.setup.ts"],
    env: { PROOF_DATA_FILE: "off", ANTHROPIC_API_KEY: "" },
  },
});
