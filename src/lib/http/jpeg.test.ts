import { describe, expect, it } from "vitest";
import { hasExif, pictureProblem } from "./jpeg";
import { MAX_PICTURE_BYTES } from "./limits";

/** A JPEG header: SOI, the given segments, then start-of-scan and a little image data. */
function jpeg(...segments: number[][]): Uint8Array {
  return Uint8Array.from([0xff, 0xd8, ...segments.flat(), 0xff, 0xda, 0x00, 0x02, 0x11, 0x22, 0xff, 0xd9]);
}

const segment = (marker: number, payload: number[]) => [0xff, marker, (payload.length + 2) >> 8, (payload.length + 2) & 0xff, ...payload];
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0));

const JFIF = segment(0xe0, [...ascii("JFIF"), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
const QUANT = segment(0xdb, new Array(65).fill(1));
const EXIF = segment(0xe1, [...ascii("Exif"), 0, 0, 0x4d, 0x4d, 0, 0x2a]);
const XMP = segment(0xe1, ascii("http://ns.adobe.com/xap/1.0/\0<x/>"));

const dataUrl = (bytes: Uint8Array) => `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;

describe("hasExif", () => {
  it("accepts a clean JPEG as a browser canvas writes it", () => {
    expect(hasExif(jpeg(JFIF, QUANT))).toBe(false);
  });

  it("finds an EXIF or XMP segment wherever it sits in the header", () => {
    expect(hasExif(jpeg(EXIF))).toBe(true);
    expect(hasExif(jpeg(JFIF, QUANT, EXIF))).toBe(true);
    expect(hasExif(jpeg(JFIF, XMP))).toBe(true);
  });

  it("treats a file it cannot read as not clean", () => {
    expect(hasExif(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
    expect(hasExif(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toBe(true);
    expect(hasExif(Uint8Array.from([0xff, 0xd8, 0x00, 0x00, 0x00]))).toBe(true);
  });

  it("does not look for metadata inside the image data", () => {
    const tail = [0xff, 0xda, 0x00, 0x02, 0xff, 0xe1, 0x00, 0x04];
    expect(hasExif(Uint8Array.from([0xff, 0xd8, ...JFIF, ...tail]))).toBe(false);
  });
});

describe("pictureProblem", () => {
  it("accepts a small clean JPEG data URL", () => {
    expect(pictureProblem(dataUrl(jpeg(JFIF)))).toBeUndefined();
  });

  it("refuses other types, paths, broken base64, metadata and large pictures", () => {
    expect(pictureProblem("/demo/plate.jpg")).toMatch(/JPEG/);
    expect(pictureProblem("data:image/png;base64,iVBORw0KGgo=")).toMatch(/JPEG/);
    expect(pictureProblem("data:image/jpeg;base64,@@@")).toMatch(/base64/);
    expect(pictureProblem(dataUrl(jpeg(EXIF)))).toMatch(/camera/);
    const big = new Uint8Array(MAX_PICTURE_BYTES + 10);
    big.set(jpeg(JFIF));
    expect(pictureProblem(dataUrl(big))).toMatch(/300 kB/);
  });
});
