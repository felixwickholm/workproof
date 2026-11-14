import { describe, expect, it } from "vitest";
import type { Talent } from "@/lib/domain/types";
import { rememberTalent } from "./talent";

describe("rememberTalent", () => {
  it("lets an event submission complete a name given in a taster", () => {
    const talents: Talent[] = [];
    rememberTalent(talents, { id: "t1", name: "Aino", contact: "" }, false);
    rememberTalent(talents, { id: "t1", name: "Aino Mäkelä", contact: "aino@example.org" }, true);
    expect(talents).toEqual([{ id: "t1", name: "Aino Mäkelä", contact: "aino@example.org", locked: true }]);
  });

  it("never changes name or contact after the first event submission", () => {
    const talents: Talent[] = [];
    rememberTalent(talents, { id: "t1", name: "Daniel Okafor", contact: "daniel@example.org" }, true);
    rememberTalent(talents, { id: "t1", name: "Mallory Example", contact: "mallory@example.net" }, true);
    rememberTalent(talents, { id: "t1", name: "Mallory", contact: "" }, false);
    expect(talents[0]).toMatchObject({ name: "Daniel Okafor", contact: "daniel@example.org" });
  });
});
