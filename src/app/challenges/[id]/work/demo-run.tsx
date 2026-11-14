"use client";

import { useMemo } from "react";
import { WorkArea } from "@/components/seeker/work/work-area";
import { DemoCursor, useDemoSession } from "@/components/think-aloud/demo-session";
import { RecorderPill } from "@/components/think-aloud/recorder-pill";
import { TimeRing } from "@/components/think-aloud/time-ring";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge } from "@/lib/domain/types";
import type { WorkParts } from "@/lib/think-aloud/answer";
import { scriptFromProof } from "@/lib/think-aloud/demo-script";
import { fixUnits, markedText } from "@/lib/think-aloud/fix-units";
import { firstWords, type DemoScript } from "@/lib/think-aloud/timeline";
import { SessionView } from "./session-view";

/**
 * A sample session for the guided demo, from a seeded piece of work on this challenge: its think-aloud
 * and its answer, played on the same work screen. Nothing is recorded; the words are the seeded text.
 */
export function DemoRun({ challenge, onExit }: { challenge: Challenge; onExit: () => void }) {
  const { data: script, loading } = useResource(async () => {
    const top = await companyApi.top(challenge.companyIds[0], challenge.id);
    const seeded = [...top.scored.map((s) => s.proof), ...top.waiting].find((p) => p.thinkAloud?.transcript);
    return seeded ? scriptFromProof(challenge, seeded) : null;
  }, [challenge]);
  if (!script) {
    return (
      <Screen back={{ onBack: onExit }}>
        {loading ? (
          <Skeleton className="mt-6 h-8 w-64" />
        ) : (
          // Not every challenge has seeded work with a think-aloud; then the person goes straight to their own session.
          <div className="mt-6">
            <p className="text-body text-label">No sample session for this challenge yet.</p>
            <Button onClick={onExit} className="mt-4">
              Try it yourself
            </Button>
          </div>
        )}
      </Screen>
    );
  }
  return <DemoPlayer challenge={challenge} script={script} onExit={onExit} />;
}

/** One frame of the sample session at a time: the recorder, the words heard so far and the answer as typed. */
function DemoPlayer({ challenge, script, onExit }: { challenge: Challenge; script: DemoScript; onExit: () => void }) {
  const frame = useDemoSession(script);
  const units = useMemo(() => (challenge.material ? fixUnits(challenge.material) : []), [challenge.material]);
  if (!frame) return null;
  const markUnit = frame.marked === null ? undefined : units[frame.marked];
  const parts: WorkParts = {
    choice: frame.picked ?? undefined,
    marked: markUnit ? markedText(units, markUnit) : undefined,
    main: script.answer.slice(0, frame.typed),
  };
  const heard = firstWords(script.transcript, frame.words);
  return (
    <>
      <SessionView
        challenge={challenge}
        sample
        timer={<TimeRing minutes={challenge.minutes} startedAt={0} at={frame.clock} />}
        pill={<RecorderPill status={frame.done ? "stopped" : "recording"} seconds={frame.clock} level={0} heard={heard} typed sample />}
        aside={<p className="text-body line-clamp-2 text-pretty text-label">{heard ? `“${heard}”` : "A sample session. The thinking shows as text, the way the company reads it."}</p>}
        action={
          <Button onClick={onExit} variant={frame.done ? "primary" : "secondary"} className="h-14! text-[18px]!">
            {frame.done ? "Now try it yourself" : "Skip the sample"}
          </Button>
        }
      >
        <WorkArea
          challenge={challenge}
          parts={parts}
          onParts={() => {}}
          mark={frame.marked}
          onMark={() => {}}
          picture={null}
          onPicture={() => {}}
          pictureChecked={false}
          onPictureChecked={() => {}}
          locked
        />
      </SessionView>
      <DemoCursor frame={frame} mark={script.mark} />
    </>
  );
}
