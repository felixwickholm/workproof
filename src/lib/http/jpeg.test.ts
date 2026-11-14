import { describe, expect, it } from "vitest";
import { jpegProblem, pictureProblem, stripJpegMetadata } from "./jpeg";
import {
  ADOBE,
  CLEAN,
  COMMENT,
  dataUrl,
  EOI,
  EXIF,
  frame,
  HUFFMAN,
  ICC,
  IPTC,
  JFIF,
  JFIF_THUMBNAIL,
  jpeg,
  jpegOfSize,
  QUANT,
  RESTART_INTERVAL,
  scan,
  segment,
  SOI,
  XMP,
} from "./jpeg-test-data";
import { MAX_PICTURE_BYTES } from "./limits";

const bytes = (...parts: number[][]) => Uint8Array.from(parts.flat());

describe("jpegProblem", () => {
  const accepted: [string, Uint8Array][] = [
    ["a minimal JFIF baseline picture", CLEAN],
    ["no JFIF header at all", jpeg()],
    ["a restart interval, as Safari writes it", jpeg(JFIF, RESTART_INTERVAL)],
    ["tables after the frame header", bytes(SOI, JFIF, frame(640, 480), HUFFMAN, QUANT, scan(), EOI)],
    ["a progressive picture with tables between scans", bytes(SOI, JFIF, frame(640, 480, 0xc2), QUANT, HUFFMAN, scan(), HUFFMAN, scan(), EOI)],
    ["byte stuffing and restart markers inside the image data", bytes(SOI, JFIF, frame(640, 480), QUANT, HUFFMAN, scan([0x11, 0xff, 0x00, 0x22, 0xff, 0xd0, 0x33]), EOI)],
    ["the smallest and largest sides", bytes(SOI, frame(16, 4096), QUANT, HUFFMAN, scan(), EOI)],
  ];

  it.each(accepted)("accepts %s", (_, file) => {
    expect(jpegProblem(file)).toBeUndefined();
  });

  const refused: [string, Uint8Array, RegExp][] = [
    ["EXIF (APP1)", jpeg(JFIF, EXIF), /metadata/],
    ["XMP (APP1)", jpeg(JFIF, XMP), /metadata/],
    ["an ICC profile (APP2)", jpeg(JFIF, ICC), /metadata/],
    ["IPTC (APP13)", jpeg(JFIF, IPTC), /metadata/],
    ["an Adobe segment (APP14)", jpeg(JFIF, ADOBE), /metadata/],
    ["a comment (COM)", jpeg(JFIF, COMMENT), /metadata/],
    ["a JFIF thumbnail", jpeg(JFIF_THUMBNAIL), /metadata/],
    ["metadata hidden after the image data", bytes(SOI, JFIF, frame(640, 480), QUANT, HUFFMAN, scan(), EXIF, EOI), /metadata/],
    ["another file type", Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]), /not a JPEG/],
    ["a truncated header", CLEAN.subarray(0, 30), /cut off|wrong length/],
    ["a file cut before EOI", CLEAN.subarray(0, CLEAN.length - 2), /cut off/],
    ["a segment longer than the file", bytes(SOI, [0xff, 0xdb, 0x7f, 0xff, 0, 1, 2]), /wrong length/],
    ["a segment length under two", bytes(SOI, [0xff, 0xdb, 0x00, 0x01], EOI), /wrong length/],
    ["a wrong restart interval length", jpeg(JFIF, segment(0xdd, [0, 8, 0])), /wrong length/],
    ["no frame header", bytes(SOI, JFIF, QUANT, HUFFMAN, scan(), EOI), /no frame/],
    ["two frame headers", bytes(SOI, frame(640, 480), frame(640, 480), QUANT, HUFFMAN, scan(), EOI), /more than one frame/],
    ["no image data", bytes(SOI, JFIF, frame(640, 480), QUANT, EOI), /no image data/],
    ["a picture wider than 4096 px", bytes(SOI, frame(4097, 480), QUANT, HUFFMAN, scan(), EOI), /16 to 4096/],
    ["a picture under 16 px tall", bytes(SOI, frame(640, 15), QUANT, HUFFMAN, scan(), EOI), /16 to 4096/],
    ["a lossless frame (SOF3)", bytes(SOI, frame(640, 480, 0xc3), QUANT, HUFFMAN, scan(), EOI), /not accepted/],
    ["trailing bytes after EOI", bytes([...CLEAN], [0x00, 0x45, 0x78]), /extra bytes/],
    ["a second image after EOI", bytes([...CLEAN], [...CLEAN]), /extra bytes/],
    ["a broken scan header", bytes(SOI, frame(640, 480), QUANT, HUFFMAN, segment(0xda, [3, 1, 0]), [0x11], EOI), /scan header/],
  ];

  it.each(refused)("refuses %s", (_, file, reason) => {
    expect(jpegProblem(file)).toMatch(reason);
  });
});

describe("stripJpegMetadata", () => {
  it("removes the segments Chrome and Safari canvases add, and keeps the rest byte for byte", () => {
    const chrome = jpeg(JFIF, ICC);
    const safari = jpeg(JFIF, EXIF, IPTC, RESTART_INTERVAL);
    expect(jpegProblem(chrome)).toMatch(/metadata/);
    expect(stripJpegMetadata(chrome)).toEqual(CLEAN);
    expect(stripJpegMetadata(safari)).toEqual(jpeg(JFIF, RESTART_INTERVAL));
    expect(jpegProblem(stripJpegMetadata(safari) ?? new Uint8Array())).toBeUndefined();
  });

  it("removes metadata wherever it sits and leaves a file that is not a JPEG alone", () => {
    const late = bytes(SOI, JFIF, COMMENT, frame(640, 480), QUANT, HUFFMAN, scan(), XMP, EOI);
    expect(jpegProblem(stripJpegMetadata(late) ?? new Uint8Array())).toBeUndefined();
    expect(stripJpegMetadata(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
  });
});

describe("pictureProblem", () => {
  it("accepts a small clean JPEG data URL", () => {
    expect(pictureProblem(dataUrl(CLEAN))).toBeUndefined();
    expect(pictureProblem(dataUrl(jpegOfSize(MAX_PICTURE_BYTES)))).toBeUndefined();
  });

  it("refuses other types, paths, broken base64, metadata and large pictures", () => {
    expect(pictureProblem("/demo/plate.jpg")).toMatch(/JPEG/);
    expect(pictureProblem("data:image/png;base64,iVBORw0KGgo=")).toMatch(/JPEG/);
    expect(pictureProblem("data:image/jpeg;base64,@@@")).toMatch(/base64/);
    expect(pictureProblem(dataUrl(jpeg(JFIF, EXIF)))).toMatch(/camera/);
    expect(pictureProblem(dataUrl(jpegOfSize(MAX_PICTURE_BYTES + 1)))).toMatch(/300 kB/);
  });
});
