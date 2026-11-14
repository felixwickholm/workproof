# Demo script

Two paths through the live demo (link at the top of the README), or `npm run dev` on http://localhost:3000: a 2-minute path a judge can follow alone, and a 5-minute path for a presenter. Each visitor gets a private copy of the demo event, so nothing you do changes anyone else's demo. "Reset demo" in the account menu (and at the foot of `/city`) starts your copy again.

There is no landing page. `/` opens the Job seeker home. The three views are Job seeker, Company and City of Espoo; switch between them with the view switcher at the top left (on a phone, at the top right).

## What the demo holds

All people and companies are invented. At the default story stage the event has 28 companies, 40 challenges, 80 pieces of work from 46 people, 48 scored by a person, 17 invited, 10 said yes, 6 talks held, 5 follow-ups agreed and 3 hires. These are the numbers the city view shows, marked "Demo data".

**The people.** Mikko Lahtinen is the job seeker, an AI developer. Laura Niemi at Halla Supply is the company person. Sanna Mattila is the city person.

**The story.** Halla Supply asks "What should we automate first?" Mikko picks the invoices, not the chatbot, says why, plans two weeks and names the risk. Laura reads the work without his name, gives 1 to 5 points for each skill and writes why. The work gets 9 of 10. She invites him, and sees his name only after he says yes.

**The challenges.** 40 challenges, listed in the README under "Four formats, forty challenges". Each one looks like a job listing, with the company's logo and a picture of the work, and is done in one of four ways: Choose, Make, Fix or Read. The City of Espoo made the Kide Silicon challenge from the company's job ad. Kide Silicon has not opened it yet, and 20 people already did it.

## 2 minutes, alone (judge)

Open the link in a normal browser window. The walkthrough starts by itself on the first visit and plays 17 cards in about two minutes. Each card opens the real page and points at one part of it. Pause, Back, Next, Esc and the arrow keys work. If it does not start (you closed it before), open `/?tour=1`.

| Cards | Chapter | What you see |
|---|---|---|
| 1 to 3 | Job seeker | "This is Mikko. He is looking for a job." The role chips, the challenges from Espoo companies, and the Halla Supply challenge he picks. |
| 4 and 5 | Job seeker | "He does the work." The work screen plays a sample session. "He says out loud how he thinks." The audio is not kept. |
| 6 and 7 | Company | "This is Laura at Halla Supply." She picks who she needs, and the AI drafts the challenge. She checks it, or writes her own. |
| 8 to 10 | Company | "She reads the work without his name." Points for each skill, with a reason. "She picks who to meet." Then the scorecard: the best work first, by her own points. |
| 11 to 14 | City of Espoo | "The city sees who is hiring now." WorkProof makes a challenge from a public job ad, and the city invites the company to try it. Then the graph from challenge to hire, and the map of Espoo. |
| 15 to 17 | The goal | "Built to meet the EU AI Act and GDPR." Mikko's answer: 9 of 10, a reason for each point, and a talk. "People get jobs for the work they can do." |

The last card has three ways on: "Try it as Mikko", "Try it as Laura" and "See the city view". For the evidence, press "For judges" at the foot of the sidebar (or open `/for-judges`): each judging criterion with a way to check it, and the dated test numbers.

## 5 minutes, presenter

Open `/?tour=0` before you start, so the walkthrough does not cover the screen. Each step says what to press, then what to say.

**0:00 Job seeker home.** Point at "Hi Mikko. What work do you want?" and the role chips.
Say: "This is Mikko. He is looking for work as an AI developer. Companies in Espoo post real challenges from their work." Press the chip "Data analyst". The list now starts with "For your roles".

**0:30 A challenge.** Press the challenge "Find the bug in this model test" (Tuulos Robotics).
Say: "Each challenge looks like a job listing: the company, the work, the skills it scores." Press "Start challenge". On the work screen, point at "Start", "Voice only" and "Type instead".
Say: "He can type or talk, and he says out loud how he thinks. No camera, and the audio is not kept."

**1:15 His answer.** In the sidebar, press "My work".
Say: "Mikko did Halla Supply's challenge. Laura Niemi gave points for each skill and wrote why. 9 of 10. People score the work. The AI never does." Press "Say yes".
Say: "Only now does Halla Supply see his name. If he said no, it never would."

**2:00 Company.** Press the view switcher at the top left ("Job seeker") and choose "Company". `/employer` opens as Laura Niemi at Halla Supply. Press the row "What should we automate first?".
Say: "Top work: the best work first, by her own points, still without names." Point at Work K7: "K7 is Mikko Lahtinen. He said yes, so she can see his name."

**2:40 Score one.** In the sidebar, press "Score work". The oldest waiting work opens (Work E7).
Say: "Work waits in the order it came. Personal details are removed by rules before she reads it. She gives 1 to 5 points for each skill and says why. Then: Invite to the event, Not now, or Score only, decide later. A person decides every time."
Do not send a score unless you want to; the buttons stay locked until every skill has points and a reason.

**3:20 A new challenge.** In the sidebar, press "New challenge". Under "Who are you looking for?", press "AI developer", then "Draft my challenge".
Say: "Laura tells the AI who she needs. The AI drafts a short challenge with the skills to score. She checks it, edits it and presses Approve and publish. Nothing goes live before that." If someone asks about job ads, point at "Start from your job ad" and the sample ads under "Try a sample ad".

**4:00 City of Espoo.** Press the view switcher and choose "City of Espoo". `/city` opens as Sanna Mattila.
Say, pointing at "From challenge to hire": "80 pieces of work. 48 scored by a person. 17 invited, 10 said yes, 6 talks, 5 follow-ups, 3 hired. All demo data."
Scroll to "Companies hiring right now" and press "Make a challenge" on the first company.
Say: "The city sees who is hiring now from public job ads. WorkProof makes a challenge from the ad, and the city invites the company to try it." Point at "Publish and invite"; you do not need to press it.

**4:40 Close.** Scroll past "Where the work goes" (the map of Espoo) to "How people are kept safe".
Say: "People get jobs for the work they can do. The AI drafts challenges. A person gives every score and makes every choice."

If time is short, each view's home has a "Show me" button: it starts the walkthrough at that view's chapter.

## At the table

`/table` on a big screen shows a QR code and a short code. A visitor scans it, and `/try` on the phone asks "What's your dream job?", gives a 2-minute challenge and shows what a company would read before they send it. The big screen shows labels and challenges, never what the visitor wrote. The host invites one with a two-sentence message; the visitor says yes or no on the phone, and only after a yes does their first name appear on the big screen.

If there is time for a question: the honest limits are in the README under "Limits, stated honestly", and the questions a city asks first are under "Fair questions".
