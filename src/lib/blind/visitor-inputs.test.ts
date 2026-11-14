import { describe, expect, it } from "vitest";
import { TABLE_INPUTS, TABLE_KNOWN, TABLE_TECHNICAL, TABLE_WORK } from "../../../evals/fixtures/table-inputs";
import { redact } from "./redact";

describe("visitor inputs from the table", () => {
  it.each(TABLE_INPUTS)("hides identity in: $answer", ({ answer, leaks }) => {
    const { text } = redact(answer, TABLE_KNOWN);
    for (const leak of leaks) expect(text.toLowerCase()).not.toContain(leak.toLowerCase());
    expect(text).toContain(TABLE_WORK);
  });

  it.each(TABLE_TECHNICAL)("leaves technical text intact: %s", (input) => {
    expect(redact(input, TABLE_KNOWN).text).toBe(input);
  });

  it("counts the name and the age apart", () => {
    const { report } = redact("Ahmed Al-Sayed, 34, from the night shift.", TABLE_KNOWN);
    expect(report.names).toBe(1);
    expect(report.other).toBe(1);
  });
});
