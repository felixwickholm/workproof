import { MAX_PICTURE_BYTES } from "./limits";

const PREFIX = "data:image/jpeg;base64,";
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** Smallest and largest side a picture of the work may have, in pixels. */
const MIN_PICTURE_SIDE = 16;
const MAX_PICTURE_SIDE = 4096;

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const DQT = 0xdb;
const DHT = 0xc4;
const DRI = 0xdd;
const APP0 = 0xe0;
/** Baseline, extended sequential and progressive Huffman frames: what canvas encoders write. */
const FRAMES = new Set([0xc0, 0xc1, 0xc2]);

/** One marker segment, from its first 0xFF to the end of its payload (and, for a scan, its image data). */
interface Segment {
  marker: number;
  start: number;
  /** First payload byte, just after the two length bytes. */
  body: number;
  /** Payload length, without the two length bytes. */
  size: number;
  end: number;
}

/** Markers that stand alone inside image data: RST0-RST7. */
const isRestart = (marker: number) => marker >= 0xd0 && marker <= 0xd7;
/** APP0-APP15 and COM: where encoders and cameras keep metadata. */
const isMetadata = (marker: number) => (marker >= 0xe0 && marker <= 0xef) || marker === 0xfe;

/** The end of a scan's image data: the next 0xFF that is neither byte stuffing (FF 00) nor a restart marker. */
function scanEnd(bytes: Uint8Array, from: number): number {
  let at = from;
  while (at < bytes.length) {
    if (bytes[at] === 0xff && at + 1 < bytes.length) {
      const next = bytes[at + 1];
      if (next === 0x00 || isRestart(next)) {
        at += 2;
        continue;
      }
      return at;
    }
    at += 1;
  }
  return at;
}

/**
 * Splits a JPEG into its segments, SOI to EOI, checking every length on the way. Returns a reason
 * instead when the file is not a complete JPEG or carries bytes after its end.
 */
function segmentsOf(bytes: Uint8Array): Segment[] | string {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== SOI) return "the picture is not a JPEG";
  const segments: Segment[] = [{ marker: SOI, start: 0, body: 2, size: 0, end: 2 }];
  let at = 2;
  for (;;) {
    if (at >= bytes.length) return "the picture is cut off before its end";
    if (bytes[at] !== 0xff) return "the picture is not a well-formed JPEG";
    let m = at + 1;
    while (m < bytes.length && bytes[m] === 0xff) m += 1;
    if (m >= bytes.length) return "the picture is cut off before its end";
    const marker = bytes[m];
    if (marker === EOI) {
      segments.push({ marker, start: at, body: m + 1, size: 0, end: m + 1 });
      return m + 1 === bytes.length ? segments : "the picture has extra bytes after its end";
    }
    if (marker === 0x00 || marker === SOI || marker === 0x01 || isRestart(marker)) return "the picture is not a well-formed JPEG";
    if (m + 2 >= bytes.length) return "the picture is cut off before its end";
    const length = (bytes[m + 1] << 8) | bytes[m + 2];
    if (length < 2) return "the picture has a segment with a wrong length";
    const body = m + 3;
    const size = length - 2;
    if (body + size > bytes.length) return "the picture has a segment with a wrong length";
    const end = marker === SOS ? scanEnd(bytes, body + size) : body + size;
    segments.push({ marker, start: at, body, size, end });
    at = end;
  }
}

/** APP0 written as a plain JFIF header with no thumbnail: the only APP segment a clean picture keeps. */
function isPlainJfif(bytes: Uint8Array, s: Segment): boolean {
  const id = String.fromCharCode(...bytes.subarray(s.body, s.body + 5));
  return s.marker === APP0 && s.size === 14 && id === "JFIF\0" && bytes[s.body + 12] === 0 && bytes[s.body + 13] === 0;
}

/** The segments a metadata-free baseline or progressive JPEG needs, and nothing else. */
function isAllowed(bytes: Uint8Array, s: Segment): boolean {
  return s.marker === SOI || s.marker === EOI || s.marker === SOS || s.marker === DQT || s.marker === DHT || s.marker === DRI || FRAMES.has(s.marker) || isPlainJfif(bytes, s);
}

