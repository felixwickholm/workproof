"use client";

import { useCallback, useSyncExternalStore } from "react";
import { parseTheme, THEME_GROUND, THEME_STORAGE_KEY, type Theme } from "./theme";

/** How long colours ease into a new theme. */
const SWITCH_MS = 300;

let switchTimer = 0;

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function read(): Theme {
  return parseTheme(document.documentElement.getAttribute("data-theme"));
}

/** Applies a theme everywhere at once: the page, the browser chrome colour and the stored choice. */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  window.clearTimeout(switchTimer);
  switchTimer = window.setTimeout(() => root.removeAttribute("data-theme-switching"), SWITCH_MS);
  root.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_GROUND[theme]);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode without storage: the theme still applies for this visit.
  }
}

/** The current theme, read from <html>, a toggle and a setter. The server renders light. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const toggle = useCallback(() => applyTheme(read() === "dark" ? "light" : "dark"), []);
  const setTheme = useCallback((next: Theme) => {
    if (next !== read()) applyTheme(next);
  }, []);
  return { theme, toggle, setTheme };
}
