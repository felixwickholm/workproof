import type { Challenge } from "@/lib/domain/types";
import { TaskMaterialView } from "@/components/proof";
import { Eyebrow } from "@/components/ui/card";

/** The brief, the one question, then the material to work on. The question comes before the code so it is never two screens down. */
export function TaskMaterial({ challenge }: { challenge: Challenge }) {
  const { material } = challenge;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-body text-label-2 whitespace-pre-wrap text-pretty">{challenge.brief}</p>
      <div className="hairline-t pt-4">
        <Eyebrow>Your task</Eyebrow>
        <p className="text-headline mt-2 font-semibold text-pretty">{challenge.deliverable}</p>
      </div>
      {material ? <TaskMaterialView material={material} /> : null}
    </div>
  );
}
