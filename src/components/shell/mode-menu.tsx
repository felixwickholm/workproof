"use client";

import { Check } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { cx } from "../ui/cx";
import { MODES, type Mode } from "./modes";

/** A menu row: 44px at least, so it is a full target under a finger too. */
export const menuItem =
  "flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left outline-none transition-colors duration-150 hover:bg-fill focus-visible:bg-fill focus-visible:outline-none disabled:text-label-3";

/** Arrow keys move between a menu's items (and its chosen segment); Home and End jump to the ends. */
export function onMenuKey(e: KeyboardEvent<HTMLElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[role^='menuitem'], [role='radio'][tabindex='0']"));
  const at = items.indexOf(document.activeElement as HTMLElement);
  const go = (i: number) => {
    e.preventDefault();
    items[(i + items.length) % items.length]?.focus();
  };
  if (e.key === "ArrowDown") go(at + 1);
  else if (e.key === "ArrowUp") go(at - 1);
  else if (e.key === "Home") go(0);
  else go(items.length - 1);
}

/** The three modes, each with its one line. The demo's own controls live in the account menu. */
export function ModeMenu({ current, onPick }: { current: Mode; onPick: (mode: Mode) => void }) {
  return (
    <div role="menu" aria-label="Switch view" onKeyDown={onMenuKey} className="flex flex-col">
      {MODES.map((mode) => {
        const on = mode.id === current.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="menuitemradio"
            aria-checked={on}
            data-current={on || undefined}
            onClick={() => onPick(mode)}
            className={cx(menuItem, "py-2")}
          >
            <mode.Icon aria-hidden className="size-5 shrink-0 text-label-2" strokeWidth={1.75} />
            <span className="min-w-0 flex-1">
              <span className="text-subhead block font-semibold text-label">{mode.label}</span>
              <span className="text-footnote block text-label-2">{mode.description}</span>
            </span>
            <Check aria-hidden className={cx("size-5 shrink-0 text-label", !on && "invisible")} strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

/** A plain action row in a menu: an icon, then the words. */
export function MenuAction({ children, icon, onClick, disabled }: { children: ReactNode; icon: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={cx(menuItem, "text-subhead text-label")}>
      <span className="flex shrink-0 text-label-2">{icon}</span>
      {children}
    </button>
  );
}
