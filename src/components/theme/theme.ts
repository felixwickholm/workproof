export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "workproof.theme";

/** The ground of each theme, also used as the browser's theme colour so the phone chrome matches. */
export const THEME_GROUND: Record<Theme, string> = { light: "#ffffff", dark: "#000000" };

/** Light unless the visitor chose dark before: a projector and daylight both favour light. */
export function parseTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

/**
 * Runs in <head> before the first paint, so a stored dark theme never flashes light.
 * Kept as plain ES5 in a string: it runs before any bundle loads.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="dark"?"dark":"light";var d=document.documentElement;d.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");document.head.appendChild(m)}m.setAttribute("content",t==="dark"?${JSON.stringify(THEME_GROUND.dark)}:${JSON.stringify(THEME_GROUND.light)})}catch(e){}})()`;
