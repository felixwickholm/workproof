import { BlindProofMini, type ProofPreview } from "@/components/blind-proof";
import { PlayStoryButton } from "@/components/story/play-story-button";
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
    <Screen right={<PlayStoryButton />} bottom={<Button href="/try">Try a 2-minute task</Button>}>
      <h1 className="rise text-display mt-4 leading-[1.05] font-semibold tracking-[-0.03em]">
        Skip the CV.
        <br />
        Do the work.
      </h1>
      <p className="rise text-body mt-3 text-label-2 text-pretty" style={riseAt(1)}>
        A short piece of real work. A person at the company reads it and decides who to meet.
      </p>
      <p className="rise text-subhead mt-3 font-medium text-label" style={riseAt(1)}>
        AI drafts the tasks. People make every decision.
      </p>

      <div className="rise mt-6" style={riseAt(2)}>
        <Eyebrow className="mb-2 px-5">The company sees your work, not your name</Eyebrow>
        <BlindProofMini proof={sample} meta="Anonymous · code review task" />
      </div>

      <div className="rise mt-6" style={riseAt(3)}>
        <p className="text-footnote mb-2 px-5 text-label-2">Or go straight to</p>
        <Group>
          <Row title="I'm looking for work" href="/challenges" />
          <Row title="I'm hiring" href="/company" />
          <Row title="I run the event" href="/city" />
        </Group>
      </div>
    </Screen>
  );
}
