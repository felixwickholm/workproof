# AGENTS.md

A map for automated reviewers and coding agents. Plain facts and commands; verify anything here against the code.

## What this is

WorkProof is a prototype for recruitment events run by the City of Espoo. A company posts a short real task, a person does it, and a named human at the company reads the work blind, scores it from 1 to 5 on each core skill, writes feedback and chooses Meet or Not now, then or later; the name is shown only after the person accepts.
AI drafts tasks and follow-up questions only. It never scores, ranks or recommends a person.
Next.js 16 (App Router), React 19, TypeScript strict, zod at the API edge, Vitest. No database, no login, no keys needed. All data is synthetic.

## Run, test, evaluate

| Command | What it does | Expected |
|---|---|---|
| `npm install` | Installs dependencies | Node.js 22 or newer |
| `npm run dev` | Dev server on http://localhost:3000 | Ready in a few seconds |
| `npm test` | Unit tests next to the code (`vitest run src`) | All pass, about 5 s |
| `npm run eval` | Eval suites in `evals/` (`vitest run evals`); prints one row per check | All pass (live-AI file skipped without a key), about 3 s |
| `npm run evidence` | Runs both suites and writes the measured figures to `src/app/for-judges/evidence.ts`, README.md and docs/evals.md | Writes nothing when a check fails |
| `npm run lint` | ESLint | Clean, about 5 s |
| `npx tsc --noEmit` | Type check | Clean, about 2 s |
| `npm run eval:e2e` | Playwright through the real UI at 390x844; needs the app running (`BASE_URL` to point elsewhere) | Prints "N/N steps passed"; takes minutes |
| `npm run check:ai` | Four live designer calls per AI provider with a key (a retry can add requests) | Skips without keys |

Current counts and their meaning: [docs/evals.md](docs/evals.md). The eval summary table is written to a file in the OS temp folder; two eval runs at the same time on one machine can drop each other's rows (the tests themselves still pass or fail correctly). Set `TMPDIR` per run to avoid it.

## Folder map

```
src/app                pages per mode, the JSON API in src/app/api, /for-judges, /llms.txt, /llms-full.txt, robots, sitemap
src/proxy.ts           sets the httpOnly sandbox cookie; ?table=<code> redirects to /api/demo/join
src/components         UI: shell (mode switcher), landing, tour, proof, seeker, company, city, table, voice, controls, ui
src/lib/domain         types.ts (the domain model), decision-rules.ts, scoring.ts (the 1 to 5 scale and the total), feedback-check.ts, places.ts, guardrails.ts (fixed sentences), kinds.ts
src/lib/service        rules: challenges, submissions, decisions, meetings, sharing, demo; views/ builds each mode's JSON
src/lib/blind          redaction rules, "At a glance" line, allow-list projection to BlindProof
src/lib/guard          no-judgement guard, protected attributes, draft checks, text normalising
src/lib/ai             scripted designer (default), Claude and Gemini adapters, provider layer, breaker, guarded wrapper
src/lib/voice          voice adapters (browser, ElevenLabs, typed) and the server proxy for ElevenLabs
src/lib/store          in-memory store, per-visitor sandbox registry, cookie helpers
src/lib/seed           the synthetic Espoo Talent Day and Mikko's story stages
src/lib/http           request limits, zod schemas, JPEG check, rate guard, responses
src/lib/matching       Second look: compares tasks by shared core skills, never people
evals                  eval suites, fixtures, and evals/e2e for the browser run
docs                   architecture, evals, responsible AI, demo script, screenshots
```

## Invariants (never break these)

