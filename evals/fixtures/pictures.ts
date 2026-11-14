/** Tiny JPEG files built byte by byte: one as a browser canvas writes it, one that still carries camera metadata. */
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0));
const segment = (marker: number, payload: number[]) => [0xff, marker, (payload.length + 2) >> 8, (payload.length + 2) & 0xff, ...payload];

const START = [0xff, 0xd8];
const JFIF = segment(0xe0, [...ascii("JFIF"), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
const EXIF_GPS = segment(0xe1, [...ascii("Exif"), 0, 0, ...ascii("MM GPS 60.1841N 24.8301E")]);
const SCAN_HEADER = [0xff, 0xda, 0x00, 0x02];
const END = [0xff, 0xd9];
const SCAN = [...SCAN_HEADER, 0x11, 0x22, ...END];

const dataUrl = (bytes: number[]) => `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;

export const CLEAN_JPEG = dataUrl([...START, ...JFIF, ...SCAN]);
export const EXIF_JPEG = dataUrl([...START, ...JFIF, ...EXIF_GPS, ...SCAN]);

/** A clean header and image data padded so the decoded picture is `bytes` long. */
export function jpegOfSize(bytes: number): string {
  const head = [...START, ...JFIF, ...SCAN_HEADER];
  return dataUrl([...head, ...new Array(Math.max(0, bytes - head.length - END.length)).fill(0x11), ...END]);
}
