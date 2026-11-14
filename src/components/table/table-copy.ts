import { timeAgo } from "../proof/format";

/** The query a phone carries after it joins: the table's code, so the phone can confirm it really joined. */
export const JOINED_PARAM = "joined";

/** Rows the big screen shows; older proofs fold into one line under them. */
export const ROWS_SHOWN = 12;

/**
 * The link in the table's QR code. `table` joins the laptop's sandbox (the proxy strips it on the
 * way); `joined` survives the redirect, so the phone knows to say "look up".
 */
export function tableJoinUrl(origin: string, code: string): string {
  const url = new URL("/try", origin);
  url.searchParams.set("table", code);
  url.searchParams.set(JOINED_PARAM, code);
  return url.toString();
}

/** The link to type, without the scheme: `/try/<code>` redirects to the QR code's link. */
export function tableShortUrl(origin: string, code: string): string {
  return `${new URL(origin).host}/try/${code}`;
}

/** The table code a phone arrived with, or null. */
export function joinedCode(search: string): string | null {
  const code = new URLSearchParams(search).get(JOINED_PARAM)?.trim().toUpperCase();
  return code ? code : null;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

/** True for an address only this computer can open. A phone on the same wifi cannot reach it. */
export function isLocalOrigin(origin: string): boolean {
  const { hostname } = new URL(origin);
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith(".localhost");
}

/** The origin of a configured site address, or null when it is missing or not a web address. */
export function publicOriginOf(siteUrl: string | undefined): string | null {
  if (!siteUrl) return null;
  try {
    const url = new URL(siteUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

/** The address phones open: the site's public one when this screen runs on localhost and one is set. */
export function joinOrigin(pageOrigin: string, publicOrigin: string | null): string {
  return publicOrigin && isLocalOrigin(pageOrigin) ? publicOrigin : pageOrigin;
}

/** "just now", "3 min ago": the table's list reads as a running sentence, so the time starts lower case. */
export function arrivedAgo(iso: string, now: number): string {
  const words = timeAgo(iso, now);
  return words.charAt(0).toLowerCase() + words.slice(1);
}

/**
 * "3 proofs from this table · 1 name shown, after the person said yes". Names count only invitations
 * the person accepted, so the second half starts at zero and moves only on a yes.
 */
export function tableCounter(proofs: number, names: number): { proofs: string; names: string } {
  return {
    proofs: `${proofs} ${proofs === 1 ? "proof" : "proofs"} from this table`,
    names: names === 1 ? "1 name shown, after the person said yes" : `${names} names shown, each after the person said yes`,
  };
}

/** The line under the newest rows: "and 4 earlier". */
export function earlierLine(hidden: number): string | null {
  return hidden > 0 ? `and ${hidden} earlier` : null;
}

/** What a row says once the table has invited its author. */
export function inviteLine(invite: { status: "invited" | "accepted" | "declined"; host: string }): string {
  if (invite.status === "declined") return "The person said not now. Name never shown.";
  if (invite.status === "accepted") return `Invited by ${invite.host} · the person said yes`;
  return `Invited by ${invite.host} · waiting for the person`;
}
