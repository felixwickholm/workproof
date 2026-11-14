import { describe, expect, it } from "vitest";
import { nodeMarks } from "./node-marks";

const company = (id: string, name: string) => ({ id, name });

describe("nodeMarks", () => {
  it("keeps one letter when no other company shares it", () => {
    const marks = nodeMarks([company("a", "Otso Health"), company("b", "Vesto Energy")]);
    expect(marks.get("a")).toBe("O");
    expect(marks.get("b")).toBe("V");
  });

  it("gives every company in a shared first letter its own two-letter mark", () => {
    const marks = nodeMarks([
      company("kaari", "Kaari Home Care"),
      company("kuulas", "Kuulas Studio"),
      company("kirkas", "Kirkas Facility Services"),
      company("kivira", "Kivira Labs"),
      company("otso", "Otso Health"),
    ]);
    expect(Object.fromEntries(marks)).toEqual({ kaari: "Ka", kirkas: "Ki", kivira: "Kv", kuulas: "Ku", otso: "O" });
  });

  it("does not depend on the order the companies arrive in", () => {
    const list = [company("x", "Kivira Labs"), company("y", "Kirkas Facility Services"), company("z", "Kaari Home Care")];
    expect(Object.fromEntries(nodeMarks(list))).toEqual(Object.fromEntries(nodeMarks([...list].reverse())));
  });

  it("skips spaces and punctuation when it looks for the second letter", () => {
    const marks = nodeMarks([company("lab", "K-Lab"), company("kaari", "Kaari")]);
    expect(Object.fromEntries(marks)).toEqual({ kaari: "Ka", lab: "Kl" });
  });
});
