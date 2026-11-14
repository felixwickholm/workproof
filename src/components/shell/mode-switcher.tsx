"use client";

import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { cx } from "../ui/cx";
import { Popover } from "../ui/popover";
import { Sheet, useWide } from "../ui/sheet";
import { AccountActions, AccountSummary } from "./account-menu";
import { ModeMenu } from "./mode-menu";
import type { Mode } from "./modes";
import { PartnerLine } from "./partner-line";
import { useShell } from "./shell-context";
import { useAccount } from "./use-account";

interface Props {
  mode: Mode;
  /** "sidebar": the desktop sidebar's top row. "bar": the phone top bar. */
  variant: "sidebar" | "bar";
  className?: string;
}

/**
 * The signature control, top left: which of the three views the visitor is in. On a laptop it opens
 * a menu of the modes; on a phone, a sheet that also holds the account menu and "for City of Espoo",
 * since a phone has no sidebar foot.
 */
export function ModeSwitcher({ mode, variant, className }: Props) {
  const [open, setOpen] = useState(false);
  const wide = useWide();
  const router = useRouter();
  const { beginSwitch } = useShell();
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const account = useAccount(mode);

  const close = () => setOpen(false);
  const pick = (next: Mode) => {
    close();
    if (next.id === mode.id) return;
    beginSwitch();
    router.push(next.home);
  };

  return (
    <div className={cx("relative", variant === "sidebar" && "w-full", className)}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`View: ${mode.label}, as ${account.name}. Switch view`}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "press flex items-center text-left transition-colors duration-150 hover:bg-fill",
          variant === "sidebar" ? "min-h-12 w-full gap-2.5 rounded-[14px] bg-surface py-2 pr-2 pl-2" : "h-10 gap-2 rounded-full bg-surface pr-3 pl-1.5",
          open && "bg-fill",
        )}
      >
        <span aria-hidden className={cx("flex shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink", variant === "sidebar" ? "size-8" : "size-7")}>
          <mode.Icon className="size-4" strokeWidth={2} />
        </span>
        <span className="text-subhead min-w-0 flex-1 truncate font-semibold text-label">{mode.label}</span>
        {variant === "sidebar" ? (
          <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-label-3" strokeWidth={1.75} />
        ) : (
          <ChevronDown aria-hidden className={cx("size-4 text-label-2 transition-transform duration-200 ease-(--ease-out)", open && "rotate-180")} strokeWidth={1.75} />
        )}
      </button>

      {wide ? (
        <Popover id={menuId} open={open} onClose={close} trigger={trigger}>
          <ModeMenu current={mode} onPick={pick} />
        </Popover>
      ) : (
        <Sheet open={open} onClose={close} title="Switch view">
          <div className="-mx-2 flex flex-col">
            <ModeMenu current={mode} onPick={pick} />
            <div className="mx-3 my-2 h-px bg-separator" />
            <AccountSummary mode={mode} className="px-3 py-2" />
            <AccountActions onDone={close} />
            <PartnerLine className="px-3 pt-4" />
          </div>
        </Sheet>
      )}
    </div>
  );
}
