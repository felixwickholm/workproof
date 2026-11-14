import { describe, expect, it } from "vitest";
import { proofLabel, toBlindProof } from "./project";
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

  it("types schools, places, employers and personal details", () => {
    const { text, report } = redact(
      "I did my MSc at the University of Tehran and later studied at Aalto. I worked at Nordwave Systems in Espoo. As a mother of two I am 34 years old and a native Arabic speaker. Syrian by birth.",
    );
    expect(text).toContain("[school]");
    expect(text).toContain("[place]");
    expect(text).toContain("[employer]");
    expect(text).toContain("[personal detail]");
    expect(text).not.toMatch(/Tehran|Aalto|Nordwave|Espoo|mother|34 years|Arabic|Syrian/);
    expect(report.schools).toBe(2);
  });

  it("removes links to profiles and Finnish city forms", () => {
    const { text } = redact("See linkedin.com/in/someone and https://github.com/someone. Asun Helsingissä.");
    expect(text).not.toMatch(/linkedin|github|Helsingissä/);
  });

  it("leaves technical content alone", () => {
    const work = "Retry 3 times with backoff. The query returns 10 rows at 0.05 seconds. Use AWS for storage.";
    expect(redact(work).text).toBe(work);
  });
});

describe("toBlindProof", () => {
  it("builds the reviewer view by allow-list with a neutral label", () => {
    const proof = toBlindProof({
      proofId: "p1",
      challenge: { id: "c1", title: "Task", coreSkills: [{ id: "sql", label: "SQL", why: "x" }] },
      work: "w",
      explain: [{ question: "q", answer: "a", extra: "hidden" } as never],
      aiSummary: "s",
      redactions: { names: 0, contacts: 0, places: 0, schools: 0, employers: 0, other: 0 },
      submittedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(JSON.stringify(proof)).not.toContain("hidden");
    expect(proof.label).toMatch(/^Proof [A-Z][1-9]$/);
    expect(proofLabel("p1")).toBe(proof.label);
  });
});
