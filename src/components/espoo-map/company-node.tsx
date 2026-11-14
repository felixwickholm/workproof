import { cx } from "@/components/ui/cx";
import { FAMILY_LABEL, FAMILY_SHAPE, type PinShape } from "./families";
import type { Box } from "./labels";
import { percentIn, type MapNode } from "./layout";
import { companyLine } from "./summary";

/** One pin shape in a -1..1 box, with about the same ink for each, so no family looks bigger. */
export function PinMark({ shape, className }: { shape: PinShape; className?: string }) {
  return (
    <svg aria-hidden viewBox="-1 -1 2 2" className={cx("block overflow-visible", className)}>
      {shape === "circle" ? <circle r={0.92} /> : null}
      {shape === "square" ? <rect x={-0.8} y={-0.8} width={1.6} height={1.6} rx={0.12} /> : null}
      {shape === "diamond" ? <path d="M0 -1.08L1.08 0L0 1.08L-1.08 0Z" strokeLinejoin="round" /> : null}
    </svg>
  );
}

interface CompanyNodeProps {
  node: MapNode;
  view: Box;
  scale: number;
  interactive: boolean;
  /** Hovered, focused or tapped: the only pin drawn in the accent. */
  active: boolean;
  dimmed: boolean;
  onOpen: (id: string, pin: boolean) => void;
  onClose: (id: string) => void;
}

/**
 * A company on the map: its family's shape in the one ink colour. A button when the map is
 * interactive, with a 44px hit area on touch screens.
 */
export function CompanyNode({ node, view, scale, interactive, active, dimmed, onOpen, onClose }: CompanyNodeProps) {
  const diameter = node.r * 2 * scale;
  const { company, totals } = node;
  const pin = (
    <span
      aria-hidden
      className={cx("block transition-[color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]", active ? "scale-125 fill-accent" : "fill-label")}
      style={{ width: diameter, height: diameter }}
    >
      <PinMark shape={FAMILY_SHAPE[node.family]} className="size-full" />
    </span>
  );
  const shared = cx("absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-opacity duration-300", dimmed && !active && "opacity-40");
  if (!interactive) {
    return (
      <span aria-hidden className={shared} style={percentIn(view, node.x, node.y)}>
        {pin}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={`${company.name}, ${company.sector} (${FAMILY_LABEL[node.family]}), ${company.district}. ${companyLine(totals)}.`}
      aria-pressed={active}
      className={cx(shared, "size-7 rounded-full outline-offset-0 pointer-coarse:size-11", active && "z-[5]")}
      style={percentIn(view, node.x, node.y)}
      onPointerEnter={(event) => event.pointerType === "mouse" && onOpen(company.id, false)}
      onPointerLeave={(event) => event.pointerType === "mouse" && onClose(company.id)}
      onFocus={() => onOpen(company.id, false)}
      onBlur={() => onClose(company.id)}
      onClick={() => onOpen(company.id, true)}
    >
      {pin}
    </button>
  );
}

/**
 * The small card beside a company: who they are and what came of the work they received.
 * On a narrow map it docks along the top edge, so it never runs off a phone screen.
 */
export function CompanyCard({ node, view, docked }: { node: MapNode; view: Box; docked: boolean }) {
  const toLeft = (node.x - view.x) / view.width > 0.55;
  const place = docked
    ? { left: 8, right: 8, top: 8 }
    : { ...percentIn(view, node.x, node.y), translate: toLeft ? "calc(-100% - 18px) -50%" : "18px -50%" };
  return (
    <div
      aria-hidden
      className={cx(
        "pointer-events-none absolute z-10 rounded-[14px] bg-raised px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)]",
        "transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-[0.97] starting:opacity-0",
        docked ? "origin-top" : cx("w-max max-w-[320px]", toLeft ? "origin-right" : "origin-left"),
      )}
      style={place}
    >
      <p className="text-[15px] font-semibold leading-5 text-label">{node.company.name}</p>
      <p className="mt-0.5 text-[14px] leading-5 text-label-2">
        {node.company.sector} · {node.company.district}
      </p>
      <p className="tnum mt-2 text-[14px] leading-5 text-label">{companyLine(node.totals)}</p>
    </div>
  );
}
