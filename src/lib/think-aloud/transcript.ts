import { LIMITS } from "@/lib/http/limits";

/** Settled words and the words the recogniser may still change, as one line. */
export function joinHeard(settled: string, interim = ""): string {
  return [settled.trim(), interim.trim()].filter(Boolean).join(" ");
}

/** The last few words heard, for the recorder pill: "…so the insulin visit stays first". */
export function lastWords(text: string, count = 7): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return words.length > count ? `…${words.slice(-count).join(" ")}` : words.join(" ");
}

/** The transcript as it is sent: trimmed, single spaces kept per line, within the server's limit. */
export function transcriptToSend(text: string): string {
  const clean = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return clean.slice(0, LIMITS.thinkAloud);
}

/** "0:07", "4:05", "12:30": a running clock in minutes and seconds. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "2 min 10 s" or "45 s": the length of a think-aloud, in words a person reads. */
export function spokenLength(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const rest = s % 60;
  return rest ? `${Math.floor(s / 60)} min ${rest} s` : `${s / 60} min`;
}
