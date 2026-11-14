import { describe, expect, it } from "vitest";
import { ApiError, errorText } from "./api";

describe("errorText", () => {
  it("says to wait when the server limits changes", () => {
    expect(errorText(new ApiError("Too many requests.", 429))).toBe("Too many changes in a short time. Wait a minute and try again.");
  });

  it("keeps the plain lines for a missing page, no connection and a server fault", () => {
    expect(errorText(new ApiError("Not found", 404))).toBe("It is not available right now.");
    expect(errorText(new TypeError("fetch failed"))).toBe("You seem to be offline. Check the connection and try again.");
    expect(errorText(new ApiError("Boom", 500))).toBe("Something went wrong on our side. Try again.");
  });
});
