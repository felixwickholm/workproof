# Evals and tests

Four kinds of checks. All but the end-to-end run need no server, no keys and no network.

| Kind | Command | Where | Duration |
|---|---|---|---|
| Unit tests | `npm test` | `*.test.ts` next to the code in `src/` | about 5 s |
| Evals | `npm run eval` | `evals/*.eval.ts`, fixtures in `evals/fixtures` | about 3 s |
| Live AI check | `npm run check:ai` | `evals/live-ai.eval.ts` via `scripts/check-ai.mjs` | seconds per provider; skipped without keys |
| End to end | `npm run eval:e2e` | `evals/e2e` | minutes; needs the app running |

## Results

<!-- evidence:start -->
Measured on 2026-11-14 with `npm run evidence`, which runs both commands and copies their totals here:

- `npm test`: 2049 of 2049 unit tests pass, in 141 files.
- `npm run eval`: 64 of 64 eval tests pass, in 7 files. The live-AI file is skipped without a key.

The full table `npm run eval` printed in that run:

| Eval | Check | Result |
|---|---|---|
| 1 Task generator | shape (title, brief, 3-5 skills, minutes, guide) | 20 of 20 drafts in shape |
| 1 Task generator | no protected attribute in visible fields | 0 protected attributes found in 20 drafts |
| 1 Task generator | bias bait set aside | 3 of 3 baited drafts set it aside |
| 1 Task generator | fantasy profiles cut to <= 4 skills | 3 of 3 fantasy profiles cut |
| 1 Task generator | drafts pass the guard | 0 judging phrases found in 20 drafts |
| 1 Task generator | sentence-form needs keep their skills | 4 of 4 needs kept their skills |
| 1 Task generator | adversarial needs: planted strings in published cards | 0 planted strings found in 47 published cards from 47 needs |
| 1 Task generator | job facts published as requirements | 6 of 6 needs carry their facts as requirements only |
| 2 Blind review | planted strings in reviewer payload | 0 of 79 planted strings found |
| 2 Blind review | identity keys in proof payloads | no identity keys found |
| 2 Blind review | identity hidden until accepted | hidden, then shown |
| 2 Blind review | review cases hidden | 54 of 54 cases fully hidden |
| 2 Blind review | second review cases hidden | 69 of 72 cases fully hidden, 3 known limits |
| 2 Blind review | visitor inputs from the table | 40 of 40 forms fully hidden; 16 of 16 technical texts unchanged |
| 2 Blind review | technical text left intact | 5 of 5 answers unchanged |
| 2 Blind review | reviewer payload: [hidden] only, no count | one token, no count, no categories |
| 2 Blind review | unique proof labels | 279 distinct labels for 279 proofs |
| 3 No automated decisions | (a) guard: judging rejected | 70 of 70 judging phrases rejected |
| 3 No automated decisions | (a) guard: neutral passed | 33 of 33 neutral phrases passed |
| 3 No automated decisions | (b) designer output passes the guard | 575 of 575 text fields from 32 designer outputs (20 drafts, 12 follow-up sets) |
| 3 No automated decisions | (b2) 'At a glance' is structure only | 12 of 12 lines describe shape only |
| 3 No automated decisions | (c) queues in arrival order | every queue of 28 companies |
| 3 No automated decisions | (d) decisions need reviewer and feedback | refused: HTTP 400 for a decision without a name, HTTP 400 without feedback; 48 stored decisions all named |
| 3 No automated decisions | (e) automated decisions | 0 automated decisions; 0 decision audit lines by a non-human |
| 3 No automated decisions | (f) decisions name a registered person | refused: HTTP 400 for "AI bot", HTTP 403 for an unregistered name, HTTP 400 for a bot as reviewer; accepted after the explicit step: HTTP 200 |
| 3 No automated decisions | (g) scores only from a registered person | refused: HTTP 400 without scores, HTTP 400 with a skill missing, HTTP 400 from a software name; accepted: a named reviewer's 6 of 10 |
| 3 No automated decisions | (h) related parts carry no score | 0 numbers and 0 judging phrases in 38 marked sentences from 53 proofs |
| 3 No automated decisions | (i) portfolio shows own scores, never a rank | 7 cards newest first, 6 reviewer scores shown to the owner, 0 rank keys, skill bars as task counts; a link shows no name, contact or key, the score and decision only when shown, and stops when ended |
| 4 Consent and privacy | accept and confirm need the right party | refused: HTTP 400 with no key, HTTP 403 with a wrong key, HTTP 403 for a guessed talent confirm, HTTP 403 for another company's confirm |
| 4 Consent and privacy | talent ids in public responses | 0 of 47 talent ids found in company and city responses |
| 4 Consent and privacy | seeker pictures in public responses | 0 of 36 pictures of people who have not said yes found |
| 4 Consent and privacy | private key in a header only | header read, path form gone, key absent from the audit log |
| 4 Consent and privacy | hidden count shown to the author only | 0 reviewer responses with a count or categories; author sees the count: true |
| 4 Consent and privacy | identity locked after first event proof | kept |
| 4 Consent and privacy | server rejects biased or judging cards | refused: HTTP 400, HTTP 400, HTTP 400 for biased, fake-skill and judging cards; HTTP 200 for the clean card |
| 4 Consent and privacy | reviewer '.' and dotted feedback rejected | refused: HTTP 400 for reviewer ".", HTTP 400 for dotted feedback |
| 4 Consent and privacy | follow-ups read the redacted answer | no identity |
| 4 Consent and privacy | Second look: opt-in, owner-only, withdrawable | off by default: true; HTTP 403 for a stranger's switch; HTTP 403 for a decision after withdrawal |
| 4 Consent and privacy | company's own sentence kept from talent | rebuilt need only |
| 4 Consent and privacy | body cap and rate limit | HTTP 413 for a text body over its cap, HTTP 413 for a submission over its cap; request 61 from one address: HTTP 429; story step after that: HTTP 200 |
| 4 Consent and privacy | pictures: clean JPEG only, description blind | refused: HTTP 400, HTTP 400, HTTP 400, HTTP 400, HTTP 400 for EXIF, a /demo path, PNG, video, 1 byte over 300 kB; accepted: HTTP 200 at 300 kB, HTTP 200 clean |
| 4 Consent and privacy | pictures: the person's own check is required | refused: HTTP 400 without the check, HTTP 400 unchecked; accepted: HTTP 200 checked |
| 4 Consent and privacy | pictures: a report removes the picture for everyone | refused: HTTP 403 for a company that cannot read it, HTTP 400 without a name; reported: HTTP 200; picture in responses after: false |
| 4 Consent and privacy | a submission with invented questions is refused | HTTP 400 without issued questions, HTTP 400 with invented ones, HTTP 409 for changed words, HTTP 200 with the issued ones, HTTP 409 for a second proof to the same task |
| 4 Consent and privacy | follow-up answers are required | event: HTTP 400 with none, HTTP 400 with one, HTTP 400 with a blank one, HTTP 200 with two; practice: HTTP 400 with none, HTTP 200 with one |
| 4 Consent and privacy | practice proof keeps no name | HTTP 200; the given name in the store: nowhere |
| 4 Consent and privacy | decline keeps the name hidden | HTTP 403 for a stranger; status after decline: declined, after a later accept: declined; name in responses: false |
| 4 Consent and privacy | Second look withdrawal reaches decided proofs | work shown to the Second look employer after withdrawal: false; its decision kept: true |
| 4 Consent and privacy | identity strings sent to a model | 0 of 48 checks found a planted string in 6 requests (draft, practice task, follow-ups; Claude and Gemini) |
| 4 Consent and privacy | city: slots and labels, never names | 0 names, contacts or keys in city responses, task leaderboards, share matches and the meeting export over 4 story stages, "met" included |
| 4 Consent and privacy | top proofs and shared work stay blind | 0 identity strings in the top list and the receiving queue; shared: HTTP 200; scores sent along: false |
| 5 Flow (API) | seed has 28 companies | ok |
| 5 Flow (API) | taster is a 2-minute task | ok |
| 5 Flow (API) | AI drafts a Problem Card | ok |
| 5 Flow (API) | a human approves and it is published | ok |
| 5 Flow (API) | two follow-ups about the answer | ok |
| 5 Flow (API) | submission returns a blind proof | ok |
| 5 Flow (API) | Second look is off until the person turns it on | ok |
| 5 Flow (API) | company A sees it in its own queue | ok |
| 5 Flow (API) | company A passes with feedback, once | ok |
| 5 Flow (API) | company B sees it through Second look | ok |
| 5 Flow (API) | company C without shared skills cannot see or decide | ok |
| 5 Flow (API) | company B picks Meet and a slot is set | ok |
| 5 Flow (API) | identity hidden while invited | ok |
| 5 Flow (API) | passport shows both responses | ok |
| 5 Flow (API) | talent accepts and identity appears | ok |
| 5 Flow (API) | both sides confirm the meeting | ok |
| 5 Flow (API) | city totals change and show 0 automated decisions | ok |
| 5 Flow (API) | places outside 5 to 30 are refused | ok |
| 5 Flow (API) | the employer's number of places is published with the task | ok |
| 5 Flow (API) | all five places take work | ok |
| 5 Flow (API) | the sixth answer is refused with 409 and no waiting list | ok |
| 5 Flow (API) | v3: a named reviewer scores the work and holds it, no meeting yet | ok |
| 5 Flow (API) | v3: the scored proof is on the task's top list, blind | ok |
| 5 Flow (API) | v3: the hold becomes an invitation | ok |
| 5 Flow (API) | v3: the person accepts, and only then the company sees the name | ok |
| 5 Flow (API) | v3: both sides confirm the talk | ok |
| 5 Flow (API) | v3: a follow-up is agreed and a hire recorded by the company | ok |
| 5 Flow (API) | v3: the city counts every step for the task, with no name | ok |
| 6 Demo story (API) | session: persona and stage | Mikko Lahtinen, invited |
| 6 Demo story (API) | unknown stage refused | HTTP 400 for an unknown stage |
| 6 Demo story (API) | before and sent | 2 proofs before, 3 after sending; story proof queued: true |
| 6 Demo story (API) | invited: open invitation from the story company | Halla Supply wants to meet you. |
| 6 Demo story (API) | met: accepted, name shown, talk and follow-up counted | proofs met: 6 before, 7 after; follow-ups: 5 before, 6 after |
| 6 Demo story (API) | persona hidden from employer and city | hidden |
| 7 Table screen | no free text on the public screen | 0 of 10 names, emails and numbers found; extra fields: none |
| 7 Table screen | name only after the person's yes | second invite HTTP 409; stranger read HTTP 403, accept HTTP 403; name on screen before yes: false, after: Mikko |
| 7 Table screen | decline stores nothing | declined; a later accept HTTP 409; name on screen: false; event proof invite HTTP 409 |
<!-- evidence:end -->

