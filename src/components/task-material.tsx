import type { Challenge } from "@/lib/domain/types";
import { Card, Eyebrow } from "./ui/card";
import { CodeBlock } from "./ui/code-block";

/** The brief, the material to work on, and the one question. */
export function TaskMaterial({ challenge }: { challenge: Challenge }) {
  const { material } = challenge;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-body text-label-2 whitespace-pre-wrap text-pretty">{challenge.brief}</p>
      {material ? (
        material.kind === "code" ? (
          <CodeBlock title={material.title} code={material.body} />
        ) : (
          <Card className="p-4">
            <p className="text-footnote font-medium text-label-2">{material.title}</p>
            <p className="text-body mt-2 whitespace-pre-wrap text-pretty">{material.body}</p>
          </Card>
        )
      ) : null}
      <div>
        <Eyebrow>Your task</Eyebrow>
        <p className="text-headline mt-2 font-semibold text-pretty">{challenge.deliverable}</p>
      </div>
    </div>
  );
}
