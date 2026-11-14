# Responsible AI

The City of Espoo brief says automated profiling or automated decision-making about individuals without human involvement should not be part of the solution, and asks teams to minimise personal data and show how privacy would be protected under the EU AI Act. This page says what WorkProof automates, what it leaves to people, and how the design relates to the rules.

This is a design position, not legal advice. A real deployment needs its own legal review.

## What is automated and what is not

| Step | Who does it | Where |
|---|---|---|
| Draft a task from a company's sentence | AI (scripted designer, or Claude or Gemini with a key) | `src/lib/ai` |
| Approve and publish a company task | A named person at the company. Practice tasks on `/try` are generated without approval and go to no company. | `src/lib/service/challenges.ts` |
| Ask two follow-up questions about the person's own choices | AI. Text is redacted by the same rules before it reaches a model; the built-in designer runs without any model. | `src/lib/service/challenges.ts` |
| Remove known personal details from the work | Fixed rules in code, not AI. Rules can miss some; pictures are checked by the person, not by software. The person sees the result before sending. | `src/lib/blind` |
| Describe the shape of the work ("At a glance") | Fixed code: points, words, code, opening words | `src/lib/blind/glance.ts` |
| Order the work waiting to be read | Arrival time only | `src/lib/service/views/queue.ts` |
| Mark where each skill shows up in the work ("related parts") | Fixed code with cue words, not a model. It shows the person's own sentences, never a number. | `src/lib/service/related.ts` |
| Score the work, 1 to 5 for each core skill | A reviewer registered for the company, named on the decision, with written feedback. Not verified without sign-in. | `src/lib/service/decisions.ts`, `src/lib/domain/scoring.ts` |
| Add up the points and order a task's top work | Fixed code: the total out of 10 is the average points × 2; top work is highest total first, ties by arrival | `src/lib/domain/scoring.ts`, `src/lib/service/views/leaderboard.ts` |
| Decide Meet or Not now, then or later | The same named reviewer | `src/lib/service/decisions.ts` |
| Share a proof with a second employer | Only with the person's consent; a person there decides | `src/lib/matching/second-look.ts`, `src/lib/service/sharing.ts` |
| Reveal the name to a company | Only after the person accepts the meeting | `src/lib/service/meetings.ts` |

No AI output is ever about a person. The guard (`src/lib/guard/no-judgement.ts`, `src/lib/guard/protected.ts`) rejects scores, ranks, verdicts and protected attributes in every AI output, and the server checks a card again when a person publishes it.

## Human oversight

- Every decision needs a reviewer name, the reviewer's points for each core skill, and feedback of at least 4 words and 20 characters (`src/lib/domain/decision-rules.ts`, `src/lib/domain/scoring.ts`). A "no" needs a written reason too. A decision without the points is refused.
- The name must be on the company's list of people registered to decide for it (`src/lib/service/reviewers.ts`). Any other name is refused with HTTP 403 until the person adds themselves, an explicit step that is logged; a name that reads as software ("AI bot") is refused with "A decision needs a named person."
- WorkProof has no automated decision feature. A decision is recorded with the name of a reviewer registered for the company and a written reason. This demo has no sign-in, so the name is not verified: the server writes `actor: "human"` for any request that carries a listed name, and a script could send one. The city counts decisions without a registered name over the log (`src/lib/service/views/automated.ts`, returned as `automatedDecisions` by `GET /api/city` from `src/lib/service/views/city.ts`, and shown on `/how-it-works`); it is 0.
- A reviewer never sees a count of hidden details. Every reviewer reads the same line: "Personal details are removed by rules before review. Some can remain."
- Every reviewer scores on the same fixed scale, and each point has words, from "Not shown" (1) to "Shown well, with reasons" (5) (`SCORE_LEVELS` in `src/lib/domain/scoring.ts`). The person sees the scores and the reason (`src/lib/service/views/passport.ts`). A company that shares a proof with another company never shares its scores.

## Logging

The audit log records: AI drafts and follow-up questions, details hidden per proof, the "At a glance" count, consent recorded or withdrawn, each human decision, invitations, acceptance and confirmations. Entries name an actor (`ai`, `human` or `system`) and never contain the person's identity. See `appendAudit` in `src/lib/service/support.ts`.

## Consent

- Second look is off until the person turns it on. They can turn it off at any time from the passport. Employers who have not answered yet can no longer read the proof. An employer that already answered keeps its decision and its own feedback, but no longer sees the proof text unless a meeting was accepted.
- Accepting shows the name to that company only. The organiser sees slots and labels, never names.
- Only the person, with their private key, can accept an invitation. A meeting counts as met when both sides confirm. Eval 4 checks this (`evals/privacy.eval.ts`).

## Data minimisation

