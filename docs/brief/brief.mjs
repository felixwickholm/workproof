/**
 * The page "WorkProof: the brief and the build". `scripts/build-brief.mjs` calls `buildBrief` with the
 * modules that hold every claim and number (src/app/for-judges/facts.ts, evidence.ts, site.ts), so the
 * page is rebuilt from the same source as /for-judges and /llms.txt. Only the connecting sentences and
 * the legal frame (from docs/responsible-ai.md) are written here by hand.
 */

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const list = (items, cls = "") => `<ul${cls ? ` class="${cls}"` : ""}>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

/** The first sentence of a longer fact, for the one-page summary. */
const firstSentence = (text) => {
  const match = /^.*?[.;](?=\s|$)/.exec(text);
  return match ? match[0].replace(/;$/, ".") : text;
};

export const TITLE = "WorkProof: the brief and the build";

/** Screenshots used on the page, copied next to it under this folder. */
export const IMAGES = {
  seeker: "seeker.png",
  company: "top-work.png",
  city: "city.png",
};
export const ASSET_DIR = "brief-assets";

export function buildBrief({ facts, evidence, site, css }) {
  const { NAME, SUMMARY, ONE_LINE, ENTRY, AUDIENCES, CRITERIA, AI_DOES, AI_NEVER, LIMITS, PRIVACY, SYNTHETIC } = facts;
  const { BRIEF_QUOTES, CHECK_PATH, ROUTES, VERIFY_COMMANDS, ARCHITECTURE_SUMMARY, BOOTH, DEMO_EVENT } = facts;
  const { UNIT_TESTS, EVAL_TESTS, VERIFIED_ON, FIGURES, EVAL_RESULTS } = evidence;
  const live = site.LIVE_SITE;
  const repo = site.DEFAULT_REPO;
  const description = `${ONE_LINE} A ${ENTRY.event} entry for the ${ENTRY.challengeBy} challenge "${ENTRY.challenge}": the brief, the build, the three views, the AI and its limits, and the measured evidence.`;
  const views = AUDIENCES.map((a) => a.mode).join(", ");
  const img = (key, alt, caption) =>
    `<figure><img src="${ASSET_DIR}/${IMAGES[key]}" alt="${esc(alt)}" width="1440" height="900"><figcaption>${esc(caption)}</figcaption></figure>`;
  const audience = (mode) => AUDIENCES.find((a) => a.mode === mode);
  const routeLink = (path) => `<a href="${live}${path === "/" ? "" : path}">${esc(live.replace(/^https:\/\//, ""))}${esc(path === "/" ? "" : path)}</a>`;

  const viewBlock = (mode, imageKey, alt, caption, extra = "") => {
    const a = audience(mode);
    return `<div class="view">
<h3>${esc(a.mode)} view, for ${esc(a.who.startsWith("City") ? a.who : a.who.charAt(0).toLowerCase() + a.who.slice(1))}</h3>
<p>${esc(a.does)} Open it: ${routeLink(a.path)}.</p>
${extra}
${img(imageKey, alt, caption)}
</div>`;
  };

  const evalRows = EVAL_RESULTS.map(
    (row) => `<tr><td>${esc(row.suite)}</td><td>${esc(row.check)}</td><td>${esc(row.result)}</td></tr>`,
  ).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(NAME)} team">
<link rel="canonical" href="${live}/brief">
<link rel="alternate" type="application/pdf" href="/brief.pdf" title="${esc(TITLE)} (PDF)">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(NAME)}">
<meta property="og:title" content="${esc(TITLE)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${live}/brief">
<meta property="og:image" content="${live}/opengraph-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(TITLE)}">
<meta name="twitter:description" content="${esc(description)}">
<style>
${css}
</style>
</head>
<body>
<main>

<header>
<p class="eyebrow">${esc(ENTRY.event)} · ${esc(ENTRY.challengeBy)} · ${esc(ENTRY.challenge)}</p>
<h1>${esc(TITLE)}</h1>
<p class="lede">${esc(SUMMARY)}</p>
<p class="links"><span>Live demo: <a href="${live}">${esc(live.replace(/^https:\/\//, ""))}</a></span><span>Code: <a href="${repo}">${esc(repo.replace(/^https:\/\//, ""))}</a></span><span>This brief as PDF: <a href="${live}/brief.pdf">${esc(live.replace(/^https:\/\//, ""))}/brief.pdf</a></span></p>
</header>

<section aria-labelledby="summary">
<h2 id="summary">One-page summary</h2>
<p><strong>What it is.</strong> ${esc(ONE_LINE)} ${esc(NAME)} turns a recruitment event into short real work: a company posts a challenge, a person does it, and a named person at the company reads the work without the name.</p>
<p><strong>For whom.</strong> ${AUDIENCES.map((a) => `${esc(a.who)} (${esc(a.mode)} view)`).join("; ")}.</p>
<h3>How each judging criterion is met</h3>
${list(
  CRITERIA.map((c) => `<strong>${esc(c.criterion)} (${esc(c.weight)}).</strong> ${esc(firstSentence(c.built))} Evidence: ${esc(c.evidence)}`),
  "criteria",
)}
<div class="facts" role="region" aria-labelledby="key-facts">
<h2 id="key-facts">Key facts</h2>
<dl>
<dt>Name</dt><dd>${esc(NAME)}</dd>
<dt>Challenge</dt><dd>"${esc(ENTRY.challenge)}" by the ${esc(ENTRY.challengeBy)}, ${esc(ENTRY.event)} (13 to 15 November 2026)</dd>
<dt>Views</dt><dd>${esc(views)}, in one app</dd>
<dt>AI role</dt><dd>${esc(firstSentence(AI_DOES[0]))} ${esc(AI_DOES[1])} A person approves every company task.</dd>
<dt>AI never</dt><dd>${AI_NEVER.map((line) => esc(firstSentence(line))).join(" ")}</dd>
<dt>Who decides</dt><dd>A named reviewer gives 1 to 5 points per core skill and writes a reason. The name of the person stays hidden until they accept.</dd>
<dt>Evidence</dt><dd>${esc(UNIT_TESTS.passed)} of ${esc(UNIT_TESTS.tests)} unit tests and ${esc(EVAL_TESTS.passed)} of ${esc(EVAL_TESTS.tests)} eval tests pass (checked ${esc(VERIFIED_ON)}). ${esc(FIGURES.plantedReached)} planted identity details reached a reviewer. ${esc(FIGURES.judgingRejected)} planted judging phrases rejected. ${esc(FIGURES.automatedDecisions)} automated decisions.</dd>
<dt>Demo data</dt><dd>${esc(DEMO_EVENT.employers)} companies, ${esc(DEMO_EVENT.tasks)} challenges, ${esc(DEMO_EVENT.proofs)} pieces of work. All synthetic. No sign-in, no keys.</dd>
<dt>Links</dt><dd><a href="${live}">${esc(live)}</a> · <a href="${repo}">${esc(repo)}</a> · <a href="${live}/for-judges">${esc(live)}/for-judges</a></dd>
</dl>
</div>
</section>

<section class="page" aria-labelledby="brief">
<h2 id="brief">The brief</h2>
<p>The ${esc(ENTRY.challengeBy)} runs recruitment and matchmaking events for companies and international talent. CVs and messages are now written and read with AI, so companies get more noise and less signal. The brief asks how the events can help companies and talent find each other on real grounds, with less noise from registration to the event, and without automated profiling or automated decisions about people.</p>
${BRIEF_QUOTES.map((q) => `<blockquote>${esc(q)}</blockquote>`).join("\n")}

<h2 id="solution">The solution</h2>
<p>${esc(NAME)} replaces the CV with a short piece of real work. A company describes its need in one sentence or pastes a job-ad link. The AI drafts a challenge with 3 to 5 core skills, and a person at the company approves it. A professional does the challenge in 8 to 30 minutes and answers two follow-up questions about their own choices. Rules remove known personal details before anyone reads the work.</p>
<p>A named reviewer at the company reads the work, gives 1 to 5 points on each core skill, writes a reason and chooses Meet or Not now. The person sees the scores and the words. The company sees the name only after the person accepts. The city sees every step from challenge taken to hire, and the work still waiting.</p>
<p>The demo story follows one loop: Mikko Lahtinen, a designer, does Halla Supply's challenge "Make our order form easier to use". Laura Niemi at Halla Supply scores it and invites him. Mikko accepts, and only then does Halla Supply see his name.</p>
<h3>How it is built</h3>
<p>${esc(ARCHITECTURE_SUMMARY)}</p>
<h3>What City of Espoo staff told us</h3>
<p>${esc(BOOTH.intro)}</p>
${list(BOOTH.answers.map((a) => `<strong>${esc(a.risk)}</strong> ${esc(a.answer)}`))}
</section>

<section class="page" aria-labelledby="views">
<h2 id="views">The three views</h2>
${viewBlock(
  "Job seeker",
  "seeker",
  "Job seeker view: Halla Supply's challenge Make our order form easier to use, with the company logo, an illustrative picture, the company facts and a See my work button, since Mikko did it.",
  "Job seeker: a challenge from Halla Supply that Mikko has done.",
)}
${viewBlock(
  "Company",
  "company",
  "Company view: top work for Make our order form easier to use. Each piece of work shows Laura Niemi's total out of 10 and her points per skill. Work K7 is invited and its name stays hidden until the person says yes.",
  "Company: top work by the reviewer's own totals. Names stay hidden until the person says yes.",
)}
</section>

<section class="page" aria-labelledby="city-view">
${viewBlock(
  "City of Espoo",
  "city",
  "City of Espoo view: the graph from challenge to hire (80 took a challenge, 48 scored, 17 invited, 10 said yes, 6 talked, 5 follow-ups agreed, 3 hired) and the work scored or waiting per company.",
  "City of Espoo: outcomes, not sign-ups. Demo data.",
).replace("<h3>", '<h3 id="city-view">')}

<h2 id="ai">The AI and its limits</h2>
<div class="two">
<div>
<h3>What the AI does</h3>
${list(AI_DOES.map(esc))}
</div>
<div>
<h3>What the AI never does</h3>
${list(AI_NEVER.map(esc))}
</div>
</div>
</section>

<section aria-labelledby="responsible">
<h2 id="responsible">Responsible AI</h2>
<p><strong>EU AI Act.</strong> Regulation (EU) 2024/1689 lists AI systems for the recruitment or selection of people as high-risk (Annex III, point 4). That covers systems that filter applications or evaluate candidates. So ${esc(NAME)} keeps AI out of scoring, ranking and deciding. The AI drafts a task and asks two questions. A named person reads the work, scores it and decides, with a written reason. The duties that match high-risk systems are built anyway: human oversight (Article 14), logs (Article 12) and telling people where AI was involved.</p>
<p><strong>GDPR Article 22.</strong> A person has the right not to be subject to a decision based solely on automated processing. ${esc(NAME)} has no automated decision feature. Every Meet or Not now carries the name of a reviewer registered for the company and a written reason. The city view counts decisions without a registered name: ${esc(FIGURES.automatedDecisions)}.</p>
<p><strong>Privacy.</strong> Review is blind: rules remove known personal details before a reviewer or a model reads the work. The name stays hidden until the person accepts. All data in the demo is synthetic, and the demo has no sign-in.</p>
${list(PRIVACY.map(esc), "small")}
<p class="small">${esc(SYNTHETIC)}</p>
<p class="note">This is a design position, not legal advice. A pilot needs its own legal review, a data protection impact assessment, sign-in and retention rules. Full text: docs/responsible-ai.md in the repository.</p>

<h3>Limits, said plainly</h3>
${list(LIMITS.slice(0, 7).map(esc), "small")}
</section>

<section aria-labelledby="evidence">
<h2 id="evidence">Evidence</h2>
<p class="small">All numbers come from real runs of the project's own checks, last on ${esc(VERIFIED_ON)}. <code>${esc(UNIT_TESTS.command)}</code>: ${esc(UNIT_TESTS.passed)} of ${esc(UNIT_TESTS.tests)} unit tests pass in ${esc(UNIT_TESTS.files)} files. <code>${esc(EVAL_TESTS.command)}</code>: ${esc(EVAL_TESTS.passed)} of ${esc(EVAL_TESTS.tests)} eval tests pass in ${esc(EVAL_TESTS.files)} files.</p>
<table class="evidence">
<thead><tr><th scope="col">Suite</th><th scope="col">What is checked</th><th scope="col">Result</th></tr></thead>
<tbody>${evalRows}</tbody>
</table>

<h2 id="try">How to try it</h2>
<p>The live demo needs no sign-in: <a href="${live}">${esc(live)}</a>. The shortest path through the whole loop:</p>
<ol>${CHECK_PATH.map((step) => `<li>${routeLink(step.path)}: ${esc(step.what)}</li>`).join("")}</ol>
<p>Other pages: ${ROUTES.filter((r) => !CHECK_PATH.some((s) => s.path === r.path))
    .map((r) => `<a href="${live}${r.path === "/" ? "" : r.path}">${esc(r.name)}</a> (${esc(r.path)})`)
    .join(", ")}.</p>
<p>Run it yourself from <a href="${repo}">${esc(repo)}</a> with Node.js 22 or newer: <code>npm install &amp;&amp; npm run dev</code>, then open http://localhost:3000. No keys are needed.</p>
<p>Check the claims the same way, no keys needed: ${VERIFY_COMMANDS.filter((c) => !["npm install", "npm run dev"].includes(c.command)).map((c) => `<code>${esc(c.command)}</code> (${esc(c.what.replace(/\.$/, "").replace(/;.*$/, ""))})`).join(", ")}.</p>
</section>

</main>
</body>
</html>
`;
}
