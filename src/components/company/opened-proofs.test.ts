import { describe, expect, it } from "vitest";
import { parseOpened, withOpened } from "./opened-proofs";

describe("parseOpened", () => {
  it("reads the stored ids", () => {
    expect([...parseOpened('["proof_1","proof_2"]')]).toEqual(["proof_1", "proof_2"]);
  });

  it("treats a missing or broken value as nothing opened", () => {
    expect(parseOpened(null).size).toBe(0);
    expect(parseOpened("not json").size).toBe(0);
    expect(parseOpened('{"a":1}').size).toBe(0);
    expect([...parseOpened('["proof_1",3,null]')]).toEqual(["proof_1"]);
  });
});

describe("withOpened", () => {
  it("adds an id once", () => {
    const once = withOpened(null, "proof_1");
    expect(JSON.parse(withOpened(once, "proof_1"))).toEqual(["proof_1"]);
    expect(JSON.parse(withOpened(once, "proof_2"))).toEqual(["proof_1", "proof_2"]);
  });
});
