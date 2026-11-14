/** Code with line numbers. Scrolls sideways inside its own frame so the page never does. */
export function CodeBlock({ title, code }: { title?: string; code: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className="overflow-hidden rounded-inner bg-surface">
      {title ? (
        <figcaption className="hairline-b px-4 py-2.5 font-mono text-caption text-label-2">{title}</figcaption>
      ) : null}
      <div className="overflow-x-auto py-3 [-webkit-overflow-scrolling:touch]">
        <pre className="min-w-max font-mono text-code">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span aria-hidden className="tnum sticky left-0 w-10 shrink-0 bg-surface pr-3 text-right text-label-3 select-none">
                {i + 1}
              </span>
              <code className="pr-4 text-label">{line || " "}</code>
            </div>
          ))}
        </pre>
      </div>
    </figure>
  );
}
