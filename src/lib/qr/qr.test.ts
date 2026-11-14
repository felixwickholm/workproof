import { describe, expect, it } from "vitest";
import { QUIET_ZONE, qrMatrix, qrPath } from "./qr";

describe("qrMatrix", () => {
  const matrix = qrMatrix("https://workprint.example.org/try?table=K7M2QX&joined=K7M2QX");

  it("is square, with a size the QR standard allows", () => {
    const size = matrix.length;
    expect(matrix.every((row) => row.length === size)).toBe(true);
    expect((size - 17) % 4).toBe(0);
  });

  it("draws the three finder squares in the corners", () => {
    const size = matrix.length;
    for (const [r, c] of [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ]) {
      // The outer ring of each finder is dark, the ring inside it light, the centre dark.
      expect(matrix[r][c]).toBe(true);
      expect(matrix[r + 1][c + 1]).toBe(false);
      expect(matrix[r + 3][c + 3]).toBe(true);
    }
  });
});

describe("qrPath", () => {
  it("joins a run of dark modules into one rectangle, offset by the quiet zone", () => {
    expect(qrPath([[true, true, false, true]])).toBe(`M${QUIET_ZONE} ${QUIET_ZONE}h2v1h-2zM${3 + QUIET_ZONE} ${QUIET_ZONE}h1v1h-1z`);
  });

  it("draws nothing for an all-light matrix", () => {
    expect(qrPath([[false, false]], 0)).toBe("");
  });
});
