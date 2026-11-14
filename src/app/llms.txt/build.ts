import { EVAL_RESULTS, EVAL_TESTS, UNIT_TESTS, VERIFIED_ON } from "@/app/for-judges/evidence";
import { CHECK_PATH, CODE_MAP, KEY_FACTS, LIMITS, NAME, ROUTES, SUMMARY } from "@/app/for-judges/facts";

/** Where the rules that back the main claims live in the code. Each path exists in the repository. */
export const EVIDENCE_IN_CODE: readonly { path: string; what: string }[] = [
  { path: "src/lib/blind", what: "The blind layer: identity removed before any reviewer or model reads the work" },
  { path: "src/lib/guard", what: "The no-judgement guard and the protected-attribute checks on every AI output" },
  { path: "src/lib/service/decisions.ts", what: "A decision needs a registered, named person and a written reason" },
  { path: "src/lib/domain/places.ts", what: "Places per task, so every answer can be read" },
  { path: "evals", what: "The eval suites behind the numbers above" },
];

/**
 * /llms.txt in the llmstxt.org shape: an H1, the quoted first paragraph, dated numbers with the
 * commands that produce them, then H2 link lists. Built from the same typed facts as /for-judges,
 * so the two always say the same thing. `origin` is the site's own address; `repo` links code paths
 * when a repository URL is known.
 */
export function buildLlmsTxt(origin: string, repo?: string): string {
  const site = origin.replace(/\/$/, "");
  const codeLink = (path: string) => (repo ? `${repo.replace(/\/$/, "")}/tree/main/${path}` : path);
  const lines = [
    `# ${NAME}`,
    "",
    `> ${SUMMARY}`,
    "",
    "Key facts:",
    "",
    ...KEY_FACTS.map((fact) => `- ${fact}`),
    "",
    `## Numbers, checked on ${VERIFIED_ON}`,
    "",
    `- \`${UNIT_TESTS.command}\`: ${UNIT_TESTS.passed} of ${UNIT_TESTS.tests} unit tests pass, in ${UNIT_TESTS.files} files.`,
    `- \`${EVAL_TESTS.command}\`: ${EVAL_TESTS.passed} of ${EVAL_TESTS.tests} eval tests pass, in ${EVAL_TESTS.files} files.`,
    ...EVAL_RESULTS.slice(0, 8).map((e) => `- ${e.suite}: ${e.check}: ${e.result} (\`npm run eval\`, ${e.file})`),
    "",
    "## Start here",
    "",
    ...CHECK_PATH.map((step) => `- [${step.path}](${site}${step.path}): ${step.what}`),
    `- [Evidence for judges](${site}/for-judges): criteria table, evals, limits, architecture, data and privacy`,
    "",
    "## Product",
    "",
    ...ROUTES.filter((r) => r.path !== "/for-judges").map((r) => `- [${r.name}](${site}${r.path}): ${r.what}`),
    "",
    "## Evidence in code",
    "",
    ...EVIDENCE_IN_CODE.map((c) => `- [${c.path}](${codeLink(c.path)}): ${c.what}`),
    "",
    "## Code map",
    "",
    ...CODE_MAP.map((c) => `- [${c.path}](${codeLink(c.path)}): ${c.what}`),
    "",
    "## Limits",
    "",
    ...LIMITS.map((limit) => `- ${limit}`),
    "",
  ];
  return lines.join("\n");
}
