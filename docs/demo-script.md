# Demo script

Two paths through the live demo (link at the top of the README), or `npm run dev` on http://localhost:3000: a 2-minute path a judge can follow alone, and a 5-minute path for a presenter. Each visitor gets a private copy of the demo event, so nothing you do changes anyone else's demo. "Reset demo" at the foot of `/city` starts your copy again.

## What the demo holds

All people and companies are invented. At the default story stage the event has 10 companies, 12 challenges, 62 pieces of work from 36 people, 34 scored by a person, 12 invitations, 7 accepted, 4 talks held, 3 follow-ups agreed and 2 hires. These are the numbers the city view shows, marked "Demo data".

**The story.** Mikko is an AI developer. 40 applications got no interview. Halla Supply asks "What should we automate first?" He picks the invoices, not the chatbot, says why, plans two weeks and names the risk. Laura Niemi at Halla Supply reads the work without the name, scores each skill from 1 to 5 and writes why. The work gets 9 of 10. Halla invites him, and sees his name only after he says yes.

**The 12 challenges.** Each one is done in one of four ways: Choose (pick one of two options and say why), Make (build a plan, a sketch or a screen), Fix (find what is wrong), Read (read a chart, a table or a report and say what matters).

| Challenge | Format | Company | Minutes |
|---|---|---|---|
| What should we automate first? (Mikko's story) | Make | Halla Supply | 10 |
| Read this chart. What must the team know? | Read | Saarnivo Grid | 10 |
| One number in this budget is wrong. Find it | Fix | Saarnivo Grid | 10 |
| Find the bug in this model test | Fix | Tuulos Robotics | 10 |
| One clause puts us at risk. Find it | Fix | Kivira Labs | 10 |
| Two customers want the same engineer. Who waits? | Choose | Vesto Controls and Saarnivo Grid | 10 |
| Sketch how to hold up this wall opening | Make | Harjula Engineering | 15 |
| Which path fails in this timing report? | Read | Kide Silicon | 15 |
| Which video will more people share? | Choose | Revontuli Games | 10 |
| Cut this feature list to two weeks of work | Make | Tuulos Robotics and Kuulas Studio | 10 |
| Make this booking screen easier. Change three things | Make | Kuulas Studio | 10 |
| Does this table support the claim? | Read | Hohka Materials | 10 |

The City of Espoo made the Kide Silicon challenge from the company's job ad. Kide Silicon has not opened it yet, and 20 people already did it.

## 2 minutes, alone (judge)

| Time | Do this | Look for |
|---|---|---|
| 0:00 | Open `/`. | "Show your work. Get the interview." Three doors: "I'm looking for work", "I'm hiring", "I'm the City of Espoo". Below them, Mikko's story: "His work got 9 of 10." |
| 0:10 | Press "Watch the 1-minute tour". Each card moves on by itself; Next, Back and Pause work too. | Seven cards over the real screens. The tour opens each page itself and sets the story to the right moment. |
| 0:15 | Card 1, "A company needs help." | The Hiring screen where a company pastes its job ad. |
| 0:25 | Card 2 and 3, "Mikko does the challenge." and "His name is hidden." | He thinks aloud as he works; no camera. Then what the company reads, with his name, a past client, where he lives and his school hidden. |
| 0:45 | Card 4, "The boss scores the work." | Laura's points for each skill and her reason. "A person gives the points, not the AI." |
| 0:55 | Card 5 and 6, "He says yes." and "The city sees what came of it." | The invitation from Halla Supply. Then the city's count from challenge to talk. |
| 1:10 | On the last card, "Now try it yourself.", press "I'm hiring". | `/employer` opens as Halla Supply. Its "Show me" button pulses once. |
| 1:15 | In the menu, open "New challenge". Under "Paste your job ad link", press the sample ad "Financial analyst". | The ad becomes a draft challenge: the task, what the person hands in, "Skills you score" (3 to 5), and the wishes set aside. Nothing goes live before a person presses "Approve and publish". |
| 1:45 | Open "Evidence for judges" in the top bar of `/`, or go to `/for-judges`. | Each judging criterion with a way to check it, and the dated test numbers. |

## 5 minutes, presenter

Open `/` before you start. Each step says what to press, then what to say.

**0:00 The start page.** Point at the headline and the three doors.
Say: "Companies see how well people do the real work before they meet them. A company posts a short challenge. A person does it in 5 to 15 minutes and thinks aloud. Someone at the company scores the work without the name. The city sees what came of it."

**0:30 Looking for work.** Press "I'm looking for work". `/seeker` opens as Mikko.
Say: "This is Mikko, an AI developer." Point at "Your invite" from Halla Supply and his score. "His work got 9 of 10."

**0:50 His work.** In the menu, open "My work", then his Halla Supply work.
Say: "This is what the company read. Bars cover what the rules removed: his name, a past client, where he lives and his school." Turn on "Show what I wrote" and drag the handle to compare. Point at "My score" and say: "Laura Niemi gave points for each skill and wrote why. People score the work. The AI never does."

**1:30 He says yes.** Go back to `/seeker` and press "Say yes".
Say: "Only now does Halla Supply see his name. If he said no, it never would."

**1:45 Hiring.** Switch the view at the top left to "Hiring". `/employer` opens as Halla Supply. Open the row "What should we automate first?".
Say: "This is the company's best work first, by its own scores, still without names. Two pieces have 9 of 10. One of them now reads ‘K7 is Mikko Lahtinen’. He said yes, so Halla Supply can see his name."

**2:15 Score one.** In the menu, open "Score work". Open the first piece of work in the list.
Say: "Work waits in the order it came. The reviewer gives 1 to 5 points for each skill and says why. Then: invite to the event, not now, or score now and decide later. A person decides every time."
Do not send a score unless you want to; the buttons stay locked until every skill has points and a reason.

**3:00 A job ad becomes a challenge.** In the menu, open "New challenge". Press the sample ad "AI developer". If someone asks what an ad looks like, open `/ads/halla-ai-developer` in a new tab.
Say: "The company gives us its job ad. The AI drafts a short challenge with 3 to 5 skills to score. Wishes that are not skills are set aside. A person reads it, edits it and approves it. Nothing goes live before that."

**3:40 The City of Espoo.** Switch the view to "City of Espoo". `/city` opens.
Say, pointing at "What came of this event": "62 pieces of work from 36 people. 34 scored by a person. 12 invitations, 4 talks held, 3 follow-ups agreed, 2 hires. All demo data."
Point at "Challenge leaderboard": "Every challenge, with how far its people got." Point at "Where the work goes": "Tap a company on the map of Espoo to see its challenges."

**4:20 The city makes a challenge.** Scroll to "Make a challenge for a company".
Say: "A company that is too busy does nothing. The city pastes its job ad and publishes the challenge for it. Kide Silicon got one this way, and 20 people already did it before the company opened it."

**4:40 Close.** Scroll to the safeguards card.
Say: "Work first. Names last. People decide. The AI drafts challenges and never scores a person."

If time is short, each view has a "Show me" button: a 1-minute guided demo of that view on the real screens. The Looking for work and Hiring demos have seven cards, the city demo six.

## At the table

`/table` on a big screen shows a QR code and a short code. A visitor scans it, and `/try` on the phone asks "What's your dream job?", gives a 2-minute challenge and shows what a company would read before they send it. The big screen shows labels and challenges, never what the visitor wrote. The host invites one with a two-sentence message; the visitor says yes or no on the phone, and only after a yes does their first name appear on the big screen.

If there is time for a question: the honest limits are in the README under "Limits, stated honestly", and the questions a city asks first are under "Fair questions".
