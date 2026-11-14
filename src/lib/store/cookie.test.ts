import { describe, expect, it } from "vitest";
import { isSecureRequest, sandboxCookie } from "./cookie";

const request = (url: string, headers?: Record<string, string>) => new Request(url, { headers });

describe("isSecureRequest", () => {
  it("reads the protocol of a direct request", () => {
    expect(isSecureRequest(request("https://workprint.example.org/table"))).toBe(true);
    expect(isSecureRequest(request("http://192.168.1.20:3000/table"))).toBe(false);
  });

  it("trusts the protocol a proxy forwards, first value first", () => {
    expect(isSecureRequest(request("http://app:3000/", { "x-forwarded-proto": "https" }))).toBe(true);
    expect(isSecureRequest(request("http://app:3000/", { "x-forwarded-proto": "https, http" }))).toBe(true);
    expect(isSecureRequest(request("https://app:3000/", { "x-forwarded-proto": "http" }))).toBe(false);
  });
});

describe("sandboxCookie", () => {
  it("is never readable by page scripts and is Secure only over HTTPS", () => {
    expect(sandboxCookie("sb_1", true)).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(sandboxCookie("sb_1", false).secure).toBe(false);
  });
});
