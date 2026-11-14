/** The guided story's position, kept in sessionStorage so it survives navigation until closed. */

export interface StoryState {
  index: number;
  ended: boolean;
  /** The signal count when the step began; the step moves on when it grows. */
  baseline?: number;
  /** The label of the proof the visitor sent in the story, so later hints can name it. */
  proofLabel?: string;
  /** Its id, so the story can open it on the company side directly. */
  proofId?: string;
  /** The bar is folded down to a small pill. */
  collapsed?: boolean;
}

const KEY = "tryout.story";
const listeners = new Set<() => void>();
let current: StoryState | null = null;
let loaded = false;

function read(): StoryState | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoryState) : null;
  } catch {
    return null;
  }
}

export const storyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get(): StoryState | null {
    if (!loaded) {
      loaded = true;
      current = read();
    }
    return current;
  },
  /** Nothing is shown on the server; the bar appears after hydration. */
  getServer(): StoryState | null {
    return null;
  },
  set(next: StoryState | null) {
    current = next;
    loaded = true;
    try {
      if (next) window.sessionStorage.setItem(KEY, JSON.stringify(next));
      else window.sessionStorage.removeItem(KEY);
    } catch {
      // Storage blocked: the story still runs until the page reloads.
    }
    listeners.forEach((l) => l());
  },
};
