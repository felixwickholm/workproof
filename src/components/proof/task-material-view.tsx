import type { Challenge } from "@/lib/domain/types";
import { CodeBlock } from "../ui/code-block";
import { cx } from "../ui/cx";
import { isFigure, materialBlocks } from "@/lib/think-aloud/material";

/**
 * The material a task gives to work on, on a subtle tonal panel under a quiet title. Code keeps its
 * line numbers. Hand-aligned columns become a real table, figures on the right; prose stays in the sans
 * face at a comfortable measure. `large` sets it bigger, for a Read challenge where it is the work.
 */
export function TaskMaterialView({ material, className, large }: { material: NonNullable<Challenge["material"]>; className?: string; large?: boolean }) {
  if (material.kind === "code") {
    return (
      <div className={className}>
        <CodeBlock title={material.title} code={material.body} />
      </div>
    );
  }
  const text = large ? "text-[18px] leading-[28px]" : "text-body";
  // A chart or picture under /demo, when the material has one.
  const image = "image" in material && typeof material.image === "string" ? material.image : undefined;
  return (
    <figure className={cx("min-w-0 rounded-inner bg-surface px-4 py-3.5 min-[640px]:px-5 min-[640px]:py-4", className)}>
      <figcaption className="text-footnote text-pretty text-label-2">{material.title}</figcaption>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- sample pictures under /demo, shown as they are
        <img src={image} alt={material.title} className="mt-3 w-full rounded-[12px] bg-ground" />
      ) : null}
      <div className="mt-2 flex flex-col gap-4">
        {materialBlocks(material.body).map((block, i) =>
          block.kind === "text" ? (
            <p key={i} className={cx(text, "max-w-[68ch] whitespace-pre-wrap text-pretty text-label [overflow-wrap:anywhere]")}>
              {block.text}
            </p>
          ) : (
            <div key={i} className="-mx-1 overflow-x-auto">
              <table className={cx(text, "tnum w-full border-collapse text-label")}>
                <thead>
                  <tr className="border-b border-separator">
                    {block.head.map((cell, j) => (
                      <th key={j} scope="col" className={cx("px-1 py-2 pr-4 text-left align-bottom font-medium text-label-2", j > 0 && block.rows.every((r) => !r[j] || isFigure(r[j])) && "text-right")}>
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, r) => (
                    <tr key={r} className="border-separator not-last:border-b">
                      {row.map((cell, j) => (
                        <td key={j} className={cx("px-1 py-2 pr-4 align-top", isFigure(cell) && "text-right whitespace-nowrap")}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        )}
      </div>
    </figure>
  );
}
