"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { Children, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { api } from "@/lib/client/api";
import { setCompanyChoice } from "../company/company-choice";
import { cx } from "../ui/cx";
import { fillAndContinue } from "./fill-sample";
import { dialogName, exists, openDialog, findTarget, firstEmptyField, markTarget, pagePrimary, reviewerFirst } from "./page-scan";
import { SAARNIVO, storyReviewers, storySteps, TUULOS, type ActionKind, type Guide } from "./steps";
import { useStory } from "./story-provider";
import { useBottomClearance } from "./use-bottom-clearance";

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * The guided story's card. Docked above the page's own bottom bar on phones (at the top while a
 * sheet is open), bottom right on desktop. It either points at the page's action in words, or holds
 * the one action itself; then the page's main button steps back. It folds to a small pill on request.
 */
export function CoachBar() {
  const { state, close, start, setCollapsed } = useStory();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { clearance, hidden: overSheet } = useBottomClearance(ref, Boolean(state));
  const [resetting, setResetting] = useState(false);
  const wide = useWide();

  // Reserve room under the page so its last lines can scroll clear of the bar.
  useEffect(() => {
    const el = ref.current;
    if (!state || !el) return;
    const observer = new ResizeObserver(() => {
      document.body.style.paddingBottom = `${el.offsetHeight + 16}px`;
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [state]);

  const step = state && !state.ended ? storySteps[state.index] : null;
  const here = step ? step.at(pathname) : false;
  const scan = useScreenScan(here ? step : null, pathname, state?.proofLabel, reduce);
  const [acting, setActing] = useState(false);

  // A new instruction unfolds the bar again, unless the visitor is typing.
  const hintNow = scan.guide.hint ?? scan.guide.action?.label;
  useEffect(() => {
    if (!hintNow) return;
    const active = document.activeElement;
    if (active?.matches("input, textarea") && !active.hasAttribute("data-fill")) return;
    setCollapsed(false);
  }, [hintNow, setCollapsed]);

  async function startAgain() {
    setResetting(true);
    try {
      await api.resetDemo();
    } catch {
      // The story can still restart on the current data.
    }
    setResetting(false);
    start();
    router.push("/challenges");
  }

  /** Closes a finished sheet with its own Done, then goes on. */
  async function closeSheetThen(href: string) {
    const done = openDialog()?.querySelector<HTMLElement>("[data-primary]");
    if (done) {
      done.click();
      await new Promise((resolve) => window.setTimeout(resolve, 60));
    }
    router.push(href);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  }

  /** Opens her proof as one company: picks the company, then the proof itself. */
  function openAs(companyId: string) {
    setCompanyChoice(companyId);
    const id = state?.proofId;
    return closeSheetThen(id ? `/company/review/${encodeURIComponent(id)}` : "/company/review");
  }

  async function act(kind: ActionKind) {
    if (acting) return;
    setActing(true);
    try {
      if (kind === "fill") {
        const companyId = exists('[role="radio"][aria-label="Saarnivo Grid"][aria-checked="true"]') ? SAARNIVO : TUULOS;
        await fillAndContinue(reduce, { reviewer: storyReviewers[companyId] });
      } else if (kind === "tuulos") await openAs(TUULOS);
      else if (kind === "saarnivo") await openAs(SAARNIVO);
      else await closeSheetThen("/passport");
    } finally {
      setActing(false);
    }
  }

  // Typing needs the room: fold the bar to its pill when the visitor taps or types in a field.
  // Autofocus and the story's own filling do not count, so the instruction stays in view.
  useEffect(() => {
    if (!state) return;
    const fold = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!e.isTrusted || !target || ref.current?.contains(target)) return;
      if (target.matches("input:not([type=checkbox]):not([type=radio]), textarea")) setCollapsed(true);
    };
    document.addEventListener("pointerdown", fold);
    document.addEventListener("input", fold);
    return () => {
      document.removeEventListener("pointerdown", fold);
      document.removeEventListener("input", fold);
    };
  }, [state, setCollapsed]);

  const total = storySteps.length;
  const collapsed = Boolean(state?.collapsed);
  const sub = useSubStep(state?.index ?? -1, state && !state.ended ? (here ? (hintNow ?? "here") : "go") : undefined, pathname);
  const counter = state?.ended ? "The end" : `${(state?.index ?? 0) + 1}${sub > 0 ? `.${sub + 1}` : ""} of ${total}`;
  const controls = <Controls onCollapse={() => setCollapsed(true)} onClose={close} />;

  // One main action on screen: the guide's button, or the page's own, never both.
  let lead = false;
  let body: ReactNode = null;
  if (state?.ended || (step?.final && here)) {
    body = (
      <>
        <Line counter={counter}>
          {step?.final ? (
            <span className="font-medium text-label">{step.text}</span>
          ) : (
            <>
              <span className="font-medium text-label">That is Tryout.</span>{" "}
              <span className="text-label-2">Real work in. A person decides. The city sees what happened.</span>
            </>
          )}
        </Line>
        <Actions trailing={controls}>
          <Pill onClick={startAgain} disabled={resetting} quiet>
            {resetting ? "Resetting" : "Start again"}
          </Pill>
        </Actions>
      </>
    );
  } else if (step && state) {
    const guide = here ? scan.guide : {};
    const action = guide.action;
    lead = !here || Boolean(action);
    const line = (
      <Line counter={counter}>
        <span className="font-medium text-label">{step.text}</span>
        {guide.hint ? <span className="text-label-2"> {guide.hint}</span> : null}
      </Line>
    );
    body = lead ? (
      <>
        {line}
        <Actions trailing={controls}>
          {!here ? (
            <Pill href={step.go.href}>
              {step.go.label}
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.2} />
            </Pill>
          ) : action ? (
            <Pill onClick={() => void act(action.kind)} disabled={acting}>
              {action.label}
              {action.kind === "fill" ? null : <ArrowRight aria-hidden className="size-4" strokeWidth={2.2} />}
            </Pill>
          ) : null}
        </Actions>
      </>
    ) : (
      // The page holds the action: no button here, and the controls share the text's row.
      <div className="flex items-start gap-1 pb-1.5">
        <div className="min-w-0 flex-1">{line}</div>
        <div className="-mr-2 flex shrink-0 items-center pt-1">{controls}</div>
      </div>
    );
  }

  // The page's main button steps back to an outline while the guide holds the action.
  useEffect(() => {
    const root = document.documentElement;
    if (lead && !collapsed) root.setAttribute("data-story-lead", "");
    else root.removeAttribute("data-story-lead");
    return () => root.removeAttribute("data-story-lead");
  }, [lead, collapsed]);

  return (
    <AnimatePresence>
      {state ? (
        <motion.div
          ref={ref}
          role="region"
          aria-label="Story guide"
          aria-live="polite"
          className={cx(
            // Solid, not glass: this card floats over page text, which must never show through.
            "highlight fixed z-50 bg-[#2c2c2e]",
            collapsed
              ? "right-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] min-[900px]:right-6"
              : wide
                ? "right-6 w-[380px] rounded-card px-4 pb-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                : // On a phone it docks edge to edge: on top of the page's bottom bar, or under the top edge while a sheet is open.
                  cx("inset-x-0 px-4", overSheet ? "rounded-b-card pt-safe pb-1.5" : cx("rounded-t-card", clearance > 0 ? "pb-1.5" : "pb-[calc(6px+env(safe-area-inset-bottom,0px))]")),
          )}
          style={
            collapsed
              ? { bottom: clearance > 0 && !overSheet ? `${clearance + 8}px` : "calc(12px + env(safe-area-inset-bottom, 0px))" }
              : wide
                ? { bottom: clearance > 0 && !overSheet ? `${clearance + 8}px` : "24px" }
                : overSheet
                  ? { top: 0, bottom: "auto" }
                  : { bottom: `${clearance}px` }
          }
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease }}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-expanded={false}
              aria-label={`Story guide, step ${counter}. Show`}
              className="press text-footnote tnum flex h-11 items-center gap-1.5 rounded-full pr-3 pl-4 font-semibold text-label"
            >
              {state.ended ? "The end" : `Step ${counter}`}
              <ChevronUp aria-hidden className="size-4 text-label-2" strokeWidth={2.4} />
            </button>
          ) : (
            <motion.div
              key={state.ended ? "end" : state.index}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease }}
            >
              {body}
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** The step and its hint in one short paragraph. */
function Line({ counter, children }: { counter: string; children: ReactNode }) {
  return (
    <p className="text-subhead pt-3 pb-1 text-pretty">
      <span className="tnum mr-1.5 font-semibold text-label-2">{counter}</span>
      {children}
    </p>
  );
}

