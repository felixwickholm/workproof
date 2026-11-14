# Tryout

Skip the CV. Do the work.

Tryout is a prototype for recruitment events. A company posts a short, real task. People do the task. A person at the company reads the work without seeing who wrote it, gives feedback, and picks who to meet.

## How it works

1. **Company.** Writes its need in one sentence. An AI draft turns it into a Problem Card: a 20-minute task, 3 to 5 core skills and a review guide. A person edits and approves it. Talent never sees the company's own sentence: the card shows the role and the core skills, rebuilt by the server.
2. **Talent.** Does the task. AI tools are allowed, because the task asks for judgment. Two follow-up questions ask about the person's own choices.
3. **Blind review.** Names, contact details, schools, places, employers and personal details are hidden by fixed rules before a reviewer or an AI model reads the work. The reviewer sees one neutral token, `[hidden]`, and one total. Above the work, an "At a glance" line built by code gives only its shape: points, length, code, and the opening words. The reviewer writes feedback and chooses Meet or Pass.
4. **Second look.** Opt-in. If the person turns it on and one employer passes or does not answer in 48 hours, employers whose tasks share core skills can read the same blind proof. The person can turn it off again from the passport. A person at that employer decides.
5. **Meeting.** The name is shown only after the person accepts the invitation. Both sides confirm that they met.
6. **City.** The event organiser sees outcomes: decisions, confirmed meetings and feedback owed by each employer.

## What the AI does, and does not do

The AI drafts tasks and asks two follow-up questions about the person's own answer. That is all. It never writes anything about a person's work for a reviewer. Removing identity and the "At a glance" line are fixed rules in code, not AI.

The AI never scores, ranks, rates or recommends a person. A guard in `src/lib/guard` rejects such text, and any protected attribute (age, gender, family, origin, native language, religion, health, schools, looks, "culture fit"), from every field of every AI output. It checks a normalised copy, so lookalike letters, zero-width characters and spaced-out words do not slip through. The server runs the same checks again before a card is published, and review guides may not contain points, counts or scales. On the Claude path the answer is passed to the model as data inside tags, and the questions must come back as exactly two short questions that pass the guard; otherwise the scripted questions are used. Review queues are ordered by arrival time. Every decision carries the name of the human who made it and is written to an audit log.

All companies, people and submissions in this repository are synthetic.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app needs no keys. Without `ANTHROPIC_API_KEY` it uses a scripted task designer with a library of roles. See `.env.example` for optional settings.

## Checks

```bash
npm test        # unit tests
npm run eval    # evals: task generator, blind review, no automated decisions, full flow
npm run eval:e2e  # end to end in a phone-sized browser; needs the app running
npm run lint
```

`npm run eval:e2e` drives the app at 390x844 with real clicks and typing: the 2-minute taster, a challenge with follow-ups and the passport, a company posting a task, blind review with Pass, Second look and Meet, acceptance, a confirmed meeting and the city totals, and the guided story. It fails on any console error or sideways scroll. Set `BASE_URL` to test another server, and `E2E_SHOTS=<folder>` to keep a screenshot of each failure. It fetches Playwright with npx; on a new machine run `npx playwright@1.64.1 install chromium` once.

| Eval | What it proves |
| --- | --- |
| Task generator | 20 needs become clear tasks with 3 to 5 skills; 47 needs that ask for protected attributes are published, and none of the strings each one planted appears in what talent sees |
| Blind review | Planted identity strings never reach the reviewer payload; 54 identity forms from a first review are hidden; 69 of 72 from a second review are hidden, and the 3 that are not are the limits named below; technical text stays intact |
| No automated decisions | AI output holds no scores, rankings or counts; the "At a glance" line follows a fixed shape; every decision has a named person and real feedback |
| Consent and privacy | Only the person can accept a meeting; no talent id in any company or city response; identity cannot be overwritten; biased cards are refused; Second look is opt-in and can be withdrawn; request size and rate are bounded |
| Flow | Draft, approve, submit, pass, Second look, meet, accept, confirm |
| End to end | The same story through the real interface on a phone-sized screen |

## Structure

```
src/app            pages and API routes
src/components     interface components
src/lib/ai         task designer (scripted, optional Claude adapter)
src/lib/blind      redaction, the "At a glance" line and the reviewer projection
src/lib/guard      no-judgement guard, protected attributes, text normalising, draft checks
src/lib/matching   second look
src/lib/service    rules for submissions, decisions, meetings and sharing
src/lib/skills     shared skill vocabulary
src/lib/domain     types and decision rules
src/lib/http       request limits, schemas and responses
src/lib/client     browser-side API calls and local state
src/lib/store      data store
src/lib/seed       synthetic event data
src/lib/util       small helpers
evals              evals and fixtures
```

## Limits

The blind layer is a set of rules, not a guarantee. It finds the author's own name in many spellings, inside identifiers and file names, spaced out or with digits for letters, self-introductions in several languages, signatures, author lines in code, contacts, ids, residence status, degree years, and listed schools, places and employers. It cannot know an unusual name of a third person written in running text ("my mentor Pekka Halonen"), another spelling of the author's own name ("Yusuf Alali" for "Youssef Al-Ali"), a place or employer that is on no list and not introduced by a phrase such as "I live in" or "worked at" (a lowercase "kone"), or identity described in a roundabout way. Dotted code names such as `flask.app` outside a code block can be hidden by mistake.

This is a no-login demo. Roles are chosen in the interface, and any caller can act as any company: a production version needs sign-in for companies and the city, and server-side ownership checks tied to it. The talent id kept in the browser is the person's private key. Each remote address may send 60 changing requests a minute, request bodies are capped at 128 kB, and the demo holds at most 500 proofs.

## Deploy

```bash
docker build -t tryout .
docker run -p 3000:3000 -v tryout-data:/app/.data tryout
```

## License

MIT
