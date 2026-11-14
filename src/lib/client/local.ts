/**
 * Browser-only storage for the demo talent identity and work drafts.
 * Every access is guarded: storage can be blocked in private windows.
 */
import { isJobRole } from "@/lib/domain/roles";
import type { DemoSession, JobRole } from "@/lib/domain/types";

const TALENT_ID = "workproof.talentId";
const TALENT_NAME = "workproof.talentName";
const TALENT_CONTACT = "workproof.talentContact";
const IDENTITY = "workproof.identity";
const ROLES = "workproof.roles";
const SAVED = "workproof.saved";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the app still works for this session.
  }
}

let memoryId: string | null = null;

export function getTalentId(): string {
  const stored = read(TALENT_ID);
  if (stored) return stored;
  const id = memoryId ?? `t_${crypto.randomUUID()}`;
  memoryId = id;
  write(TALENT_ID, id);
  return id;
}

/** Who the seeker side acts as: the demo persona (the default) or the visitor's own random key. */
type Identity = "persona" | "me";

export function getIdentity(): Identity {
  return read(IDENTITY) === "me" ? "me" : "persona";
}

/** From now on the seeker side shows the visitor's own proofs. */
export function switchToOwnIdentity() {
  write(IDENTITY, "me");
}

/** Back to exploring as the demo persona. */
export function switchToPersona() {
  write(IDENTITY, null);
}

/**
 * The caller's demo session, kept in memory only: it belongs to the sandbox cookie,
 * and joining another sandbox reloads the page, which starts empty again.
 */
let session: Promise<DemoSession> | null = null;

export function cachedSession(): Promise<DemoSession> | null {
  return session;
}

/** Keeps a session request; a failed one is dropped so the next call asks again. */
export function rememberSession(pending: Promise<DemoSession>): Promise<DemoSession> {
  session = pending;
  pending.catch(() => {
    if (session === pending) session = null;
  });
  return pending;
}

/**
 * The latest follow-up questions the server issued per task, in memory only: a reload starts the task's
 * questions again, as the page does.
 */
const issues = new Map<string, string>();

export function rememberIssue(challengeId: string, issueId: string) {
  issues.set(challengeId, issueId);
}

export function issuedFor(challengeId: string): string | undefined {
  return issues.get(challengeId);
}

export function getSavedIdentity() {
  return { name: read(TALENT_NAME) ?? "", contact: read(TALENT_CONTACT) ?? "" };
}

export function saveIdentity(name: string, contact?: string) {
  write(TALENT_NAME, name);
  if (contact !== undefined) write(TALENT_CONTACT, contact);
}

interface WorkDraft {
  answer: string;
  explain: string[];
  startedAt: number;
}

const draftKey = (challengeId: string) => `workproof.draft.${challengeId}`;

export function loadDraft(challengeId: string): WorkDraft | null {
  const raw = read(draftKey(challengeId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WorkDraft;
  } catch {
    return null;
  }
}

export function saveDraft(challengeId: string, draft: WorkDraft) {
  write(draftKey(challengeId), JSON.stringify(draft));
}

export function clearDraft(challengeId: string) {
  write(draftKey(challengeId), null);
}

/**
 * The job roles this visitor picked on the challenge list, or null before they picked any. Unknown
 * values from an older build are dropped.
 */
export function getChosenRoles(): JobRole[] | null {
  const raw = read(ROLES);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isJobRole) : null;
  } catch {
    return null;
  }
}

export function saveChosenRoles(roles: readonly JobRole[]) {
  write(ROLES, JSON.stringify(roles));
}

/** The challenge ids this visitor saved, newest first. Only on this device; nothing is sent. */
export function getSavedChallenges(): string[] {
  const raw = read(SAVED);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Saves or forgets one challenge and returns the new list. */
export function setChallengeSaved(challengeId: string, saved: boolean): string[] {
  const rest = getSavedChallenges().filter((id) => id !== challengeId);
  const next = saved ? [challengeId, ...rest] : rest;
  write(SAVED, JSON.stringify(next));
  return next;
}
