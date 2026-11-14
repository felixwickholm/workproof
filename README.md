# Tryout

Skip the CV. Do the work.

Tryout is a prototype for recruitment events. A company posts a short, real task. People do the task. A person at the company reads the work without seeing who wrote it, gives feedback, and picks who to meet.

## How it works

1. **Company.** Writes its need in one sentence. An AI draft turns it into a Problem Card: a 20-minute task, 3 to 5 core skills and a review guide. A person edits and approves it.
2. **Talent.** Does the task. AI tools are allowed, because the task asks for judgment. Two follow-up questions ask about the person's own choices.
3. **Blind review.** Names, contact details, schools, places and employers are removed before a reviewer sees the work. The reviewer writes feedback and chooses Meet or Pass.
4. **Second look.** If one employer passes, employers whose tasks share core skills can read the same proof. A person there decides.
5. **Meeting.** The name is shown only after the person accepts the invitation. Both sides confirm that they met.
6. **City.** The event organiser sees outcomes: decisions, confirmed meetings and feedback owed by each employer.

## What the AI does, and does not do

The AI drafts tasks, removes identity from text and describes what a work sample contains.

The AI never scores, ranks, rates or recommends a person. A guard in `src/lib/guard` rejects such text from any AI output. Review queues are ordered by arrival time. Every decision carries the name of the human who made it and is written to an audit log.

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
npm run lint
```

| Eval | What it proves |
| --- | --- |
| Task generator | 20 needs become clear tasks with 3 to 5 skills and no protected attributes |
| Blind review | Planted identity strings never reach the reviewer payload |
| No automated decisions | AI output holds no scores or rankings; every decision has a named person |
| Flow | Draft, approve, submit, pass, second look, meet, accept, confirm |

## Structure

```
src/app            pages and API routes
src/components     interface components
src/lib/ai         task designer (scripted, optional Claude adapter)
src/lib/blind      redaction and the reviewer projection
src/lib/guard      no-judgement guard
src/lib/matching   second look
src/lib/service    rules for submissions, decisions and meetings
src/lib/store      data store
src/lib/seed       synthetic event data
evals              evals and fixtures
```

## Deploy

```bash
docker build -t tryout .
docker run -p 3000:3000 -v tryout-data:/app/.data tryout
```

## License

MIT
