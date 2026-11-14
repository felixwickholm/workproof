import type { BlindProof, Challenge } from "@/lib/domain/types";
import { fixUnits, markedText } from "./fix-units";
import type { DemoScript } from "./timeline";

/** The answer field's own words, without the labels `composeAnswer` writes around them. */
function fieldText(format: Challenge["format"], work: string): string {
  const after = (label: string) => {
    const at = work.indexOf(label);
    if (at < 0) return null;
    const rest = work.slice(at + label.length);
    return rest.split("\n\n")[0]?.trim() ?? null;
  };
  switch (format) {
    case "choose":
      return work.split("\n\n").slice(1).join("\n\n").trim();
    case "fix":
      return after("The fix: ") ?? work;
    case "read":
      return after("The one thing: ") ?? work;
    case "make":
      return work;
  }
}

/** The longest stretch the scripted hand types, so a long seeded answer still fits the session. */
const TYPE_LIMIT = 220;

/**
 * A sample session from a seeded piece of work: its think-aloud streams, its answer is typed, its pick
 * or its marked part is chosen. Null when the work has no think-aloud to play.
 */
export function scriptFromProof(challenge: Pick<Challenge, "format" | "material">, proof: Pick<BlindProof, "work" | "choice" | "thinkAloud">): DemoScript | null {
  if (!proof.thinkAloud?.transcript) return null;
  const answer = fieldText(challenge.format, proof.work);
  let mark: number | undefined;
  if (challenge.format === "fix" && challenge.material) {
    const units = fixUnits(challenge.material);
    const wrong = proof.work.match(/What is wrong: (.+)/)?.[1]?.trim();
    mark = units.find((u) => wrong && markedText(units, u) === wrong)?.index ?? units.find((u) => !u.head && wrong?.includes(u.text))?.index ?? units.find((u) => !u.head)?.index ?? 0;
  }
  return {
    format: challenge.format,
    transcript: proof.thinkAloud.transcript,
    answer: answer.length > TYPE_LIMIT ? `${answer.slice(0, TYPE_LIMIT).trimEnd()}…` : answer,
    choice: proof.choice,
    mark,
    seconds: proof.thinkAloud.seconds,
  };
}
