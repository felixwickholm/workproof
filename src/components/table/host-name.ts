/** The name of the person hosting the table, remembered in this browser so each invitation is one field shorter. */
const KEY = "workproof.tableHost";

export function readHostName(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveHostName(name: string): void {
  try {
    window.localStorage.setItem(KEY, name);
  } catch {
    // Storage blocked: the field starts empty next time.
  }
}
