import type { ProofKind, StoryStage, TaskFormat } from "./types";

/** Every proof kind in display order. The schemas and the city view share this list. */
export const PROOF_KINDS = ["writing", "plan", "photo", "video", "voice", "design", "code"] as const satisfies readonly ProofKind[];

/** The story stages in order, from before Mikko's proof to a confirmed meeting. */
export const STORY_STAGES = ["before", "sent", "invited", "met"] as const satisfies readonly StoryStage[];

/** How a challenge is done, in display order: Choose, Make, Fix, Read. */
export const TASK_FORMATS = ["choose", "make", "fix", "read"] as const satisfies readonly TaskFormat[];
