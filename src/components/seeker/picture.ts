import { stripJpegMetadata } from "@/lib/http/jpeg";
import { MAX_PICTURE_BYTES } from "@/lib/http/limits";

/** Longest side of a picture after re-encoding. */
export const MAX_SIDE = 1280;
/** Qualities tried in turn until the picture fits under the size limit. */
export const QUALITIES = [0.8, 0.7, 0.6, 0.5, 0.4] as const;

/** Scales a picture down (never up) so its longest side is at most `max`. */
export function fitWithin(width: number, height: number, max = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Bytes a base64 data URL decodes to. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Encodes at quality 0.8 first and lowers it until the result fits under `limit` bytes.
 * Returns null when even the lowest quality is too large.
 */
export async function encodeUnderLimit(encode: (quality: number) => Promise<string>, limit = MAX_PICTURE_BYTES): Promise<string | null> {
  for (const quality of QUALITIES) {
    const url = await encode(quality);
    if (dataUrlBytes(url) <= limit) return url;
  }
  return null;
}

const JPEG_PREFIX = "data:image/jpeg;base64,";

/**
 * Takes out what the browser's own encoder adds to a canvas JPEG (Chrome an ICC profile, Safari an
 * EXIF and an IPTC block), so the server receives only the segments a clean picture needs.
 */
export function withoutMetadata(dataUrl: string): string | null {
  if (!dataUrl.startsWith(JPEG_PREFIX)) return null;
  const binary = atob(dataUrl.slice(JPEG_PREFIX.length));
  const stripped = stripJpegMetadata(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  if (!stripped) return null;
  let out = "";
  for (let at = 0; at < stripped.length; at += 0x8000) out += String.fromCharCode(...stripped.subarray(at, at + 0x8000));
  return JPEG_PREFIX + btoa(out);
}

/**
 * Re-encodes a chosen photo in the browser: drawn on a canvas at most 1280px wide, saved as JPEG.
 * A canvas keeps only the pixels, so the camera's metadata (place, time, device) is dropped, and
 * the segments the encoder itself writes are taken out before sending.
 */
export async function toCleanJpeg(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return encodeUnderLimit(async (quality) => {
    const clean = withoutMetadata(canvas.toDataURL("image/jpeg", quality));
    if (!clean) throw new Error("The browser did not write a JPEG");
    return clean;
  });
}
