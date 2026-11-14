import { useEffect, useRef } from "react";
import { cx } from "@/components/ui/cx";
import type { Box } from "./labels";
import { percentIn, type MapNode } from "./layout";
import { companyLine } from "./summary";

/** Initials only fit a dot this large; smaller dots stay plain and are named by their label. */
const MARK_MIN_DIAMETER = 28;

/** The ring a company gets when a meeting is first held: one calm pulse, then a quiet outline. */
function MeetingRing({ diameter, pulseDelay }: { diameter: number; pulseDelay: number | null }) {
  const pulse = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (pulseDelay === null || !pulse.current) return;
    const animation = pulse.current.animate(
      [
        { transform: "scale(1)", opacity: 0.9 },
        { transform: "scale(1.6)", opacity: 0 },
      ],
      { duration: 600, delay: pulseDelay, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" },
    );
    return () => animation.cancel();
  }, [pulseDelay]);
  const ring = { width: diameter + 7, height: diameter + 7 };
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute rounded-full border-[1.5px] border-accent" style={ring} />
      <span ref={pulse} aria-hidden className="pointer-events-none absolute rounded-full border-[1.5px] border-accent opacity-0" style={ring} />
    </>
  );
}

interface CompanyNodeProps {
  node: MapNode;
  /** The letters on the dot: one, or two when another company shares the first letter. */
  mark: string;
  view: Box;
  scale: number;
  interactive: boolean;
  dimmed: boolean;
  /** Milliseconds until the meeting pulse plays, or null when it should not play. */
  pulseDelay: number | null;
  onOpen: (id: string, pin: boolean) => void;
  onClose: (id: string) => void;
}

/** A company on the map: a filled circle with its mark. A button when the map is interactive. */
export function CompanyNode({ node, mark, view, scale, interactive, dimmed, pulseDelay, onOpen, onClose }: CompanyNodeProps) {
  const diameter = node.r * 2 * scale;
  // Two letters get a smaller share of the dot, with an 8px floor so they stay readable.
  const fontSize = mark.length > 1 ? Math.max(8, Math.round(diameter * 0.42)) : Math.max(9, Math.round(diameter * 0.52));
  const { company, totals } = node;
  const dot = (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-full bg-label leading-none font-semibold tracking-[-0.02em] text-ground"
      style={{ width: diameter, height: diameter, fontSize }}
    >
      {diameter >= MARK_MIN_DIAMETER ? mark : null}
    </span>
  );
  const shared = cx("absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-opacity duration-300", dimmed && "opacity-40");
  const ring = totals.met > 0 ? <MeetingRing diameter={diameter} pulseDelay={pulseDelay} /> : null;
  if (!interactive) {
    return (
      <span aria-hidden className={shared} style={percentIn(view, node.x, node.y)}>
        {ring}
        {dot}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={`${company.name}, ${company.sector}, ${company.district}. ${companyLine(totals)}.`}
      className={cx(shared, "size-8 outline-offset-0")}
      style={percentIn(view, node.x, node.y)}
      onPointerEnter={(event) => event.pointerType === "mouse" && onOpen(company.id, false)}
      onPointerLeave={(event) => event.pointerType === "mouse" && onClose(company.id)}
      onFocus={() => onOpen(company.id, false)}
      onBlur={() => onClose(company.id)}
      onClick={() => onOpen(company.id, true)}
    >
      {ring}
      {dot}
    </button>
  );
}

/** The small card beside a company: who they are and what came of the work they received. */
export function CompanyCard({ node, view }: { node: MapNode; view: Box }) {
  const toLeft = (node.x - view.x) / view.width > 0.55;
  return (
    <div
      aria-hidden
      className={cx(
        "pointer-events-none absolute z-10 w-max whitespace-nowrap rounded-[14px] bg-raised px-3.5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)]",
        "transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-[0.97] starting:opacity-0",
        toLeft ? "origin-right" : "origin-left",
      )}
      style={{ ...percentIn(view, node.x, node.y), translate: toLeft ? "calc(-100% - 20px) -50%" : "20px -50%" }}
    >
      <p className="text-[14px] font-semibold leading-[18px] text-label">{node.company.name}</p>
      <p className="mt-0.5 text-[12px] leading-4 text-label-2">
        {node.company.sector} · {node.company.district}
      </p>
      <p className="tnum mt-2 text-[12px] leading-4 text-label">{companyLine(node.totals)}</p>
    </div>
  );
}
