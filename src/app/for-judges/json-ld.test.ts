import { describe, expect, it } from "vitest";
import { SUMMARY } from "./facts";
import { jsonLdScript, structuredData } from "./json-ld";

describe("structuredData", () => {
  const data = structuredData("https://workproof.example.org/", "https://github.com/felixwickholm/workproof/");
  const graph = data["@graph"] as Record<string, unknown>[];
  const byType = (type: string) => graph.find((node) => node["@type"] === type) as Record<string, unknown>;

  it("describes the app, its code, the entry and the event", () => {
    expect(graph.map((node) => node["@type"])).toEqual(["SoftwareApplication", "SoftwareSourceCode", "CreativeWork", "Event"]);
    expect(byType("SoftwareApplication")).toMatchObject({ name: "WorkProof", url: "https://workproof.example.org", description: SUMMARY });
    expect(byType("SoftwareSourceCode")).toMatchObject({ codeRepository: "https://github.com/felixwickholm/workproof", programmingLanguage: "TypeScript" });
    expect(byType("CreativeWork").name).toBe('WorkProof: Junction 2026 entry for the City of Espoo challenge "Rethinking Recruitment"');
    expect(byType("CreativeWork").url).toBe("https://workproof.example.org/for-judges");
  });

  it("links the nodes by id", () => {
    const ids = new Set(graph.map((node) => node["@id"]).filter(Boolean));
    const refs = JSON.stringify(data).match(/"@id":"[^"]+"/g) ?? [];
    for (const ref of refs) expect(ids.has(ref.slice(7, -1))).toBe(true);
  });

  it("cannot close its script element", () => {
    expect(jsonLdScript({ text: "</script><script>alert(1)</script>" })).not.toContain("</");
  });
});
