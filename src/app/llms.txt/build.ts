import { EVAL_RESULTS, EVAL_TESTS, UNIT_TESTS, VERIFIED_ON } from "@/app/for-judges/evidence";
import { CHECK_PATH, CODE_MAP, ENTRY, ENTRY_POINTS, KEY_FACTS, LIMITS, NAME, ROUTES, SUMMARY } from "@/app/for-judges/facts";

/** Where the rules that back the main claims live in the code. Each path exists in the repository. */
export const EVIDENCE_IN_CODE: readonly { path: string; what: string }[] = [
  { path: "src/lib/blind", what: "The blind layer: rules remove known personal details before any reviewer or model reads the work; some can remain" },
  { path: "src/lib/guard", what: "The no-judgement guard and the protected-attribute checks on every AI output" },
  { path: "src/lib/service/decisions.ts", what: "A decision needs the name of a reviewer registered for the company, the reviewer's points for each core skill and a written reason; without sign-in the name is not verified" },
  { path: "src/lib/domain/scoring.ts", what: "One fixed scale from 1 to 5 per skill and the total out of 10; points come only from a named reviewer" },
  { path: "src/lib/domain/places.ts", what: "Places per task, so an employer can read them all" },
  { path: "evals", what: "The eval suites behind the numbers above" },
];

/** Documents in the repository that explain and check the project. Each path exists. */
export const REPO_DOCS: readonly { path: string; what: string }[] = [
  { path: "README.md", what: "What it is, the criterion-by-criterion table with routes, files and tests, and the limits" },
  { path: "AGENTS.md", what: "Commands, folder map and the invariants, each with where it is enforced and checked" },
  { path: "docs/evals.md", what: "Every eval check and how to read its output" },
  { path: "docs/architecture.md", what: "How the parts fit together" },
  { path: "docs/responsible-ai.md", what: "Human oversight, data minimisation and the EU AI Act position" },
];

/**
 * /llms.txt in the llmstxt.org shape: an H1, the quoted first paragraph, dated numbers with the
 * commands that produce them, then H2 link lists, with an Optional list last. Built from the same typed facts as /for-judges,
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
    `${ENTRY.event} entry for the ${ENTRY.challengeBy} challenge "${ENTRY.challenge}". Live demo: ${site}.${repo ? ` Code: ${repo.replace(/\/$/, "")} (MIT).` : ""}`,
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
    `- [Full text](${site}/llms-full.txt): everything below in one markdown file, with every criterion, guardrail and eval row`,
    ...ENTRY_POINTS.filter((e) => !["/llms.txt", "/llms-full.txt", "/for-judges"].includes(e.path)).map((e) => `- [${e.title}](${site}${e.path}): ${e.what}`),
    ...CHECK_PATH.map((step) => `- [${step.path}](${site}${step.path}): ${step.what}`),
    `- [Evidence for judges](${site}/for-judges): criteria table, evals, limits, architecture, data and privacy`,
    `- [How it works](${site}/how-it-works): the product in six plain steps, what the AI does and never does, fair questions`,
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
    "## Optional",
    "",
    ...(repo ? [`- [Source code](${repo.replace(/\/$/, "")}): the repository, MIT licence`] : []),
    ...REPO_DOCS.map((d) => `- [${d.path}](${codeLink(d.path)}): ${d.what}`),
    "",
  ];
  return lines.join("\n");
}
