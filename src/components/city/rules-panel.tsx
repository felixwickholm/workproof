import { Panel } from "../ui/card";

const blocks = [
  { title: "What the AI does", text: "Drafts tasks and follow-up questions. A person approves every task." },
  { title: "What a person decides", text: "Meet or Not now. Every decision comes with a written reason." },
  { title: "What data is kept", text: "The work, a name and one contact. No CV and no voice recording. The person confirms a picture shows only the work." },
  {
    title: "EU AI Act and GDPR",
    text: "Recruitment AI that ranks people is high-risk (Annex III, point 4). Workprint's AI does not evaluate people, people keep the decision, and every step is logged. Identity is shown only with consent.",
  },
];

/** The compliance card: plain statements a city officer can check against the audit log. Server-readable text. */
export function RulesPanel({ className }: { className?: string }) {
  return (
    <Panel title="How this meets the rules" className={className}>
      <dl className="flex flex-col">
        {blocks.map((b) => (
          <div key={b.title} className="py-3 first:pt-1 [&+&]:hairline-t">
            <dt className="text-subhead font-medium text-label">{b.title}</dt>
            <dd className="text-subhead mt-1 text-pretty text-label-2">{b.text}</dd>
          </div>
        ))}
      </dl>
      <p className="text-footnote mt-2 text-label-2">This is a design position, not legal advice.</p>
    </Panel>
  );
}
