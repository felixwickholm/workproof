/**
 * Browser-only storage for the demo talent identity and work drafts.
 * Every access is guarded: storage can be blocked in private windows.
 */

const TALENT_ID = "tryout.talentId";
const TALENT_NAME = "tryout.talentName";
const TALENT_CONTACT = "tryout.talentContact";

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

export function getSavedIdentity() {
  return { name: read(TALENT_NAME) ?? "", contact: read(TALENT_CONTACT) ?? "" };
}

export function saveIdentity(name: string, contact?: string) {
  write(TALENT_NAME, name);
  if (contact !== undefined) write(TALENT_CONTACT, contact);
}

export interface WorkDraft {
  answer: string;
  explain: string[];
  startedAt: number;
}

const draftKey = (challengeId: string) => `tryout.draft.${challengeId}`;

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
