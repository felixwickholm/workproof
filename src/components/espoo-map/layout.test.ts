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

const build = (width: number) => buildMapLayout({ companies, flows, variant: "panel", width });

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

  it("draws accent states last so they sit on top", () => {
    expect(build(460).flows.map((f) => f.flow.state)).toEqual(["sent", "sent", "answered", "invited", "met"]);
  });

  it("gives each proof to the same company its own curve", () => {
    const kaari = build(460).flows.filter((f) => f.flow.companyId === "co-kaari");
    expect(new Set(kaari.map((f) => f.path)).size).toBe(3);
  });

  it("sizes nodes by proofs received", () => {
    const sizes = Object.fromEntries(build(460).nodes.map((n) => [n.company.id, n.size]));
    expect(sizes["co-kaari"]).toBe(2);
    expect(sizes["co-merituuli"]).toBe(0);
  });

  it("labels the venue and the busiest companies without overlaps", () => {
    const { labels } = build(600);
    expect(labels.map((l) => l.text)).toEqual(expect.arrayContaining(["Espoo Talent Day", "Kaari Home Care"]));
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const [a, b] = [labels[i], labels[j]];
        const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
        expect(apart, `${a.text} / ${b.text}`).toBe(true);
      }
    }
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
  const named = (variant: "hero" | "panel", width: number) =>
    buildMapLayout({ ...event, variant, width })
      .labels.filter((l) => l.kind === "company")
      .map((l) => l.text);

  it.each([
    ["hero", 560],
    ["hero", 640],
    ["panel", 680],
  ] as const)("names every employer on a wide %s map (%ipx)", (variant, width) => {
    expect(named(variant, width).sort()).toEqual(event.companies.map((c) => c.name).sort());
  });

  it.each([
    ["hero", 358],
    ["panel", 318],
  ] as const)("names only the four busiest employers on a narrow %s map (%ipx)", (variant, width) => {
    expect(named(variant, width)).toHaveLength(4);
  });

  it.each([358, 600, 680])("keeps every label apart, inside the map and off the inset at %ipx", (width) => {
    const { labels, view, inset, nodes, venue } = buildMapLayout({ ...event, variant: "hero", width });
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

  it("draws plain dots: no company dot is large enough for initials", () => {
    const { nodes, scale } = buildMapLayout({ ...event, variant: "hero", width: 640 });
    for (const node of nodes) expect(node.r * 2 * scale).toBeLessThan(28);
  });

  it("joins a label that sits further out to its dot with a leader", () => {
    const { labels, leaders } = buildMapLayout({ ...event, variant: "hero", width: 600 });
    expect(leaders.map((l) => l.id).sort()).toEqual(labels.filter((l) => l.leader).map((l) => l.id).sort());
  });
});

