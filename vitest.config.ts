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
    // Tests never call a live model or voice service, whatever keys the shell holds.
    env: {
      PROOF_DATA_FILE: "off",
      ANTHROPIC_API_KEY: "",
      GEMINI_API_KEY: "",
      GOOGLE_API_KEY: "",
      AI_PROVIDER: "",
      ELEVENLABS_API_KEY: "",
    },
  },
});
