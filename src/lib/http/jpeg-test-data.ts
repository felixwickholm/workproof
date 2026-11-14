/**
 * Small JPEG files built byte by byte for the tests and evals: the segments a browser canvas writes,
 * plus the metadata segments a clean picture must not carry. Not decodable images, only valid structure.
 */
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0));

/** A marker segment with its two length bytes. */
export const segment = (marker: number, payload: number[]) => [0xff, marker, (payload.length + 2) >> 8, (payload.length + 2) & 0xff, ...payload];

export const SOI = [0xff, 0xd8];
export const EOI = [0xff, 0xd9];
export const JFIF = segment(0xe0, [...ascii("JFIF\0"), 1, 1, 0, 0, 1, 0, 1, 0, 0]);
export const JFIF_THUMBNAIL = segment(0xe0, [...ascii("JFIF\0"), 1, 1, 0, 0, 1, 0, 1, 1, 1, 0x80, 0x80, 0x80]);
export const QUANT = segment(0xdb, [0, ...new Array(64).fill(1)]);
export const HUFFMAN = segment(0xc4, [0, 0, 1, ...new Array(14).fill(0), 0]);
export const RESTART_INTERVAL = segment(0xdd, [0, 8]);
export const EXIF = segment(0xe1, [...ascii("Exif\0\0"), 0x4d, 0x4d, 0, 0x2a, ...ascii("GPS 60.1841N 24.8301E")]);
export const XMP = segment(0xe1, ascii("http://ns.adobe.com/xap/1.0/\0<x/>"));
export const ICC = segment(0xe2, [...ascii("ICC_PROFILE\0"), 1, 1, 0, 0, 0, 0]);
export const IPTC = segment(0xed, [...ascii("Photoshop 3.0\0"), ...ascii("8BIM"), 4, 4, 0, 0]);
export const ADOBE = segment(0xee, [...ascii("Adobe"), 0, 100, 0, 0, 0, 0, 1]);
export const COMMENT = segment(0xfe, ascii("Taken by Ilona Koski"));

/** A start-of-frame header (baseline unless another marker is given) for three colour components. */
export function frame(width: number, height: number, marker = 0xc0): number[] {
  return segment(marker, [8, height >> 8, height & 0xff, width >> 8, width & 0xff, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]);
}

/** A scan header for three components, followed by `data` bytes of image data. */
export function scan(data: number[] = [0x11, 0x22, 0x33]): number[] {
  return [...segment(0xda, [3, 1, 0x00, 2, 0x11, 3, 0x11, 0, 63, 0]), ...data];
}

/** A complete JPEG: SOI, the given header segments, a 640x480 frame, one scan, EOI. */
export function jpeg(...header: number[][]): Uint8Array {
  return Uint8Array.from([...SOI, ...header.flat(), ...frame(640, 480), ...QUANT, ...HUFFMAN, ...scan(), ...EOI]);
}

/** A clean JPEG as Chrome writes it before its ICC profile is taken out. */
export const CLEAN = jpeg(JFIF);

export const dataUrl = (bytes: Uint8Array | number[]) => `data:image/jpeg;base64,${Buffer.from(Uint8Array.from(bytes)).toString("base64")}`;

/** A clean JPEG whose image data is padded so the file is exactly `bytes` long. */
export function jpegOfSize(bytes: number): Uint8Array {
  const head = [...SOI, ...JFIF, ...frame(640, 480), ...QUANT, ...HUFFMAN, ...scan([])];
  return Uint8Array.from([...head, ...new Array(Math.max(0, bytes - head.length - EOI.length)).fill(0x11), ...EOI]);
}