/** Pills on the left, skip, fold and close on the right, all in one row. */
function Actions({ children, trailing }: { children: ReactNode; trailing: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items}
      <div className="-mr-2 ml-auto flex shrink-0 items-center">{trailing}</div>
    </div>
  );
}

function Controls({ onCollapse, onClose }: { onCollapse: () => void; onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onCollapse}
        aria-expanded
        aria-label="Fold the story guide"
        className="press flex size-11 items-center justify-center text-label-2"
      >
        <ChevronDown aria-hidden className="size-5" strokeWidth={2.2} />
      </button>
      <button type="button" onClick={onClose} aria-label="Close the story" className="press flex size-11 items-center justify-center text-label-2">
        <X aria-hidden className="size-5" strokeWidth={2.2} />
      </button>
    </>
  );
}

function Pill({
  children,
  href,
  onClick,
  quiet,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  quiet?: boolean;
  disabled?: boolean;
}) {
  const classes = cx(
    "press text-subhead inline-flex h-11 items-center gap-1.5 rounded-full px-5 font-semibold",
    quiet ? "text-label shadow-[inset_0_0_0_1px_var(--color-label-3)]" : "bg-white text-black",
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/**
 * Counts the screens inside one story step, so the counter moves on every screen change
 * ("2 of 7", "2.2 of 7", "2.3 of 7"). Starts again at each step.
 */
function useSubStep(index: number, hint: string | undefined, pathname: string) {
  const [seen, setSeen] = useState<{ index: number; keys: string[] }>({ index, keys: [] });
  if (seen.index !== index) setSeen({ index, keys: [] });
  // A screen counts once its instruction has held for a moment, so passing states while a page loads do not.
  // The visible heading is part of the key, so two screens with the same instruction still count twice.
  useEffect(() => {
    if (!hint) return;
    let last = "";
    const id = window.setInterval(() => {
      const heading = Array.from(document.querySelectorAll("main h1")).find((h) => h.getBoundingClientRect().width > 0)?.textContent ?? "";
      const key = `${pathname}|${heading}|${hint}`;
      // Counted on the second matching read, about 350ms after it appeared.
      if (key === last) setSeen((prev) => (prev.index !== index || prev.keys.includes(key) ? prev : { index, keys: [...prev.keys, key] }));
      last = key;
    }, 350);
    return () => window.clearInterval(id);
  }, [index, hint, pathname]);
  return Math.max(0, seen.keys.length - 1);
}

const WIDE = "(min-width: 900px)";

function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function useWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
}

interface Scan {
  guide: Guide;
}

const emptyScan: Scan = { guide: {} };

const sameGuide = (a: Guide, b: Guide) =>
  a.hint === b.hint && a.target === b.target && a.action?.label === b.action?.label && a.action?.kind === b.action?.kind;

/**
 * Reads the screen a few times a second: the open dialog, the main button, empty story fields,
 * and the step's guide. Rings the step's target with a data attribute; CSS draws the ring.
 */
function useScreenScan(step: (typeof storySteps)[number] | null, pathname: string, proofLabel: string | undefined, reduce: boolean): Scan {
  const [scan, setScan] = useState<Scan>(emptyScan);
  useEffect(() => {
    if (!step) {
      markTarget(null);
      return;
    }
    const read = () => {
      const guide =
        step.guide?.(pathname, {
          proofLabel,
          primary: pagePrimary(),
          dialog: dialogName(),
          fillable: firstEmptyField(),
          reviewerFirst: reviewerFirst(),
          has: (t) => findTarget(t) !== null,
          exists,
        }) ?? {};
      markTarget(guide.target ? findTarget(guide.target) : null, reduce);
      setScan((prev) => (sameGuide(prev.guide, guide) ? prev : { guide }));
    };
    read();
    const id = window.setInterval(read, 250);
    return () => {
      window.clearInterval(id);
      markTarget(null);
    };
  }, [step, pathname, proofLabel, reduce]);
  return step ? scan : emptyScan;
}
