import { describe, expect, it } from "vitest";
import {
  arrivedAgo,
  earlierLine,
  inviteLine,
  isLocalOrigin,
  joinedCode,
  joinOrigin,
  publicOriginOf,
  tableCounter,
  tableJoinUrl,
  tableShortUrl,
} from "./table-copy";

describe("table links", () => {
  it("joins the table and remembers the code past the join redirect", () => {
    expect(tableJoinUrl("https://workproof.example.org", "K7M2QX")).toBe("https://workproof.example.org/try?table=K7M2QX&joined=K7M2QX");
  });

  it("keeps the port of a local address", () => {
    expect(tableJoinUrl("http://192.168.1.20:3000", "K7M2QX")).toBe("http://192.168.1.20:3000/try?table=K7M2QX&joined=K7M2QX");
    expect(tableShortUrl("http://192.168.1.20:3000", "K7M2QX")).toBe("192.168.1.20:3000/try/K7M2QX");
  });

  it("reads the joined code in any case, and nothing when it is missing", () => {
    expect(joinedCode("?joined=k7m2qx")).toBe("K7M2QX");
    expect(joinedCode("?joined=")).toBeNull();
    expect(joinedCode("")).toBeNull();
  });
});

describe("the address in the QR code", () => {
  it("knows which addresses only this computer can open", () => {
    expect(isLocalOrigin("http://localhost:3000")).toBe(true);
    expect(isLocalOrigin("http://127.0.0.1:3000")).toBe(true);
    expect(isLocalOrigin("http://workproof.localhost")).toBe(true);
    expect(isLocalOrigin("http://192.168.1.20:3000")).toBe(false);
    expect(isLocalOrigin("https://workproof.example.org")).toBe(false);
  });

  it("uses the public address on localhost, and the page's own address everywhere else", () => {
    expect(joinOrigin("http://localhost:3000", "https://workproof.example.org")).toBe("https://workproof.example.org");
    expect(joinOrigin("http://192.168.1.20:3000", "https://workproof.example.org")).toBe("http://192.168.1.20:3000");
    expect(joinOrigin("http://localhost:3000", null)).toBe("http://localhost:3000");
  });

  it("takes only a web address from the setting", () => {
    expect(publicOriginOf("https://workproof.example.org/")).toBe("https://workproof.example.org");
    expect(publicOriginOf("workproof.example.org")).toBeNull();
    expect(publicOriginOf("javascript:alert(1)")).toBeNull();
    expect(publicOriginOf(undefined)).toBeNull();
  });
});

describe("arrivedAgo", () => {
  const now = Date.parse("2026-11-14T12:00:00Z");
  it("starts lower case so it reads inside a row", () => {
    expect(arrivedAgo("2026-11-14T11:59:40Z", now)).toBe("just now");
    expect(arrivedAgo("2026-11-14T11:57:00Z", now)).toBe("3 min ago");
    expect(arrivedAgo("2026-11-13T10:00:00Z", now)).toBe("yesterday");
  });
});

describe("row words", () => {
  it("counts proofs, and names only after a yes", () => {
    expect(tableCounter(0, 0)).toEqual({ proofs: "0 proofs from this table", names: "0 names shown, each after the person said yes" });
    expect(tableCounter(1, 1)).toEqual({ proofs: "1 proof from this table", names: "1 name shown, after the person said yes" });
    expect(tableCounter(7, 2).names).toBe("2 names shown, each after the person said yes");
  });

  it("folds older proofs into one line", () => {
    expect(earlierLine(0)).toBeNull();
    expect(earlierLine(4)).toBe("and 4 earlier");
  });

  it("says where an invitation stands without a name", () => {
    expect(inviteLine({ status: "invited", host: "Rami" })).toBe("Invited by Rami · waiting for the person");
    expect(inviteLine({ status: "declined", host: "Rami" })).toBe("The person said not now. Name never shown.");
    expect(inviteLine({ status: "accepted", host: "Rami" })).toBe("Invited by Rami · the person said yes");
  });
});
