import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { buildCityOverview } from "@/lib/service/views/city";
import { buildMapLayout, type MapLabel } from "./layout";
import type { FlowMapCompany, FlowMapFlow } from "./types";

const companies: FlowMapCompany[] = [
  { id: "co-kaari", name: "Kaari Home Care", sector: "Home care", district: "Matinkylä" },
  { id: "co-otso", name: "Otso Health", sector: "Occupational health", district: "Tapiola" },
  { id: "co-merituuli", name: "Merituuli Kitchen", sector: "Restaurants", district: "Tapiola" },
  { id: "co-kuulas", name: "Kuulas Studio", sector: "Design", district: "Otaniemi" },
  { id: "co-saarnivo", name: "Saarnivo Grid", sector: "Energy software", district: "Otaniemi" },
];

const flows: FlowMapFlow[] = [
  { proofLabel: "K1", companyId: "co-kaari", state: "met" },
  { proofLabel: "K2", companyId: "co-kaari", state: "sent" },
  { proofLabel: "K3", companyId: "co-kaari", state: "answered" },
  { proofLabel: "O1", companyId: "co-otso", state: "invited" },
  { proofLabel: "L1", companyId: "co-kuulas", state: "sent" },
  { proofLabel: "X1", companyId: "co-unknown", state: "sent" },
];

const build = (width: number, list = companies) => buildMapLayout({ companies: list, flows, variant: "panel", width });

describe("buildMapLayout", () => {
  it("is deterministic", () => {
    expect(build(460)).toEqual(build(460));
  });

  it("keeps markers apart, including from the venue", () => {
    const { nodes, venue, scale } = build(358);
    const markers = [venue, ...nodes];
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        const distance = Math.hypot(markers[i].x - markers[j].x, markers[i].y - markers[j].y);
        expect(distance).toBeGreaterThanOrEqual(markers[i].r + markers[j].r + 2.9 / scale);
      }
    }
  });

  it("skips flows to companies that are not on the map", () => {
    expect(build(460).flows.map((f) => f.flow.proofLabel)).not.toContain("X1");
  });

  it("draws one line per company and stage, dashed handed-in first and the accent last", () => {
    const { lines } = build(460);
    expect(lines.map((l) => `${l.companyId}:${l.stage}`)).toEqual(["co-kaari:sent", "co-kuulas:sent", "co-kaari:scored", "co-kaari:invited", "co-otso:invited"]);
  });

  it("keeps one travelling dot per piece of work, on its stage's line", () => {
    const { flows, lines } = build(460);
    expect(flows).toHaveLength(5);
    const kaari = flows.filter((f) => f.flow.companyId === "co-kaari");
    expect(new Set(kaari.map((f) => f.path)).size).toBe(3);
    for (const flow of flows) expect(lines.some((l) => l.path === flow.path)).toBe(true);
  });

  it("sizes pins by work received and shapes them by family", () => {
    const nodes = Object.fromEntries(build(460).nodes.map((n) => [n.company.id, n]));
    expect(nodes["co-kaari"].size).toBe(2);
    expect(nodes["co-merituuli"].size).toBe(0);
    expect(nodes["co-kaari"].family).toBe("people");
    expect(nodes["co-merituuli"].family).toBe("commercial");
    expect(nodes["co-saarnivo"].family).toBe("technical");
  });

  it("names the venue and the seven districts without overlaps", () => {
    const { labels } = build(600);
    expect(labels.map((l) => l.text)).toEqual(
      expect.arrayContaining(["Espoo Talent Day", "Otaniemi", "Keilaniemi", "Tapiola", "Leppävaara", "Matinkylä", "Espoonlahti", "Espoon keskus"]),
    );
    expectApart(labels);
  });

  it("names Kera only when a company sits there", () => {
    const district = (list: FlowMapCompany[]) => build(600, list).regions.map((r) => r.name);
    expect(district(companies)).not.toContain("Kera");
    expect(district([...companies, { id: "co-k", name: "K", sector: "Robotics", district: "Kera" }])).toContain("Kera");
  });

  it("adds sea below the coast for the headline figures, and keeps labels out of it", () => {
    const plain = build(600);
    const withFigures = buildMapLayout({ companies, flows, variant: "panel", width: 600, withHeadline: true });
    expect(plain.headline).toBeNull();
    expect(withFigures.view.height).toBeGreaterThan(plain.view.height);
    const box = withFigures.headline!;
    for (const l of withFigures.labels) expect(l.y + l.height <= box.y, l.text).toBe(true);
  });

  it("never draws figures on the compact thumbnail", () => {
    expect(buildMapLayout({ companies, flows, variant: "compact", width: 320, withHeadline: true }).headline).toBeNull();
  });

  it("draws no labels on the compact thumbnail", () => {
    expect(buildMapLayout({ companies, flows, variant: "compact", width: 320 }).labels).toEqual([]);
  });
});

