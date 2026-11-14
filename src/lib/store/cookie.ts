/**
 * The visitor's sandbox key. Shared by the proxy, which sets it, and the store, which reads it.
 * Kept free of server imports so the proxy bundle stays small.
 */
export const SANDBOX_COOKIE = "workprint_sandbox";

/** How long the browser keeps the cookie. Matches the sandbox lifetime. */
export const SANDBOX_LIFETIME_MS = 12 * 60 * 60 * 1000;

/** Random ids only: anything else in the cookie is replaced, so a visitor cannot pick a short, guessable key. */
const SANDBOX_ID = /^sb_[A-Za-z0-9-]{32,40}$/;

export function isSandboxId(value: string | undefined): value is string {
  return value !== undefined && SANDBOX_ID.test(value);
}

export function newSandboxId(): string {
  return `sb_${crypto.randomUUID()}`;
}

/** No 0, O, 1 or I, so a code read aloud or from a screen is typed right the first time. */
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CODE_LENGTH = 6;
const CODE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function newShareCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Upper-cases a typed code and returns it only when it has the right shape. */
export function normaliseShareCode(value: string | null | undefined): string | undefined {
  const code = value?.trim().toUpperCase();
  return code && CODE.test(code) ? code : undefined;
}

/** Cookie settings for the sandbox key: never readable by page scripts. */
export function sandboxCookie(id: string) {
  return {
    name: SANDBOX_COOKIE,
    value: id,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SANDBOX_LIFETIME_MS / 1000,
  };
}
