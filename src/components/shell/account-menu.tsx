"use client";

import { BookOpen, ChevronsUpDown, Moon, Play, RotateCcw, Scale, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type ReactNode } from "react";
import type { Theme } from "../theme/theme";
import { useTheme } from "../theme/use-theme";
import { Avatar } from "../ui/avatar";
import { cx } from "../ui/cx";
import { Popover } from "../ui/popover";
import { SegmentedControl } from "../ui/segmented-control";
import { startTour, useResetDemo } from "./demo-actions";
import { MenuAction, onMenuKey } from "./mode-menu";
import { type Mode } from "./modes";
import { useAccount } from "./use-account";

const ICON = "size-5";
const STROKE = 1.75;

const THEMES = [
  { value: "light", label: <><Sun aria-hidden className="size-4" strokeWidth={STROKE} />Light</> },
  { value: "dark", label: <><Moon aria-hidden className="size-4" strokeWidth={STROKE} />Dark</> },
] as const satisfies readonly { value: Theme; label: ReactNode }[];

/** Who the visitor acts as: their picture (or a neutral person shape), the name, then the company or role. */
export function AccountSummary({ mode, className }: { mode: Mode; className?: string }) {
  const account = useAccount(mode);
  return (
    <span className={cx("flex min-w-0 flex-1 items-center gap-3", className)}>
      <Avatar src={account.avatar} size="md" />
      <span className="min-w-0 flex-1">
        <span className="text-footnote block truncate font-semibold text-label">{account.name}</span>
        <span className="text-caption block truncate text-label-2">{account.role}</span>
      </span>
    </span>
  );
}

/**
 * The rarely used actions, together in one place: the guided story from the start, a reset, the theme and the
 * pages around the app (there is no landing page). `onDone` closes whatever holds the menu.
 */
export function AccountActions({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { reset, busy } = useResetDemo();
  const { theme, setTheme } = useTheme();
  return (
    <div role="menu" aria-label="Demo" onKeyDown={onMenuKey} className="flex flex-col">
      <MenuAction
        onClick={() => {
          onDone();
          startTour();
        }}
        icon={<Play aria-hidden className={ICON} strokeWidth={STROKE} />}
      >
        Show me, from the start
      </MenuAction>
      <MenuAction
        disabled={busy}
        onClick={async () => {
          await reset();
          onDone();
        }}
        icon={<RotateCcw aria-hidden className={cx(ICON, busy && "animate-[spin_800ms_linear_infinite] motion-reduce:animate-none")} strokeWidth={STROKE} />}
      >
        {busy ? "Resetting the demo…" : "Reset demo"}
      </MenuAction>
      <div className="flex min-h-11 items-center gap-3 px-3">
        <span className="text-subhead flex-1 text-label">Theme</span>
        <SegmentedControl label="Theme" segments={THEMES} value={theme} onChange={setTheme} className="w-[160px]" />
      </div>
      <div role="separator" className="mx-3 my-2 h-px bg-separator" />
      <MenuAction
        onClick={() => {
          onDone();
          router.push("/how-it-works");
        }}
        icon={<BookOpen aria-hidden className={ICON} strokeWidth={STROKE} />}
      >
        How it works
      </MenuAction>
      <MenuAction
        onClick={() => {
          onDone();
          router.push("/for-judges");
        }}
        icon={<Scale aria-hidden className={ICON} strokeWidth={STROKE} />}
      >
        Evidence for judges
      </MenuAction>
      <div role="separator" className="mx-3 my-2 h-px bg-separator" />
      <p className="text-caption px-3 pb-1 text-label-2">
        Demo data. All people and companies are invented.{" "}
        <a href="/llms.txt" className="underline underline-offset-2 hover:text-label">
          llms.txt
        </a>
      </p>
    </div>
  );
}

/** Laptop: the account card at the foot of the sidebar. It opens the account menu upwards. */
export function AccountCard({ mode }: { mode: Mode }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const close = () => setOpen(false);
  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Account and demo settings"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "press flex w-full items-center gap-2 rounded-[14px] bg-surface p-2 text-left transition-colors duration-150 hover:bg-fill",
          open && "bg-fill",
        )}
      >
        <AccountSummary mode={mode} />
        <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-label-3" strokeWidth={STROKE} />
      </button>
      <Popover id={menuId} open={open} onClose={close} trigger={trigger} placement="above" className="w-[296px]">
        <AccountActions onDone={close} />
      </Popover>
    </div>
  );
}
