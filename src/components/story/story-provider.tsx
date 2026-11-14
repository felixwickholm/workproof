"use client";

import { usePathname } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import { api } from "@/lib/client/api";
import { getTalentId } from "@/lib/client/local";
import type { PassportEntry } from "@/lib/domain/types";
import { CoachBar } from "./coach-bar";
import { storySteps, type Signal } from "./steps";
import { storyStore, type StoryState } from "./story-store";

interface StoryApi {
  state: StoryState | null;
  start: () => void;
  next: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const StoryContext = createContext<StoryApi | null>(null);

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory needs StoryProvider");
  return ctx;
}

/** A new step always opens the bar, so its instruction is seen. */
function goTo(index: number, proof?: { proofLabel?: string; proofId?: string }) {
  const now = storyStore.get();
  const position = index >= storySteps.length ? { index: storySteps.length - 1, ended: true } : { index, ended: false };
  const proofLabel = proof?.proofLabel ?? now?.proofLabel;
  const proofId = proof?.proofId ?? now?.proofId;
  storyStore.set({ ...position, ...(proofLabel ? { proofLabel } : {}), ...(proofId ? { proofId } : {}) });
}

const signals: Signal[] = ["proofs", "passes", "meets", "accepted"];

function countSignal(entries: PassportEntry[], signal: Signal) {
  if (signal === "proofs") return entries.length;
  const responses = entries.flatMap((e) => e.responses);
  if (signal === "passes") return responses.filter((r) => r.decision === "pass").length;
  if (signal === "meets") return responses.filter((r) => r.decision === "meet").length;
  return responses.filter((r) => r.meeting && r.meeting.status !== "invited").length;
}

function useStoryState() {
  return useSyncExternalStore(storyStore.subscribe, storyStore.get, storyStore.getServer);
}

/** Holds the guided story's step across pages. */
export function StoryProvider({ children }: { children: ReactNode }) {
  const state = useStoryState();
  const next = useCallback(() => {
    const now = storyStore.get();
    if (now) goTo(now.index + 1);
  }, []);
  const value = useMemo(
    () => ({
      state,
      start: () => storyStore.set({ index: 0, ended: false }),
      next,
      close: () => storyStore.set(null),
      setCollapsed: (collapsed: boolean) => {
        const now = storyStore.get();
        if (now && Boolean(now.collapsed) !== collapsed) storyStore.set({ ...now, collapsed });
      },
    }),
    [state, next],
  );

  return (
    <StoryContext.Provider value={value}>
      {children}
      {/* Reads the URL, so it sits in its own Suspense boundary and never holds the page back. */}
      <Suspense fallback={null}>
        <StoryRuntime />
      </Suspense>
    </StoryContext.Provider>
  );
}

/** Moves the story on when the visitor reaches the right page or the data shows the action happened. */
function StoryRuntime() {
  const pathname = usePathname();
  const state = useStoryState();
  const step = state && !state.ended ? storySteps[state.index] : null;

  // `?demo=1` on any page starts the story.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("demo") !== "1") return;
    url.searchParams.delete("demo");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    storyStore.set({ index: 0, ended: false });
  }, []);

  // Route-based advance.
  useEffect(() => {
    if (state && step?.leaveWhen?.(pathname)) goTo(state.index + 1);
  }, [pathname, step, state]);

  // Data-based advance. The visitor's own proofs are polled for the whole story, so a step's
  // starting count is known the moment it begins, even when the action follows at once.
  const latest = useRef<Partial<Record<Signal, number>>>({});
  const active = Boolean(state && !state.ended);
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    const check = async () => {
      try {
        const entries = await api.passport(getTalentId());
        if (stopped) return;
        const counts = Object.fromEntries(signals.map((s) => [s, countSignal(entries, s)])) as Record<Signal, number>;
        latest.current = counts;
        const now = storyStore.get();
        const signal = now && !now.ended ? storySteps[now.index].signal : undefined;
        if (!now || !signal) return;
        if (now.baseline === undefined) storyStore.set({ ...now, baseline: counts[signal] });
        else if (counts[signal] > now.baseline) {
          // The newest proof is the one sent in the story; later steps name it and open it.
          const newest = signal === "proofs" ? entries[0]?.proof : undefined;
          goTo(now.index + 1, newest ? { proofLabel: newest.label, proofId: newest.proofId } : undefined);
        }
      } catch {
        // Offline for a moment: try again on the next tick.
      }
    };
    void check();
    const id = window.setInterval(check, 1000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [active]);

  // A step that waits for data starts from the last count seen, never from a later one.
  const index = state?.index;
  useEffect(() => {
    const now = storyStore.get();
    const signal = now && !now.ended ? storySteps[now.index].signal : undefined;
    const known = signal ? latest.current[signal] : undefined;
    if (now && signal && now.baseline === undefined && known !== undefined) storyStore.set({ ...now, baseline: known });
  }, [index]);

  return <CoachBar />;
}
