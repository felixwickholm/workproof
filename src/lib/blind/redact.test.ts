import { describe, expect, it } from "vitest";
import { proofLabel, toBlindProof, toOwnProof } from "./project";
import { redact } from "./redact";

describe("redact", () => {
  it("removes the author's name, contact and signature", () => {
    const { text, report } = redact("My name is Leila Haddad. Reach me at leila@example.org or +358 40 123 4567.\n\nBest,\nLeila", {
      name: "Leila Haddad",
      contact: "leila@example.org",
    });
    expect(text).not.toMatch(/Leila|Haddad|example\.org|4567/);
    expect(report.names).toBeGreaterThan(0);
    expect(report.contacts).toBe(2);
  });

  it("counts schools, places, employers and personal details, and shows one neutral token", () => {
    const { text, report } = redact(
      "I did my MSc at the University of Tehran and later studied at Aalto. I worked at Nordwave Systems in Espoo. As a mother of two I am 34 years old and a native Arabic speaker. Syrian by birth.",
    );
    expect(text).not.toMatch(/Tehran|Aalto|Nordwave|Espoo|mother|34 years|Arabic|Syrian/);
    expect(text).not.toMatch(/\[(?:name|contact|school|place|employer|personal detail)\]/);
    expect(text).toContain("[hidden]");
    expect(report.schools).toBe(2);
    expect(report.places).toBeGreaterThan(0);
    expect(report.employers).toBe(1);
    expect(report.other).toBeGreaterThan(0);
  });

  it("removes links to profiles and Finnish city forms", () => {
    const { text } = redact("See linkedin.com/in/someone and https://github.com/someone. Asun Helsingissä.");
    expect(text).not.toMatch(/linkedin|github|Helsingissä/);
  });

  it("leaves technical content alone", () => {
    const work = "Retry 3 times with backoff. The query returns 10 rows at 0.05 seconds. Use AWS for storage.";
    expect(redact(work).text).toBe(work);
  });

  it("hides name parts only as capitalised words, never ordinary lowercase words", () => {
    const willMay = redact("I will split by attempt. It may leak otherwise, and that will hurt. Will May", { name: "Will May" }).text;
    expect(willMay).toBe("I will split by attempt. It may leak otherwise, and that will hurt. [hidden]");
    expect(redact("This is an obvious leak. Use an attempt id.", { name: "An Le" }).text).toBe("This is an obvious leak. Use an attempt id.");
    expect(redact("Thanks to Mark for the idea. We mark the rows.", { name: "Mark Grace" }).text).toBe("Thanks to [hidden] for the idea. We mark the rows.");
  });

  it("finds the author's name without accents, as initials and as a handle", () => {
    expect(redact("Split by attempt. Aino Makela", { name: "Aino Mäkelä" }).text).not.toMatch(/Aino|Makela/);
    expect(redact("L. Haddad / LH / Leilah / leila_haddad / Leila H.", { name: "Leila Haddad" }).text).not.toMatch(/Haddad|LH|Leilah|leila|Leila/);
  });

  it("does not damage technical words that follow at, for, I am or this is", () => {
    const work =
      "I am Confident this is fine. This is GroupShuffleSplit at Scale. Ask for Approval. Run it at Night. Use Pandas for this. The test set at Kaggle style. Look at Figure 2. I'm Running Python. Use it at Monday.";
    expect(redact(work, { name: "Leila Haddad", contact: "l@e.org" }).text).toBe(work);
  });

  it("keeps decorators and file names in code", () => {
    const code = "@pytest.fixture\ndef split():\n    return GroupShuffleSplit(n_splits=1)  # see utils.py";
    expect(redact(code).text).toBe(code);
  });
});

describe("blind projections", () => {
  const own = toOwnProof({
    proofId: "p1",
    challenge: { id: "c1", title: "Task", coreSkills: [{ id: "sql", label: "SQL", why: "x" }], proofKind: "writing" },
    work: "w",
    explain: [{ question: "q", answer: "a", extra: "secret" } as never],
    glance: "s",
    redactions: { names: 1, contacts: 0, places: 0, schools: 2, employers: 0, other: 0 },
    submittedAt: "2026-01-01T00:00:00.000Z",
  });

  it("builds the author's view by allow-list with a neutral label", () => {
    expect(JSON.stringify(own)).not.toContain("secret");
    expect(own.label).toMatch(/^Proof [A-Z][1-9]$/);
    expect(proofLabel("p1")).toBe(own.label);
    expect(own.redactions.schools).toBe(2);
  });

  it("gives the reviewer neither a total nor categories; the author keeps both", () => {
    const blind = toBlindProof(own);
    expect(own.hiddenCount).toBe(3);
    expect(Object.keys(blind)).not.toContain("hiddenCount");
    expect(Object.keys(blind)).not.toContain("redactions");
  });

  it("keeps labels unique, growing to two digits when one is taken", () => {
    const taken = new Set<string>();
    for (let i = 0; i < 400; i++) taken.add(proofLabel(`proof_${i}`, taken));
    expect(taken.size).toBe(400);
    expect([...taken].some((label) => /^Proof [A-Z]\d{2}$/.test(label))).toBe(true);
  });
});

describe("redact, second review", () => {
  const known = { name: "Sanna Virtanen", contact: "sanna.virtanen@example.org" };
  const hidden = (text: string, extra = {}) => redact(text, { ...known, ...extra }).text;

  it("finds the author's name inside identifiers, file names and constants", () => {
    for (const code of ["sanna_virtanen_split = 1", "eval_by_virtanen = 1", "const sannaVirtanenSplit = 1", "SANNA_VIRTANEN_KEY = 2", 'df.to_csv("virtanen_results.csv")']) {
      expect(hidden(code)).not.toMatch(/sanna|virtanen/i);
    }
    expect(hidden("will_retry = may_fail()", { name: "Will May" })).toBe("will_retry = may_fail()");
    expect(hidden("The price is wrong.", { name: "Mark Price" })).toBe("The price is wrong.");
  });

  it("finds spaced and digit forms of the name, and phone numbers in Finnish words", () => {
    expect(hidden("S a n n a  V i r t a n e n / S4nn4 V1rt4n3n")).not.toMatch(/S a n n a|V i r t|S4nn4|V1rt4n3n/);
    expect(hidden("Soita: nolla neljä nolla yksi kaksi kolme neljä viisi kuusi seitsemän")).not.toMatch(/nolla neljä/);
  });

  it("hides status, a lone gender in a group, degree years and non-Latin name lines", () => {
    const text = hidden(
      "I'm on a residence permit. I need visa sponsorship. I came as an asylum seeker. I'm the only woman on my team. MSc in 1998, BSc 2001.\nمع تحياتي، يوسف العلي",
    );
    expect(text).not.toMatch(/residence permit|visa sponsorship|asylum|only woman|1998|2001|يوسف/);
    expect(hidden("We accept Visa and Mastercard.")).toBe("We accept Visa and Mastercard.");
  });

  it("hides the names of event companies", () => {
    expect(hidden("I applied to Tuulos last year.", { companies: ["Tuulos Robotics"] })).toBe("I applied to [hidden] last year.");
  });
});
