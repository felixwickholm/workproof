"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Refetch every N ms while the page is visible. */
  pollMs?: number;
}

/** Loads data on mount, keeps the last good value during refetches, refetches on focus. */
export function useResource<T>(load: (() => Promise<T>) | null, deps: unknown[], options: Options = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const reload = useCallback(async () => {
    const fn = loadRef.current;
    if (!fn) return;
    try {
      const next = await fn();
      setData(next);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // When the inputs change, drop the old data during render, then load again.
  const depKey = JSON.stringify(deps);
  const [loadedKey, setLoadedKey] = useState(depKey);
  if (loadedKey !== depKey) {
    setLoadedKey(depKey);
    setData(null);
    setLoading(true);
  }

  useEffect(() => {
    void reload();
  }, [depKey, reload]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    const timer = options.pollMs
      ? window.setInterval(() => document.visibilityState === "visible" && void reload(), options.pollMs)
      : undefined;
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
      if (timer) window.clearInterval(timer);
    };
  }, [reload, options.pollMs]);

  const retry = useCallback(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  return { data, error, loading, reload, retry, setData };
}
