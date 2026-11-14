/**
 * Code with line numbers. Long lines soft-wrap, so nothing is ever cut off at the edge.
 * A wrapped line continues two characters further in than where it started, and its number stays on its first row.
 */
export function CodeBlock({ title, code }: { title?: string; code: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className="overflow-hidden rounded-inner bg-surface">
      {title ? (
        <figcaption className="hairline-b px-4 py-2 font-mono text-caption text-label-2">{title}</figcaption>
      ) : null}
      <pre className="py-3 font-mono text-[14px] leading-[21px] min-[430px]:text-code">
        {lines.map((line, i) => {
          const indent = (line.match(/^\s*/)?.[0].length ?? 0) + 2;
          return (
            <div key={i} className="flex">
              <span aria-hidden className="tnum w-9 shrink-0 pr-3 text-right text-label-3 select-none">
                {i + 1}
              </span>
              <code
                className="min-w-0 flex-1 pr-4 text-label whitespace-pre-wrap [overflow-wrap:anywhere]"
                style={{ paddingLeft: `${indent}ch`, textIndent: `-${indent}ch` }}
              >
                {line || " "}
              </code>
            </div>
          );
        })}
      </pre>
    </figure>
  );
}