| Invariant | Enforced in | Checked by |
|---|---|---|
| Identity (name, contact) lives only in `Talent`. | `src/lib/domain/types.ts`, `src/lib/service/talent.ts` | `evals/blind-review.eval.ts` ("identity keys in proof payloads"), `evals/privacy.eval.ts` ("talent ids in public responses") |
| Reviewers get `BlindProof`, built by an allow-list that names every field. Never build it by deleting fields. | `src/lib/blind/project.ts` (`toBlindProof`), `src/lib/service/views/queue.ts` | `src/lib/blind/project.test.ts` ("keeps out every field it does not name"), `evals/blind-review.eval.ts` |
| Software never scores, ranks or rates a person. Only a named reviewer gives points: 1 to 5 for each core skill of the task, with a written reason. The total out of 10 is the average points × 2. A decision without the reviewer's points is refused. AI output with a score, rank or verdict is rejected, and related parts carry no number. Decision words are Meet, Not now, and Score only, decide later. | `src/lib/domain/scoring.ts`, `src/lib/service/decisions.ts`, `src/lib/guard/no-judgement.ts`, `src/lib/guard/check-draft.ts`, `src/lib/ai/guarded.ts`, `src/lib/service/related.ts`, `src/components/company/score-panel.tsx` | `evals/no-automated-decisions.eval.ts` (a, b, b2, g, h, i), `src/lib/domain/scoring.test.ts`, `src/lib/guard/no-judgement.test.ts`, `src/lib/seed/index.test.ts` |
| Every decision carries a reviewer name and written feedback (at least 4 words, 20 characters). The name is on the company's list (`Company.reviewers`); any other name is refused with 403, a name that reads as software with 400. Without sign-in the name is not verified; never call it proof of a human. | `src/lib/domain/decision-rules.ts`, `src/lib/service/decisions.ts`, `src/lib/service/reviewers.ts` | `evals/no-automated-decisions.eval.ts` (d, e), `evals/privacy.eval.ts`, `src/lib/service/reviewers.test.ts` |
| An event task takes a fixed number of answers (5 to 30, default 12), so an employer can read them all. Never promise that every answer is read. | `src/lib/domain/places.ts`, `src/lib/service/submissions.ts` | `src/lib/domain/places.test.ts` |
| Reviewers never see a count of hidden details; every reviewer reads the same fixed line. | `src/lib/domain/guardrails.ts` (`REVIEWER_HIDDEN_LINE`) | `evals/e2e/suites/employer.mjs` |
| A request without the sandbox cookie reads the shared demo event and cannot change it. The private key is never in a URL: the `x-workproof-key` header on reads and table answers, the request body on submissions, meeting answers and sharing changes. | `src/lib/store/index.ts`, `src/lib/http/talent-key.ts` | `src/lib/store/index.test.ts`, `src/lib/http/talent-key.test.ts` |
| Code under `src/lib` never imports from `src/components`. | folder rule | review |
| Work waiting to be read is in arrival order. The only other order is a task's top work: scored proofs by the reviewers' own totals, highest first, ties by arrival. Software adds no order of its own. | `src/lib/service/views/queue.ts` (`byArrival`), `src/lib/service/views/leaderboard.ts` | `evals/no-automated-decisions.eval.ts` (c), `src/lib/service/views/leaderboard.test.ts` |
| The demo persona's talent id leaves the server only through `GET /api/demo/session`, to the visitor who owns the sandbox. | `src/lib/service/demo.ts`, `src/app/api/demo/session/route.ts` | `evals/story.eval.ts` ("persona hidden from employer and city") |
| Audio is never stored. Only the transcript is sent with a submission. | `src/lib/http/schemas.ts` (no audio field), `src/lib/voice/server/elevenlabs.ts` (passes audio through once) | `src/lib/voice/server/elevenlabs.test.ts` ("returns only the text"), `src/app/api/voice/routes.test.ts` |
| Identity reaches a company only after the person accepts the meeting. | `src/lib/service/views/queue.ts`, `src/lib/service/meetings.ts` | `evals/blind-review.eval.ts` ("identity hidden until accepted"), `evals/flow.eval.ts` |

## Conventions

- Colours and type through the theme tokens in `src/app/globals.css` (`ground`, `surface`, `raised`, `label`, `label-2`, `label-3`, `separator`, `fill`, `accent`), not raw hex values in components.
- Tests sit next to the code as `*.test.ts`. Evals live in `evals/` and call route handlers directly (`evals/helpers.ts`).
- No `console.log`. Console output is limited to one warning when a live AI call falls back (`src/lib/ai/index.ts`), store file warnings (`src/lib/store/memory.ts`), a render error warning (`src/app/error.tsx`) and unexpected server errors (`src/lib/http/respond.ts`). The end-to-end run fails on any browser console error.
- Short doc comments that say why. No commented-out code, no TODOs.
- Copy: short sentences, British spelling, no exclamation marks, no emoji. Fixed phrases come from the product copy in `src/components` and `src/app/for-judges/facts.ts`.
- Next.js 16: middleware is `src/proxy.ts`; route params are async; `cacheComponents` is on in `next.config.ts`. Read `node_modules/next/dist/docs/` before using an API you are not sure of.

## Verifying the judging criteria

- The README table "How it meets each judging criterion" gives a command, a route or a file to check each row; "How it answers each problem in the brief" gives a route, a code path and an eval number for every claim.
- `/for-judges` on the running app shows the same evidence as server-rendered text; its data is `src/app/for-judges/facts.ts` and `src/app/for-judges/evidence.ts`, and `src/app/for-judges/facts.test.ts` checks that every route and path it names exists.
- `/llms.txt` (short map) and `/llms-full.txt` (the whole evidence page as markdown) are built from the same facts (`src/app/llms.txt/build.ts`, `src/app/llms-full.txt/build.ts`); their tests check that every criterion, guardrail, limit and eval row is there. `/` and `/for-judges` carry schema.org JSON-LD from `src/app/for-judges/json-ld.ts`.
- `SITE_URL` sets the public address; a production build without it uses https://workproof.wicflow.com, because robots, the sitemap, metadata and the text maps are prerendered at build time. `REPO_URL` defaults to https://github.com/felixwickholm/workproof.
- Known limits are listed in the README under "Limits, stated honestly". They are deliberate disclosures.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
