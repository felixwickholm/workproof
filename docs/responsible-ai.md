# Responsible AI

The City of Espoo brief says automated profiling or automated decision-making about individuals without human involvement should not be part of the solution, and asks teams to minimise personal data and show how privacy would be protected under the EU AI Act. This page says what Workprint automates, what it leaves to people, and how the design relates to the rules.

This is a design position, not legal advice. A real deployment needs its own legal review.

## What is automated and what is not

| Step | Who does it | Where |
|---|---|---|
| Draft a task from a company's sentence | AI (scripted designer, or Claude or Gemini with a key) | `src/lib/ai` |
| Approve and publish the task | A named person at the company | `src/lib/service/challenges.ts` |
| Ask two follow-up questions about the person's own choices | AI, reading the answer after the blind layer | `src/lib/service/challenges.ts` |
| Hide identity in the work | Fixed rules in code, not AI | `src/lib/blind` |
| Describe the shape of the work ("At a glance") | Fixed code: points, words, code, opening words | `src/lib/blind/glance.ts` |
| Order the review queue | Arrival time only | `src/lib/service/views/queue.ts` |
| Read the work and decide Meet or Not now | A named person, with written feedback | `src/lib/service/decisions.ts` |
| Share a proof with a second employer | Only with the person's consent; a person there decides | `src/lib/matching/second-look.ts`, `src/lib/service/sharing.ts` |
| Reveal the name to a company | Only after the person accepts the meeting | `src/lib/service/meetings.ts` |

No AI output is ever about a person. The guard (`src/lib/guard/no-judgement.ts`, `src/lib/guard/protected.ts`) rejects scores, ranks, verdicts and protected attributes in every AI output, and the server checks a card again when a person publishes it.

## Human oversight

- Every decision needs a reviewer name and feedback of at least 4 words and 20 characters (`src/lib/domain/decision-rules.ts`). A "no" needs a written reason too.
- The name must belong to a person registered to decide for that company (`src/lib/service/reviewers.ts`). Any other name is refused with HTTP 403 until the person adds themselves, an explicit step that is logged; a name that reads as software ("AI bot") is refused with "A decision needs a named person."
- Every decision is written to the audit log with `actor: "human"` and the reviewer's name. 0 automated decisions: the API has no path for one, every decision names a registered person, and the audit log is counted, not assumed (`src/lib/service/views/automated.ts`, shown in `src/components/city/ai-ledger.tsx`).
- A reviewer never sees a count of hidden details. Every reviewer reads the same line: "Personal details are hidden before anyone reads the work."
- The review guide tells the reviewer what to look for in words, never on a scale (`src/components/company/review-guide.tsx`).

## Logging

The audit log records: AI drafts and follow-up questions, details hidden per proof, the "At a glance" count, consent recorded or withdrawn, each human decision, invitations, acceptance and confirmations. Entries name an actor (`ai`, `human` or `system`) and never contain the person's identity. See `appendAudit` in `src/lib/service/support.ts`.

## Consent

- Second look is off until the person turns it on. They can turn it off at any time from the passport. Employers who have not answered yet can no longer read the proof. An employer that already answered keeps its decision and its own feedback, but no longer sees the proof text unless a meeting was accepted.
- The name and contact reach one company only when the person accepts that company's invitation.
- Only the person, with their private key, can accept or confirm a meeting. Eval 4 checks this (`evals/privacy.eval.ts`).

## Data minimisation

- No account, no CV and no profile. The person confirms that a picture shows only the work, not themselves; pictures are not analysed. A reviewer can report a picture as possibly identifying, and it is then removed for every reader.
- Facts about the job (a work language, a language level, a licence) are shown to talent in fixed forms under "Good to know". A wish for a native speaker is set aside with "Ask for a language level, not a native speaker."
- An event proof needs a name and one contact, so the company can reach the person after they accept. A practice task on `/try` asks for a first name only, and it can be skipped.
- The person's key stays in their browser (`src/lib/client/local.ts`) and travels in a request header, never in an address (`src/lib/http/talent-key.ts`). No company or city response carries it: 0 of 31 in eval 4.
- The table's big screen shows labels, tasks and counts, never a visitor's free text, and a name only after its person accepted on the phone. A visitor can decline; the name then never shows.
- Photos are re-encoded in the browser to a JPEG without metadata (`src/components/seeker/picture.ts`); the server refuses a JPEG that still carries an EXIF or XMP segment (`src/lib/http/jpeg.ts`).
- Voice: only the transcript is stored. With a server key, audio goes once to the speech service and is not saved (`src/lib/voice/server/elevenlabs.ts`). Browser speech recognition may send audio to the browser vendor's service; the voice sheet says so.
- The city sees counts and proof labels, never people.
- Not built: retention periods and deletion on request. A pilot needs both.

## EU AI Act

Regulation (EU) 2024/1689 lists AI systems intended for the recruitment or selection of natural persons, including systems that analyse and filter applications and evaluate candidates, as high-risk (Annex III, point 4). Workprint is a recruitment tool, so this matters.

Our design position:

- The AI in Workprint does not evaluate, filter, rank or profile candidates. It drafts a task from a company's need and asks two questions about the person's answer. People read the work and decide.
- Article 6(3) of the Regulation describes cases where an Annex III system is not considered high-risk, for example when it performs a narrow procedural task or a preparatory task, and says a system that profiles natural persons is always high-risk. Workprint is designed to stay inside that narrow role. Whether the exemption applies is a legal assessment the provider must document (Article 6(4)); we have not made that assessment.
- If scoring, ranking or profiling of people were ever added, the system would be high-risk. The guard and the evals are there to keep that from happening by accident.
- The features that match the Regulation's high-risk duties are built anyway: human oversight (Article 14), logs of what the system did (Article 12), and telling people when AI was involved (the task page and the city view say what the AI drafted).
- Workprint does not analyse voices or faces. Emotion recognition in the workplace is prohibited under Article 5.

## GDPR Article 22

Article 22 of the GDPR gives a person the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significantly affects them. In Workprint no decision about a person is automated: a named human decides every Meet or Not now after reading the work, and must write why. The city view shows this count, 0, and eval 3 checks it.

Other GDPR principles the design follows: data minimisation (Article 5(1)(c)) and data protection by design (Article 25). A pilot run by the city would also need a data protection impact assessment (Article 35), a privacy notice and a lawful basis, none of which this prototype provides.

## Limits

- Pictures are not analysed. The person confirms that the picture shows only the work, and a reviewer can report one; a reported picture is removed for every reader. Nothing checks what a picture shows automatically.
- AI-written work is reduced, not solved. Two follow-up answers about the person's own choices and a meeting that starts from the work make a copied answer harder to stand behind. The product cannot prove who typed an answer.
- Impact is not measured yet. Every outcome in the demo is invented data. The first real test is a pilot event.
- Reviewing takes employer time. A task takes 5 to 30 answers and the employer home shows the reading time owed, but reading still takes a person's time.
- The blind layer is rules, not a guarantee. It misses a lowercase name with no cue word, a bare name with no introduction, another person's name, another spelling of the author's name, and part of an employer name that is not on the list. It over-hides a one-word capitalised sign-off and a capitalised value after "name:" outside a code block.
- Company and city actions have no sign-in. In the demo anyone can act as any company or as the city.

## What a pilot would add

- Sign-in for companies and the city, and ownership checks on every route.
- A documented risk assessment of the AI's role, and a data protection impact assessment.
- Retention periods, deletion on request, and an export for the person.
- An accessibility audit against WCAG 2.1 AA.