function frameProblem(bytes: Uint8Array, s: Segment): string | undefined {
  const components = bytes[s.body + 5];
  if (s.size < 6 || components < 1 || s.size !== 6 + 3 * components) return "the picture has a broken frame header";
  const height = (bytes[s.body + 1] << 8) | bytes[s.body + 2];
  const width = (bytes[s.body + 3] << 8) | bytes[s.body + 4];
  const fits = (side: number) => side >= MIN_PICTURE_SIDE && side <= MAX_PICTURE_SIDE;
  if (!fits(width) || !fits(height)) return `the picture must be ${MIN_PICTURE_SIDE} to ${MAX_PICTURE_SIDE} pixels on each side`;
  return undefined;
}

function scanProblem(bytes: Uint8Array, s: Segment): string | undefined {
  const components = bytes[s.body];
  return s.size < 1 || components < 1 || s.size !== 4 + 2 * components ? "the picture has a broken scan header" : undefined;
}

/**
 * Why a JPEG is not a clean picture of the work, or undefined when it is. A real structural check:
 * SOI first; every segment with a valid length; only the segments a metadata-free JPEG needs (JFIF APP0
 * without a thumbnail, DQT, DHT, SOF0-SOF2, DRI, SOS), so EXIF, XMP, ICC, IPTC and comments are refused
 * wherever they sit, also between scans; exactly one frame before the first scan, 16 to 4096 px a side;
 * and EOI as the very last bytes.
 */
export function jpegProblem(bytes: Uint8Array): string | undefined {
  const segments = segmentsOf(bytes);
  if (typeof segments === "string") return segments;
  let frames = 0;
  let scans = 0;
  for (const s of segments) {
    if (isMetadata(s.marker) && !isPlainJfif(bytes, s)) return "the picture still has camera details or other metadata; take it again in the app";
    if (!isAllowed(bytes, s)) return "the picture uses a JPEG feature that is not accepted";
    if (FRAMES.has(s.marker)) {
      frames += 1;
      if (frames > 1 || scans > 0) return "the picture has more than one frame header";
      const problem = frameProblem(bytes, s);
      if (problem) return problem;
    }
    if (s.marker === DRI && s.size !== 2) return "the picture has a segment with a wrong length";
    if (s.marker === SOS) {
      if (frames === 0) return "the picture has no frame header";
      scans += 1;
      const problem = scanProblem(bytes, s);
      if (problem) return problem;
    }
  }
  return scans === 0 ? "the picture has no image data" : undefined;
}

/**
 * The same JPEG without its metadata segments (every APPn but a plain JFIF header, and COM). Browsers'
 * canvas encoders add some on their own: Chrome an ICC colour profile (APP2), Safari an EXIF block (APP1)
 * and Photoshop IPTC (APP13). The pixels and tables are kept byte for byte. Null when the file is not a JPEG.
 */
export function stripJpegMetadata(bytes: Uint8Array): Uint8Array | null {
  const segments = segmentsOf(bytes);
  if (typeof segments === "string") return null;
  const kept = segments.filter((s) => !isMetadata(s.marker) || isPlainJfif(bytes, s));
  const out = new Uint8Array(kept.reduce((sum, s) => sum + s.end - s.start, 0));
  let at = 0;
  for (const s of kept) {
    out.set(bytes.subarray(s.start, s.end), at);
    at += s.end - s.start;
  }
  return out;
}

/**
 * Why a visitor's picture cannot be accepted, or undefined when it can: a base64 JPEG data URL,
 * at most MAX_PICTURE_BYTES once decoded, that passes the structural check.
 */
export function pictureProblem(src: string): string | undefined {
  if (!src.startsWith(PREFIX)) return "only a JPEG picture made in the browser is accepted";
  const body = src.slice(PREFIX.length);
  if (!BASE64.test(body)) return "the picture is not valid base64";
  if (Math.floor((body.length * 3) / 4) > MAX_PICTURE_BYTES + 2) return "the picture is larger than 300 kB";
  const bytes = Buffer.from(body, "base64");
  if (bytes.byteLength > MAX_PICTURE_BYTES) return "the picture is larger than 300 kB";
  return jpegProblem(bytes);
}
