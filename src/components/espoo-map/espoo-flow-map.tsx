"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { cx } from "@/components/ui/cx";
import { ESPOO_OUTLINE_PATH } from "@/lib/geo/espoo-outline";
import { CompanyCard, CompanyNode } from "./company-node";
import { easeInOut, pointOnCurve } from "./geometry";
import type { Box } from "./labels";
import { buildMapLayout, DEFAULT_WIDTH, NARROW_WIDTH, percentIn, type MapFlow, type MapLabel } from "./layout";
import { MapHeadline } from "./map-headline";
import { MAP_CAPTION, MapInset, MapLegend } from "./map-legend";
import { stageOf, summarySentence, type FlowStage } from "./summary";
import type { EspooFlowMapProps } from "./types";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const TRAVEL_SAMPLES = 24;

/**
 * The window cuts the city off to the west and north; the land fades out there instead of
 * ending in a hard edge. With headline figures it also fades out above them, into the sea.
 */
function cropFade(figuresShare: number) {
  const fades = ["linear-gradient(to right, transparent, #000 9%)", "linear-gradient(to bottom, transparent, #000 12%)"];
  if (figuresShare > 0) {
    const end = Math.round(figuresShare * 100);
    fades.push(`linear-gradient(to top, transparent ${end}%, #000 ${end + 10}%)`);
  }
  return { maskImage: fades.join(", "), maskComposite: "intersect" } as const;
}

const LINE_CLASS: Record<FlowStage, string> = {
  sent: "stroke-label-2",
  scored: "stroke-label-2",
  invited: "stroke-accent",
};

/** The rendered width of an element, starting from a fixed guess so the first render is stable. */
function useRenderedWidth(ref: RefObject<HTMLElement | null>, initial: number) {
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width) || initial));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, initial]);
  return width;
}

/**
 * Keyframes for one dot: fade in at the venue, travel the curve with ease-in-out, fade out
 * as it reaches the company, then stay hidden for the rest of the loop.
 */
function travelKeyframes(flow: MapFlow, loopShare: number): Keyframe[] {
  const frames: Keyframe[] = [];
  for (let i = 0; i <= TRAVEL_SAMPLES; i++) {
    const progress = i / TRAVEL_SAMPLES;
    const point = pointOnCurve(flow.from, flow.control, flow.to, easeInOut(progress));
    const opacity = Math.min(1, progress / 0.12, (1 - progress) / 0.12);
    frames.push({ offset: progress * loopShare, transform: `translate(${point.x}px, ${point.y}px)`, opacity });
  }
  if (loopShare < 1) frames.push({ offset: 1, transform: frames[frames.length - 1].transform, opacity: 0 });
  return frames;
}

function labelStyle(label: MapLabel, view: Box) {
  const { fontSize } = label;
  const middle = label.y + label.height / 2;
  // Anchor each label on the edge nearest its marker, so a wider font never runs into it.
  if (label.side === "left" || label.side === "above-left" || label.side === "below-left") {
    const { left, top } = percentIn(view, label.x + label.width, middle);
    return { right: `calc(100% - ${left})`, top, fontSize, translate: "0 -50%" };
  }
  if (label.side === "right" || label.side === "above-right" || label.side === "below-right") return { ...percentIn(view, label.x, middle), fontSize, translate: "0 -50%" };
  return { ...percentIn(view, label.x + label.width / 2, middle), fontSize, translate: "-50% -50%" };
}

/** A plate in the land's own tone, so a name that had to cross a line stays readable. */
const PLATE: Record<"hero" | "panel" | "compact", string> = {
  hero: "rounded-[5px] bg-surface/90 px-1 -mx-1",
  panel: "rounded-[5px] bg-ground/90 px-1 -mx-1",
  compact: "",
};

const LABEL_CLASS: Record<MapLabel["kind"], string> = {
  venue: "font-semibold text-label",
  proof: "font-semibold text-accent",
  company: "font-medium text-label",
  district: "font-medium text-label-2",
  landmark: "italic text-label-3",
};

/**
 * A live map of Espoo: named districts as soft shaded regions, employers as pins shaped by
 * their family, and lines from the event venue to each employer, weighted by how much work
 * went there and styled by how far it got: handed in, scored by a person, invited to talk.
 */
