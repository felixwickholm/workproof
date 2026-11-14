import type { TaskDesigner } from "../task-designer";
import { draftFromNeed, tasterFor } from "./compose";
import { followUpQuestions } from "./follow-ups";
import { describeWork } from "./summarise";

/** Deterministic designer built on the role library. Runs without any API key. */
export const scriptedDesigner: TaskDesigner = {
  name: "scripted",
  async draftChallenge(need) {
    return draftFromNeed(need);
  },
  async taster(dreamJob) {
    return tasterFor(dreamJob);
  },
  async followUps(challenge, answer) {
    return followUpQuestions(challenge, answer);
  },
  async summariseWork(challenge, answer, explain) {
    return describeWork(challenge, answer, explain);
  },
};
