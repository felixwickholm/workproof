# Demo script

Two scripts: a 2-minute click path a judge can follow alone, and a 90-second spoken demo at the table for peer review. Both use the live demo (link at the top of the README) or `npm run dev` on http://localhost:3000. Each visitor gets a private copy of the demo event, so nothing you do changes anyone else's demo.

## 2 minutes, alone (judge)

| Time | Do this | Look for |
|---|---|---|
| 0:00 | Open `/`. | "Skip the CV. Do the work." and the counts under the map, with "0 automated decisions". |
| 0:10 | Press "See it in 2 minutes". Press Next on each card. | Nine steps over the real app. The tour sets the story stage and opens each page itself. |
| 0:25 | Step 3 and 4, Olena's proof. | Left: what she wrote, with the hidden details marked. Right: what the company reads, with 7 details hidden. The spoken follow-up is shown as text. |
| 0:45 | Step 5 and 6, Anna at Kaari Home Care. | The queue is in arrival order, with no names and no scores. Anna's decision has her name and a written reason. |
| 1:05 | Step 7, Olena accepts. | Only now does Kaari see her name. Her earlier plan, which another employer could not use, reached Otso Health through Second look, with her consent. |
| 1:20 | Step 8, the city view. | Written answers, answers still owed per employer, meetings both sides confirmed, 0 automated decisions. |
| 1:30 | Close the tour. Open `/company` from the Hiring mode. Type a sentence with a biased wish and a fact, for example "Nurse for our ward: work language English, valid nurse licence, elderly clients, native Finnish speaker". | The draft keeps 3 to 5 core skills, shows the language and the licence under "Good to know", and sets the native speaker wish aside with "Ask for a language level, not a native speaker." Choose how many answers you can read (5 to 30); a person approves before it goes live. |
| 1:50 | Open `/for-judges` ("Evidence for judges"). | The 2-minute check path, each criterion with a way to check it, and the dated eval numbers. |

## 90 seconds, at the table (peer review)

Setup: the laptop shows `/table` on a big screen. Have a phone ready to pass round.

1. **(0:00) The problem.** "Today AI writes the CV and AI reads it. The City of Espoo asked for better matches at its recruitment events, without automated decisions about people."
2. **(0:10) The idea.** Point at the screen. "Skip the CV. Do the work. A company posts a 20-minute real task. You do it. A person there reads your work without your name and decides."
3. **(0:20) Your turn.** Ask the visitor to scan the QR code, or type the short link under it. On the phone `/try` asks: "What's your dream job?" They pick one, answer one task in two sentences and one follow-up question.
4. **(0:50) The reveal.** The phone shows "This is what a company sees." with their name and places hidden. The proof appears on the big screen as it arrives, as a label and a task, never the text they wrote.
5. **(1:00) The invitation.** On the big screen, press Invite on their proof and write two sentences about what you saw. Their phone shows your words; they accept or decline. Only after an accept does their first name appear on the big screen.
6. **(1:10) The other two sides.** On the laptop, switch the mode at the top left to Hiring, then to City of Espoo. "Anna reads work in arrival order. Every decision needs a written reason, also a no, and only a registered reviewer can sign it. The city sees answers given, answers still owed per employer and meetings both sides confirmed, and exports the meeting list."
7. **(1:25) Close.** "AI drafts the tasks. People make every decision. Work first. Names last. People decide."

If there is time for a question: the honest limits are in the README under "Limits, stated honestly", and the questions a city asks first are under "Fair questions".