export function EspooFlowMap({ companies, flows, variant = "panel", highlightProof, className, live = false, headline, onSelectCompany }: EspooFlowMapProps) {
  const frame = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clipId = `espoo-land-${useId().replace(/[^\w-]/g, "")}`;
  const width = useRenderedWidth(frame, DEFAULT_WIDTH[variant]);
  const reduceMotion = useReducedMotion() ?? false;
  const withHeadline = Boolean(headline) && variant !== "compact";
  const layout = useMemo(
    () => buildMapLayout({ companies, flows, variant, width, highlightProof, withHeadline }),
    [companies, flows, variant, width, highlightProof, withHeadline],
  );
  const summary = summarySentence(layout.flows.map((f) => f.flow));
  const highlighted = layout.flows.find((f) => f.flow.proofLabel === highlightProof);
  const interactive = variant !== "compact";
  const narrow = width < NARROW_WIDTH;

  const select = useRef(onSelectCompany);
  useEffect(() => {
    select.current = onSelectCompany;
  }, [onSelectCompany]);

  const [active, setActive] = useState<{ id: string; pinned: boolean } | null>(null);
  const open = useCallback((id: string, pin: boolean) => {
    if (pin) select.current?.(id);
    setActive((current) => (pin && current?.pinned && current.id === id ? null : { id, pinned: pin || (current?.id === id && current.pinned) }));
  }, []);
  const close = useCallback((id: string) => setActive((current) => (current?.id === id && !current.pinned ? null : current)), []);

  useEffect(() => {
    if (!active?.pinned) return;
    const dismiss = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !frame.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [active]);

  // Travelling dots, at most six on their way at once. Paused while the map is off screen.
  useEffect(() => {
    const root = svg.current;
    if (!root || reduceMotion) return;
    const animations = layout.flows.flatMap((flow) => {
      const dot = root.querySelector<SVGCircleElement>(`[data-dot="${CSS.escape(flow.key)}"]`);
      if (!dot) return [];
      const loopShare = live ? flow.trip / layout.period : 1;
      return [
        dot.animate(travelKeyframes(flow, loopShare), {
          duration: (live ? layout.period : flow.trip) * 1000,
          delay: flow.offset * 1000,
          iterations: live ? Infinity : 1,
          fill: "both",
        }),
      ];
    });
    const observer = new IntersectionObserver(([entry]) => animations.forEach((a) => (entry.isIntersecting ? a.play() : a.pause())));
    observer.observe(root);
    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
    };
  }, [layout, live, reduceMotion]);

  // Lines fade in once, in drawing order, when the map first appears; state changes do not replay it.
  useEffect(() => {
    const root = svg.current;
    if (!root || reduceMotion) return;
    root.querySelectorAll<SVGPathElement>("[data-line]").forEach((line, i) => {
      line.animate([{ opacity: 0 }, { opacity: getComputedStyle(line).opacity }], { duration: 600, delay: 200 + i * 24, easing: EASE_OUT, fill: "backwards" });
    });
  }, [reduceMotion]);

  const view = layout.view;
  const activeId = active?.id ?? null;
  const activeNode = layout.nodes.find((n) => n.company.id === activeId);
  const tone = variant === "panel" ? "fill-ground" : "fill-surface";
  const gapTone = variant === "panel" ? "stroke-ground" : "stroke-surface";
  const dimmedFor = (companyId: string) => Boolean(highlighted) && companyId !== highlighted?.flow.companyId;

  const map = (
    <div ref={frame} className="relative w-full select-none" style={{ aspectRatio: `${view.width} / ${view.height}` }}>
      <svg
        ref={svg}
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        role="img"
        aria-label={summary}
        className="absolute inset-0 size-full"
        style={variant === "compact" ? undefined : cropFade(layout.headline ? layout.headline.height / view.height : 0)}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={ESPOO_OUTLINE_PATH} clipRule="evenodd" />
          </clipPath>
        </defs>
        <path d={ESPOO_OUTLINE_PATH} fillRule="evenodd" strokeWidth={1 / layout.scale} strokeLinejoin="round" className={cx(tone, "stroke-separator")} />
        {/* Districts: one tone step darker than the land, kept apart by a hairline of the land's tone. */}
        <g clipPath={`url(#${clipId})`}>
          {layout.regions.map((region) => (
            <path key={region.name} d={region.path} strokeWidth={1.5 / layout.scale} className={cx("fill-label/[0.07]", gapTone)} />
          ))}
        </g>
        <g className={cx("transition-opacity duration-300", highlighted && "opacity-25")}>
          {layout.lines.map((line) => (
            <path
              key={line.key}
              data-line
              d={line.path}
              fill="none"
              strokeWidth={line.weight / layout.scale}
              strokeLinecap="round"
              strokeDasharray={line.stage === "sent" ? `${3 / layout.scale} ${4 / layout.scale}` : undefined}
              className={cx(LINE_CLASS[line.stage], line.stage === "sent" && "opacity-80", line.stage === "scored" && "opacity-75")}
            />
          ))}
          {/* Dots stay in the markup, hidden, under reduced motion too, so server and client agree. */}
          {layout.flows
            .filter((flow) => flow !== highlighted)
            .map((flow) => (
              <circle key={flow.key} data-dot={flow.key} r={layout.dotRadius} opacity={0} className={stageOf(flow.flow.state) === "invited" ? "fill-accent" : "fill-label"} />
            ))}
        </g>
        {highlighted ? (
          <path
            key={highlighted.key}
            d={highlighted.path}
            fill="none"
            pathLength={1}
            strokeDasharray="1 1"
            strokeWidth={3 / layout.scale}
            strokeLinecap="round"
            className="stroke-accent motion-safe:animate-[espoo-map-draw_1.4s_cubic-bezier(0.77,0,0.175,1)_both]"
          />
        ) : null}
        {highlighted ? <circle data-dot={highlighted.key} r={layout.dotRadius * 1.25} opacity={0} className="fill-accent" /> : null}
        {layout.leaders.map((leader) => (
          <line key={leader.id} x1={leader.from.x} y1={leader.from.y} x2={leader.to.x} y2={leader.to.y} strokeWidth={1 / layout.scale} className="stroke-label" />
        ))}
        <circle cx={layout.venue.x} cy={layout.venue.y} r={layout.venue.r} strokeWidth={1.5 / layout.scale} className={cx("stroke-label", tone)} />
        <circle cx={layout.venue.x} cy={layout.venue.y} r={layout.venue.r * 0.45} className="fill-label" />
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {layout.labels.map((label) => (
          <span
            key={label.id}
            aria-hidden
            className={cx("absolute whitespace-pre leading-[1.3] transition-opacity duration-300", label.onLine && PLATE[variant], LABEL_CLASS[label.kind])}
            style={labelStyle(label, layout.view)}
          >
            {label.text}
          </span>
        ))}
      </div>

      <div className={cx("absolute inset-0", !interactive && "pointer-events-none")}>
        {layout.nodes.map((node) => (
          <CompanyNode
            key={node.company.id}
            node={node}
            view={view}
            scale={layout.scale}
            interactive={interactive}
            active={node.company.id === activeId || node.company.id === highlighted?.flow.companyId}
            dimmed={dimmedFor(node.company.id)}
            onOpen={open}
            onClose={close}
          />
        ))}
        {activeNode ? <CompanyCard key={activeNode.company.id} node={activeNode} view={view} docked={narrow} /> : null}
      </div>
      {layout.inset ? (
        <MapInset
          view={layout.land}
          className="pointer-events-none absolute"
          style={{ ...percentIn(view, layout.inset.x, layout.inset.y), width: `${(layout.inset.width / view.width) * 100}%`, height: `${(layout.inset.height / view.height) * 100}%` }}
        />
      ) : null}
      {headline && layout.headline ? (
        <MapHeadline
          headline={headline}
          narrow={narrow}
          className="absolute inset-x-0 bottom-0 pb-2"
          style={{ height: `${(layout.headline.height / view.height) * 100}%` }}
        />
      ) : null}
      <style>{"@keyframes espoo-map-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}"}</style>
    </div>
  );

  // Wrapped, because a table refuses the 1px width of sr-only and would widen the page.
  const table = (
    <div className="sr-only">
      <table>
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Sector</th>
            <th scope="col">District</th>
            <th scope="col">People who took its challenge</th>
            <th scope="col">Scored by a person</th>
            <th scope="col">Invited</th>
          </tr>
        </thead>
        <tbody>
          {layout.nodes.map(({ company, totals }) => (
            <tr key={company.id}>
              <th scope="row">{company.name}</th>
              <td>{company.sector}</td>
              <td>{company.district}</td>
              <td>{totals.sent}</td>
              <td>{totals.scored}</td>
              <td>{totals.invited}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (variant === "compact") {
    return (
      <figure className={cx("relative m-0", className)}>
        {map}
        {table}
      </figure>
    );
  }
  return (
    <figure className={cx("m-0", className)}>
      {map}
      <MapLegend className="mt-4" />
      <figcaption className="mt-2 text-[14px] leading-5 text-pretty text-label-2">{MAP_CAPTION}</figcaption>
      {table}
    </figure>
  );
}
