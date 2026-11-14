import type { Challenge } from "@/lib/domain/types";
import { CodeBlock } from "../ui/code-block";
import { cx } from "../ui/cx";
import { needsFixedWidth } from "./material-face";

/**
 * The material a task gives to work on, on a subtle tonal panel under a quiet title. Code keeps its
 * line numbers. A text that lines up columns with tabs or spaces (a small plan table) is the only text
 * set in the fixed-width face, so its columns line up. Everything else is prose: the sans face at a
 * comfortable measure. Every long line wraps, in both faces, so nothing is cut off at the edge.
 */
export function TaskMaterialView({ material, className }: { material: NonNullable<Challenge["material"]>; className?: string }) {
  if (material.kind === "code") {
    return (
      <div className={className}>
        <CodeBlock title={material.title} code={material.body} />
      </div>
    );
  }
  const fixed = needsFixedWidth(material.body);
  return (
    <figure className={cx("min-w-0 rounded-inner bg-surface px-4 py-3.5 min-[640px]:px-5 min-[640px]:py-4", className)}>
      <figcaption className="text-footnote text-pretty text-label-2">{material.title}</figcaption>
      {fixed ? (
        <pre className="mt-2.5 font-mono text-[12px] leading-[19px] whitespace-pre-wrap text-label [overflow-wrap:anywhere] [tab-size:4] min-[430px]:text-code">
          {material.body}
        </pre>
      ) : (
        <p className="text-body mt-2 max-w-[68ch] whitespace-pre-wrap text-pretty text-label [overflow-wrap:anywhere]">{material.body}</p>
      )}
    </figure>
  );
}
