import Link from "next/link";
import { Play } from "lucide-react";
import { BlindProofMini, type ProofPreview } from "@/components/blind-proof";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { Group, Row } from "@/components/ui/group";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";

/** A sample of the real proof card, so the first screen shows the idea without explaining it. */
const sample: ProofPreview = {
  label: "Proof K7",
  challengeTitle: "Review a sensor retry change",
  work: "The retry loop never waits between tries, so one dead sensor floods the queue. I would cap it at 5 tries with a growing delay.",
  skills: [
    { id: "review", label: "Code review", why: "" },
    { id: "python", label: "Python", why: "" },
    { id: "failure", label: "Failure modes", why: "" },
  ],
};

export default function Home() {
  return (
    <Screen bottom={<Button href="/try">Try a 2-minute task</Button>}>
      <h1 className="rise text-display mt-6 font-bold">
        Skip the CV.
        <br />
        Do the work.
      </h1>
      <p className="rise text-body mt-3 text-label-2" style={riseAt(1)}>
        20 minutes of real work. A human decides who to meet.
      </p>

      <div className="rise mt-8" style={riseAt(2)}>
        <Eyebrow className="mb-2 px-1">What a company sees</Eyebrow>
        <BlindProofMini proof={sample} meta="Robotics team · 20 min task" />
      </div>

      <div className="rise mt-8" style={riseAt(3)}>
        <Group>
          <Row title="I'm looking for work" href="/challenges" />
          <Row title="I'm hiring" href="/company" />
          <Row title="I run the event" href="/city" />
        </Group>

        <Link
          href="/?demo=1"
          className="press text-subhead mt-4 flex h-11 items-center gap-2 px-4 font-medium text-label-2"
        >
          <Play aria-hidden className="size-4" strokeWidth={2} />
          Play the story
        </Link>

        <p className="text-footnote mt-6 px-4 text-label-3">AI drafts the tasks. People make every decision.</p>
      </div>
    </Screen>
  );
}
