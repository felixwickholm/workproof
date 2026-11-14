import { describe, expect, it } from "vitest";
import { jpegProblem } from "@/lib/http/jpeg";
import { CLEAN, dataUrl, EXIF, ICC, IPTC, jpeg, JFIF } from "@/lib/http/jpeg-test-data";
import { dataUrlBytes, encodeUnderLimit, fitWithin, withoutMetadata } from "./picture";

/** A fake encoder whose output shrinks with the quality, like a JPEG does. */
const fakeJpeg = (bytesAtFull: number) => async (quality: number) =>
  `data:image/jpeg;base64,${"A".repeat(Math.ceil((bytesAtFull * quality * 4) / 3))}`;

describe("picture re-encoding", () => {
  it("scales the longest side down to 1280 and never up", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 1280, height: 960 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 960, height: 1280 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("counts the decoded bytes of a data URL", () => {
    expect(dataUrlBytes("data:image/jpeg;base64,AAAA")).toBe(3);
    expect(dataUrlBytes("data:image/jpeg;base64,AAA=")).toBe(2);
  });

  it("keeps quality 0.8 when it fits", async () => {
    const qualities: number[] = [];
    const url = await encodeUnderLimit(async (q) => {
      qualities.push(q);
      return fakeJpeg(100_000)(q);
    }, 300_000);
    expect(qualities).toEqual([0.8]);
    expect(url).not.toBeNull();
  });

  it("lowers the quality until the picture is under the limit", async () => {
    const qualities: number[] = [];
    const url = await encodeUnderLimit(async (q) => {
      qualities.push(q);
      return fakeJpeg(500_000)(q);
    }, 300_000);
    expect(qualities).toEqual([0.8, 0.7, 0.6]);
    expect(dataUrlBytes(url ?? "")).toBeLessThanOrEqual(300_000);
  });

  it("gives up when even the lowest quality is too large", async () => {
    expect(await encodeUnderLimit(fakeJpeg(5_000_000), 300_000)).toBeNull();
  });

  it("takes out the segments a browser's canvas encoder adds, so the server accepts the picture", () => {
    const fromCanvas = dataUrl(jpeg(JFIF, ICC, EXIF, IPTC));
    const clean = withoutMetadata(fromCanvas);
    expect(clean).toBe(dataUrl(CLEAN));
    expect(jpegProblem(Buffer.from((clean ?? "").split(",")[1], "base64"))).toBeUndefined();
    expect(withoutMetadata("data:image/png;base64,iVBORw0KGgo=")).toBeNull();
  });
});
