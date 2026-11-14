"use client";

import { usePathname } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
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
}

const StoryContext = createContext<StoryApi | null>(null);

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory needs StoryProvider");
  return ctx;
}

function goTo(index: number) {
  storyStore.set(index >= storySteps.length ? { index: storySteps.length - 1, ended: true } : { index, ended: false });
}

function countSignal(entries: PassportEntry[], signal: Signal) {
  if (signal === "proofs") return entries.length;
  const responses = entries.flatMap((e) => e.responses);
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
    () => ({ state, start: () => goTo(0), next, close: () => storyStore.set(null) }),
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
    goTo(0);
  }, []);

  // Route-based advance.
  useEffect(() => {
    if (state && step?.leaveWhen?.(pathname)) goTo(state.index + 1);
  }, [pathname, step, state]);

  // Data-based advance: watch the visitor's own proofs while a step waits for an action.
  useEffect(() => {
    if (!state || !step?.signal) return;
    const signal = step.signal;
    let stopped = false;
    const check = async () => {
      try {
        const count = countSignal(await api.passport(getTalentId()), signal);
        if (stopped) return;
        if (state.baseline === undefined) storyStore.set({ ...state, baseline: count });
        else if (count > state.baseline) goTo(state.index + 1);
      } catch {
        // Offline for a moment: try again on the next tick.
      }
    };
    void check();
    const id = window.setInterval(check, 2000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [step, state]);

  return <CoachBar />;
}
