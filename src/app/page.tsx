import { BlindProofMini, type ProofPreview } from "@/components/blind-proof";
import { PlayStoryButton } from "@/components/story/play-story-button";
import { Button } from "@/components/ui/button";
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
  const actions = (
    <div className="flex flex-col gap-2.5">
      <PlayStoryButton />
      <Button href="/try">Try a 2-minute task</Button>
    </div>
  );
  return (
    <Screen page tall phoneBar bottom={actions}>
      <div className="min-[900px]:grid min-[900px]:grid-cols-[minmax(0,1fr)_440px] min-[900px]:items-center min-[900px]:gap-16 min-[900px]:pt-10">
        <div>
          <p className="rise text-subhead mt-3 font-medium text-label-2">Built for city recruitment events.</p>
          <h1 className="rise text-display mt-2 leading-[1.05] font-semibold tracking-[-0.03em] min-[900px]:text-[64px] min-[900px]:leading-[1.02]">
            Skip the CV.
            <br />
            Do the work.
          </h1>
          <p className="rise text-body mt-3 text-label-2 text-pretty min-[900px]:mt-5 min-[900px]:text-[19px] min-[900px]:leading-[28px]" style={riseAt(1)}>
            A short piece of real work. A person at the company reads it and decides who to meet.
          </p>
          <p className="rise text-subhead mt-3 font-medium text-label min-[900px]:text-[17px]" style={riseAt(1)}>
            AI drafts the tasks. People make every decision.
          </p>
          <div className="rise mt-8 hidden w-[340px] min-[900px]:block" style={riseAt(2)}>
            {actions}
          </div>
        </div>

        <div>
          <div className="rise mt-6 min-[900px]:mt-0" style={riseAt(2)}>
            <p className="text-footnote mb-2 px-5 text-label-2">The company sees your work, not your name</p>
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
        </div>
      </div>
    </Screen>
  );
}
