/** One box in the diagram: x, y, width, the label and a second line. */
const BOXES = [
  { x: 8, y: 96, w: 136, title: "Browser", sub: "Phone or laptop" },
  { x: 184, y: 96, w: 152, title: "Next.js routes", sub: "Pages and src/app/api" },
  { x: 376, y: 96, w: 152, title: "Service rules", sub: "src/lib/service" },
  { x: 568, y: 8, w: 168, title: "Blind layer", sub: "src/lib/blind" },
  { x: 568, y: 96, w: 168, title: "No-judgement guard", sub: "src/lib/guard" },
  { x: 568, y: 184, w: 168, title: "AI adapter", sub: "Scripted, Claude, Gemini" },
  { x: 376, y: 184, w: 152, title: "Sandbox store", sub: "One copy per visitor" },
] as const;

const H = 56;

/** Arrows as [from box, to box]; a straight line between the facing edges. */
const LINKS: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [2, 6],
];

/** A curve between facing edges: side to side, or top to bottom when the target sits below. */
function path(from: (typeof BOXES)[number], to: (typeof BOXES)[number]): string {
  if (to.y > from.y + H && to.x === from.x) {
    const x = from.x + from.w / 2;
    return `M${x} ${from.y + H}L${x} ${to.y - 6}`;
  }
  const [x1, y1, x2, y2] = [from.x + from.w, from.y + H / 2, to.x - 6, to.y + H / 2];
  return `M${x1} ${y1}C${x1 + 20} ${y1} ${x2 - 20} ${y2} ${x2} ${y2}`;
}

/**
 * Request path: browser, Next.js routes, the service rules, then the blind layer, the guard and the
 * AI adapter, and the per-visitor store. Drawn with the theme's tokens, readable without script.
 */
export function ArchitectureDiagram() {
  return (
    <figure className="overflow-x-auto">
      <svg viewBox="0 0 744 248" role="img" aria-labelledby="arch-title" className="h-auto w-full min-w-[640px] max-w-[744px]">
        <title id="arch-title">
          Browser to Next.js routes to service rules; the service rules use the blind layer, the no-judgement guard and the AI adapter, and read and write the
          sandbox store.
        </title>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0L8 4L0 8z" className="fill-label-2" />
          </marker>
        </defs>
        {LINKS.map(([a, b]) => (
          <path key={`${a}-${b}`} d={path(BOXES[a], BOXES[b])} fill="none" strokeWidth={1.5} className="stroke-label-2" markerEnd="url(#arch-arrow)" />
        ))}
        {BOXES.map((box) => (
          <g key={box.title}>
            <rect x={box.x} y={box.y} width={box.w} height={H} rx={12} className="fill-surface stroke-separator" />
            <text x={box.x + 14} y={box.y + 24} className="fill-label text-[14px] font-semibold">
              {box.title}
            </text>
            <text x={box.x + 14} y={box.y + 42} className="fill-label-2 text-[12px]">
              {box.sub}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
