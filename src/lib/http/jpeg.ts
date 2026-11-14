import { MAX_PICTURE_BYTES } from "./limits";

const PREFIX = "data:image/jpeg;base64,";
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** Markers that stand alone, with no length field: RST0-RST7 and TEM. */
const standalone = (marker: number) => (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01;

/**
 * True when a JPEG still carries an APP1 segment (EXIF or XMP), where cameras keep the place,
 * time and device. Walks the header segments up to the image data. A header that cannot be
 * walked to the end counts as metadata too: a picture is accepted only when it is provably clean.
 */
export function hasExif(bytes: Uint8Array): boolean {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return true;
  let at = 2;
  while (at + 1 < bytes.length) {
    if (bytes[at] !== 0xff) return true;
    const marker = bytes[at + 1];
    if (marker === 0xff) {
      at += 1;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) return false;
    if (standalone(marker)) {
      at += 2;
      continue;
    }
    if (marker === 0xe1) return true;
    if (at + 3 >= bytes.length) return true;
    const length = (bytes[at + 2] << 8) | bytes[at + 3];
    if (length < 2) return true;
    at += 2 + length;
  }
  return true;
}

/**
 * Why a visitor's picture cannot be accepted, or undefined when it can: a base64 JPEG data URL,
 * at most MAX_PICTURE_BYTES once decoded, with no camera metadata.
 */
export function pictureProblem(src: string): string | undefined {
  if (!src.startsWith(PREFIX)) return "only a JPEG picture made in the browser is accepted";
  const body = src.slice(PREFIX.length);
  if (!BASE64.test(body)) return "the picture is not valid base64";
  if (Math.floor((body.length * 3) / 4) > MAX_PICTURE_BYTES + 2) return "the picture is larger than 300 kB";
  const bytes = Buffer.from(body, "base64");
  if (bytes.byteLength > MAX_PICTURE_BYTES) return "the picture is larger than 300 kB";
  if (hasExif(bytes)) return "the picture still has camera details; take it again in the app";
  return undefined;
}