/** The demo event as the landing page and the city panel draw it. */
function demoEvent() {
  const city = buildCityOverview(buildSeed(new Date("2026-11-14T10:00:00Z"), "invited"));
  return { companies: city.insights.companies, flows: city.insights.flows };
}

function expectApart(labels: readonly MapLabel[]) {
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const [a, b] = [labels[i], labels[j]];
      const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
      expect(apart, `${a.text} / ${b.text}`).toBe(true);
    }
  }
}

describe("buildMapLayout on the demo event", () => {
  const event = demoEvent();
  const DISTRICTS = ["Otaniemi", "Keilaniemi", "Tapiola", "Leppävaara", "Matinkylä", "Espoonlahti", "Espoon keskus"];

  it.each([
    ["hero", 560],
    ["hero", 640],
    ["panel", 688],
  ] as const)("names every district on a wide %s map (%ipx)", (variant, width) => {
    const names = buildMapLayout({ ...event, variant, width, withHeadline: true }).labels.filter((l) => l.kind === "district").map((l) => l.text);
    expect(names).toEqual(expect.arrayContaining(DISTRICTS));
  });

  it("names no company until a proof is traced", () => {
    expect(buildMapLayout({ ...event, variant: "hero", width: 640 }).labels.filter((l) => l.kind === "company")).toEqual([]);
    const proof = event.flows[0].proofLabel;
    const traced = buildMapLayout({ ...event, variant: "hero", width: 640, highlightProof: proof });
    expect(traced.labels.map((l) => l.kind)).toEqual(expect.arrayContaining(["proof", "company"]));
  });

  it.each([358, 600, 680])("keeps every label apart, inside the map, off the inset and off every pin at %ipx", (width) => {
    const { labels, view, inset, nodes, venue } = buildMapLayout({ ...event, variant: "hero", width, withHeadline: true });
    expectApart(labels);
    for (const l of labels) {
      expect(l.x).toBeGreaterThanOrEqual(view.x);
      expect(l.x + l.width).toBeLessThanOrEqual(view.x + view.width);
      expect(l.y).toBeGreaterThanOrEqual(view.y);
      expect(l.y + l.height).toBeLessThanOrEqual(view.y + view.height);
      expect(inset && l.x < inset.x + inset.width && inset.x < l.x + l.width && l.y < inset.y + inset.height && inset.y < l.y + l.height).toBeFalsy();
      for (const m of [venue, ...nodes]) {
        const nx = Math.max(l.x, Math.min(m.x, l.x + l.width));
        const ny = Math.max(l.y, Math.min(m.y, l.y + l.height));
        expect(Math.hypot(m.x - nx, m.y - ny), `${l.text} on a marker`).toBeGreaterThanOrEqual(m.r);
      }
    }
  });

  it("sets no map text under 14px on a wide map or 13px on a phone", () => {
    for (const l of buildMapLayout({ ...event, variant: "hero", width: 640 }).labels) expect(l.fontSize).toBeGreaterThanOrEqual(14);
    for (const l of buildMapLayout({ ...event, variant: "hero", width: 358 }).labels) expect(l.fontSize).toBeGreaterThanOrEqual(13);
  });

  it("weights lines in three steps", () => {
    const weights = new Set(buildMapLayout({ ...event, variant: "panel", width: 680 }).lines.map((l) => l.weight));
    expect(weights.size).toBeLessThanOrEqual(3);
    expect(weights.size).toBeGreaterThan(1);
  });

  it("joins a venue or company label that sits further out to its marker with a leader", () => {
    const { labels, leaders } = buildMapLayout({ ...event, variant: "hero", width: 600 });
    const ids = labels.filter((l) => l.leader && (l.kind === "venue" || l.kind === "company")).map((l) => l.id);
    expect(leaders.map((l) => l.id).sort()).toEqual(ids.sort());
  });
});
