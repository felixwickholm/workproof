import { describe, expect, it } from "vitest";
import { redact } from "@/lib/blind/redact";
import { markHidden } from "./mark-hidden";

const hiddenOf = (original: string, blind: string) => markHidden(original, blind).filter((s) => s.hidden).map((s) => s.text);
const joined = (original: string, blind: string) => markHidden(original, blind).map((s) => s.text).join("");

describe("markHidden", () => {
  it("finds a detail at the start", () => {
    expect(hiddenOf("Olena here. I keep the insulin visit.", "[name] here. I keep the insulin visit.")).toEqual(["Olena"]);
  });

  it("finds a detail at the end", () => {
    expect(hiddenOf("Thanks for reading.\nOlena Kovalenko", "Thanks for reading.\n[hidden]")).toEqual(["Olena Kovalenko"]);
  });

  it("joins adjacent tokens into one span", () => {
    expect(hiddenOf("I studied at Kyiv Medical Institute in Kyiv, then moved.", "I studied at [school][place], then moved.")).toEqual([
      "Kyiv Medical Institute in Kyiv",
    ]);
  });

  it("marks nothing when nothing was hidden", () => {
    expect(markHidden("Insulin at 08:00 stays.", "Insulin at 08:00 stays.")).toEqual([{ text: "Insulin at 08:00 stays.", hidden: false }]);
  });

  it("keeps repeated words apart", () => {
    expect(hiddenOf("Anna and Anna met at Anna's.", "[name] and [name] met at [name]'s.")).toEqual(["Anna", "Anna", "Anna"]);
  });

  it("works across lines", () => {
    const original = "Keep A.\nI worked at Yöpuhdas Oy in Espoo.\nMove B.";
    expect(hiddenOf(original, "Keep A.\nI worked at [employer] in [place].\nMove B.")).toEqual(["Yöpuhdas Oy", "Espoo"]);
  });

  it("finds the right end when the hidden span contains the closing text", () => {
    expect(hiddenOf("I trained at No. 2. I came", "I trained at [school]. I came")).toEqual(["No. 2"]);
  });

  it("returns the original unmarked when the blind text is from somewhere else", () => {
    expect(markHidden("Plan A", "Something [hidden] else")).toEqual([{ text: "Plan A", hidden: false }]);
  });

  it("always rebuilds the original exactly", () => {
    const original = "Call the daughter of client F at 7:00.\nOlena Kovalenko, olena@example.org";
    const blind = "Call the daughter of client F at 7:00.\n[name], [contact]";
    expect(joined(original, blind)).toBe(original);
  });

  it("lines up with the real blind layer on the story proof", () => {
    const original = [
      "Planning a ward morning was my daily work.",
      "I was a doctor in Kyiv for 11 years, after Kyiv Medical Institute No. 2. Now I work at Yöpuhdas Oy in Espoo.",
      "",
      "Olena Kovalenko",
    ].join("\n");
    const blind = redact(original, { name: "Olena Kovalenko" }).text;
    const segments = markHidden(original, blind);
    expect(segments.map((s) => s.text).join("")).toBe(original);
    expect(segments.some((s) => s.hidden && s.text.includes("Olena"))).toBe(true);
  });
});
