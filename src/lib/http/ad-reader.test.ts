import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SAMPLE_ADS } from "@/lib/seed/ads";
import { readAd, sectionOf, type JobAd } from "./ad-reader";

const fixture = (slug: string) => readFileSync(new URL(`./fixtures/ads/${slug}.html`, import.meta.url), "utf8");

/** Every heading of a page, as plain text. */
const headingsOf = (html: string) => [...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((m) => m[1].replace(/<[^>]*>/g, "").trim());

/** A listed line as the reader keeps it: without the closing full stop. */
const asItem = (line: string) => line.replace(/\.$/, "");

const items = (ad: JobAd) => [...ad.duties, ...ad.requirements, ...ad.facts];

describe("readAd on the sample ads", () => {
  it.each(SAMPLE_ADS.map((ad) => [ad.slug, ad] as const))("%s: the title, the real list items and no heading as an item", (slug, sample) => {
    const html = fixture(slug);
    const ad = readAd(html);
    expect(ad.title).toBe(sample.title);
    expect(ad.duties).toEqual(sample.youWill.map(asItem));
    expect(ad.requirements).toEqual(sample.weLookFor.map(asItem));
    const headings = headingsOf(html);
    expect(headings).toEqual(expect.arrayContaining(["What you will do", "What we look for"]));
    for (const heading of headings) expect(items(ad)).not.toContain(heading);
  });

  it("keeps the work language from the line under the title as a fact, and leaves the intro and the sample note out", () => {
    const ad = readAd(fixture("kide-chip-verification-engineer"));
    expect(ad.facts).toEqual(["Work language English"]);
    expect(items(ad).join(" ")).not.toMatch(/Sample job ad|We are 60 people|We pay for courses/);
  });
});

describe("sectionOf", () => {
  it.each([
    ["What you will do", "duties"],
    ["What you'll get to do", "duties"],
    ["Your responsibilities:", "duties"],
    ["Tehtävät", "duties"],
    ["Työnkuva", "duties"],
    ["Arbetsuppgifter", "duties"],
    ["What we look for", "requirements"],
    ["Who you are", "requirements"],
    ["Odotamme sinulta", "requirements"],
    ["Vi söker dig som", "requirements"],
    ["About us", "skip"],
    ["We offer", "skip"],
    ["What you will get", "skip"],
    ["What you’ll get", "skip"],
    ["How to apply", "skip"],
    ["Contact", "skip"],
    ["Tarjoamme", "skip"],
    ["Meistä", "skip"],
    ["Hakeminen", "skip"],
    ["Vi erbjuder", "skip"],
    ["Om oss", "skip"],
    ["Location", "other"],
  ] as const)("%s is %s", (heading, section) => {
    expect(sectionOf(heading)).toBe(section);
  });
});

describe("readAd on other ad shapes", () => {
  it("reads a Finnish ad and leaves out the company, the offer and the application", () => {
    const ad = readAd(`
      <title>Talousanalyytikko | Esimerkki Oy</title>
      <h1>Talousanalyytikko</h1>
      <h2>Meistä</h2><p>Olemme 40 hengen yritys Espoossa.</p><ul><li>Toimisto Tapiolassa</li></ul>
      <h2>Tehtävät</h2><ul><li>Seuraat tiimien budjetteja.</li><li>Teet kuukausiraportin johdolle.</li></ul>
      <h2>Odotamme sinulta</h2><ul><li>Tarkkuutta numeroiden kanssa</li><li>Selkeää kirjoittamista</li></ul>
      <h2>Tarjoamme</h2><ul><li>Joustavat työajat</li></ul>
      <h2>Hakeminen</h2><p>Lähetä hakemus osoitteeseen rekry@example.org.</p>`);
    expect(ad).toEqual({
      title: "Talousanalyytikko",
      duties: ["Seuraat tiimien budjetteja", "Teet kuukausiraportin johdolle"],
      requirements: ["Tarkkuutta numeroiden kanssa", "Selkeää kirjoittamista"],
      facts: [],
    });
  });

  it("reads a Swedish ad", () => {
    const ad = readAd(`
      <h1>Ekonom</h1>
      <h2>Om oss</h2><p>Vi är ett litet företag.</p>
      <h2>Arbetsuppgifter</h2><ul><li>Följa upp budgeten</li></ul>
      <h2>Vi söker dig som</h2><ul><li>Har god känsla för siffror</li></ul>
      <h2>Vi erbjuder</h2><ul><li>Friskvårdsbidrag</li></ul>
      <h2>Ansökan</h2><ul><li>Skicka din ansökan senast 1.12.</li></ul>`);
    expect(ad).toMatchObject({ title: "Ekonom", duties: ["Följa upp budgeten"], requirements: ["Har god känsla för siffror"] });
    expect(items(ad).join(" ")).not.toMatch(/Friskvård|ansökan|litet företag/);
  });

  it("reads bold lines and lines that end in a colon as headings", () => {
    const ad = readAd(`
      <h1>Data analyst</h1>
      <p><strong>Your tasks</strong></p>
      <p>• Build the weekly sales dashboard</p>
      <p>• Send weekly reports to the sales team</p>
      <p><b>Requirements:</b></p>
      <ul><li>SQL</li></ul>
      <p>We offer:</p>
      <ul><li>A good salary</li></ul>`);
    expect(ad.duties).toEqual(["Build the weekly sales dashboard", "Send weekly reports to the sales team"]);
    expect(ad.requirements).toEqual(["SQL"]);
    expect(items(ad)).not.toEqual(expect.arrayContaining(["Your tasks", "Requirements", "We offer", "A good salary"]));
  });

  it("splits a known heading written inline, as in 'Heading: text'", () => {
    const ad = readAd(`
      <h1>Kehittäjä</h1>
      <p><strong>Tehtävät:</strong> Rakennat pieniä työkaluja toimistolle.</p>
      <p>Odotamme: Kokemusta automaatiosta.</p>
      <p>Plussaa: Python ja SQL.</p>`);
    expect(ad.duties).toEqual(["Rakennat pieniä työkaluja toimistolle"]);
    // "Plussaa" is no heading the reader knows, so the line stays whole inside the part above it.
    expect(ad.requirements).toEqual(["Kokemusta automaatiosta", "Plussaa: Python ja SQL"]);
  });

  it("uses the page title and the loose list items when the ad has no headings", () => {
    const ad = readAd(`
      <html><head><title>Warehouse planner | Example Oy</title></head>
      <body><p>We need a planner. Work language English.</p><ul><li>Plan the weekly shifts</li><li>Apply by email: jobs@example.org</li></ul></body></html>`);
    expect(ad).toEqual({ title: "Warehouse planner", duties: [], requirements: ["Plan the weekly shifts"], facts: ["Work language English"] });
  });

  it("leaves out a 'What you will get' section and offer sentences, and keeps 'What you'll get to do' as work", () => {
    const ad = readAd(`
      <h1>Product manager</h1>
      <h2>What you&rsquo;ll get to do</h2><ul><li>Decide what the team builds next</li></ul>
      <p>We offer a good salary and free lunch.</p>
      <h2>Who you are</h2><ul><li>You talk to customers every week</li></ul>
      <h2>What you will get</h2><ul><li>Six weeks of holiday</li><li>Stock options</li></ul>
      <h2>Questions?</h2><p>Call us on +358 40 123 4567.</p>`);
    expect(ad).toEqual({ title: "Product manager", duties: ["Decide what the team builds next"], requirements: ["You talk to customers every week"], facts: [] });
  });

  it("keeps a smaller heading that names no part inside the part above it", () => {
    const ad = readAd(`
      <h1>Embedded engineer</h1>
      <h2>What we look for</h2><h3>Technical</h3><ul><li>C on small devices</li></ul><h3>Nice to have</h3><ul><li>Rust</li></ul>
      <h2>Location</h2><ul><li>Otaniemi office</li></ul>`);
    expect(ad.requirements).toEqual(["C on small devices", "Rust"]);
  });

  it("drops scripts, menus and footers, and decodes entities", () => {
    const ad = readAd(`
      <nav><ul><li>Jobs</li><li>About us</li></ul></nav>
      <h1>Designer</h1><script>var tasks = ["x"]</script>
      <h2>Your role</h2><ul><li>Sketch flows &amp; screens</li></ul>
      <footer><ul><li>Privacy</li></ul></footer>`);
    expect(ad).toEqual({ title: "Designer", duties: ["Sketch flows & screens"], requirements: [], facts: [] });
  });
});