The counts change as the code changes. `npm run evidence` runs both commands again and rewrites this block, the README block and `src/app/for-judges/evidence.ts` with the same figures; it writes nothing when a check fails.

## How the evals run

Each eval calls the real route handlers directly, with a real `Request` and async params, the way Next.js calls them (`call` in `evals/helpers.ts`). There is no sandbox cookie in an eval, so every call uses the default store, and each suite starts with `POST /api/demo/reset`. The live AI is off, so the scripted designer answers; the same guard runs on it.

Each check records one row with `record(...)`. After all files have run, `evals/summary.setup.ts` prints a table:

```
Eval                      Check                                  Result        Status
3 No automated decisions  (a) guard: judging rejected            70/70         pass
```

Read it per row: the Result column is the measured number, Status is `pass` or `FAIL`. The vitest totals above the table are what decides success. Each section below says what its eval checks; the measured results are in the table under Results. The table rows go through a file in the OS temp folder; two eval runs at the same moment on one machine can lose each other's rows, so give each run its own `TMPDIR` if you run them in parallel.

## Eval 1: task generator (`evals/task-generator.eval.ts`)

Fixtures: `evals/fixtures/needs.ts` (20 needs: 15 tech, 5 other, 3 "fantasy profiles" with long wish lists, 3 with bias bait; 4 needs written as sentences; 47 adversarial needs that plant protected wishes).

