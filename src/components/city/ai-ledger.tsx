import type { AuditEvent } from "@/lib/domain/types";
import { countAiWork } from "@/lib/service/ai-work";
import { Section } from "../ui/card";
import { Group, Row } from "../ui/group";

const never = ["Scores or rates a person", "Ranks or shortlists people", "Decides who to meet", "Analyses a voice or a face"];

export function AiLedger({ audit }: { audit: AuditEvent[] }) {
  const done = countAiWork(audit);
  return (
    <>
      <Section label="What is automated" className="mt-0">
        <Group>
          <Row title="Drafted tasks" detail="None goes live until a person approves it." value={done.drafted} />
          <Row title={`Summarised the shape of ${done.described} ${done.described === 1 ? "proof" : "proofs"}`} detail="Length, points and opening words. Code, not AI, and never about quality." />
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