- No account and no profile. The person confirms that a picture shows only the work, not themselves; pictures are not analysed. A reviewer can report a picture as possibly identifying, and it is then removed for every reader.
- Facts about the job (a work language, a language level, a licence) are shown to talent in fixed forms under "Good to know". A wish for a native speaker is set aside with "Ask for a language level, not a native speaker."
- Before sending, the person sees what the company will read (`POST /api/preview`, nothing stored) and can go back to remove what the rules missed.
- An event proof needs a name and one contact, so the company can reach the person after they accept. A practice task on `/try` asks for a first name only, and it can be skipped.
- The person's key stays in their browser (`src/lib/client/local.ts`) and is never in an address: it travels in a header on reads and table answers, and in the request body on submissions, meeting answers and sharing changes (`src/lib/http/talent-key.ts`). No company or city response carries it: 0 of 47 in eval 4.
- The table's big screen shows labels, tasks and counts, never a visitor's free text, and a name only after its person accepted on the phone. A visitor can decline; the name then never shows.
- Photos are re-encoded in the browser to a JPEG without metadata (`src/components/seeker/picture.ts`); the server refuses a JPEG that still carries an EXIF or XMP segment (`src/lib/http/jpeg.ts`).
- Voice is planned, not live: every answer is typed, and no screen asks for a microphone. The planned server route keeps the rule that audio is never stored: it passes audio once to the speech service and returns only text (`src/lib/voice/server/elevenlabs.ts`). The speech service's own retention is outside this code.
- The city dashboard shows counts and proof labels, never people. The meeting export carries slots and labels, never names.
- Not built: retention periods and deletion on request. A pilot needs both.

## EU AI Act

Regulation (EU) 2024/1689 lists AI systems intended for the recruitment or selection of natural persons, including systems that analyse and filter applications and evaluate candidates, as high-risk (Annex III, point 4). WorkProof is a recruitment tool, so this matters.

Our design position:

- The AI in WorkProof does not evaluate, filter, rank or profile candidates. It drafts a task from a company's need and asks two questions about the person's answer. People read the work, score it and decide.
- Article 6(3) of the Regulation describes cases where an Annex III system is not considered high-risk, for example when it performs a narrow procedural task or a preparatory task, and says a system that profiles natural persons is always high-risk. WorkProof is designed to stay inside that narrow role. Whether the exemption applies is a legal assessment the provider must document (Article 6(4)); we have not made that assessment.
- People give every score in WorkProof. The software adds up a reviewer's points and sorts a task's scored work by that total; it adds no judgement of its own. If the AI ever scored, ranked or profiled people, the system would be high-risk. The guard and the evals are there to keep that from happening by accident.
- The features that match the Regulation's high-risk duties are built anyway: human oversight (Article 14), logs of what the system did (Article 12), and telling people when AI was involved (the task page and the city view say what the AI drafted).
- WorkProof does not analyse voices or faces. Emotion recognition in the workplace is prohibited under Article 5.

## GDPR Article 22

Article 22 of the GDPR gives a person the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significantly affects them. WorkProof has no automated decision feature: every Meet or Not now is recorded with the name of a reviewer registered for the company and a written reason. This demo has no sign-in, so the name is not verified; a pilot needs sign-in. The city view counts decisions without a registered name, 0, and eval 3 checks it.

Other GDPR principles the design follows: data minimisation (Article 5(1)(c)) and data protection by design (Article 25). A pilot run by the city would also need a data protection impact assessment (Article 35), a privacy notice and a lawful basis, none of which this prototype provides.

## Limits

- Pictures are not analysed. The person confirms that the picture shows only the work, and a reviewer can report one; a reported picture is removed for every reader. Nothing checks what a picture shows automatically.
- AI-written work is not solved. Our untested assumption: follow-up answers about a person's own choices, and a meeting that starts from the work, make AI-only answers easy to notice. This is not measured yet. The product cannot prove who typed an answer.
- Impact is not measured yet. Every outcome in the demo is invented data. The first real test is a pilot event.
- Reviewing takes employer time. A task takes 5 to 30 answers and the employer home shows the reading time owed, but reading still takes a person's time.
- The blind layer is rules, not a guarantee. It misses a lowercase name with no cue word, a bare name with no introduction, another person's name, another spelling of the author's name, and part of an employer name that is not on the list. It over-hides a one-word capitalised sign-off and a capitalised value after "name:" outside a code block.
- Company and city actions have no sign-in. In the demo anyone can act as any company or as the city, and a reviewer name is not verified.

## What a pilot would add

- Sign-in for companies and the city, and ownership checks on every route.
- A documented risk assessment of the AI's role, and a data protection impact assessment.
- Retention periods, deletion on request, and an export for the person.
- An accessibility audit against WCAG 2.1 AA.