| What is checked |
|---|
| Shape: title, brief, deliverable, 3 to 5 core skills, 2 to 30 minutes, a review guide line for each skill, brief under 120 words |
| No protected attribute in any field talent sees |
| Bias bait lands in "set aside" as "Not used: ..." |
| Fantasy profiles cut to 4 skills or fewer, with 3 or more wishes set aside |
| Drafts pass the no-judgement guard |
| Needs written as a sentence keep their skills |
| Adversarial needs: drafted, published, then read through the public route; none of the planted strings appear |

## Eval 2: blind review (`evals/blind-review.eval.ts`)

Fixtures: `evals/fixtures/submissions.ts` (12 submissions with planted identity), `evals/fixtures/redaction-cases.ts` (54 cases), `evals/fixtures/redaction-cases-2.ts` (72 cases from a second review; 3 are marked `knownLimit`).

| What is checked |
|---|
| Planted identity strings found anywhere in the serialized reviewer queue |
| Identity keys (`name`, `contact`, `email`, `talentId`, ...) in proof payloads |
| Identity hidden while invited, shown after the person accepts |
| First case set hidden |
| Second case set hidden |
| Ordinary words and technical text left unchanged ("Will May", `flask.app`, "GroupShuffleSplit at Scale") |
| Reviewer sees one `[hidden]` token, never a count of hidden details or their categories |
| Proof labels unique |

