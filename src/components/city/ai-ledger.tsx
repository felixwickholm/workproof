import type { AuditEvent } from "@/lib/domain/types";
import { countAiWork } from "@/lib/service/ai-work";
import { Section } from "../ui/card";
import { Group, Row } from "../ui/group";

const never = ["Scores or rates a person", "Ranks or shortlists people", "Decides who to meet", "Analyses a voice or a face"];

export function AiLedger({ audit }: { audit: AuditEvent[] }) {
  const done = countAiWork(audit);
  return (
    <>
      <Section label="What the AI did" className="mt-0">
        <Group>
          <Row title="Drafted Problem Cards" detail="None goes live until a person approves it." value={done.drafted} />
          <Row title="Described proofs" detail="It describes the work, never the person." value={done.described} />
          <Row title="Asked about their own answer" detail="Questions the person answers after submitting." value={done.questions} />
          <Row title="Hid personal details" detail="A fixed rule, before anyone reads the work." value={done.hidden} />
        </Group>
      </Section>
      <Section label="What the AI never does">
        <Group>
          {never.map((item) => (
            <Row key={item} title={item} value="Never" />
          ))}
        </Group>
      </Section>
    </>
  );
}
