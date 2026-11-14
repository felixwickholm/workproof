import type { AuditEvent } from "@/lib/domain/types";
import { Section } from "../ui/card";
import { Group, Row } from "../ui/group";

/** Adds up the numbers the audit log records for each kind of automated step. */
function countWork(audit: AuditEvent[]) {
  const sumOf = (action: string, pattern: RegExp) =>
    audit
      .filter((e) => e.action === action)
      .reduce((sum, e) => sum + Number(pattern.exec(e.detail)?.[1] ?? 0), 0);
  const count = (action: string) => audit.filter((e) => e.action === action).length;

  return {
    drafted: count("Drafted a Problem Card"),
    described: count("Described the work"),
    questions: sumOf("Asked about the person's own answer", /(\d+) question/),
    hidden: sumOf("Hid identity from the work", /(\d+) detail/),
  };
}

const never = ["Scores or rates a person", "Ranks or shortlists people", "Decides who to meet", "Analyses a voice or a face"];

export function AiLedger({ audit }: { audit: AuditEvent[] }) {
  const done = countWork(audit);
  return (
    <>
      <Section label="What the AI did" className="mt-0">
        <Group>
          <Row title="Drafted Problem Cards" detail="None goes live until a person approves it." value={done.drafted} />
          <Row title="Described work samples" detail="It describes the work, never the person." value={done.described} />
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