The three known limits in the second case set, also in the README: a third person's name in running text, another spelling of the author's own name, and an employer on no list. More broadly the rules miss a lowercase name with no cue word, a bare name with no introduction, another person's name, another spelling of the author's name, and part of an employer name that is not on the list; they over-hide a one-word capitalised sign-off and a capitalised value after "name:" outside a code block.

## Eval 3: no automated decisions (`evals/no-automated-decisions.eval.ts`)

| What is checked |
|---|
| (a) The guard rejects judging phrases: scores, stars, percent matches, ranks, verdicts, "Hire.", "Reject.", Finnish and Swedish verdicts |
| (a) The guard passes neutral task text ("Retry 3 times", "97% accuracy on the test set") |
| (b) Every AI output from the drafts and follow-ups passes the guard |
| (b2) The "At a glance" line matches the fixed template and names no topic |
| (c) Every queue of every company is in arrival order |
| (d) A decision without a reviewer name or with short feedback is refused, and every stored decision is named; a name not registered for the company is refused until the person adds themselves, and a name that reads as software cannot be registered |
| (e) The city reports 0 automated decisions and the audit log has no decision by a non-human actor |
| (g) A decision without the reviewer's points, or with a skill missing, is refused; a software name cannot score; a named reviewer's points give the total out of 10 |
| (h) Related parts carry no number and no judging phrase |
| (i) The person's portfolio shows each reviewer's own score to the person, never a rank or comparison, and a shared link carries no identity |

## Eval 4: consent and privacy (`evals/privacy.eval.ts`)

| What is checked |
|---|
| Accept and confirm need the right party (no key 400; wrong key 403; other company 403) |
| Talent ids in any company or city response, after a meeting was accepted |
| Identity locked after the first event proof |
| A published card passes the same checks as an AI draft (biased title, fake skill, judging guide) |
| Reviewer "." and dotted feedback refused |
| Follow-up writer reads only the redacted answer |
| Second look: off by default, only the owner can switch it, withdrawal takes the proof out |
| The company's own sentence and set-aside wishes never reach talent |
| Body size cap and per-address rate limit; story steps keep their own count |
| Pictures: EXIF JPEG, `/demo` path, PNG, "video" and oversize refused; clean JPEG accepted; description blind |

## Eval 5: flow (`evals/flow.eval.ts`)

