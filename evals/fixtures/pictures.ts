/** Pictures for the evals as data URLs: one as a browser sends it after re-encoding, one that still carries camera metadata. */
import { CLEAN, dataUrl, EXIF, JFIF, jpeg, jpegOfSize as cleanJpegOfSize } from "@/lib/http/jpeg-test-data";

export const CLEAN_JPEG = dataUrl(CLEAN);
export const EXIF_JPEG = dataUrl(jpeg(JFIF, EXIF));

/** A clean JPEG data URL whose decoded picture is `bytes` long. */
export const jpegOfSize = (bytes: number) => dataUrl(cleanJpegOfSize(bytes));