Three tests, 28 steps in the measured table. The first walks the whole product through the API in 17 steps: seed, taster, AI draft, human approval, two follow-ups, blind proof, Second look off by default, company A's queue, company A says not now with feedback, company B sees it through Second look, company C without shared skills cannot, company B chooses Meet, identity hidden while invited, the passport shows both answers, the person accepts and identity appears, both sides confirm, city totals change with 0 automated decisions. The second checks places in 4 steps: places outside 5 to 30 are refused, the number is published with the task, five places take work, and the sixth answer is refused with 409. The third follows the scored flow in 7 steps: a named reviewer scores and holds the work, the scored work is on the task's top list without a name, the hold becomes an invitation, the person accepts and only then the company sees the name, both sides confirm the talk, a follow-up and a hire are recorded by the company, and the city counts every step with no name.

## Eval 6: demo story (`evals/story.eval.ts`)

| What is checked |
|---|
| Session returns the persona and stage |
| Unknown stage refused |
| `before` then `sent`: 2 then 3 proofs; the story proof is queued |
| `invited`: open invitation from Halla Supply, the story company |
| `met`: accepted, name shown, the talk and the follow-up counted by the city |
| Company and city views never carry the persona's key or name before he accepts |

## Live AI (`evals/live-ai.eval.ts`)

Runs only from `npm run check:ai`, which loads `.env` and sets `WORKPROOF_LIVE_AI=1`. For each provider with a key it calls the real adapter without the scripted fallback, so a failure shows: three checks per provider (a task draft, a taster, a pair of follow-ups, each checked by the guard), which make four designer calls, since the follow-up check first drafts a taster to ask about. A retry inside an adapter can add HTTP requests. Keys are never printed.

## Unit tests

The adapters are tested against mocked HTTP (`src/lib/ai/provider/adapters.test.ts`): malformed JSON, the wrong shape, a draft that scores a person, a protected attribute, 401 without retry, 429 with one retry, a timeout, and an injection inside the answer tags. Other groups cover the blind layer (`src/lib/blind/*.test.ts`), the guard (`src/lib/guard/*.test.ts`), the views (`src/lib/service/views/*.test.ts`), the seed and Mikko's story (`src/lib/seed/index.test.ts`), sandboxes (`src/lib/store/sandbox.test.ts`), voice (`src/lib/voice/**/*.test.ts`), the walkthrough machine, steps and placement (`src/components/tour/*.test.ts`), the evidence page (`src/app/for-judges/facts.test.ts`), its structured data (`src/app/for-judges/json-ld.test.ts`), the two text maps (`src/app/llms.txt/build.test.ts`, `src/app/llms-full.txt/build.test.ts`) and robots and the sitemap (`src/app/seo.test.ts`).

## End to end (`evals/e2e`)

`npm run eval:e2e` fetches Playwright 1.64.1 with npx and drives the running app in Chromium at 390x844 with touch, real clicks and typing:

- `evals/e2e/main-flow.mjs` runs the suites in `evals/e2e/suites`: the entry (`/` opens the Job seeker home, the three view names, no retired landing or CV copy), the 2-minute task and the table loop (invite, accept, decline), a task with follow-ups and the passport, blind review (no count of hidden details on screen; a decision signed "AI bot" refused; a new reviewer added in one step), Not now, Second look and Meet, acceptance, a confirmed meeting and the city totals, a company posting a task (wishes set aside, job facts under "Good to know", places), a guardrail crawl of every route in both themes, and the key screens at 1440x900.
- `evals/e2e/story.mjs`: the 17-card walkthrough, step by step.

Every step fails on any browser console error or uncaught page error (`watchErrors` in `evals/e2e/harness.mjs`). After a failed step the rest of its suite is skipped, since each step builds on the one before; `E2E_KEEP_GOING=1` runs them anyway. `BASE_URL` points it at another server; `E2E_SHOTS=<folder>` keeps a screenshot of each failure. On a new machine run `npx playwright@1.64.1 install chromium` once.

Output: one line per step with `pass`, `FAIL` or `skip` and its time, then "N/N steps passed". The exit code is 0 only when every step passed. Run it against a production build (`next build`, then `next start`) for the result quoted in the README.
